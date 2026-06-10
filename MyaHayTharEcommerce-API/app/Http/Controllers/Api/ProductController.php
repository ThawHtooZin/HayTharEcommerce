<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category');

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('aesthetic')) {
            $query->where('aesthetic', $request->aesthetic);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%"));
        }

        if ($request->boolean('in_stock')) {
            $query->where('in_stock', true);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('sort')) {
            match ($request->sort) {
                'price_asc' => $query->orderBy('price'),
                'price_desc' => $query->orderByDesc('price'),
                'rating' => $query->orderByDesc('rating'),
                'bestsellers' => $query->orderByDesc('is_bestseller')->orderByDesc('rating'),
                default => $query->orderByDesc('is_featured')->orderByDesc('created_at'),
            };
        } else {
            $query->orderByDesc('is_featured')->orderByDesc('created_at');
        }

        if ($request->boolean('bestsellers')) {
            $query->where('is_bestseller', true);
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->boolean('blind_box')) {
            $query->where('is_blind_box', true);
        }

        return response()->json($query->get());
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['category', 'reviews'])->where('slug', $slug)->firstOrFail();

        return response()->json($product);
    }
}
