<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('lams:send-checklist-reminders')->daily();

// Hourly check to trigger automated backups if due according to configured frequency (hourly, daily, weekly, monthly)
Schedule::command('lams:run-backup')->hourly();

// Daily retention check to purge old backups and audit logs exceeding configured retention periods
Schedule::command('lams:clean-backups')->daily();
