<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    public function sales(Request $request): JsonResponse
    {
        $period = $request->get('period', 'monthly');
        $format = match ($period) {
            'daily' => '%Y-%m-%d',
            'weekly' => '%Y-%u',
            'annually' => '%Y',
            default => '%Y-%m',
        };

        $sales = Order::whereNotIn('status', ['cancelled', 'refunded'])
            ->select(
                DB::raw("strftime('{$format}', created_at) as period"),
                DB::raw('SUM(subtotal) as gross_sales'),
                DB::raw('SUM(discount) as discounts'),
                DB::raw('SUM(shipping) as shipping'),
                DB::raw('SUM(total) as net_sales'),
                DB::raw('COUNT(*) as order_count'),
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return response()->json($sales);
    }

    public function productPerformance(): JsonResponse
    {
        $products = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                'products.stock',
                'products.price',
                DB::raw('SUM(order_items.quantity) as units_sold'),
                DB::raw('SUM(order_items.quantity * order_items.price) as revenue'),
            )
            ->groupBy('products.id', 'products.name', 'products.stock', 'products.price')
            ->orderByDesc('units_sold')
            ->get();

        return response()->json($products);
    }
}
