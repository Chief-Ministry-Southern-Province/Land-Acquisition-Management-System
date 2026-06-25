<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $department = \App\Models\Departments::firstOrCreate([
            'department_name' => 'Administration'
        ]);

        $role = \App\Models\Roles::firstOrCreate([
            'role_name' => 'Admin'
        ], [
            'description' => 'Administrator'
        ]);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'department_id' => $department->id,
            'role_id' => $role->id,
        ]);
    }
}
