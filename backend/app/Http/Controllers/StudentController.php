<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Subject;
use App\Models\ClassSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with('user');
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('full_name', 'like', "%{$search}%");
        }
        if ($request->has('grade')) {
            $query->where('grade', $request->grade);
        }
        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->has('all') && $request->all == 'true') {
            return response()->json(['success' => true, 'data' => $query->get()]);
        }

        return response()->json(['success' => true, 'data' => $query->paginate(20)]);
    }

    public function show($id)
    {
        $student = Student::with(['user', 'subjects.school_class', 'subjects.tutor', 'fees'])->find($id);
        if (!$student) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        return response()->json(['success' => true, 'data' => $student]);
    }

    public function enroll(Request $request, $id)
    {
        $student = Student::find($id);
        if (!$student) return response()->json(['success' => false, 'message' => 'Student not found'], 404);

        $request->validate([
            'subject_ids' => 'required|array',
            'subject_ids.*' => 'exists:subjects,subject_id'
        ]);

        $student->subjects()->syncWithoutDetaching($request->subject_ids);
        return response()->json(['success' => true, 'message' => 'Enrolled successfully']);
    }
    
    public function getTimetable($id)
    {
        $student = Student::find($id);
        if (!$student) return response()->json(['success' => false, 'message' => 'Not found'], 404);

        $subjectIds = $student->subjects()->pluck('subjects.subject_id');
        
        $schedules = ClassSchedule::whereIn('subject_id', $subjectIds)
            ->with(['subject', 'tutor', 'school_class'])
            ->orderBy('schedule_date')
            ->orderBy('start_time')
            ->get();

        return response()->json(['success' => true, 'data' => $schedules]);
    }

    public function getMyTimetable()
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'student') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        return $this->getTimetable($user->student->student_id);
    }

    public function getStats()
    {
        $now = \Carbon\Carbon::now();
        $stats = [
            'total' => Student::count(),
            'thisMonth' => Student::whereMonth('enrollment_date', $now->month)
                                 ->whereYear('enrollment_date', $now->year)
                                 ->count(),
            'male' => Student::whereRaw('LOWER(gender) = ?', ['male'])->count(),
            'female' => Student::whereRaw('LOWER(gender) = ?', ['female'])->count(),
        ];
        return response()->json(['success' => true, 'data' => $stats]);
    }

    public function update(Request $request, $id)
    {
        $student = Student::with('user')->find($id);
        if (!$student) return response()->json(['success' => false, 'message' => 'Student not found'], 404);

        $request->validate([
            'full_name' => 'required|string',
            'address' => 'required|string',
            'contact_no' => 'required|string',
            'guardian_name' => 'required|string',
            'guardian_contact' => 'required|string',
            'emergency_contact' => 'required|string',
            'gender' => 'required|string',
            'username' => 'sometimes|string|unique:users,username,' . $student->user_id . ',user_id',
            'password' => 'nullable|string|min:6',
        ]);

        // Update User Model
        $userData = [];
        if ($request->filled('username')) $userData['username'] = $request->username;
        if ($request->filled('password')) $userData['password'] = Hash::make($request->password);
        
        if (!empty($userData)) {
            $student->user->update($userData);
        }

        // Update Student Data Array
        $studentData = [
            'full_name' => $request->full_name,
            'contact_no' => $request->contact_no,
            'nic' => $request->nic,
            'email' => $request->email,
            'dob' => $request->dob,
            'address' => $request->address,
            'gender' => $request->gender,
            'guardian_name' => $request->guardian_name,
            'guardian_contact' => $request->guardian_contact,
            'emergency_contact' => $request->emergency_contact,
            'enrollment_date' => $request->enrollment_date,
        ];
        
        // Handle Profile Photo
        if ($request->hasFile('profile_photo')) {
            $path = $request->file('profile_photo')->store('profiles', 'public');
            $studentData['profile_photo'] = '/storage/' . $path;
        }

        // Update Student Model
        $student->update($studentData);
        
        // Handle Class/Grade Change if requested
        if ($request->filled('class_id') && $request->class_id != $student->class_id) {
             $class = \App\Models\Classes::find($request->class_id);
             if ($class) {
                 // Decrement old class count
                 if ($student->class_id) {
                     \App\Models\Classes::where('class_id', $student->class_id)->decrement('total_students');
                 }
                 $student->update([
                     'class_id' => $class->class_id,
                     'grade' => $class->class_name
                 ]);
                 $class->increment('total_students');
             }
        }

        // Handle Subjects Sync
        if ($request->has('subject_ids')) {
            $subjectIds = $request->input('subject_ids');
            if (is_string($subjectIds)) $subjectIds = explode(',', $subjectIds);
            
            // Re-calculate Total Fee if subjects changed
            $totalFee = 0;
            $subjects = Subject::whereIn('subject_id', $subjectIds)->get();
            foreach ($subjects as $subject) {
                $totalFee += $subject->monthly_fee;
            }
            $student->update(['total_monthly_fee' => $totalFee]);

            $student->subjects()->sync($subjectIds);
        }

        return response()->json(['success' => true, 'message' => 'Profile updated successfully']);
    }
}
