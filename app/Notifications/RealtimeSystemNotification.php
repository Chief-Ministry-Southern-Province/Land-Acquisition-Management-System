<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class RealtimeSystemNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $title,
        public string $message,
        public ?string $actionUrl = null,
        public string $type = 'info' // 'info' | 'success' | 'warning' | 'error'
    ) {}

    /**
     * Store in database and send via WebSocket broadcasting.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Data stored in database (`notifications` table).
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'action_url' => $this->actionUrl,
            'type' => $this->type,
        ];
    }

    /**
     * Real-time WebSocket payload broadcast to client via Laravel Echo.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'title' => $this->title,
            'message' => $this->message,
            'action_url' => $this->actionUrl,
            'type' => $this->type,
            'created_at' => now()->toIso8601String(),
            'read_at' => null,
        ]);
    }
}
