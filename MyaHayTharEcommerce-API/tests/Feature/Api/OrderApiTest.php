<?php

namespace Tests\Feature\Api;

use App\Models\GuestAccount;
use App\Models\Order;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    public function test_authenticated_checkout_creates_order_without_guest_token(): void
    {
        $user = $this->actingAsCustomer(['email' => 'member@example.com']);
        $product = $this->createProduct();

        $response = $this->postJson('/api/orders', $this->checkoutPayload($product, [
            'email' => 'member@example.com',
        ]));

        $response->assertCreated()
            ->assertJsonPath('is_guest', false)
            ->assertJsonMissing(['guest_token']);

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'email' => 'member@example.com',
        ]);
    }

    public function test_checkout_applies_bulk_discount_for_multiple_items(): void
    {
        $product = $this->createProduct(['price' => 20.00]);

        $response = $this->postJson('/api/orders', $this->checkoutPayload($product, [
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ]));

        $response->assertCreated();
        $this->assertEquals(4.00, (float) $response->json('discount'));
    }

    public function test_checkout_applies_promo_code(): void
    {
        $this->createDiscountCode(['code' => 'SWEET20', 'type' => 'percent', 'value' => 20]);
        $product = $this->createProduct(['price' => 50.00]);

        $response = $this->postJson('/api/orders', $this->checkoutPayload($product, [
            'discount_code' => 'sweet20',
        ]));

        $response->assertCreated();
        $this->assertEquals(10.00, (float) $response->json('discount'));
    }

    public function test_checkout_rejects_out_of_stock_product(): void
    {
        $product = $this->createProduct(['stock' => 0, 'in_stock' => false]);

        $this->postJson('/api/orders', $this->checkoutPayload($product))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items']);
    }

    public function test_authenticated_user_can_list_their_orders(): void
    {
        $user = $this->actingAsCustomer();
        $order = $this->createOrder($user);

        $this->getJson('/api/orders')
            ->assertOk()
            ->assertJsonFragment(['order_number' => $order->order_number]);
    }

    public function test_track_order_by_number_and_email(): void
    {
        $order = $this->createOrder(null, [
            'order_number' => 'HT-TRACKME1',
            'email' => 'track@example.com',
        ]);

        $this->getJson('/api/orders/track?order_number=ht-trackme1&email=track@example.com')
            ->assertOk()
            ->assertJsonPath('order_number', $order->order_number);
    }

    public function test_track_order_fails_for_wrong_email(): void
    {
        $this->createOrder(null, [
            'order_number' => 'HT-TRACKME1',
            'email' => 'track@example.com',
        ]);

        $this->getJson('/api/orders/track?order_number=HT-TRACKME1&email=wrong@example.com')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['order_number']);
    }

    public function test_claim_account_links_guest_orders_and_returns_token(): void
    {
        $guest = $this->createGuest(['email' => 'claim@example.com']);
        $order = $this->createOrder($guest, ['user_id' => null, 'guest_account_id' => $guest->id]);

        $response = $this->postJson('/api/orders/claim-account', [
            'order_number' => $order->order_number,
            'email' => 'claim@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'claim@example.com')
            ->assertJsonStructure(['token', 'order']);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'is_guest' => 0,
        ]);
        $this->assertDatabaseMissing('guest_accounts', ['id' => $guest->id]);
    }

    public function test_claim_account_rejects_already_linked_order(): void
    {
        $user = $this->createCustomer(['email' => 'member@example.com']);
        $order = $this->createOrder($user);

        $this->postJson('/api/orders/claim-account', [
            'order_number' => $order->order_number,
            'email' => 'member@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['order_number']);
    }
}
