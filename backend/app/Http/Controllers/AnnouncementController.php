<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Announcement;
use App\Models\Notification;
use App\Models\User;
use App\Models\Student;
use App\Models\Tutor;
use App\Models\Subject;
use App\Services\SMSService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AnnouncementController extends Controller
{
    protected $smsService;

    public function __construct(SMSService $smsService)
    {
        $this->smsService = $smsService;
    }

    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $query = Announcement::with(['creator', 'school_class', 'subject']);

        if ($user->role === 'student') {
            $student = $user->student;
            if ($student) {
                // Get announcements for everyone, for all students, or specifically for this student's class/subjects
                $subjectIds = $student->subjects()->pluck('subjects.subject_id')->toArray();
                $query->where(function($q) use ($student, $subjectIds) {
                    $q->where('audience', 'all')
                      ->orWhere(function($q2) use ($student, $subjectIds) {
                          $q2->where('audience', 'students')
                             ->where(function($q3) use ($student, $subjectIds) {
                                 $q3->where('scope', 'entire_system')
                                    ->orWhere(function($q4) use ($student) {
                                        $q4->where('scope', 'class')->where('class_id', $student->class_id);
                                    })
                                    ->orWhere(function($q4) use ($subjectIds) {
                                        $q4->where('scope', 'subject')->whereIn('subject_id', $subjectIds);
                                    });
                             });
                      });
                });
            } else {
                $query->where('audience', 'all');
            }
        } elseif ($user->role === 'tutor') {
            $tutor = $user->tutor;
            if ($tutor) {
                $query->where(function($q) use ($tutor) {
                    $q->where('audience', 'all')
                      ->orWhere('audience', 'tutors')
                      ->orWhere('created_by', $tutor->user_id);
                });
            } else {
                $query->where('audience', 'all');
            }
        }
        // Admin can see everything

        $announcements = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $announcements
        ]);
    }

    public function show($id)
    {
        $announcement = Announcement::with(['creator', 'school_class', 'subject'])->find($id);
        if (!$announcement) {
            return response()->json(['success' => false, 'message' => 'Announcement not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $announcement]);
    }

    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            \Log::info('Store announcement start', ['user_id' => $user->user_id]);

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'audience' => 'required|in:all,students,tutors',
                'scope' => 'required|in:entire_system,class,subject',
                'class_id' => 'nullable',
                'subject_id' => 'nullable',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }

            // Role based permission check
            if ($user->role === 'tutor') {
                if ($request->audience !== 'students') {
                    return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
                }
            }

            DB::beginTransaction();
            
            $announcement = Announcement::create([
                'title' => $request->title,
                'message' => $request->message,
                'audience' => $request->audience,
                'scope' => $request->scope,
                'class_id' => $request->class_id ?: null,
                'subject_id' => $request->subject_id ?: null,
                'created_by' => $user->user_id
            ]);

            \Log::info('Announcement created', ['id' => $announcement->announcement_id]);

            // For now, let's just return success to see if basic creation works
            // If this works, we will re-enable the broadcast logic step-by-step
            
            DB::commit();
            
            // Try to notify asynchronously or at least handle errors
            try {
                $this->broadcastAnnouncement($announcement, $request, $user);
            } catch (\Throwable $th) {
                \Log::error('Broadcast error (not failing main request)', ['error' => $th->getMessage()]);
            }

            return response()->json(['success' => true, 'message' => 'Announcement sent', 'data' => $announcement]);

        } catch (\Throwable $e) {
            if (DB::transactionLevel() > 0) DB::rollBack();
            \Log::error('Announcement fatal error', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json(['success' => false, 'message' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }

    private function broadcastAnnouncement($announcement, $request, $user)
    {
        // ... broadcast logic extracted ...
        $recipients = collect();

        if ($request->audience == 'all' || $request->audience == 'students') {
            $studentQuery = Student::query();
            if ($request->scope == 'class' && $request->class_id) {
                $studentQuery->where('class_id', $request->class_id);
            } elseif ($request->scope == 'subject' && $request->subject_id) {
                $studentQuery->whereHas('subjects', function($q) use ($request) {
                    $q->where('subjects.subject_id', $request->subject_id);
                });
            }
            $recipients = $recipients->concat($studentQuery->with('user')->get());
        }

        if ($request->audience == 'all' || $request->audience == 'tutors') {
            $tutorQuery = Tutor::query();
            if ($request->scope == 'class' && $request->class_id) {
                $tutorQuery->whereHas('subjects', function($q) use ($request) {
                    $q->where('class_id', $request->class_id);
                });
            } elseif ($request->scope == 'subject' && $request->subject_id) {
                $tutorQuery->whereHas('subjects', function($q) use ($request) {
                    $q->where('subjects.subject_id', $request->subject_id);
                });
            }
            $recipients = $recipients->concat($tutorQuery->with('user')->get());
        }

        foreach ($recipients as $recipient) {
            try {
                // Determine contact number
                $phone = $recipient->contact_no;
                if (!$phone && $recipient instanceof Student) {
                    $phone = $recipient->guardian_contact;
                }

                // Create In-app Notification
                Notification::create([
                    'title' => $announcement->title,
                    'message' => $announcement->message,
                    'user_id' => $recipient->user_id,
                    'student_id' => ($recipient instanceof Student) ? $recipient->student_id : null,
                    'recipient_phone' => $phone ?: 'N/A',
                    'type' => 'Schedule Update',
                    'status' => 'Sent',
                    'is_read' => false
                ]);
                
                // Send SMS if phone exists
                if ($phone && $phone !== 'N/A') {
                    $this->smsService->send($phone, "Announcement: " . $announcement->title . "\n" . $announcement->message);
                    
                    // If student, also notify guardian if they have a different contact
                    if ($recipient instanceof Student && $recipient->guardian_contact && $recipient->guardian_contact !== $recipient->contact_no) {
                        $this->smsService->send($recipient->guardian_contact, "Announcement for Student " . $recipient->full_name . ": " . $announcement->title . "\n" . $announcement->message);
                    }
                }
            } catch (\Throwable $recipientEx) {
                \Log::warning('Individual broadcast failed for user', [
                    'user_id' => $recipient->user_id,
                    'error' => $recipientEx->getMessage()
                ]);
            }
        }
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }

        if ($user->role !== 'admin' && $user->user_id !== $announcement->created_by) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $announcement->delete();
        return response()->json(['success' => true, 'message' => 'Deleted']);
    }
}
