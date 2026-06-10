<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiscountCode;
use App\Models\GuestAccount;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    private const SHIPPING_COST = 6.99;
    private const BULK_DISCOUNT_PERCENT = 10;
    private const BULK_DISCOUNT_MIN_ITEMS = 2;

    private const FREE_SHIPPING_THRESHOLDS = [
        'USD' => 49.99,
        'AUD' => 150.00,
        'EUR' => 45.00,
        'GBP' => 40.00,
        'JPY' => 7500,
        'MMK' => 105000,
    ];

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $rules = [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:255',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:255',
            'currency' => 'nullable|string|size:3',
            'discount_code' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ];

        if (! $user) {
            $rules['email'] = 'required|email';
        }

        $data = $request->validate($rules);
        $currency = $data['currency'] ?? 'USD';
        $email = $user?->email ?? $data['email'];

        $subtotal = 0;
        $totalItems = 0;
        $orderItems = [];

        foreach ($data['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);
            if (! $product->in_stock || $product->stock < $item['quantity']) {
                throw ValidationException::withMessages([
                    'items' => ["{$product->name} is out of stock or insufficient quantity."],
                ]);
            }
            $lineTotal = $product->price * $item['quantity'];
            $subtotal += $lineTotal;
            $totalItems += $item['quantity'];
            $orderItems[] = [
                'product' => $product,
                'quantity' => $item['quantity'],
                'price' => $product->price,
            ];
        }

        $discount = 0;
        if ($totalItems >= self::BULK_DISCOUNT_MIN_ITEMS) {
            $discount += round($subtotal * (self::BULK_DISCOUNT_PERCENT / 100), 2);
        }
        $discount += $this->applyPromoCode($data['discount_code'] ?? null, $subtotal);

        $afterDiscount = max(0, $subtotal - $discount);
        $threshold = self::FREE_SHIPPING_THRESHOLDS[$currency] ?? self::FREE_SHIPPING_THRESHOLDS['USD'];
        $shipping = $afterDiscount >= $threshold ? 0 : self::SHIPPING_COST;
        $total = $afterDiscount + $shipping;

        $guestAccount = null;
        if (! $user) {
            $guestAccount = GuestAccount::createForCheckout(
                $email,
                trim("{$data['first_name']} {$data['last_name']}"),
                $request->header('X-Guest-Token'),
            );
        }

        $order = Order::create([
            'user_id' => $user?->id,
            'guest_account_id' => $guestAccount?->id,
            'order_number' => 'HT-'.strtoupper(Str::random(8)),
            'email' => $email,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'address' => $data['address'],
            'city' => $data['city'],
            'postal_code' => $data['postal_code'],
            'country' => $data['country'],
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'discount' => $discount,
            'total' => $total,
            'status' => 'processing',
            'currency' => $currency,
            'is_guest' => $user === null,
        ]);

        foreach ($orderItems as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product']->id,
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
            $item['product']->decrement('stock', $item['quantity']);
            if ($item['product']->stock <= 0) {
                $item['product']->update(['in_stock' => false, 'stock' => 0]);
            }
        }

        $response = $order->load('items.product')->toArray();
        if ($guestAccount) {
            $response['guest_token'] = $guestAccount->token;
            $response['guest_account'] = [
                'email' => $guestAccount->email,
                'name' => $guestAccount->name,
                'type' => 'guest',
            ];
        }

        return response()->json($response, 201);
    }

    public function claimAccount(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_number' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
            'name' => 'nullable|string|max:255',
        ]);

        $order = Order::where('order_number', $data['order_number'])
            ->where('email', $data['email'])
            ->whereNull('user_id')
            ->first();

        if (! $order) {
            throw ValidationException::withMessages([
                'order_number' => ['Order not found or already linked to an account.'],
            ]);
        }

        if (User::where('email', $data['email'])->exists()) {
            throw ValidationException::withMessages([
                'email' => ['An account with this email already exists. Please sign in instead.'],
            ]);
        }

        $name = $data['name'] ?? trim("{$order->first_name} {$order->last_name}");

        $user = User::create([
            'name' => $name,
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'customer',
        ]);

        Order::where('email', $data['email'])
            ->whereNull('user_id')
            ->update(['user_id' => $user->id, 'guest_account_id' => null, 'is_guest' => false]);

        GuestAccount::where('email', $data['email'])->delete();

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'order' => $order->fresh()->load('items.product'),
        ], 201);
    }

    public function track(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_number' => 'required|string',
            'email' => 'required|email',
        ]);

        $order = Order::with('items.product')
            ->where('order_number', strtoupper($data['order_number']))
            ->where('email', $data['email'])
            ->first();

        if (! $order) {
            throw ValidationException::withMessages([
                'order_number' => ['No order found with that number and email. Double-check and try again.'],
            ]);
        }

        return response()->json($order);
    }

    public function index(Request $request): JsonResponse
    {
        $orders = Order::with('items.product')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders);
    }

    private function applyPromoCode(?string $code, float $subtotal): float
    {
        if (empty($code)) {
            return 0;
        }

        $promo = DiscountCode::where('code', strtoupper($code))->first();
        if ($promo && $promo->isValid()) {
            $amount = $promo->calculateDiscount($subtotal);
            $promo->increment('times_used');

            return $amount;
        }

        return 0;
    }
}
