<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with('items.product')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(20));
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load('items.product'));
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => 'sometimes|in:pending,processing,shipped,delivered,cancelled,refunded',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        $order->update($data);

        return response()->json($order->fresh()->load('items.product'));
    }

    public function refund(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'type' => 'required|in:full,partial',
            'amount' => 'nullable|numeric|min:0',
        ]);

        if ($order->status === 'refunded') {
            return response()->json(['message' => 'Order already refunded'], 422);
        }

        foreach ($order->items as $item) {
            $product = Product::find($item->product_id);
            if ($product) {
                $product->increment('stock', $item->quantity);
                $product->update(['in_stock' => true]);
            }
        }

        $order->update(['status' => 'refunded']);

        return response()->json([
            'message' => 'Refund processed and inventory restored',
            'order' => $order->fresh()->load('items.product'),
        ]);
    }
}
