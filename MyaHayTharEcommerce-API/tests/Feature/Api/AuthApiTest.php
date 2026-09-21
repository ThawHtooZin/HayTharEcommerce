<?php

namespace Tests\Feature\Api;

use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'New Member',
            'email' => 'new@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'new@example.com')
            ->assertJsonStructure(['token']);

        $this->assertDatabaseHas('users', ['email' => 'new@example.com', 'role' => 'customer']);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        $this->createCustomer(['email' => 'taken@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Another',
            'email' => 'taken@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_with_valid_credentials(): void
    {
        $this->createCustomer([
            'email' => 'login@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.email', 'login@example.com')
            ->assertJsonStructure(['token']);
    }

    public function test_login_links_existing_guest_orders_with_matching_email(): void
    {
        $user = $this->createCustomer(['email' => 'returning@example.com']);
        $guest = $this->createGuest(['email' => $user->email]);
        $order = $this->createOrder(null, [
            'email' => $user->email,
            'guest_account_id' => $guest->id,
            'is_guest' => true,
            'user_id' => null,
        ]);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'user_id' => $user->id,
            'guest_account_id' => null,
            'is_guest' => 0,
        ]);
        $this->assertDatabaseMissing('guest_accounts', ['id' => $guest->id]);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        $this->createCustomer(['email' => 'login@example.com', 'password' => 'password123']);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = $this->actingAsCustomer(['email' => 'me@example.com']);

        $this->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('email', 'me@example.com');
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
    }

    public function test_logout_revokes_current_token(): void
    {
        $user = $this->createCustomer();
        $token = $user->createToken('auth')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out');

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'auth',
        ]);
    }
}
