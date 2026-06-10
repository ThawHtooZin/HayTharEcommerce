<?php

namespace Tests\Feature\Api;

use App\Models\Wishlist;
use Tests\TestCase;

class WishlistApiTest extends TestCase
{
    public function test_wishlist_requires_authentication(): void
    {
        $this->getJson('/api/wishlist')->assertUnauthorized();
    }

    public function test_user_can_add_and_list_wishlist_items(): void
    {
        $user = $this->actingAsCustomer();
        $product = $this->createProduct();

        $this->postJson('/api/wishlist', ['product_id' => $product->id])
            ->assertOk()
            ->assertJsonPath('message', 'Added to wishlist');

        $this->getJson('/api/wishlist')
            ->assertOk()
            ->assertJsonFragment(['id' => $product->id]);

        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_user_can_remove_wishlist_item(): void
    {
        $user = $this->actingAsCustomer();
        $product = $this->createProduct();

        Wishlist::create(['user_id' => $user->id, 'product_id' => $product->id]);

        $this->deleteJson("/api/wishlist/{$product->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Removed from wishlist');

        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }
}
