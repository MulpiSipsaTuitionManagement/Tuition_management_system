<?php

// app/Http/Controllers/NotificationController.php
namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\SMSService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    protected $smsService;

    public function __construct(SMSService $smsService)
    {
        $this->smsService = $smsService;
    }

    public function index(Request $request)
    {
        $query = Notification::with(['user', 'student']);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by student
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date,
                $request->end_date
            ]);
        }

        $notifications = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    public function show($id)
    {
        $notification = Notification::with(['user', 'student'])
            ->find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $notification
        ]);
    }

    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|max:255',
            'message' => 'required|string',
            'student_id' => 'nullable|exists:students,student_id',
            'recipient_phone' => 'required|string',
            'send_immediately' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $notification = Notification::create([
                'type' => $request->type,
                'message' => $request->message,
                'student_id' => $request->student_id,
                'user_id' => Auth::id(),
                'recipient_phone' => $request->recipient_phone,
                'status' => 'pending'
            ]);

            // Send immediately if requested
            if ($request->send_immediately) {
                $this->sendNotification($notification->notification_id);
            }

            return response()->json([
                'success' => true,
                'message' => 'Notification created successfully',
                'data' => $notification
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create notification: ' . $e->getMessage()
            ], 500);
        }
    }

    public function sendNotification($id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        try {
            $result = $this->smsService->send(
                $notification->recipient_phone,
                $notification->message
            );

            if ($result['success']) {
                $notification->update([
                    'status' => 'Sent',
                    'sent_date' => now()
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Notification sent successfully'
                ]);
            } else {
                $notification->update([
                    'status' => 'Failed'
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send notification: ' . $result['message']
                ], 500);
            }

        } catch (\Exception $e) {
            $notification->update([
                'status' => 'Failed'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send notification: ' . $e->getMessage()
            ], 500);
        }
    }

    public function sendPendingNotifications()
    {
        $pendingNotifications = Notification::where('status', 'pending')->get();

        $sentCount = 0;
        $failedCount = 0;

        foreach ($pendingNotifications as $notification) {
            try {
                $result = $this->smsService->send(
                    $notification->recipient_phone,
                    $notification->message
                );

                if ($result['success']) {
                    $notification->update([
                        'status' => 'Sent',
                        'sent_date' => now()
                    ]);
                    $sentCount++;
                } else {
                    $notification->update([
                        'status' => 'Failed'
                    ]);
                    $failedCount++;
                }

            } catch (\Exception $e) {
                $notification->update([
                    'status' => 'Failed'
                ]);
                $failedCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Sent: {$sentCount}, Failed: {$failedCount}",
            'data' => [
                'sent' => $sentCount,
                'failed' => $failedCount
            ]
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        try {
            $notification->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update notification: ' . $e->getMessage()
            ], 500);
        }
    }

    public function delete($id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        try {
            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getMyNotifications(Request $request)
    {
        $user = Auth::user();
        $notifications = Notification::where('user_id', $user->user_id)
                               ->orderBy('created_at', 'desc')
                               ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    public function getUnreadCount()
    {
        $user = Auth::user();
        $count = Notification::where('is_read', false)
                            ->where('user_id', $user->user_id)
                            ->count();

        return response()->json([
            'success' => true,
            'count' => $count
        ]);
    }

    public function getStats()
    {
        $total = Notification::count();
        $sent = Notification::where('status', 'Sent')->count();
        $pending = Notification::where('status', 'pending')->count();
        $failed = Notification::where('status', 'Failed')->count();

        $byType = Notification::selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->get();

        $recentSent = Notification::where('status', 'Sent')
            ->where('sent_date', '>=', now()->subDays(7))
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'sent' => $sent,
                'pending' => $pending,
                'failed' => $failed,
                'by_type' => $byType,
                'recent_sent' => $recentSent
            ]
        ]);
    }

    public function bulkSend(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'exists:notifications,notification_id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $notifications = Notification::whereIn('notification_id', $request->notification_ids)
            ->where('status', 'pending')
            ->get();

        $sentCount = 0;
        $failedCount = 0;

        foreach ($notifications as $notification) {
            try {
                $result = $this->smsService->send(
                    $notification->recipient_phone,
                    $notification->message
                );

                if ($result['success']) {
                    $notification->update([
                        'status' => 'Sent',
                        'sent_date' => now()
                    ]);
                    $sentCount++;
                } else {
                    $notification->update(['status' => 'Failed']);
                    $failedCount++;
                }

            } catch (\Exception $e) {
                $notification->update(['status' => 'Failed']);
                $failedCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Sent: {$sentCount}, Failed: {$failedCount}",
            'data' => [
                'sent' => $sentCount,
                'failed' => $failedCount
            ]
        ]);
    }
}
