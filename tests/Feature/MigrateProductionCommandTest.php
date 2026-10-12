<?php

use App\Models\Departments;
use App\Models\Roles;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

test('migrate:production command runs successfully and creates baseline data without dummy records', function () {
    $this->artisan('migrate:production', ['--force' => true])
        ->assertSuccessful();

    // Verify departments
    expect(Departments::count())->toBeGreaterThanOrEqual(5);
    expect(Departments::where('dep_code', 'ADM')->exists())->toBeTrue();

    // Verify roles
    expect(Roles::count())->toBeGreaterThanOrEqual(8);
    expect(Roles::where('role_name', 'Admin')->exists())->toBeTrue();

    // Verify permissions and mappings
    expect(DB::table('permissions')->count())->toBe(6);
    expect(DB::table('role_permission')->count())->toBe(15);

    // Verify ONLY the sample admin user exists (or no dummy users)
    $users = User::all();
    expect($users->where('email', 'admin@lams.gov.lk')->isNotEmpty())->toBeTrue();
    $admin = $users->firstWhere('email', 'admin@lams.gov.lk');
    expect($admin->role->role_name)->toBe('Admin');
    expect(Hash::check('Admin@12345', $admin->password))->toBeTrue();

    // Verify ZERO dummy business records
    expect(DB::table('projects')->count())->toBe(0);
    expect(DB::table('land_parcels')->count())->toBe(0);
    expect(DB::table('residents')->count())->toBe(0);
    expect(DB::table('property_owners')->count())->toBe(0);
    expect(DB::table('compensation')->count())->toBe(0);
    expect(DB::table('documents')->count())->toBe(0);
});

test('migrate:production supports custom admin email and password options', function () {
    $this->artisan('migrate:production', [
        '--admin-name' => 'Custom Super Admin',
        '--admin-email' => 'superadmin@southernprovince.gov.lk',
        '--admin-password' => 'SecureP@ss2026',
        '--force' => true,
    ])->assertSuccessful();

    $admin = User::where('email', 'superadmin@southernprovince.gov.lk')->first();
    expect($admin)->not->toBeNull();
    expect($admin->name)->toBe('Custom Super Admin');
    expect(Hash::check('SecureP@ss2026', $admin->password))->toBeTrue();
    expect($admin->role->role_name)->toBe('Admin');
});
