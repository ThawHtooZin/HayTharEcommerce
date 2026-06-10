<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class CatalogApiTest extends TestCase
{
    public function test_categories_index_returns_categories(): void
    {
        $this->createCategory(['name' => 'Plushies', 'slug' => 'plushies']);

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonFragment(['slug' => 'plushies']);
    }

    public function test_products_index_returns_products(): void
    {
        $product = $this->createProduct(['name' => 'Star Plush']);

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Star Plush']);
    }

    public function test_products_index_filters_by_category(): void
    {
        $category = $this->createCategory(['slug' => 'apparel']);
        $this->createProduct($category, ['name' => 'Hoodie']);
        $this->createProduct(null, ['name' => 'Other Item']);

        $response = $this->getJson('/api/products?category=apparel');

        $response->assertOk();
        $names = collect($response->json())->pluck('name');
        $this->assertTrue($names->contains('Hoodie'));
        $this->assertFalse($names->contains('Other Item'));
    }

    public function test_products_show_by_slug(): void
    {
        $product = $this->createProduct(null, ['slug' => 'cute-bear', 'name' => 'Cute Bear']);

        $this->getJson('/api/products/cute-bear')
            ->assertOk()
            ->assertJsonPath('name', 'Cute Bear')
            ->assertJsonPath('slug', 'cute-bear');
    }

    public function test_products_show_returns_404_for_unknown_slug(): void
    {
        $this->getJson('/api/products/does-not-exist')->assertNotFound();
    }
}
