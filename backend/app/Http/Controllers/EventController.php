<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Event::orderBy('event_date')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $event = Event::create($request->all());
        return response()->json(['success' => true, 'data' => $event], 201);
    }

    public function update(Request $request, $id)
    {
        $event = Event::find($id);
        if (!$event) return response()->json(['success' => false, 'message' => 'Event not found'], 404);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'sometimes|required|date'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $event->update($request->all());
        return response()->json(['success' => true, 'data' => $event]);
    }

    public function destroy($id)
    {
        $event = Event::find($id);
        if (!$event) return response()->json(['success' => false, 'message' => 'Event not found'], 404);
        $event->delete();
        return response()->json(['success' => true, 'message' => 'Event deleted']);
    }
}
