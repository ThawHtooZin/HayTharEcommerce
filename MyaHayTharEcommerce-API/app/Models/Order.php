<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'guest_account_id', 'order_number', 'email', 'first_name', 'last_name',
        'address', 'city', 'postal_code', 'country', 'subtotal', 'shipping',
        'discount', 'total', 'status', 'currency', 'tracking_number', 'is_guest',
        'payment_method', 'payment_status', 'payment_slip_path', 'payment_rejection_reason',
    ];

    protected $appends = ['payment_slip_url'];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'shipping' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
            'is_guest' => 'boolean',
        ];
    }

    public function getPaymentSlipUrlAttribute(): ?string
    {
        if (! $this->payment_slip_path) {
            return null;
        }

        return Storage::disk('public')->url($this->payment_slip_path);
    }

    public function isManualPayment(): bool
    {
        return in_array($this->payment_method, config('payments.manual_methods', []), true);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function guestAccount(): BelongsTo
    {
        return $this->belongsTo(GuestAccount::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
