<?php

namespace Database\Seeders;

use App\Models\DiscountCode;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'demo@haythar.com'],
            ['name' => 'Demo User', 'password' => Hash::make('password'), 'role' => 'customer'],
        );

        User::updateOrCreate(
            ['email' => 'admin@haythar.com'],
            ['name' => 'Store Admin', 'password' => Hash::make('password'), 'role' => 'admin'],
        );

        DiscountCode::updateOrCreate(
            ['code' => 'SWEET'],
            ['type' => 'percent', 'value' => 20, 'usage_limit' => 1000, 'is_active' => true],
        );

        DiscountCode::updateOrCreate(
            ['code' => 'CUTE10'],
            ['type' => 'percent', 'value' => 10, 'usage_limit' => null, 'is_active' => true],
        );

        $this->call(ProductSeeder::class);
    }
}
