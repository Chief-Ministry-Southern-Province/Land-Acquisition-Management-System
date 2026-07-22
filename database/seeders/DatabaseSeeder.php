<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $dummySqlFile = database_path('dummy_data.sql');

        if (File::exists($dummySqlFile)) {
            DB::unprepared(File::get($dummySqlFile));

            return;
        }

        $departments = [
            [
                'id' => 1,
                'department_name' => 'Administration',
                'dep_code' => 'ADM',
                'dep_head' => 'John Silva',
                'email' => 'admin@lams.gov.lk',
                'phone' => '+94 11 234 1001',
                'staff' => 12,
                'status' => 1,
            ],
            [
                'id' => 2,
                'department_name' => 'Land Acquisition',
                'dep_code' => 'LAQ',
                'dep_head' => 'Nimal Perera',
                'email' => 'land@lams.gov.lk',
                'phone' => '+94 11 234 1002',
                'staff' => 18,
                'status' => 1,
            ],
            [
                'id' => 3,
                'department_name' => 'Survey',
                'dep_code' => 'SRV',
                'dep_head' => 'Kasun Fernando',
                'email' => 'survey@lams.gov.lk',
                'phone' => '+94 11 234 1003',
                'staff' => 15,
                'status' => 1,
            ],
            [
                'id' => 4,
                'department_name' => 'Legal',
                'dep_code' => 'LEG',
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
                [
                    'department_name' => $dept['department_name'],
                    'dep_code' => $dept['dep_code'],
                    'dep_head' => $dept['dep_head'],
                    'email' => $dept['email'],
                    'phone' => $dept['phone'],
                    'staff' => $dept['staff'],
                    'status' => $dept['status'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $roles = [
            [
                'id' => 1,
                'role_name' => 'Admin',
                'description' => 'System Administrator',
            ],
            [
                'id' => 2,
                'role_name' => 'DO',
                'description' => 'Development Officer',
            ],
            [
                'id' => 3,
                'role_name' => 'HOB',
                'description' => 'Head of Branch',
            ],
            [
                'id' => 4,
                'role_name' => 'AO',
                'description' => 'Administrative Officer',
            ],
            [
                'id' => 5,
                'role_name' => 'AS',
                'description' => 'Assistant Secretary',
            ],
            [
                'id' => 6,
                'role_name' => 'SAS',
                'description' => 'Senior Assistant Secretary',
            ],
            [
                'id' => 7,
                'role_name' => 'SEC',
                'description' => 'Secretary',
            ],
            [
                'id' => 8,
                'role_name' => 'Viewer',
                'description' => 'Read-only access to system information',
            ],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['id' => $role['id']],
                [
                    'role_name' => $role['role_name'],
                    'description' => $role['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'department_id' => 1,
            'role_id' => 1,
        ]);
    }
}
