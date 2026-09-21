<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with('items.product')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
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

        DB::transaction(function () use ($data, $order) {
            if (($data['status'] ?? null) === 'processing' && $order->status !== 'processing') {
                if ($order->status !== 'pending') {
                    abort(422, 'Only pending orders can move to processing.');
                }

                $this->deductOrderStock($order);
            }

            $order->update($data);
        });

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

    public function confirmPayment(Order $order): JsonResponse
    {
        if (! $order->isManualPayment()) {
            return response()->json(['message' => 'This order does not use manual payment.'], 422);
        }

        if ($order->payment_status !== 'slip_submitted') {
            return response()->json(['message' => 'No payment slip to confirm.'], 422);
        }

        DB::transaction(function () use ($order) {
            if ($order->status === 'pending') {
                $this->deductOrderStock($order);
            }
            $order->update([
                'payment_status' => 'confirmed',
                'status' => 'processing',
                'payment_rejection_reason' => null,
            ]);
        });

        return response()->json([
            'message' => 'Payment confirmed. Order is now processing.',
            'order' => $order->fresh()->load('items.product'),
        ]);
    }

    public function rejectPayment(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        if (! $order->isManualPayment()) {
            return response()->json(['message' => 'This order does not use manual payment.'], 422);
        }

        $order->update([
            'payment_status' => 'rejected',
            'status' => 'pending',
            'payment_rejection_reason' => $data['reason'] ?? 'Payment could not be verified. Please upload a clear screenshot.',
        ]);

        return response()->json([
            'message' => 'Payment rejected. Customer can re-upload a slip.',
            'order' => $order->fresh()->load('items.product'),
        ]);
    }

    private function deductOrderStock(Order $order): void
    {
        foreach ($order->items as $item) {
            $product = Product::lockForUpdate()->find($item->product_id);
            if (! $product || $product->stock < $item->quantity) {
                abort(422, "Insufficient stock for {$product?->name}.");
            }

            $product->decrement('stock', $item->quantity);
            $product->update(['in_stock' => $product->fresh()->stock > 0]);
        }
    }
}
