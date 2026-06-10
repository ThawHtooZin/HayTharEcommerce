<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class AdminApiTest extends TestCase
{
    public function test_admin_routes_reject_non_admin_users(): void
    {
        $this->actingAsCustomer();

        $this->getJson('/api/admin/dashboard')->assertForbidden();
    }

    public function test_admin_routes_reject_guests(): void
    {
        $this->getJson('/api/admin/dashboard')->assertUnauthorized();
    }

    public function test_admin_dashboard_returns_kpis(): void
    {
        $this->actingAsAdmin();
        $this->createOrder($this->createCustomer());

        $this->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'kpis' => ['total_revenue', 'active_orders', 'conversion_rate', 'average_order_value', 'total_customers'],
                'alerts' => ['low_stock_count', 'pending_orders', 'new_registrations'],
                'recent_orders',
                'top_products',
            ]);
    }

    public function test_admin_can_list_and_update_orders(): void
    {
        $this->actingAsAdmin();
        $order = $this->createOrder($this->createCustomer(), ['status' => 'processing']);

        $this->getJson('/api/admin/orders')
            ->assertOk()
            ->assertJsonFragment(['order_number' => $order->order_number]);

        $this->getJson("/api/admin/orders/{$order->id}")
            ->assertOk()
            ->assertJsonPath('id', $order->id);

        $this->patchJson("/api/admin/orders/{$order->id}", [
            'status' => 'shipped',
            'tracking_number' => 'TRACK123',
        ])
            ->assertOk()
            ->assertJsonPath('status', 'shipped')
            ->assertJsonPath('tracking_number', 'TRACK123');
    }

    public function test_admin_can_refund_order_and_restore_inventory(): void
    {
        $this->actingAsAdmin();
        $product = $this->createProduct(['stock' => 5]);
        $order = $this->createOrder($this->createCustomer());
        $order->items()->first()->update(['product_id' => $product->id, 'quantity' => 2]);
        $product->update(['stock' => 3]);

        $this->postJson("/api/admin/orders/{$order->id}/refund", ['type' => 'full'])
            ->assertOk()
            ->assertJsonPath('order.status', 'refunded');

        $this->assertEquals(5, $product->fresh()->stock);
        $this->assertTrue($product->fresh()->in_stock);
    }

    public function test_admin_can_manage_products(): void
    {
        $this->actingAsAdmin();
        $category = $this->createCategory();

        $create = $this->postJson('/api/admin/products', [
            'category_id' => $category->id,
            'name' => 'Admin Plush',
            'description' => 'Created in admin',
            'price' => 19.99,
            'image' => 'admin-plush.jpg',
            'stock' => 15,
        ]);

        $create->assertCreated()
            ->assertJsonPath('name', 'Admin Plush');

        $productId = $create->json('id');

        $this->getJson('/api/admin/products')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Admin Plush']);

        $this->patchJson("/api/admin/products/{$productId}", ['price' => 17.99])
            ->assertOk()
            ->assertJsonPath('price', '17.99');

        $this->deleteJson("/api/admin/products/{$productId}")
            ->assertOk()
            ->assertJsonPath('message', 'Product deleted');

        $this->assertDatabaseMissing('products', ['id' => $productId]);
    }

    public function test_admin_can_list_customers_and_newsletter(): void
    {
        $this->actingAsAdmin();
        $customer = $this->createCustomer();

        $this->getJson('/api/admin/customers')
            ->assertOk()
            ->assertJsonFragment(['email' => $customer->email]);

        $this->getJson("/api/admin/customers/{$customer->id}")
            ->assertOk()
            ->assertJsonPath('user.email', $customer->email);

        $this->postJson('/api/newsletter', ['email' => 'sub@example.com']);

        $this->getJson('/api/admin/newsletter')
            ->assertOk()
            ->assertJsonFragment(['email' => 'sub@example.com']);
    }

    public function test_admin_can_manage_discount_codes(): void
    {
        $this->actingAsAdmin();

        $create = $this->postJson('/api/admin/discounts', [
            'code' => 'admin10',
            'type' => 'percent',
            'value' => 10,
            'usage_limit' => 50,
            'is_active' => true,
        ]);

        $create->assertCreated()
            ->assertJsonPath('code', 'ADMIN10');

        $discountId = $create->json('id');

        $this->getJson('/api/admin/discounts')
            ->assertOk()
            ->assertJsonFragment(['code' => 'ADMIN10']);

        $this->patchJson("/api/admin/discounts/{$discountId}", ['value' => 15])
            ->assertOk()
            ->assertJsonPath('value', '15.00');

        $this->deleteJson("/api/admin/discounts/{$discountId}")
            ->assertOk();

        $this->assertDatabaseMissing('discount_codes', ['id' => $discountId]);
    }

    public function test_admin_reports_endpoints(): void
    {
        $this->actingAsAdmin();
        $this->createOrder($this->createCustomer());

        $this->getJson('/api/admin/reports/sales?period=daily')
            ->assertOk()
            ->assertJsonIsArray();

        $this->getJson('/api/admin/reports/products')
            ->assertOk()
            ->assertJsonIsArray();
    }
}
