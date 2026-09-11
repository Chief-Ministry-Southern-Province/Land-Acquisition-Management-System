<?php

namespace App\Services;

use App\Mail\GenericEmail;
use App\Models\Projects;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Services\SmsService;

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
     * Determine if email should be sent based on user preference.
     */
    public static function shouldSendEmail(?User $user): bool
    {
        if (! $user) return true;
        $pref = $user->notification_preference ?? 'email';
        return in_array($pref, ['email', 'both']);
    }

    /**
     * Determine if SMS should be sent based on user preference.
     */
    public static function shouldSendSms(?User $user): bool
    {
        if (! $user) return false;
        $pref = $user->notification_preference ?? 'email';
        return in_array($pref, ['sms', 'both']);
    }

    /**
     * Send notification to a newly created user based on notification preference.
     */
    public static function sendUserCreatedEmail(User $user, string $plainPassword, bool $sendSms = false): bool
    {
        $user->loadMissing(['role', 'department']);

        $pref = $user->notification_preference ?? 'email';
        if ($pref === 'none') {
            Log::info("Skipping notification for user {$user->id}: Preference is 'none'.");
            return false;
        }

        $emailSent = false;

        if (static::shouldSendEmail($user)) {
            $emailSent = static::sendEmail(
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

        if (static::shouldSendSms($user) || $sendSms || ($pref === 'email' && !$emailSent)) {
            SmsService::sendUserCreatedSms($user, $plainPassword);
        }

        return $emailSent || static::shouldSendSms($user);
    }

    /**
     * Send notification to an officer receiving a case to approve based on preference.
     */
    public static function sendCasePendingApprovalEmail(User $recipient, Projects $project, string $stageName, bool $sendSms = false): bool
    {
        $pref = $recipient->notification_preference ?? 'email';
        if ($pref === 'none') {
            Log::info("Skipping case pending notification for user {$recipient->id}: Preference is 'none'.");
            return false;
        }

        $emailSent = false;

        if (static::shouldSendEmail($recipient)) {
            $emailSent = static::sendEmail(
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

        if (static::shouldSendSms($recipient) || $sendSms || ($pref === 'email' && !$emailSent)) {
            SmsService::sendCasePendingApprovalSms($recipient, $project, $stageName);
        }

        return $emailSent || static::shouldSendSms($recipient);
    }

    /**
     * Send notification to an officer when a case is denied/queried based on preference.
     */
    public static function sendCaseDeniedEmail(User $recipient, Projects $project, string $deniedByRole, string $comment, string $actionType = 'rejected', bool $sendSms = false): bool
    {
        $pref = $recipient->notification_preference ?? 'email';
        if ($pref === 'none') {
            Log::info("Skipping case denied notification for user {$recipient->id}: Preference is 'none'.");
            return false;
        }

        $emailSent = false;
        $actionLabel = ucfirst($actionType);

        if (static::shouldSendEmail($recipient)) {
            $emailSent = static::sendEmail(
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

        if (static::shouldSendSms($recipient) || $sendSms || ($pref === 'email' && !$emailSent)) {
            SmsService::sendCaseDeniedSms($recipient, $project, $deniedByRole, $comment, $actionType);
        }

        return $emailSent || static::shouldSendSms($recipient);
    }
}


