<?php

namespace Tests\Feature\Api;

use App\Models\Order;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PaymentApiTest extends TestCase
{
    public function test_payment_methods_list_is_public(): void
    {
        $this->getJson('/api/payment-methods')
            ->assertOk()
            ->assertJsonFragment(['id' => 'kpay', 'label' => 'KPay / KBZ Pay'])
            ->assertJsonFragment(['id' => 'wavepay', 'label' => 'WavePay']);
    }

    public function test_manual_checkout_requires_payment_slip(): void
    {
        Storage::fake('public');
        $product = $this->createProduct();

        $this->postJson('/api/orders', $this->checkoutPayload($product, [
            'payment_method' => 'kpay',
        ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['payment_slip']);
    }

    public function test_manual_checkout_with_slip_creates_pending_order(): void
    {
        Storage::fake('public');
        $product = $this->createProduct();

        $response = $this->post('/api/orders', array_merge(
            $this->checkoutPayload($product, ['payment_method' => 'kpay']),
            ['payment_slip' => UploadedFile::fake()->image('slip.jpg')],
        ), ['Accept' => 'application/json']);

        $response->assertCreated()
            ->assertJsonPath('status', 'pending')
            ->assertJsonPath('payment_method', 'kpay')
            ->assertJsonPath('payment_status', 'slip_submitted');

        $this->assertNotNull($response->json('payment_slip_url'));
    }

    public function test_admin_can_confirm_manual_payment(): void
    {
        Storage::fake('public');
        $this->actingAsAdmin();
        $order = $this->createOrder(null, [
            'payment_method' => 'kpay',
            'payment_status' => 'slip_submitted',
            'payment_slip_path' => 'payment-slips/test/slip.jpg',
            'status' => 'pending',
        ]);

        $this->postJson("/api/admin/orders/{$order->id}/confirm-payment")
            ->assertOk()
            ->assertJsonPath('order.payment_status', 'confirmed')
            ->assertJsonPath('order.status', 'processing');
    }

    public function test_admin_can_reject_manual_payment(): void
    {
        $this->actingAsAdmin();
        $order = $this->createOrder(null, [
            'payment_method' => 'wavepay',
            'payment_status' => 'slip_submitted',
            'status' => 'pending',
        ]);

        $this->postJson("/api/admin/orders/{$order->id}/reject-payment", [
            'reason' => 'Amount does not match',
        ])
            ->assertOk()
            ->assertJsonPath('order.payment_status', 'rejected');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_rejection_reason' => 'Amount does not match',
        ]);
    }

    public function test_customer_can_reupload_payment_slip(): void
    {
        Storage::fake('public');
        $order = $this->createOrder(null, [
            'order_number' => 'HT-REUPLOAD',
            'email' => 'pay@example.com',
            'payment_method' => 'kpay',
            'payment_status' => 'rejected',
            'status' => 'pending',
        ]);

        $this->post('/api/orders/payment-slip', [
            'order_number' => 'HT-REUPLOAD',
            'email' => 'pay@example.com',
            'payment_slip' => UploadedFile::fake()->image('new-slip.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('payment_status', 'slip_submitted');

        $order->refresh();
        $this->assertNull($order->payment_rejection_reason);
    }
}
