<?php

namespace Tests\Feature\Infrastructure;

use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class SanctumMigrationTest extends TestCase
{
    public function test_personal_access_tokens_table_exists_after_migrations(): void
    {
        $this->assertTrue(
            Schema::hasTable('personal_access_tokens'),
            'Sanctum personal_access_tokens table is missing. Run: php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider" && php artisan migrate'
        );
    }

    public function test_login_can_create_sanctum_token(): void
    {
        $user = $this->createCustomer([
            'email' => 'token-test@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'token-test@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => $user::class,
            'name' => 'auth',
        ]);
    }
}
