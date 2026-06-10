<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Product::with('category')->orderByDesc('created_at')->paginate(20)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'compare_at_price' => 'nullable|numeric|min:0',
            'image' => 'required|string',
            'sku' => 'nullable|string|max:50',
            'stock' => 'required|integer|min:0',
            'aesthetic' => 'nullable|string',
            'badge' => 'nullable|string',
            'in_stock' => 'boolean',
            'is_blind_box' => 'boolean',
            'is_bestseller' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        $data['slug'] = Str::slug($data['name']).'-'.Str::random(4);
        $data['in_stock'] = ($data['stock'] ?? 0) > 0;

        $product = Product::create($data);

        return response()->json($product->load('category'), 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'compare_at_price' => 'nullable|numeric|min:0',
            'image' => 'sometimes|string',
            'sku' => 'nullable|string|max:50',
            'stock' => 'sometimes|integer|min:0',
            'aesthetic' => 'nullable|string',
            'badge' => 'nullable|string',
            'in_stock' => 'boolean',
            'is_blind_box' => 'boolean',
            'is_bestseller' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        if (isset($data['stock'])) {
            $data['in_stock'] = $data['stock'] > 0;
        }

        $product->update($data);

        return response()->json($product->fresh()->load('category'));
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }
}
