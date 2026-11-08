<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database from the frontend mock fixtures.
     *
     * All demo accounts use the same local password: assetflow123.
     */
    public function run(): void
    {
        $employees = $this->loadFixture('employees.json');
        $users = $this->loadFixture('users.json');

        $employeeDetails = collect($employees)->keyBy('id');

        foreach ($employees as $employee) {
            Employee::updateOrCreate(
                ['public_id' => $employee['id']],
                [
                    'name' => $employee['name'],
                    'email' => $employee['email'],
                    'phone' => $employee['phone'] ?? null,
                    'department' => $employee['department'] ?? null,
                    'position' => $employee['position'] ?? null,
                    'status' => $employee['status'] ?? 'Aktif',
                    'join_date' => $employee['joinDate'] ?? null,
                    'manager' => $employee['manager'] ?? null,
                    'location' => $employee['location'] ?? null,
                    'initials' => $employee['initials'] ?? null,
                    'avatar_color' => $employee['avatarColor'] ?? null,
                    'assets_count' => $employee['assets'] ?? 0,
                    'grade' => $employee['grade'] ?? null,
                    'notes' => $employee['notes'] ?? null,
                ]
            );
        }

        foreach ($users as $account) {
            $employee = $employeeDetails->get($account['employeeId']);

            User::updateOrCreate(
                ['email' => $account['email']],
                [
                    'public_id' => $account['id'],
                    'employee_id' => $account['employeeId'] ?? null,
                    'name' => $account['name'],
                    'username' => Str::before($account['email'], '@'),
                    'password' => Hash::make('assetflow123'),
                    'role' => $account['role'] ?? 'Employee',
                    'position' => $employee['position'] ?? null,
                    'department' => $account['department'] ?? $employee['department'] ?? null,
                    'phone' => $employee['phone'] ?? null,
                    'initials' => $account['initials'] ?? null,
                    'avatar_color' => $account['avatarColor'] ?? null,
                    'join_date' => $employee['joinDate'] ?? null,
                    'two_fa' => $account['twoFA'] ?? null,
                    'status' => $account['status'] ?? 'Aktif',
                    'last_active' => $account['lastActive'] ?? null,
                    'device' => $account['device'] ?? null,
                    'modules' => $account['modules'] ?? null,
                ]
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function loadFixture(string $filename): array
    {
        $path = database_path('seeders/data/'.$filename);

        return json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
    }
}
