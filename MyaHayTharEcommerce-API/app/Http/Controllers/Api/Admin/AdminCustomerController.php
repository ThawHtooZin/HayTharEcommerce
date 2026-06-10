<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscription;
use App\Models\Order;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'customer')->orderByDesc('created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        $customers = $query->paginate(20);

        $customers->getCollection()->transform(function ($user) {
            $user->orders_count = Order::where('user_id', $user->id)->count();
            $user->lifetime_value = Order::where('user_id', $user->id)->sum('total');
            $user->wishlist_count = Wishlist::where('user_id', $user->id)->count();

            return $user;
        });

        return response()->json($customers);
    }

    public function show(User $user): JsonResponse
    {
        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Not a customer'], 404);
        }

        return response()->json([
            'user' => $user,
            'orders' => Order::with('items.product')->where('user_id', $user->id)->orderByDesc('created_at')->get(),
            'wishlist' => Wishlist::with('product')->where('user_id', $user->id)->get(),
            'lifetime_value' => Order::where('user_id', $user->id)->sum('total'),
        ]);
    }

    public function newsletterSubscribers(): JsonResponse
    {
        return response()->json(NewsletterSubscription::orderByDesc('created_at')->get());
    }
}
