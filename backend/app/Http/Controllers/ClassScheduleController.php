<?php

namespace App\Http\Controllers;

use App\Models\ClassSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ClassScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = ClassSchedule::with(['school_class', 'subject', 'tutor']);
        
        // Role-based filtering
        if ($user->role === 'student') {
            $student = $user->student;
            $query->where('class_id', $student->class_id);
        } elseif ($user->role === 'tutor') {
            $tutor = $user->tutor;
            $query->where('tutor_id', $tutor->tutor_id);
        }

        // Additional filters
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }
        if ($request->filled('tutor_id')) {
            $query->where('tutor_id', $request->tutor_id);
        }
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->filled('date')) {
            $query->where('schedule_date', $request->date);
        }

        // Time range filtering
        if ($request->has('range') && $request->range !== 'all') {
            $now = Carbon::now();
            if ($request->range === 'today') {
                $query->whereDate('schedule_date', $now->toDateString());
            } elseif ($request->range === 'week') {
                $start = $now->copy()->startOfWeek()->toDateString();
                $end = $now->copy()->endOfWeek()->toDateString();
                $query->whereBetween('schedule_date', [$start, $end]);
            } elseif ($request->range === 'month') {
                $query->whereMonth('schedule_date', $now->month)
                      ->whereYear('schedule_date', $now->year);
            }
        }

        $schedules = $query->orderBy('schedule_date')->orderBy('start_time')->get();
        return response()->json(['success' => true, 'data' => $schedules]);
    }

    public function getSchedulingOptions()
    {
        $user = auth()->user();
        $data = [
            'classes' => [],
            'tutors' => [],
            'subjects' => []
        ];

        if ($user->role === 'tutor') {
            $tutor = $user->tutor;
            // Tutors see their assigned classes and subjects
            $data['subjects'] = \App\Models\Subject::where('tutor_id', $tutor->tutor_id)
                ->with('school_class')
                ->get();
            $data['classes'] = $data['subjects']->pluck('school_class')->unique('class_id')->values();
        } elseif ($user->role === 'admin') {
            $data['classes'] = \App\Models\Classes::all();
            $data['tutors'] = \App\Models\Tutor::all();
            $data['subjects'] = \App\Models\Subject::all();
        } elseif ($user->role === 'student') {
            $student = $user->student;
            $data['classes'] = \App\Models\Classes::where('class_id', $student->class_id)->get();
            $data['subjects'] = \App\Models\Subject::where('class_id', $student->class_id)->get();
        }

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function show($id)
    {
        $schedule = ClassSchedule::with(['school_class', 'subject', 'tutor'])->find($id);
        if (!$schedule) return response()->json(['success' => false, 'message' => 'Schedule not found'], 404);
        return response()->json(['success' => true, 'data' => $schedule]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $validator = Validator::make($request->all(), [
            'class_id' => 'required|exists:classes,class_id',
            'subject_id' => 'required|exists:subjects,subject_id',
            'tutor_id' => 'required|exists:tutors,tutor_id',
            'schedule_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'status' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Tutor logic: Lock to their own id
        if ($user->role === 'tutor') {
            $tutorId = $user->tutor->tutor_id;
            if ($request->tutor_id != $tutorId) {
                return response()->json(['success' => false, 'message' => 'You can only schedule for yourself'], 403);
            }
        }

        // Conflict check
        $conflict = ClassSchedule::where('tutor_id', $request->tutor_id)
            ->where('schedule_date', $request->schedule_date)
            ->where(function ($q) use ($request) {
                $q->where(function($qq) use ($request) {
                    $qq->where('start_time', '<', $request->end_time)
                       ->where('end_time', '>', $request->start_time);
                });
            })->exists();

        if ($conflict) {
            return response()->json(['success' => false, 'message' => 'Tutor has a scheduling conflict'], 409);
        }

        $schedule = ClassSchedule::create(array_merge($request->all(), [
            'status' => $request->status ?: 'Upcoming'
        ]));
        
        return response()->json(['success' => true, 'data' => $schedule], 201);
    }

    public function update(Request $request, $id)
    {
        $schedule = ClassSchedule::find($id);
        if (!$schedule) return response()->json(['success' => false, 'message' => 'Schedule not found'], 404);

        $validator = Validator::make($request->all(), [
            'schedule_date' => 'sometimes|date',
            'start_time' => 'sometimes',
            'end_time' => 'sometimes|after:start_time',
            'status' => 'sometimes|string|in:Upcoming,Scheduled,Completed,Cancelled,Postponed'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Conflict check if date/time changed
        if ($request->has('schedule_date') || $request->has('start_time') || $request->has('end_time')) {
            $date = $request->schedule_date ?? $schedule->schedule_date;
            $start = $request->start_time ?? $schedule->start_time;
            $end = $request->end_time ?? $schedule->end_time;

            $conflict = ClassSchedule::where('tutor_id', $schedule->tutor_id)
                ->where('schedule_id', '!=', $id)
                ->where('schedule_date', $date)
                ->where(function ($q) use ($start, $end) {
                    $q->where(function($qq) use ($start, $end) {
                        $qq->where('start_time', '<', $end)
                           ->where('end_time', '>', $start);
                    });
                })->exists();

            if ($conflict) {
                return response()->json(['success' => false, 'message' => 'Tutor has a scheduling conflict at this time'], 409);
            }
        }

        $schedule->update($request->all());
        return response()->json(['success' => true, 'data' => $schedule->load(['school_class', 'subject', 'tutor'])]);
    }

    public function destroy($id)
    {
        $schedule = ClassSchedule::find($id);
        if (!$schedule) return response()->json(['success' => false, 'message' => 'Schedule not found'], 404);
        $schedule->delete();
        return response()->json(['success' => true, 'message' => 'Schedule deleted']);
    }
}
