<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method')->default('card')->after('currency');
            $table->string('payment_status')->default('not_required')->after('payment_method');
            $table->string('payment_slip_path')->nullable()->after('payment_status');
            $table->text('payment_rejection_reason')->nullable()->after('payment_slip_path');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method',
                'payment_status',
                'payment_slip_path',
                'payment_rejection_reason',
            ]);
        });
    }
};
