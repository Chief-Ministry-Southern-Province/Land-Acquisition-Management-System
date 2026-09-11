<?php

namespace App\Services;

use App\Mail\GenericEmail;
use App\Models\Projects;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    /**
     * Generic function to send an email using Blade templates and SMTP config from .env.
     *
     * @param string|array $to Email address or array of email addresses
     * @param string $subject Email subject line
     * @param string $view Blade view name (e.g., 'emails.user_created')
     * @param array $data View data array
     * @return bool True if email dispatched successfully, false otherwise
     */
    public static function sendEmail(string|array $to, string $subject, string $view, array $data = []): bool
    {
        try {
            if (empty($to)) {
                return false;
            }

            Mail::to($to)->send(new GenericEmail($subject, $view, $data));

            return true;
        } catch (\Throwable $e) {
            $recipients = is_array($to) ? implode(', ', $to) : $to;
            Log::error("Failed to send email to [{$recipients}]: {$e->getMessage()}", [
                'exception' => $e,
                'subject' => $subject,
                'view' => $view,
            ]);

            return false;
        }
    }

    /**
     * Send email to a newly created user with login credentials.
     */
    public static function sendUserCreatedEmail(User $user, string $plainPassword): bool
    {
        $user->loadMissing(['role', 'department']);

        return static::sendEmail(
            to: $user->email,
            subject: 'Welcome to Land Acquisition Management System - Your Account Credentials',
            view: 'emails.user_created',
            data: [
                'user' => $user,
                'password' => $plainPassword,
                'loginUrl' => config('app.url'),
            ]
        );
    }

    /**
     * Send email to an officer receiving a case to approve.
     */
    public static function sendCasePendingApprovalEmail(User $recipient, Projects $project, string $stageName): bool
    {
        return static::sendEmail(
            to: $recipient->email,
            subject: "[Action Required] Case Pending Approval: {$project->title}",
            view: 'emails.case_pending_approval',
            data: [
                'recipient' => $recipient,
                'project' => $project,
                'stageName' => $stageName,
                'actionUrl' => config('app.url') . '/approval-workflow',
            ]
        );
    }

    /**
     * Send email to an officer when a case is denied, rejected, or queried by a higher officer.
     */
    public static function sendCaseDeniedEmail(User $recipient, Projects $project, string $deniedByRole, string $comment, string $actionType = 'rejected'): bool
    {
        $actionLabel = ucfirst($actionType);

        return static::sendEmail(
            to: $recipient->email,
            subject: "[Case Alert] Case {$actionLabel} by {$deniedByRole}: {$project->title}",
            view: 'emails.case_denied',
            data: [
                'recipient' => $recipient,
                'project' => $project,
                'deniedByRole' => $deniedByRole,
                'comment' => $comment,
                'actionType' => $actionType,
                'actionUrl' => config('app.url') . '/dashboard',
            ]
        );
    }
}
