<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function methods(): JsonResponse
    {
        $methods = collect(config('payments.methods'))
            ->map(fn ($method, $key) => array_merge(['id' => $key], $method))
            ->values();

        return response()->json($methods);
    }
}
