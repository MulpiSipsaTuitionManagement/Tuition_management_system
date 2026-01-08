<?php

namespace App\Http\Controllers;

use App\Models\Tutor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class TutorController extends Controller
{
    public function index(Request $request)
    {
        $query = Tutor::with('user');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('subject_specialization', 'like', "%{$search}%");
            });
        }

        // Filter by subject
        if ($request->has('subject')) {
            $query->where('subject_specialization', $request->subject);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            });
        }

        $tutors = $query->orderBy('full_name', 'asc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $tutors
        ]);
    }

    public function show($id)
    {
        $tutor = Tutor::with(['user', 'subjects.school_class', 'salaries'])
            ->find($id);

        if (!$tutor) {
            return response()->json([
                'success' => false,
                'message' => 'Tutor not found'
            ], 404);
        }

        // Check if current user has permission to view this tutor
        $currentUser = Auth::user();
        if ($currentUser->role === 'tutor' && $currentUser->id !== $tutor->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $tutor
        ]);
    }

    public function getProfile()
    {
        $user = Auth::user();
        
        if ($user->role !== 'tutor') {
            return response()->json([
                'success' => false,
                'message' => 'Not a tutor account'
            ], 403);
        }

        $tutor = Tutor::with(['classes', 'salaries'])
            ->where('user_id', $user->id)
            ->first();

        return response()->json([
            'success' => true,
            'data' => $tutor
        ]);
    }

    public function getMyClasses(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role !== 'tutor') {
            return response()->json([
                'success' => false,
                'message' => 'Not a tutor account'
            ], 403);
        }

        $tutor = $user->tutor;

        if (!$tutor) {
            return response()->json([
                'success' => false,
                'message' => 'Tutor profile not found'
            ], 404);
        }

        $query = $tutor->classes()->with(['students']);

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('schedule_date', [
                $request->start_date,
                $request->end_date
            ]);
        } else {
            // Default to next 7 days
            $query->where('schedule_date', '>=', now())
                  ->where('schedule_date', '<=', now()->addDays(7));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $classes = $query->orderBy('schedule_date', 'asc')
                        ->orderBy('start_time', 'asc')
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $classes
        ]);
    }

    public function getTodayClasses()
    {
        $user = Auth::user();
        
        if ($user->role !== 'tutor') {
            return response()->json([
                'success' => false,
                'message' => 'Not a tutor account'
            ], 403);
        }

        $tutor = $user->tutor;

        if (!$tutor) {
            return response()->json([
                'success' => false,
                'message' => 'Tutor profile not found'
            ], 404);
        }

        $todayClasses = $tutor->classes()
            ->with(['students'])
            ->whereDate('schedule_date', today())
            ->where('status', 'scheduled')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $todayClasses,
            'count' => $todayClasses->count()
        ]);
    }

    public function getClassHistory($tutorId, Request $request)
    {
        $tutor = Tutor::find($tutorId);

        if (!$tutor) {
            return response()->json([
                'success' => false,
                'message' => 'Tutor not found'
            ], 404);
        }

        // Check permission
        $currentUser = Auth::user();
        if ($currentUser->role === 'tutor' && $currentUser->id !== $tutor->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $classes = $tutor->classes()
            ->with(['students'])
            ->where('schedule_date', '<', now())
            ->orderBy('schedule_date', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $classes
        ]);
    }

    public function updateProfile(Request $request, $id)
    {
        $tutor = Tutor::find($id);

        if (!$tutor) {
            return response()->json([
                'success' => false,
                'message' => 'Tutor not found'
            ], 404);
        }

        // Only allow tutor to update their own profile or admin
        $currentUser = Auth::user();
        if ($currentUser->role === 'tutor' && $currentUser->user_id !== $tutor->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        try {
            $data = $request->only([
                'full_name', 'email', 'contact_no', 'address', 'nic', 'emergency_contact', 
                'basic_salary', 'dob', 'gender', 'join_date', 'experience', 'qualification'
            ]);

            // Handle Profile Photo Upload
            if ($request->hasFile('profile_photo')) {
                // Delete old photo if it exists
                if ($tutor->profile_photo) {
                    $oldPath = str_replace('/storage/', '', $tutor->profile_photo);
                    Storage::disk('public')->delete($oldPath);
                }
                $path = $request->file('profile_photo')->store('profiles', 'public');
                $data['profile_photo'] = '/storage/' . $path;
            }

            $tutor->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $tutor
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTutorStats($tutorId)
    {
        $tutor = Tutor::find($tutorId);

        if (!$tutor) {
            return response()->json([
                'success' => false,
                'message' => 'Tutor not found'
            ], 404);
        }

        // Check permission
        $currentUser = Auth::user();
        if ($currentUser->role === 'tutor' && $currentUser->id !== $tutor->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $totalClasses = $tutor->classes()->count();
        $completedClasses = $tutor->classes()
            ->where('status', 'completed')
            ->count();
        
        $upcomingClasses = $tutor->classes()
            ->where('schedule_date', '>=', now())
            ->where('status', 'scheduled')
            ->count();

        $studentsEnrolled = $tutor->classes()
            ->with('students')
            ->get()
            ->pluck('students')
            ->flatten()
            ->unique('id')
            ->count();

        $materialsUploaded = \App\Models\StudyMaterial::where('uploaded_by', $tutor->user_id)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_classes' => $totalClasses,
                'completed_classes' => $completedClasses,
                'upcoming_classes' => $upcomingClasses,
                'students_enrolled' => $studentsEnrolled,
                'materials_uploaded' => $materialsUploaded
            ]
        ]);
    }

    public function getTutorsBySubject(Request $request)
    {
        $subject = $request->query('subject');

        if (!$subject) {
            return response()->json([
                'success' => false,
                'message' => 'Subject parameter is required'
            ], 400);
        }

        $tutors = Tutor::with('user')
            ->where('subject_specialization', 'like', "%{$subject}%")
            ->whereHas('user', function($query) {
                $query->where('is_active', true);
            })
            ->orderBy('full_name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tutors
        ]);
    }

    public function getActiveTutors()
    {
        $tutors = Tutor::with('user')
            ->whereHas('user', function($query) {
                $query->where('is_active', true);
            })
            ->orderBy('full_name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tutors,
            'count' => $tutors->count()
        ]);
    }

    public function getAllTutorStats()
    {
        $totalTutors = Tutor::count();
        $activeTutors = Tutor::whereHas('user', function($query) {
            $query->where('is_active', true);
        })->count();

        $subjectDistribution = Tutor::selectRaw('subject_specialization, COUNT(*) as count')
            ->groupBy('subject_specialization')
            ->get();

        $recentlyJoined = Tutor::where('join_date', '>=', now()->subDays(30))
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_tutors' => $totalTutors,
                'active_tutors' => $activeTutors,
                'inactive_tutors' => $totalTutors - $activeTutors,
                'recently_joined' => $recentlyJoined,
                'subject_distribution' => $subjectDistribution
            ]
        ]);
    }
}
