<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Tutor;
use App\Models\Subject;
use App\Models\Classes;
use App\Models\ClassSchedule;
use App\Models\AdminProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function createUser(Request $request)
    {
        // General validation
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|unique:users,username',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:student,tutor',
            'full_name'=> 'required|string',
            'address'  => 'required|string',
            'gender'   => 'required|string',
            'contact_no'=> 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            // Create user
            $user = User::create([
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'is_active' => true
            ]);

            // Handle Profile Photo Upload
            $profilePhotoPath = null;
            if ($request->hasFile('profile_photo')) {
                $path = $request->file('profile_photo')->store('profiles', 'public');
                $profilePhotoPath = '/storage/' . $path;
            }

            // Create profile
            if ($request->role === 'student') {
                // Additional validation for students
                $studentValidator = Validator::make($request->all(), [
                    'class_id' => 'required',
                    'subject_ids' => 'required', // Removed |array to allow FormData handling (which sends arrays as discrete keys or strings) - better to validate existence
                    'guardian_name' => 'required|string',
                    'guardian_contact' => 'required|string',
                    'emergency_contact' => 'required|string',
                ]);

                if ($studentValidator->fails()) {
                    return response()->json(['success' => false, 'errors' => $studentValidator->errors()], 422);
                }
                
                // Validate Class exists
                $class = Classes::find($request->class_id);
                if (!$class) throw new \Exception('Invalid Class ID.');

                // Handle subjects coming from FormData
                // If subject_ids is sent as array [], Laravel handles it.
                // If sent as 'subject_ids[0]', 'subject_ids[1]', it's an array.
                // If sending as comma separated string? Unlikely if using FormData correctly.
                // We'll assume standard array handling.
                $subjectIds = $request->input('subject_ids');
                if (is_string($subjectIds)) {
                     // In case it comes as json string or comma separated
                     $subjectIds = explode(',', $subjectIds);
                }
                
                // Calculate Total Fee
                $totalFee = 0;
                $subjects = Subject::whereIn('subject_id', $subjectIds)->get();
                if ($subjects->isEmpty()) throw new \Exception('No valid subjects selected.');

                foreach ($subjects as $subject) {
                    $totalFee += $subject->monthly_fee;
                }

                $student = Student::create([
                    'user_id' => $user->user_id,
                    'full_name' => $request->full_name,
                    'contact_no' => $request->contact_no,
                    'nic' => $request->nic,
                    'email' => $request->email,
                    'dob' => $request->dob,
                    'address' => $request->address,
                    'gender' => $request->gender,
                    'grade' => $class->class_name, 
                    'class_id' => $class->class_id,
                    'total_monthly_fee' => $totalFee,
                    'guardian_name' => $request->guardian_name,
                    'guardian_contact' => $request->guardian_contact,
                    'emergency_contact' => $request->emergency_contact,
                    'enrollment_date' => $request->enrollment_date ?? now()->toDateString(),
                    'profile_photo' => $profilePhotoPath
                ]);

                // Create initial Fee record for the current month
                \App\Models\Fee::create([
                    'student_id' => $student->student_id,
                    'amount' => $student->total_monthly_fee,
                    'due_date' => now()->startOfMonth(),
                    'status' => 'pending',
                    'recorded_by' => Auth::id(),
                    'remarks' => "Initial fee for " . now()->format('Y-m')
                ]);

                // Enroll in subjects
                $student->subjects()->attach($subjectIds);

                // Update Counts
                $class->increment('total_students');
                foreach ($subjects as $subject) {
                    $subject->increment('total_students');
                }

            } else {
                Tutor::create([
                    'user_id' => $user->user_id,
                    'full_name' => $request->full_name,
                    'address' => $request->address,
                    'nic' => $request->nic,
                    'email' => $request->email,
                    'contact_no' => $request->contact_no,
                    'emergency_contact' => $request->emergency_contact,
                    'basic_salary' => $request->basic_salary ?? 0,
                    'dob' => $request->dob,
                    'gender' => $request->gender,
                    'join_date' => $request->join_date,
                    'experience' => $request->experience,
                    'qualification' => $request->qualification,
                    'profile_photo' => $profilePhotoPath,
                ]);
            }

            DB::commit();

            // Send SMS Notifications after commit
            try {
                $smsService = app(\App\Services\SMSService::class);
                if ($request->role === 'student' && isset($student)) {
                    $msg = "Welcome to Mulpi Sipsa! Enrollment successful for " . $student->full_name . ". Username: " . $request->username . " Password: " . $request->password ."Change your password after login";
                    // Student
                    if ($student->contact_no) $smsService->send($student->contact_no, $msg);
                    // Guardian
                    if ($student->guardian_contact) $smsService->send($student->guardian_contact, "Student " . $student->full_name . " registered at Mulpi Sipsa. Username: " . $request->username . " Password: " . $request->password ."Change your password after login");
                } else {
                    $msg = "Welcome to Mulpi Sipsa! Your Tutor account for " . $request->full_name . " is ready. Username: " . $request->username . " Password: " . $request->password ."Change your password after login";
                    if ($request->contact_no) $smsService->send($request->contact_no, $msg);
                }
            } catch (\Exception $smsEx) {
                // Log SMS failure but don't fail the whole request
                \Log::error("SMS Registration error: " . $smsEx->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => ucfirst($request->role) . ' created successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }
    
    public function deleteUser($id)
    {
        $user = User::find($id);
        if (!$user || $user->role === 'admin') return response()->json(['success'=>false, 'message'=>'Invalid request'], 403);
        
        DB::beginTransaction();
        try {
            if ($user->role === 'student') {
                $student = $user->student;
                if ($student) {
                    // Update Counts (Decrement)
                    if ($student->class_id) {
                        Classes::where('class_id', $student->class_id)->decrement('total_students');
                    }
                    $subjectIds = $student->subjects()->pluck('subjects.subject_id'); // specifying table name
                    Subject::whereIn('subject_id', $subjectIds)->decrement('total_students');
                }
            }
            $user->delete(); // Cascades delete profile/pivot
            DB::commit();
            return response()->json(['success'=>true, 'message'=>'Deleted']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success'=>false, 'message'=>$e->getMessage()], 500);
        }
    }

    public function getDashboardStats()
    {
        $stats = [
            'total_students' => Student::count(),
            'total_tutors' => Tutor::count(),
            'pending_fees' => \App\Models\Fee::where('status', 'pending')->sum('amount'),
            'classes_today' => ClassSchedule::whereDate('schedule_date', today())->count(),
        ];
        return response()->json(['success' => true, 'data' => $stats]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => 'nullable|string',
            'nic' => 'nullable|string',
            'dob' => 'nullable|string',
            'gender' => 'nullable|string',
            'email' => 'nullable|email',
            'contact_no' => 'nullable|string',
            'address' => 'nullable|string',
            'join_date' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $profile = AdminProfile::firstOrNew(['user_id' => $user->user_id]);

            // Handle Profile Photo
            if ($request->hasFile('profile_photo')) {
                // Delete old photo if exists
                if ($profile->profile_photo) {
                    $oldPath = str_replace('/storage/', '', $profile->profile_photo);
                    Storage::disk('public')->delete($oldPath);
                }
                $path = $request->file('profile_photo')->store('profiles', 'public');
                $profile->profile_photo = '/storage/' . $path;
            }

            $profile->fill($request->only([
                'full_name', 'nic', 'dob', 'gender', 'email', 'contact_no', 'address', 'join_date'
            ]));
            
            $profile->save();

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'profile' => $profile
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
