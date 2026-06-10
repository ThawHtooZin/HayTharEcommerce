<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'body' => 'required|string|max:1000',
        ]);

        $review = Review::create([
            'product_id' => $product->id,
            'user_id' => $request->user()?->id,
            'author_name' => $request->user()?->name ?? 'Anonymous',
            'rating' => $data['rating'],
            'body' => $data['body'],
        ]);

        $avgRating = $product->reviews()->avg('rating');
        $product->update([
            'rating' => round($avgRating, 1),
            'review_count' => $product->reviews()->count(),
        ]);

        return response()->json($review, 201);
    }
}
