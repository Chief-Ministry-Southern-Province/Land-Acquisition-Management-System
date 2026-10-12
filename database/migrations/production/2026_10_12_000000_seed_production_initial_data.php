<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the production baseline migrations.
     * Seeds essential master data and a sample admin without any dummy data.
     */
    public function up(): void
    {
        // 1. Core Departments (Same as Development)
        $departments = [
            [
                'id' => 1,
                'department_name' => 'Department of Southern Province Health Services',
                'dep_code' => 'ADM',
                'dep_address' => 'Lower Dickson Road, Galle, Southern Province',
                'dep_head' => 'John Silva',
                'email' => 'admin@lams.gov.lk',
                'phone' => '+94 11 234 1001',
                'staff' => 12,
                'status' => 1,
            ],
            [
                'id' => 2,
                'department_name' => 'Department of Ayurwedha',
                'dep_code' => 'AYU',
                'dep_address' => 'Kachcheri Complex, Galle',
                'dep_head' => 'Nimal Perera',
                'email' => 'land@lams.gov.lk',
                'phone' => '+94 11 234 1002',
                'staff' => 18,
                'status' => 1,
            ],
            [
                'id' => 3,
                'department_name' => 'Department of Local Government',
                'dep_code' => 'LG',
                'dep_address' => 'Wakwella Road, Galle',
                'dep_head' => 'Kasun Fernando',
                'email' => 'survey@lams.gov.lk',
                'phone' => '+94 11 234 1003',
                'staff' => 15,
                'status' => 1,
            ],
            [
                'id' => 4,
                'department_name' => 'Road Development Authority',
                'dep_code' => 'RDA',
                'dep_address' => 'Court Road, Galle',
                'dep_head' => 'Saman Jayasuriya',
                'email' => 'legal@lams.gov.lk',
                'phone' => '+94 11 234 1004',
                'staff' => 8,
                'status' => 1,
            ],
            [
                'id' => 5,
                'department_name' => 'Finance',
                'dep_code' => 'FIN',
                'dep_address' => 'Main Street, Galle',
                'dep_head' => 'Amila Gunasekara',
                'email' => 'finance@lams.gov.lk',
                'phone' => '+94 11 234 1005',
                'staff' => 10,
                'status' => 1,
            ],
        ];

        foreach ($departments as $dept) {
            DB::table('departments')->updateOrInsert(
                ['id' => $dept['id']],
                array_merge($dept, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // 2. Core Roles
        $roles = [
            ['id' => 1, 'role_name' => 'Admin', 'description' => 'System Administrator'],
            ['id' => 2, 'role_name' => 'DO', 'description' => 'Development Officer'],
            ['id' => 3, 'role_name' => 'HOB', 'description' => 'Head of Branch'],
            ['id' => 4, 'role_name' => 'AO', 'description' => 'Administrative Officer'],
            ['id' => 5, 'role_name' => 'AS', 'description' => 'Assistant Secretary'],
            ['id' => 6, 'role_name' => 'SAS', 'description' => 'Senior Assistant Secretary'],
            ['id' => 7, 'role_name' => 'SEC', 'description' => 'Secretary'],
            ['id' => 8, 'role_name' => 'Viewer', 'description' => 'Read-only access to system information'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['id' => $role['id']],
                array_merge($role, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // 3. System Permissions
        $permissions = [
            ['id' => 1, 'module' => 'projects', 'permission_name' => 'view_projects', 'description' => 'Ability to view project lists and details.'],
            ['id' => 2, 'module' => 'projects', 'permission_name' => 'manage_projects', 'description' => 'Ability to create, update, and delete projects.'],
            ['id' => 3, 'module' => 'land_parcels', 'permission_name' => 'view_parcels', 'description' => 'Ability to view land parcel inventory.'],
            ['id' => 4, 'module' => 'land_parcels', 'permission_name' => 'manage_parcels', 'description' => 'Ability to register and update land parcel records.'],
            ['id' => 5, 'module' => 'valuations', 'permission_name' => 'manage_valuations', 'description' => 'Ability to submit and approve property valuations.'],
            ['id' => 6, 'module' => 'compensation', 'permission_name' => 'manage_compensation', 'description' => 'Ability to request and pay compensations.'],
        ];

        foreach ($permissions as $perm) {
            DB::table('permissions')->updateOrInsert(
                ['id' => $perm['id']],
                array_merge($perm, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // 4. Role Permission Mappings
        $rolePermissions = [
            ['id' => 1, 'role_id' => 1, 'permission_id' => 1],
            ['id' => 2, 'role_id' => 1, 'permission_id' => 2],
            ['id' => 3, 'role_id' => 1, 'permission_id' => 3],
            ['id' => 4, 'role_id' => 1, 'permission_id' => 4],
            ['id' => 5, 'role_id' => 1, 'permission_id' => 5],
            ['id' => 6, 'role_id' => 1, 'permission_id' => 6],
            ['id' => 7, 'role_id' => 2, 'permission_id' => 1],
            ['id' => 8, 'role_id' => 2, 'permission_id' => 3],
            ['id' => 9, 'role_id' => 2, 'permission_id' => 4],
            ['id' => 10, 'role_id' => 3, 'permission_id' => 1],
            ['id' => 11, 'role_id' => 3, 'permission_id' => 3],
            ['id' => 12, 'role_id' => 3, 'permission_id' => 5],
            ['id' => 13, 'role_id' => 4, 'permission_id' => 1],
            ['id' => 14, 'role_id' => 4, 'permission_id' => 3],
            ['id' => 15, 'role_id' => 4, 'permission_id' => 6],
        ];

        foreach ($rolePermissions as $rp) {
            DB::table('role_permission')->updateOrInsert(
                ['id' => $rp['id']],
                array_merge($rp, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // 5. Sample Administrator Account (Single sample admin only)
        $adminEmail = env('ADMIN_EMAIL', 'admin@lams.gov.lk');
        $adminPassword = env('ADMIN_DEFAULT_PASSWORD', 'Admin@12345');

        $userColumns = [
            'department_id' => 1,
            'role_id' => 1,
            'name' => env('ADMIN_NAME', 'System Administrator'),
            'email' => $adminEmail,
            'email_verified_at' => now(),
            'password' => Hash::make($adminPassword),
            'phone' => '+94 11 234 1001',
            'notification_preference' => 'all',
            'status' => 'active',
            'updated_at' => now(),
        ];

        // Ensure user is created or updated
        $existingAdmin = DB::table('users')->where('email', $adminEmail)->first();
        if ($existingAdmin) {
            DB::table('users')->where('id', $existingAdmin->id)->update($userColumns);
        } else {
            DB::table('users')->insert(array_merge($userColumns, [
                'created_at' => now(),
            ]));
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $adminEmail = env('ADMIN_EMAIL', 'admin@lams.gov.lk');
        DB::table('users')->where('email', $adminEmail)->delete();
    }
};
