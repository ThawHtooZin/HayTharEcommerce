<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class ReviewApiTest extends TestCase
{
    public function test_authenticated_user_can_post_review(): void
    {
        $user = $this->actingAsCustomer(['name' => 'Reviewer']);
        $product = $this->createProduct(['rating' => 0, 'review_count' => 0]);

        $response = $this->postJson("/api/products/{$product->id}/reviews", [
            'rating' => 5,
            'body' => 'So kawaii!',
        ]);

        $response->assertCreated()
            ->assertJsonPath('rating', 5)
            ->assertJsonPath('author_name', 'Reviewer');

        $product->refresh();
        $this->assertEquals(5.0, (float) $product->rating);
        $this->assertEquals(1, $product->review_count);
    }

    public function test_review_requires_authentication(): void
    {
        $product = $this->createProduct();

        $this->postJson("/api/products/{$product->id}/reviews", [
            'rating' => 5,
            'body' => 'Cute!',
        ])->assertUnauthorized();
    }
}
