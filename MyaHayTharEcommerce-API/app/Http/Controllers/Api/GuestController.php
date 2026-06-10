<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuestAccount;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class GuestController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        $guest = $this->resolveGuest($request);

        return response()->json([
            'id' => $guest->id,
            'email' => $guest->email,
            'name' => $guest->name,
            'type' => 'guest',
            'orders_count' => $guest->orders()->count(),
        ]);
    }

    public function orders(Request $request): JsonResponse
    {
        $guest = $this->resolveGuest($request);

        $orders = Order::with('items.product')
            ->where('guest_account_id', $guest->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders);
    }

    public function upgrade(Request $request): JsonResponse
    {
        $guest = $this->resolveGuest($request);

        $data = $request->validate([
            'password' => 'required|string|min:8|confirmed',
            'name' => 'nullable|string|max:255',
        ]);

        if (User::where('email', $guest->email)->exists()) {
            throw ValidationException::withMessages([
                'email' => ['An account with this email already exists. Please sign in instead.'],
            ]);
        }

        $user = DB::transaction(function () use ($guest, $data) {
            $user = User::create([
                'name' => $data['name'] ?? $guest->name ?? 'Guest',
                'email' => $guest->email,
                'password' => Hash::make($data['password']),
                'role' => 'customer',
            ]);

            Order::where('guest_account_id', $guest->id)->update([
                'user_id' => $user->id,
                'guest_account_id' => null,
                'is_guest' => false,
            ]);

            $guest->delete();

            return $user;
        });

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Guest account upgraded to full membership',
        ], 201);
    }

    private function resolveGuest(Request $request): GuestAccount
    {
        $token = $request->header('X-Guest-Token') ?? $request->query('guest_token');

        if (! $token) {
            throw ValidationException::withMessages([
                'guest_token' => ['Guest session not found. Please check out again or track your order.'],
            ]);
        }

        $guest = GuestAccount::where('token', $token)->first();

        if (! $guest) {
            throw ValidationException::withMessages([
                'guest_token' => ['Guest session expired or invalid.'],
            ]);
        }

        return $guest;
    }
}
