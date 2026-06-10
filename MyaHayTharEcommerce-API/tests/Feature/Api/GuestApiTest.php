<?php

namespace Tests\Feature\Api;

use App\Models\GuestAccount;
use App\Models\Order;
use App\Models\User;
use Tests\TestCase;

class GuestApiTest extends TestCase
{
    public function test_guest_checkout_creates_guest_account_and_token(): void
    {
        $product = $this->createProduct();

        $response = $this->postJson('/api/orders', $this->checkoutPayload($product));

        $response->assertCreated()
            ->assertJsonStructure(['guest_token', 'guest_account', 'order_number'])
            ->assertJsonPath('guest_account.type', 'guest')
            ->assertJsonPath('is_guest', true);

        $this->assertDatabaseHas('guest_accounts', ['email' => 'checkout@example.com']);
    }

    public function test_guest_me_returns_profile_with_token(): void
    {
        $guest = $this->createGuest(['email' => 'guest@example.com', 'name' => 'Guest Cutie']);
        $this->createOrder($guest);

        $this->withGuestToken($guest->token)
            ->getJson('/api/guest/me')
            ->assertOk()
            ->assertJsonPath('email', 'guest@example.com')
            ->assertJsonPath('type', 'guest')
            ->assertJsonPath('orders_count', 1);
    }

    public function test_guest_me_requires_token(): void
    {
        $this->getJson('/api/guest/me')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['guest_token']);
    }

    public function test_guest_orders_lists_device_orders(): void
    {
        $guest = $this->createGuest();
        $order = $this->createOrder($guest);

        $this->withGuestToken($guest->token)
            ->getJson('/api/guest/orders')
            ->assertOk()
            ->assertJsonFragment(['order_number' => $order->order_number]);
    }

    public function test_guest_upgrade_creates_full_account_and_migrates_orders(): void
    {
        $guest = $this->createGuest(['email' => 'upgrade@example.com']);
        $order = $this->createOrder($guest);

        $response = $this->withGuestToken($guest->token)
            ->postJson('/api/guest/upgrade', [
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'upgrade@example.com')
            ->assertJsonStructure(['token'])
            ->assertJsonPath('message', 'Guest account upgraded to full membership');

        $this->assertDatabaseHas('users', ['email' => 'upgrade@example.com', 'role' => 'customer']);
        $this->assertDatabaseMissing('guest_accounts', ['id' => $guest->id]);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'user_id' => User::where('email', 'upgrade@example.com')->value('id'),
            'guest_account_id' => null,
            'is_guest' => 0,
        ]);
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_type' => User::class,
            'name' => 'auth',
        ]);
    }

    public function test_guest_upgrade_rejects_when_email_already_registered(): void
    {
        $this->createCustomer(['email' => 'taken@example.com']);
        $guest = $this->createGuest(['email' => 'taken@example.com']);

        $this->withGuestToken($guest->token)
            ->postJson('/api/guest/upgrade', [
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_guest_upgrade_rejects_invalid_token(): void
    {
        $this->withGuestToken('not-a-real-token')
            ->postJson('/api/guest/upgrade', [
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['guest_token']);
    }

    public function test_repeat_guest_checkout_reuses_existing_token(): void
    {
        $product = $this->createProduct();
        $guest = $this->createGuest(['email' => 'returning@example.com']);

        $response = $this->withGuestToken($guest->token)
            ->postJson('/api/orders', $this->checkoutPayload($product, ['email' => 'returning@example.com']));

        $response->assertCreated()
            ->assertJsonPath('guest_token', $guest->token);

        $this->assertEquals(1, GuestAccount::where('email', 'returning@example.com')->count());
        $this->assertEquals(1, Order::where('email', 'returning@example.com')->count());
    }
}
