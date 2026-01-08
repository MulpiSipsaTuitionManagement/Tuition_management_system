<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Subject::with(['school_class', 'tutor']);
        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }
        $subjects = $query->get();
        return response()->json(['success' => true, 'data' => $subjects]);
    }

    public function show($id)
    {
        $subject = Subject::with(['school_class', 'tutor', 'students', 'schedules'])->find($id);
        if (!$subject) {
            return response()->json(['success' => false, 'message' => 'Subject not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $subject]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subject_name' => 'required|string',
            'class_id' => 'required|exists:classes,class_id',
            'tutor_id' => 'required|exists:tutors,tutor_id',
            'monthly_fee' => 'required|numeric',
            'grade' => 'required|string', // Ensuring grade is validated
            'study_materials' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $subject = Subject::create([
            'subject_name' => $request->subject_name,
            'class_id' => $request->class_id,
            'tutor_id' => $request->tutor_id,
            'monthly_fee' => $request->monthly_fee,
            'grade' => $request->grade,
            'study_materials' => $request->study_materials,
            'total_students' => 0
        ]);

        return response()->json(['success' => true, 'data' => $subject, 'message' => 'Subject created successfully'], 201);
    }

    public function update(Request $request, $id)
    {
        $subject = Subject::find($id);
        if (!$subject) {
            return response()->json(['success' => false, 'message' => 'Subject not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'subject_name' => 'sometimes|string',
            'class_id' => 'sometimes|exists:classes,class_id',
            'tutor_id' => 'sometimes|exists:tutors,tutor_id',
            'monthly_fee' => 'sometimes|numeric',
            'grade' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $subject->update($request->all());
        return response()->json(['success' => true, 'data' => $subject, 'message' => 'Subject updated successfully']);
    }

    public function destroy($id)
    {
        $subject = Subject::find($id);
        if (!$subject) {
            return response()->json(['success' => false, 'message' => 'Subject not found'], 404);
        }
        $subject->delete();
        return response()->json(['success' => true, 'message' => 'Subject deleted successfully']);
    }
}
