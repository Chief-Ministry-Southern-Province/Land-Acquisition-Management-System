<?php

namespace App\Console\Commands;

use App\Models\Departments;
use App\Models\Roles;
use App\Models\User;
use Database\Seeders\ProductionSeeder;
use Illuminate\Console\Command;
use Illuminate\Console\ConfirmableTrait;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MigrateProduction extends Command
{
    use ConfirmableTrait;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:production
                            {--fresh : Drop all tables and re-run all migrations from scratch}
                            {--admin-name= : Custom administrator name}
                            {--admin-email= : Custom administrator email}
                            {--admin-password= : Custom administrator password}
                            {--force : Force execution without interactive confirmation in production}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run migrations and seed baseline production data (roles, departments, permissions, and sample admin only; without dummy data).';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (! $this->confirmToProceed()) {
            return self::FAILURE;
        }

        $isFresh = (bool) $this->option('fresh');
        $adminName = $this->option('admin-name') ?: env('ADMIN_NAME', 'System Administrator');
        $adminEmail = $this->option('admin-email') ?: env('ADMIN_EMAIL', 'admin@lams.gov.lk');
        $adminPassword = $this->option('admin-password') ?: env('ADMIN_DEFAULT_PASSWORD', 'Admin@12345');

        $this->info('====================================================');
        $this->info('  LAMS PRODUCTION DATABASE MIGRATION INITIATED');
        $this->info('====================================================');

        // 1. Run schema migrations
        if ($isFresh) {
            $this->warn('Running migrate:fresh to rebuild database schema...');
            $status = $this->call('migrate:fresh', [
                '--force' => true,
            ]);
        } else {
            $this->info('Running migrate to ensure all tables are up to date...');
            $status = $this->call('migrate', [
                '--force' => true,
            ]);
        }

        if ($status !== 0) {
            $this->error('Schema migration failed.');

            return self::FAILURE;
        }

        // 2. Run production-specific migration & seeder
        $this->info('Seeding production baseline data (Departments, Roles, Permissions)...');

        $this->call('migrate', [
            '--path' => 'database/migrations/production',
            '--force' => true,
        ]);

        $this->call('db:seed', [
            '--class' => ProductionSeeder::class,
            '--force' => true,
        ]);

        // 3. Ensure custom admin credentials if overridden via CLI options or ENV
        $adminRole = Roles::where('role_name', 'Admin')->first();
        $adminDept = Departments::where('id', 1)->first() ?? Departments::first();

        if ($adminRole && $adminDept) {
            $adminUser = User::where('email', $adminEmail)->first();
            if ($adminUser) {
                $adminUser->update([
                    'name' => $adminName,
                    'password' => Hash::make($adminPassword),
                    'role_id' => $adminRole->id,
                    'department_id' => $adminDept->id,
                    'status' => 'active',
                    'notification_preference' => 'all',
                ]);
            } else {
                User::create([
                    'name' => $adminName,
                    'email' => $adminEmail,
                    'password' => Hash::make($adminPassword),
                    'role_id' => $adminRole->id,
                    'department_id' => $adminDept->id,
                    'phone' => '+94 11 234 1001',
                    'status' => 'active',
                    'notification_preference' => 'all',
                    'email_verified_at' => now(),
                ]);
            }
        }

        // 4. Verification of production state
        $projectCount = DB::table('projects')->count();
        $parcelCount = DB::table('land_parcels')->count();
        $userCount = DB::table('users')->count();
        $roleCount = DB::table('roles')->count();
        $deptCount = DB::table('departments')->count();

        $this->newLine();
        $this->info('Production baseline migration completed successfully!');
        $this->newLine();

        $this->table(
            ['Configuration / Metric', 'Value'],
            [
                ['Environment', app()->environment()],
                ['Database', config('database.default')],
                ['Departments Seeded', $deptCount],
                ['Roles Seeded', $roleCount],
                ['Total Users', $userCount],
                ['Dummy Projects Found', $projectCount === 0 ? '0 (Clean)' : "{$projectCount} (Warning!)"],
                ['Dummy Parcels Found', $parcelCount === 0 ? '0 (Clean)' : "{$parcelCount} (Warning!)"],
            ]
        );

        $this->newLine();
        $this->info('Sample Administrator Credentials:');
        $this->table(
            ['Field', 'Value'],
            [
                ['Name', $adminName],
                ['Email', $adminEmail],
                ['Password', $adminPassword],
                ['Role', 'Admin'],
                ['Department', $adminDept ? $adminDept->department_name : 'Administration'],
            ]
        );

        $this->warn('IMPORTANT: Please instruct the system administrator to change this default password upon initial login!');

        return self::SUCCESS;
    }
}
