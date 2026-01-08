<?php

namespace App\Http\Controllers;

use App\Models\Salary;
use App\Models\Tutor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalaryController extends Controller
{
    public function index(Request $request)
    {
        $query = Salary::with('tutor');

        if ($request->has('month')) {
            $query->where('month', $request->month);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('tutor_id')) {
            $query->where('tutor_id', $request->tutor_id);
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->get()
        ]);
    }

    public function getTutorSalaries()
    {
        $user = Auth::user();
        $tutor = $user->tutor;

        if (!$tutor) {
            return response()->json(['success' => false, 'message' => 'Tutor profile not found'], 404);
        }

        $salaries = Salary::where('tutor_id', $tutor->tutor_id)
            ->latest()
            ->paginate(15);

        $summary = [
            'total_earned' => Salary::where('tutor_id', $tutor->tutor_id)->where('status', 'Paid')->sum('net_salary'),
            'pending_amount' => Salary::where('tutor_id', $tutor->tutor_id)->where('status', 'Pending')->sum('net_salary'),
        ];

        return response()->json([
            'success' => true,
            'data' => $salaries,
            'summary' => $summary
        ]);
    }

    public function generateMonthlySalaries(Request $request)
    {
        $request->validate([
            'month' => 'required|string', // Format: YYYY-MM
        ]);

        $month = $request->month;
        $tutors = Tutor::whereHas('user', function($q) {
            $q->where('is_active', true);
        })->get();
        $generatedCount = 0;
        $skippedCount = 0;

        DB::beginTransaction();
        try {
            foreach ($tutors as $tutor) {
                // Check if salary already generated for this tutor and month
                $exists = Salary::where('tutor_id', $tutor->tutor_id)
                    ->where('month', $month)
                    ->exists();

                if ($exists) {
                    $skippedCount++;
                    continue;
                }

                $baseAmount = $tutor->basic_salary ?? 0;
                $allowances = 0;
                $bonus = 0;
                $deductions = 0;
                $netSalary = $baseAmount + $allowances + $bonus - $deductions;

                Salary::create([
                    'tutor_id' => $tutor->tutor_id,
                    'month' => $month,
                    'base_amount' => $baseAmount,
                    'allowances' => $allowances,
                    'bonus' => $bonus,
                    'deductions' => $deductions,
                    'net_salary' => $netSalary,
                    'status' => 'Pending',
                    'recorded_by' => Auth::id()
                ]);

                $generatedCount++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully generated $generatedCount salaries. $skippedCount were already generated.",
                'generated' => $generatedCount,
                'skipped' => $skippedCount
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate salaries: ' . $e->getMessage()
            ], 500);
        }
    }

    public function markAsPaid($id)
    {
        $salary = Salary::find($id);
        if (!$salary) {
            return response()->json(['success' => false, 'message' => 'Salary record not found'], 404);
        }

        $salary->update([
            'status' => 'Paid',
            'payment_date' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Salary marked as paid',
            'data' => $salary
        ]);
    }

    public function update(Request $request, $id)
    {
        $salary = Salary::find($id);
        if (!$salary) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }

        $request->validate([
            'base_amount' => 'required|numeric',
            'allowances' => 'nullable|numeric',
            'bonus' => 'nullable|numeric',
            'deductions' => 'nullable|numeric',
            'status' => 'nullable|string'
        ]);

        $base = $request->base_amount;
        $allowances = $request->allowances ?? 0;
        $bonus = $request->bonus ?? 0;
        $deductions = $request->deductions ?? 0;
        $net = $base + $allowances + $bonus - $deductions;

        $salary->update([
            'base_amount' => $base,
            'allowances' => $allowances,
            'bonus' => $bonus,
            'deductions' => $deductions,
            'net_salary' => $net,
            'status' => $request->status ?? $salary->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Salary updated successfully',
            'data' => $salary
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tutor_id' => 'required|exists:tutors,tutor_id',
            'month' => 'required|string',
            'base_amount' => 'required|numeric',
            'allowances' => 'nullable|numeric',
            'bonus' => 'nullable|numeric',
            'deductions' => 'nullable|numeric',
            'status' => 'nullable|string'
        ]);

        $base = $request->base_amount;
        $allowances = $request->allowances ?? 0;
        $bonus = $request->bonus ?? 0;
        $deductions = $request->deductions ?? 0;
        $net = $base + $allowances + $bonus - $deductions;

        $salary = Salary::create([
            'tutor_id' => $request->tutor_id,
            'month' => $request->month,
            'base_amount' => $base,
            'allowances' => $allowances,
            'bonus' => $bonus,
            'deductions' => $deductions,
            'net_salary' => $net,
            'status' => $request->status ?? 'Pending',
            'recorded_by' => Auth::id()
        ]);

        return response()->json(['success' => true, 'data' => $salary], 201);
    }

    public function show($id)
    {
        $salary = Salary::with('tutor.user')->find($id);
        if (!$salary) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $salary]);
    }

    public function destroy($id)
    {
        $salary = Salary::find($id);
        if (!$salary) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }
        $salary->delete();
        return response()->json(['success' => true, 'message' => 'Deleted']);
    }
}
