<?php

namespace Tests\Concerns;

use App\Models\Category;
use App\Models\DiscountCode;
use App\Models\GuestAccount;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

trait MakesHayTharData
{
    protected function createCustomer(array $attrs = []): User
    {
        return User::factory()->create(array_merge(['role' => 'customer'], $attrs));
    }

    protected function createAdmin(array $attrs = []): User
    {
        return User::factory()->create(array_merge(['role' => 'admin'], $attrs));
    }

    protected function actingAsCustomer(array $attrs = []): User
    {
        $user = $this->createCustomer($attrs);
        Sanctum::actingAs($user);

        return $user;
    }

    protected function actingAsAdmin(array $attrs = []): User
    {
        $user = $this->createAdmin($attrs);
        Sanctum::actingAs($user);

        return $user;
    }

    protected function bearerToken(User $user): string
    {
        return $user->createToken('auth')->plainTextToken;
    }

    protected function createCategory(array $attrs = []): Category
    {
        $name = $attrs['name'] ?? 'Test Category';

        return Category::create(array_merge([
            'name' => $name,
            'slug' => $attrs['slug'] ?? Str::slug($name).'-'.Str::lower(Str::random(4)),
            'description' => 'Test category description',
            'image' => 'category.jpg',
        ], $attrs));
    }

    protected function createProduct(Category|array|null $category = null, array $attrs = []): Product
    {
        if (is_array($category)) {
            $attrs = $category;
            $category = null;
        }

        $category ??= $this->createCategory();

        return Product::create(array_merge([
            'category_id' => $category->id,
            'name' => 'Kawaii Plush',
            'slug' => 'kawaii-plush-'.Str::random(4),
            'sku' => 'SKU-'.Str::upper(Str::random(6)),
            'stock' => 50,
            'description' => 'Soft and cute',
            'price' => 24.99,
            'compare_at_price' => 29.99,
            'image' => 'plush.jpg',
            'aesthetic' => 'kawaii',
            'badge' => 'New',
            'rating' => 4.5,
            'review_count' => 10,
            'in_stock' => true,
            'is_blind_box' => false,
            'is_bestseller' => false,
            'is_featured' => true,
        ], $attrs));
    }

    protected function createGuest(array $attrs = []): GuestAccount
    {
        return GuestAccount::create(array_merge([
            'token' => (string) Str::uuid(),
            'email' => 'guest@example.com',
            'name' => 'Guest User',
        ], $attrs));
    }

    protected function createDiscountCode(array $attrs = []): DiscountCode
    {
        return DiscountCode::create(array_merge([
            'code' => 'SWEET20',
            'type' => 'percent',
            'value' => 20,
            'usage_limit' => 100,
            'times_used' => 0,
            'expires_at' => null,
            'is_active' => true,
        ], $attrs));
    }

    protected function createOrder(User|GuestAccount|null $owner = null, array $attrs = []): Order
    {
        $product = $this->createProduct();

        $defaults = [
            'order_number' => 'HT-'.strtoupper(Str::random(8)),
            'email' => 'buyer@example.com',
            'first_name' => 'Test',
            'last_name' => 'Buyer',
            'address' => '123 Cute St',
            'city' => 'Kawaii City',
            'postal_code' => '12345',
            'country' => 'US',
            'subtotal' => 24.99,
            'shipping' => 6.99,
            'discount' => 0,
            'total' => 31.98,
            'status' => 'processing',
            'currency' => 'USD',
            'is_guest' => true,
        ];

        if ($owner instanceof User) {
            $defaults['user_id'] = $owner->id;
            $defaults['email'] = $owner->email;
            $defaults['is_guest'] = false;
        } elseif ($owner instanceof GuestAccount) {
            $defaults['guest_account_id'] = $owner->id;
            $defaults['email'] = $owner->email;
        }

        $order = Order::create(array_merge($defaults, $attrs));

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price' => $product->price,
        ]);

        return $order->load('items.product');
    }

    protected function checkoutPayload(Product $product, array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Test',
            'last_name' => 'Buyer',
            'email' => 'checkout@example.com',
            'address' => '123 Cute St',
            'city' => 'Kawaii City',
            'postal_code' => '12345',
            'country' => 'US',
            'currency' => 'USD',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ], $overrides);
    }

    protected function withGuestToken(string $token): static
    {
        $this->withHeader('X-Guest-Token', $token);

        return $this;
    }
}
