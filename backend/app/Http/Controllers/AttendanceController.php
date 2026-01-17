<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\ClassSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function markAttendance(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:class_schedules,schedule_id',
            'students' => 'required|array',
            'students.*.student_id' => 'required|exists:students,student_id',
            'students.*.status' => 'required|in:Present,Absent,Late'
        ]);

        $schedule = ClassSchedule::find($request->schedule_id);
        $markerId = auth()->id();

        foreach ($request->students as $studentData) {
            Attendance::updateOrCreate(
                [
                    'schedule_id' => $schedule->schedule_id,
                    'student_id' => $studentData['student_id']
                ],
                [
                    'class_id' => $schedule->class_id,
                    'attendance_date' => $schedule->schedule_date,
                    'status' => $studentData['status'],
                    'marked_by' => $markerId
                ]
            );
        }

        // Update schedule status to Completed if it was upcoming
        if ($schedule->status === 'Upcoming' || $schedule->status === 'Scheduled') {
            $schedule->update(['status' => 'Completed']);
        }

        // Check for 3 consecutive absences and send alerts
        try {
            $smsService = app(\App\Services\SMSService::class);
            foreach ($request->students as $studentData) {
                if ($studentData['status'] === 'Absent') {
                    $student = \App\Models\Student::find($studentData['student_id']);
                    
                    // Check last 3 records for this student
                    $lastThree = Attendance::where('student_id', $student->student_id)
                        ->orderBy('attendance_date', 'desc')
                        ->orderBy('created_at', 'desc')
                        ->take(3)
                        ->get();

                    if ($lastThree->count() >= 3 && $lastThree->every(fn($a) => $a->status === 'Absent')) {
                        if ($student->guardian_contact) {
                            $smsService->send($student->guardian_contact, "Absence Alert: Student " . $student->full_name . " has been absent for 3 consecutive classes. Please check.");
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            \Log::error("Absence Alert SMS Error: " . $e->getMessage());
        }

        return response()->json(['success' => true, 'message' => 'Attendance marked successfully']);
    }

    public function getBySchedule($scheduleId)
    {
        $schedule = ClassSchedule::with(['school_class', 'subject', 'tutor'])->find($scheduleId);
        if (!$schedule) return response()->json(['success' => false, 'message' => 'Schedule not found'], 404);

        // Get all students in this class
        $students = \App\Models\Student::where('class_id', $schedule->class_id)->get();
        
        // Get existing attendance for this schedule
        $attendance = Attendance::where('schedule_id', $scheduleId)->get()->keyBy('student_id');

        $data = $students->map(function($student) use ($attendance) {
            return [
                'student_id' => $student->student_id,
                'full_name' => $student->full_name,
                'status' => $attendance->has($student->student_id) ? $attendance[$student->student_id]->status : null,
            ];
        });

        return response()->json([
            'success' => true, 
            'data' => $data,
            'schedule' => $schedule
        ]);
    }

    public function getAnalytics()
    {
        $user = auth()->user();
        $today = Carbon::today();
        $startDate = $today->copy()->subDays(6);
        
        $query = Attendance::query();
        if ($user->role === 'tutor') {
            $tutorId = $user->tutor->tutor_id;
            $query->whereHas('schedule', function($q) use ($tutorId) {
                $q->where('tutor_id', $tutorId);
            });
        }
        
        // Optimize: Fetch all stats in one query using Group By
        $dailyStats = $query->whereBetween('attendance_date', [$startDate, $today])
            ->selectRaw('attendance_date, COUNT(*) as total, SUM(CASE WHEN status IN (?, ?) THEN 1 ELSE 0 END) as present', ['Present', 'Late'])
            ->groupBy('attendance_date')
            ->get()
            ->keyBy(function($item) {
                return Carbon::parse($item->attendance_date)->format('Y-m-d');
            });

        // Build the weekly array ensuring 0 values for missing days
        $weeklyData = [];
        $todayPercentage = 0;

        for ($i = 6; $i >= 0; $i--) {
            $dateObj = Carbon::today()->subDays($i);
            $dateStr = $dateObj->format('Y-m-d');
            
            $stat = $dailyStats->get($dateStr);
            $dayTotal = $stat ? $stat->total : 0;
            $dayPresent = $stat ? $stat->present : 0;
            $percentage = $dayTotal > 0 ? round(($dayPresent / $dayTotal) * 100, 2) : 0;
            
            $weeklyData[] = [
                'date' => $dateStr,
                'day' => $dateObj->format('D'),
                'percentage' => $percentage
            ];

            if ($i === 0) {
                $todayPercentage = $percentage;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'today_percentage' => $todayPercentage,
                'weekly_overview' => $weeklyData
            ]
        ]);
    }

    public function getStudentSummary($studentId = null)
    {
        $user = auth()->user();
        if ($user->role === 'student') {
            $studentId = $user->student->student_id;
        }

        if (!$studentId) {
            return response()->json(['success' => false, 'message' => 'Student ID required'], 400);
        }

        // Only count attendance for completed schedules
        $records = Attendance::where('student_id', $studentId)
            ->whereHas('schedule', function($q) {
                $q->where('status', 'Completed');
            })
            ->with(['schedule.subject', 'schedule.school_class'])
            ->orderBy('attendance_date', 'desc')
            ->get()
            ->unique('schedule_id'); // Ensure one record per schedule
        
        $summary = [
            'total_scheduled' => $records->count(),
            'present_count' => $records->whereIn('status', ['Present', 'Late'])->count(),
            'absent_count' => $records->where('status', 'Absent')->count(),
            'late_count' => $records->where('status', 'Late')->count(),
        ];

        return response()->json([
            'success' => true,
            'summary' => $summary,
            'records' => $records->values() // values() to reset keys after unique()
        ]);
    }
}
