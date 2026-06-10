<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $totalRevenue = Order::whereNotIn('status', ['cancelled'])->sum('total');
        $activeOrders = Order::whereIn('status', ['processing', 'pending', 'shipped'])->count();
        $totalOrders = Order::count();
        $totalCustomers = User::where('role', 'customer')->count();
        $avgOrderValue = $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0;
        $lowStock = Product::where('stock', '<=', 10)->where('in_stock', true)->count();

        $recentOrders = Order::with('items.product')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.name', DB::raw('SUM(order_items.quantity) as sold'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('sold')
            ->limit(5)
            ->get();

        return response()->json([
            'kpis' => [
                'total_revenue' => (float) $totalRevenue,
                'active_orders' => $activeOrders,
                'conversion_rate' => $totalCustomers > 0 ? round(($totalOrders / max($totalCustomers, 1)) * 100, 1) : 0,
                'average_order_value' => $avgOrderValue,
                'total_customers' => $totalCustomers,
            ],
            'alerts' => [
                'low_stock_count' => $lowStock,
                'pending_orders' => Order::where('status', 'processing')->count(),
                'new_registrations' => User::where('role', 'customer')->where('created_at', '>=', now()->subDays(7))->count(),
            ],
            'recent_orders' => $recentOrders,
            'top_products' => $topProducts,
        ]);
    }
}
