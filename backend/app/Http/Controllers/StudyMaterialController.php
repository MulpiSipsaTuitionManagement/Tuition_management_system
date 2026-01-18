<?php

// app/Http/Controllers/StudyMaterialController.php
namespace App\Http\Controllers;

use App\Models\StudyMaterial;
use App\Models\Subject;
use App\Models\Student;
use App\Models\Tutor;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class StudyMaterialController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = StudyMaterial::with(['subject.school_class', 'uploader']);

        // Role-based filtering
        if ($user->role === 'student') {
            // Students can only see materials for their enrolled class and subjects
            $student = Student::where('user_id', $user->user_id)->first();
            if ($student) {
                // Get subjects this student is enrolled in
                $subjectIds = $student->subjects()->pluck('subjects.subject_id');
                $query->whereIn('subject_id', $subjectIds);
            } else {
                // No student record, return empty
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }
        } elseif ($user->role === 'tutor') {
            // Tutors can see materials they uploaded OR materials for subjects they are assigned to
            $tutor = Tutor::where('user_id', $user->user_id)->first();
            if ($tutor) {
                $tutorSubjectIds = Subject::where('tutor_id', $tutor->tutor_id)->pluck('subject_id');
                $query->where(function($q) use ($tutor, $tutorSubjectIds) {
                    $q->where('uploaded_by', $tutor->tutor_id)
                      ->orWhereIn('subject_id', $tutorSubjectIds);
                });
            } else {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }
        }
        // Admin sees all materials (no additional filter)

        // Apply filters
        if ($request->filled('class_id')) {
            $subjectIds = Subject::where('class_id', $request->class_id)->pluck('subject_id');
            $query->whereIn('subject_id', $subjectIds);
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('tutor_id')) {
            $query->where('uploaded_by', $request->tutor_id);
        }

        // Search by title
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $materials = $query->orderBy('uploaded_date', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $materials
        ]);
    }

    public function getOptions()
    {
        $user = Auth::user();
        
        $data = [
            'classes' => [],
            'subjects' => [],
            'tutors' => []
        ];

        if ($user->role === 'admin') {
            $data['classes'] = \App\Models\Classes::select('class_id', 'class_name')->get();
            $data['subjects'] = Subject::with('school_class:class_id,class_name')
                ->select('subject_id', 'subject_name', 'class_id', 'tutor_id')
                ->get();
            $data['tutors'] = Tutor::select('tutor_id', 'full_name')->get();
        } elseif ($user->role === 'tutor') {
            $tutor = Tutor::where('user_id', $user->user_id)->first();
            if ($tutor) {
                // Get subjects assigned to this tutor with class relationship
                $subjects = Subject::with('school_class:class_id,class_name')
                    ->where('tutor_id', $tutor->tutor_id)
                    ->select('subject_id', 'subject_name', 'class_id', 'tutor_id')
                    ->get();
                
                $data['subjects'] = $subjects;
                
                // Get unique classes from those subjects
                $classIds = $subjects->pluck('class_id')->unique()->filter();
                
                if ($classIds->isNotEmpty()) {
                    $data['classes'] = \App\Models\Classes::whereIn('class_id', $classIds)
                        ->select('class_id', 'class_name')
                        ->get();
                }
            }
        } elseif ($user->role === 'student') {
            $student = Student::where('user_id', $user->user_id)->first();
            if ($student) {
                $data['classes'] = \App\Models\Classes::where('class_id', $student->class_id)
                    ->select('class_id', 'class_name')
                    ->get();
                    
                // Students should only see options for subjects they are enrolled in
                $data['subjects'] = $student->subjects()
                    ->with('school_class:class_id,class_name')
                    ->select('subjects.subject_id', 'subjects.subject_name', 'subjects.class_id')
                    ->get();
            }
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function upload(Request $request)
    {
        $user = Auth::user();

        // Only tutors and admins can upload
        if ($user->role !== 'tutor' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to upload materials'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,subject_id',
            'file' => 'required|file|mimes:pdf,doc,docx|max:10240' // Only PDF and Word, 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // For tutors, verify they are assigned to this subject
            if ($user->role === 'tutor') {
                $tutor = Tutor::where('user_id', $user->user_id)->first();
                $subject = Subject::find($request->subject_id);
                
                if (!$tutor || $subject->tutor_id != $tutor->tutor_id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You can only upload materials for subjects assigned to you'
                    ], 403);
                }
                
                $uploadedBy = $tutor->tutor_id;
            } else {
                // Admin - need to get tutor from subject or allow null
                $subject = Subject::find($request->subject_id);
                $uploadedBy = $subject->tutor_id; // Use subject's assigned tutor
            }

            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('study_materials', $fileName, 'public');
            
            $fileSize = round($file->getSize() / 1024, 2); // Convert to KB

            $material = StudyMaterial::create([
                'title' => $request->title,
                'description' => $request->description,
                'subject_id' => $request->subject_id,
                'file_path' => $filePath,
                'file_size' => $fileSize . ' KB',
                'uploaded_by' => $uploadedBy,
                'uploaded_date' => now()
            ]);

            // Create notification for students in this class
            $subject = Subject::with('school_class')->find($request->subject_id);
            $tutor = Tutor::find($uploadedBy);
            
            if ($subject && $subject->school_class && $tutor) {
                // Get all students in this class
                $students = Student::where('class_id', $subject->class_id)->get();
                
                foreach ($students as $student) {
                    Notification::create([
                        'user_id' => $student->user_id,
                        'student_id' => $student->student_id,
                        'title' => 'New Study Material Available',
                        'message' => "Tutor {$tutor->full_name} uploaded new course material for {$subject->subject_name} - {$subject->school_class->class_name}",
                        'type' => 'Schedule Update',
                        'recipient_phone' => $student->contact_no ?: 'N/A',
                        'status' => 'Sent',
                        'sent_date' => now(),
                        'is_read' => false
                    ]);
                }

                // Also notify admin
                $adminUsers = \App\Models\User::where('role', 'admin')->get();
                foreach ($adminUsers as $adminUser) {
                    Notification::create([
                        'user_id' => $adminUser->id,
                        'title' => 'New Study Material Uploaded',
                        'message' => "Tutor {$tutor->full_name} uploaded new material: {$request->title}",
                        'type' => 'Schedule Update',
                        'recipient_phone' => 'N/A',
                        'status' => 'Sent',
                        'sent_date' => now(),
                        'is_read' => false
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Study material uploaded successfully',
                'data' => $material->load(['subject.school_class', 'uploader'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload study material: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $material = StudyMaterial::find($id);

        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Study material not found'
            ], 404);
        }

        $user = Auth::user();
        
        // Check permission - only uploader or admin can delete
        if ($user->role !== 'admin') {
            if ($user->role === 'tutor') {
                $tutor = Tutor::where('user_id', $user->user_id)->first();
                if (!$tutor || $material->uploaded_by !== $tutor->tutor_id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized to delete this material'
                    ], 403);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete materials'
                ], 403);
            }
        }

        try {
            // Delete file from storage
            if (Storage::disk('public')->exists($material->file_path)) {
                Storage::disk('public')->delete($material->file_path);
            }

            $material->delete();

            return response()->json([
                'success' => true,
                'message' => 'Study material deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete study material: ' . $e->getMessage()
            ], 500);
        }
    }

    public function download($id)
    {
        $material = StudyMaterial::find($id);

        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Study material not found'
            ], 404);
        }

        try {
            $filePath = storage_path('app/public/' . $material->file_path);

            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found'
                ], 404);
            }

            return response()->download($filePath, $material->title);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download file: ' . $e->getMessage()
            ], 500);
        }
    }
}
