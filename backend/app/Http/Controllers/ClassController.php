<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ClassController extends Controller
{
    public function index()
    {
        $classes = Classes::with('subjects')->get();
        return response()->json(['success' => true, 'data' => $classes]);
    }

    public function show($id)
    {
        $class = Classes::with(['subjects' => function($query) {
            $query->with('tutor')->withCount('students');
        }])->find($id);
        if (!$class) {
            return response()->json(['success' => false, 'message' => 'Class not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $class]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'class_name' => 'required|string|unique:classes',
            'academic_level' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
            'subjects' => 'nullable|array',
            'subjects.*.subject_name' => 'required_with:subjects|string',
            'subjects.*.tutor_id' => 'required_with:subjects|exists:tutors,tutor_id',
            'subjects.*.monthly_fee' => 'required_with:subjects|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $class = Classes::create([
            'class_name' => $request->class_name,
            'academic_level' => $request->academic_level,
            'status' => $request->status ?? 'active',
            'total_students' => 0
        ]);

        // Handle Subjects
        if ($request->has('subjects')) {
            foreach ($request->subjects as $sub) {
                \App\Models\Subject::create([
                    'subject_name' => $sub['subject_name'],
                    'class_id' => $class->class_id,
                    'tutor_id' => $sub['tutor_id'],
                    'monthly_fee' => $sub['monthly_fee'],
                    'grade' => $class->class_name, // Sync grade name if needed or store ref
                    'total_students' => 0
                ]);
            }
        }

        return response()->json(['success' => true, 'data' => $class], 201);
    }

    public function update(Request $request, $id)
    {
        $class = Classes::find($id);
        if (!$class) return response()->json(['success' => false, 'message' => 'Class not found'], 404);
        
        $validator = Validator::make($request->all(), [
            'class_name' => 'sometimes|string|unique:classes,class_name,'.$id.',class_id',
            'academic_level' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
            'subjects' => 'nullable|array',
            'subjects.*.subject_name' => 'required_with:subjects|string',
            'subjects.*.tutor_id' => 'required_with:subjects|exists:tutors,tutor_id',
            'subjects.*.monthly_fee' => 'required_with:subjects|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $class->update($request->only('class_name', 'academic_level', 'status'));

        // Handle Subjects Sync
        if ($request->has('subjects')) {
            $submittedSubjectIds = collect($request->subjects)->pluck('subject_id')->filter()->toArray();
            
            // Delete subjects that are no longer in the list
            \App\Models\Subject::where('class_id', $class->class_id)
                ->whereNotIn('subject_id', $submittedSubjectIds)
                ->delete();

            foreach ($request->subjects as $sub) {
                if (isset($sub['subject_id'])) {
                    // Update existing
                    $subject = \App\Models\Subject::find($sub['subject_id']);
                    if ($subject) {
                        $subject->update([
                            'subject_name' => $sub['subject_name'],
                            'tutor_id' => $sub['tutor_id'],
                            'monthly_fee' => $sub['monthly_fee'],
                            'grade' => $class->class_name // Update grade name if it changed
                        ]);
                    }
                } else {
                    // Create new
                    \App\Models\Subject::create([
                        'subject_name' => $sub['subject_name'],
                        'class_id' => $class->class_id,
                        'tutor_id' => $sub['tutor_id'],
                        'monthly_fee' => $sub['monthly_fee'],
                        'grade' => $class->class_name,
                        'total_students' => 0
                    ]);
                }
            }
        }

        return response()->json(['success' => true, 'data' => $class]);
    }

    public function destroy($id)
    {
        $class = Classes::find($id);
        if (!$class) return response()->json(['success' => false, 'message' => 'Class not found'], 404);
        
        // Check for dependencies? Student constraint is ON DELETE SET NULL, 
        // but maybe we should warn if students exist. 
        // For now, allow delete as per schema strictness isn't blocker.
        $class->delete();
        return response()->json(['success' => true, 'message' => 'Class deleted']);
    }
}
