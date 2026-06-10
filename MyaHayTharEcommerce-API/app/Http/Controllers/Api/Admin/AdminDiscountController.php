<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DiscountCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDiscountController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(DiscountCode::orderByDesc('created_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => 'required|string|max:50|unique:discount_codes,code',
            'type' => 'required|in:percent,fixed',
            'value' => 'required|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $data['code'] = strtoupper($data['code']);
        $promo = DiscountCode::create($data);

        return response()->json($promo, 201);
    }

    public function update(Request $request, DiscountCode $discountCode): JsonResponse
    {
        $data = $request->validate([
            'type' => 'sometimes|in:percent,fixed',
            'value' => 'sometimes|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $discountCode->update($data);

        return response()->json($discountCode->fresh());
    }

    public function destroy(DiscountCode $discountCode): JsonResponse
    {
        $discountCode->delete();

        return response()->json(['message' => 'Discount code deleted']);
    }
}
