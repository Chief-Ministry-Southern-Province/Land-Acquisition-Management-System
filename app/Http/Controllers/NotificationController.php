<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get user's notifications.
     */
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()->orderBy('created_at', 'desc')->get()->map(function ($notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? '',
                'message' => $notification->data['message'] ?? '',
                'action_url' => $notification->data['action_url'] ?? null,
                'type' => $notification->data['type'] ?? 'info',
                'created_at' => $notification->created_at->toIso8601String(),
                'read_at' => $notification->read_at ? $notification->read_at->toIso8601String() : null,
            ];
        });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ], 200);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read',
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ], 200);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'message' => 'All notifications marked as read',
            'unread_count' => 0,
        ], 200);
    }
}
