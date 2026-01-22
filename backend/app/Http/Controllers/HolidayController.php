<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HolidayController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Holiday::orderBy('holiday_date')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'holiday_date' => 'required|date|unique:holidays,holiday_date'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $holiday = Holiday::create($request->all());
        return response()->json(['success' => true, 'data' => $holiday], 201);
    }

    public function update(Request $request, $id)
    {
        $holiday = Holiday::find($id);
        if (!$holiday) return response()->json(['success' => false, 'message' => 'Holiday not found'], 404);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'holiday_date' => 'sometimes|required|date|unique:holidays,holiday_date,' . $id . ',holiday_id'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $holiday->update($request->all());
        return response()->json(['success' => true, 'data' => $holiday]);
    }

    public function destroy($id)
    {
        $holiday = Holiday::find($id);
        if (!$holiday) return response()->json(['success' => false, 'message' => 'Holiday not found'], 404);
        $holiday->delete();
        return response()->json(['success' => true, 'message' => 'Holiday deleted']);
    }
}
