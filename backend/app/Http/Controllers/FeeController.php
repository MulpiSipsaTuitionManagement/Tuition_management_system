<?php

namespace App\Http\Controllers;

use App\Models\Fee;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class FeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Fee::with(['student.school_class', 'subject']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('month') && $request->month) {
            // Assuming due_date stores the 1st of the month or we filter by month/year
            $date = Carbon::parse($request->month . '-01');
            $query->whereMonth('due_date', $date->month)
                  ->whereYear('due_date', $date->year);
        }

        if ($request->has('class_id') && $request->class_id) {
            $query->whereHas('student', function($q) use ($request) {
                $q->where('class_id', $request->class_id);
            });
        }

        if ($request->has('student_id') && $request->student_id) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('search') && $request->search) {
            $query->whereHas('student', function($q) use ($request) {
                $q->where('full_name', 'LIKE', '%' . $request->search . '%');
            });
        }
        
        $sort = $request->get('sort', 'desc');
        
        return response()->json([
            'success' => true, 
            'data' => $query->orderBy('due_date', $sort)->get()
        ]);
    }

    public function generateMonthlyFees(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'month' => 'required|date_format:Y-m'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $monthStr = $request->month; // YYYY-MM
        $dueDate = Carbon::parse($monthStr . '-01');
        $endOfMonth = $dueDate->copy()->endOfMonth();
        
        $students = Student::where('total_monthly_fee', '>', 0)
            ->where('enrollment_date', '<=', $endOfMonth)
            ->get();
        $count = 0;

        foreach ($students as $student) {
            // Check if record already exists for this student and month
            $exists = Fee::where('student_id', $student->student_id)
                        ->whereMonth('due_date', $dueDate->month)
                        ->whereYear('due_date', $dueDate->year)
                        ->exists();

            if (!$exists) {
                Fee::create([
                    'student_id' => $student->student_id,
                    'amount' => $student->total_monthly_fee,
                    'due_date' => $dueDate,
                    'status' => 'pending',
                    'recorded_by' => Auth::id(),
                    'remarks' => "Monthly fee for " . $monthStr
                ]);
                
                // Send SMS Reminder
                try {
                    if ($student->guardian_contact) {
                        $smsService = app(\App\Services\SMSService::class);
                        $smsService->send($student->guardian_contact, "Fee Reminder: Monthly fee of Rs. " . number_format($student->total_monthly_fee, 2) . " for " . $student->full_name . " is now due for " . $monthStr . ". Please pay by the due date.");
                    }
                } catch (\Exception $e) {
                    \Log::error("Fee Reminder SMS Error: " . $e->getMessage());
                }

                $count++;
            }
        }

        return response()->json([
            'success' => true, 
            'message' => "Generated $count fee records for $monthStr"
        ]);
    }

    public function sendReminder($id)
    {
        $fee = Fee::with('student')->find($id);
        if (!$fee || !$fee->student) {
            return response()->json(['success' => false, 'message' => 'Fee record or student not found'], 404);
        }

        if ($fee->status === 'paid') {
            return response()->json(['success' => false, 'message' => 'Fee is already paid'], 400);
        }

        try {
            if ($fee->student->guardian_contact) {
                $smsService = app(\App\Services\SMSService::class);
                $month = Carbon::parse($fee->due_date)->format('F Y');
                $smsService->send($fee->student->guardian_contact, "Urgent Fee Reminder: Pending fee of Rs. " . number_format($fee->amount, 2) . " for " . $fee->student->full_name . " (Month: " . $month . "). Please settle prominently.");
                return response()->json(['success' => true, 'message' => 'Reminder sent successfully']);
            }
            return response()->json(['success' => false, 'message' => 'Guardian contact not available'], 400);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'SMS Error: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,student_id',
            'amount' => 'required|numeric',
            'due_date' => 'required|date',
            'fee_type' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $fee = Fee::create(array_merge($request->all(), [
            'status' => 'pending',
            'recorded_by' => Auth::id()
        ]));

        return response()->json(['success' => true, 'data' => $fee], 201);
    }
    
    public function update(Request $request, $id)
    {
        $fee = Fee::find($id);
        if (!$fee) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        
        $fee->update($request->all());
        return response()->json(['success' => true, 'data' => $fee]);
    }

    public function markAsPaid(Request $request, $id)
    {
        $fee = Fee::find($id);
        if (!$fee) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        
        $fee->update([
            'status' => 'paid',
            'paid_date' => now(),
            'recorded_by' => Auth::id()
        ]);

        return response()->json(['success' => true, 'message' => 'Fee marked as paid']);
    }

    public function getStudentFees(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Student profile not found'], 404);
        }

        $sort = $request->get('sort', 'asc');
        $fees = Fee::where('student_id', $student->student_id)
            ->orderBy('due_date', $sort)
            ->paginate(15);

        $summary = [
            'total_fees' => Fee::where('student_id', $student->student_id)->sum('amount'),
            'paid' => Fee::where('student_id', $student->student_id)->where('status', 'paid')->sum('amount'),
            'pending' => Fee::where('student_id', $student->student_id)->where('status', '!=', 'paid')->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $fees,
            'summary' => $summary
        ]);
    }

    public function destroy($id)
    {
        $fee = Fee::find($id);
        if (!$fee) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        $fee->delete();
        return response()->json(['success' => true, 'message' => 'Record deleted']);
    }
}
