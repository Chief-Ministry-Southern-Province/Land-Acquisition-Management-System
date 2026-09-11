<?php

namespace App\Services;

use App\Models\Projects;
use App\Models\User;
use App\Services\Sms\SmsGatewayManager;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Singleton instance of Gateway Manager.
     */
    protected static ?SmsGatewayManager $manager = null;

    /**
     * Get or initialize SmsGatewayManager instance.
     */
    public static function getManager(): SmsGatewayManager
    {
        if (static::$manager === null) {
            static::$manager = new SmsGatewayManager();
        }

        return static::$manager;
    }

    /**
     * Set a custom SmsGatewayManager instance (useful for unit testing / mocking).
     */
    public static function setManager(?SmsGatewayManager $manager): void
    {
        static::$manager = $manager;
    }

    /**
     * Generic function to send an SMS message using configured SMS Gateway.
     *
     * @param string|array $to Phone number or array of phone numbers / User models
     * @param string $message Text content to send
     * @param string|null $driver Explicit driver name (e.g. 'log', 'twilio', 'notify_lk', 'generic_http')
     * @param array $options Gateway parameters or extra options
     * @return bool True if message dispatched successfully, false otherwise
     */
    public static function sendSms(string|array|User $to, string $message, ?string $driver = null, array $options = []): bool
    {
        try {
            if (config('sms.enabled') === false) {
                Log::info("SMS dispatch skipped: SMS is disabled in configuration.");
                return false;
            }

            if ($to instanceof User) {
                $pref = $to->notification_preference ?? 'email';
                if ($pref === 'none' && empty($options['force'])) {
                    Log::info("SMS dispatch skipped for User {$to->id}: Notification preference is 'none'.");
                    return false;
                }
            }

            $recipients = static::normalizeRecipients($to);

            if (empty($recipients)) {
                Log::warning("SMS dispatch failed: No valid recipient phone numbers provided.");
                return false;
            }

            $gateway = static::getManager()->driver($driver);
            $allSuccessful = true;

            foreach ($recipients as $phone) {
                $sent = $gateway->send($phone, $message, $options);
                if (!$sent) {
                    $allSuccessful = false;
                }
            }

            return $allSuccessful;
        } catch (\Throwable $e) {
            Log::error("SmsService encountered error: {$e->getMessage()}", [
                'exception' => $e,
                'message' => $message,
            ]);

            return false;
        }
    }

    /**
     * Send SMS to a newly created user with login credentials.
     *
     * @param User $user
     * @param string $plainPassword
     * @param string|null $driver
     * @return bool
     */
    public static function sendUserCreatedSms(User $user, string $plainPassword, ?string $driver = null): bool
    {
        $phone = static::extractPhone($user);
        if (empty($phone)) {
            Log::warning("Cannot send user creation SMS to user ID {$user->id}: No phone number available.");
            return false;
        }

        $appName = config('app.name', 'LAM System');
        $message = "Welcome to {$appName}! Your account has been created. Email: {$user->email}, Password: {$plainPassword}. Login at: " . config('app.url');

        return static::sendSms($phone, $message, $driver);
    }

    /**
     * Send SMS to an officer receiving a case to approve.
     *
     * @param User|string $recipient
     * @param Projects $project
     * @param string $stageName
     * @param string|null $driver
     * @return bool
     */
    public static function sendCasePendingApprovalSms(User|string $recipient, Projects $project, string $stageName, ?string $driver = null): bool
    {
        $phone = is_string($recipient) ? $recipient : static::extractPhone($recipient);
        if (empty($phone)) {
            Log::warning("Cannot send case pending SMS for project {$project->id}: No recipient phone number.");
            return false;
        }

        $message = "[LAM Alert] Case Pending Approval: '{$project->title}' requires your review for stage '{$stageName}'. Please log in to approve.";

        return static::sendSms($phone, $message, $driver);
    }

    /**
     * Send SMS to an officer when a case is denied, rejected, or queried.
     *
     * @param User|string $recipient
     * @param Projects $project
     * @param string $deniedByRole
     * @param string $comment
     * @param string $actionType ('rejected' or 'queried')
     * @param string|null $driver
     * @return bool
     */
    public static function sendCaseDeniedSms(User|string $recipient, Projects $project, string $deniedByRole, string $comment, string $actionType = 'rejected', ?string $driver = null): bool
    {
        $phone = is_string($recipient) ? $recipient : static::extractPhone($recipient);
        if (empty($phone)) {
            Log::warning("Cannot send case denied SMS for project {$project->id}: No recipient phone number.");
            return false;
        }

        $actionLabel = ucfirst($actionType);
        $message = "[LAM Alert] Case {$actionLabel} by {$deniedByRole} for project '{$project->title}'. Comment: {$comment}";

        return static::sendSms($phone, $message, $driver);
    }

    /**
     * Normalize recipient input into an array of clean phone strings.
     *
     * @param string|array|User $to
     * @return array<string>
     */
    protected static function normalizeRecipients(string|array|User $to): array
    {
        if ($to instanceof User) {
            $phone = static::extractPhone($to);
            return $phone ? [$phone] : [];
        }

        if (is_string($to)) {
            $cleaned = static::sanitizePhone($to);
            return $cleaned ? [$cleaned] : [];
        }

        $phones = [];
        foreach ($to as $item) {
            if ($item instanceof User) {
                $p = static::extractPhone($item);
                if ($p) $phones[] = $p;
            } else if (is_string($item)) {
                $p = static::sanitizePhone($item);
                if ($p) $phones[] = $p;
            }
        }

        return array_unique($phones);
    }

    /**
     * Extract phone number from a User model or related department.
     *
     * @param User $user
     * @return string|null
     */
    public static function extractPhone(User $user): ?string
    {
        $user->loadMissing('department');

        $phone = $user->phone ?? $user->phone_number ?? $user->department?->phone ?? null;

        return $phone ? static::sanitizePhone((string) $phone) : null;
    }

    /**
     * Sanitize phone number string (strip non-digit characters except leading +).
     *
     * @param string $phone
     * @return string|null
     */
    public static function sanitizePhone(string $phone): ?string
    {
        $phone = trim($phone);
        if (empty($phone)) {
            return null;
        }

        $isPlus = str_starts_with($phone, '+');
        $digitsOnly = preg_replace('/[^\d]/', '', $phone);

        if (empty($digitsOnly)) {
            return null;
        }

        return $isPlus ? '+' . $digitsOnly : $digitsOnly;
    }
}
