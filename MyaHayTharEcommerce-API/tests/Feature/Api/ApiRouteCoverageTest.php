<?php

namespace Tests\Feature\Api;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ApiRouteCoverageTest extends TestCase
{
    public function test_all_documented_api_routes_are_registered(): void
    {
        $expected = [
            'GET|api/categories',
            'GET|api/products',
            'GET|api/products/{slug}',
            'POST|api/newsletter',
            'POST|api/register',
            'POST|api/login',
            'POST|api/orders',
            'POST|api/orders/claim-account',
            'GET|api/orders/track',
            'GET|api/guest/me',
            'GET|api/guest/orders',
            'POST|api/guest/upgrade',
            'POST|api/logout',
            'GET|api/me',
            'GET|api/orders',
            'GET|api/wishlist',
            'POST|api/wishlist',
            'DELETE|api/wishlist/{product}',
            'POST|api/products/{product}/reviews',
            'GET|api/admin/dashboard',
            'GET|api/admin/orders',
            'GET|api/admin/orders/{order}',
            'PATCH|api/admin/orders/{order}',
            'POST|api/admin/orders/{order}/refund',
            'GET|api/admin/products',
            'POST|api/admin/products',
            'PATCH|api/admin/products/{product}',
            'DELETE|api/admin/products/{product}',
            'GET|api/admin/customers',
            'GET|api/admin/customers/{user}',
            'GET|api/admin/newsletter',
            'GET|api/admin/discounts',
            'POST|api/admin/discounts',
            'PATCH|api/admin/discounts/{discountCode}',
            'DELETE|api/admin/discounts/{discountCode}',
            'GET|api/admin/reports/sales',
            'GET|api/admin/reports/products',
        ];

        $registered = collect(Route::getRoutes())
            ->filter(fn ($route) => str_starts_with($route->uri(), 'api/'))
            ->map(function ($route) {
                $methods = collect($route->methods())
                    ->reject(fn ($method) => $method === 'HEAD')
                    ->values()
                    ->all();

                return implode('|', $methods).'|'.$route->uri();
            })
            ->unique()
            ->values();

        foreach ($expected as $route) {
            $this->assertTrue(
                $registered->contains($route),
                "Missing API route: {$route}. Registered: ".$registered->implode(', ')
            );
        }

        $this->assertGreaterThanOrEqual(count($expected), $registered->count());
    }
}
