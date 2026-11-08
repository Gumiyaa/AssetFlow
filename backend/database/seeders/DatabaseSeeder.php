<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'andi.pratama@assetflow.id'],
            [
                'public_id' => 'USR-001',
                'employee_id' => 'EMP-2021-001',
                'name' => 'Andi Pratama',
                'username' => 'andi.pratama',
                'password' => Hash::make('assetflow123'),
                'role' => 'Super Admin',
                'position' => 'Super Administrator',
                'department' => 'Information Technology',
                'phone' => '+62 812-1900-4411',
                'initials' => 'AP',
                'avatar_color' => '#1B4B6B',
                'join_date' => '2021-01-12',
                'two_fa' => 'FIDO2 / Hardware Token',
                'status' => 'Aktif',
                'last_login' => now(),
            ]
        );
    }
}
