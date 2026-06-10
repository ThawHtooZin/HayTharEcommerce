<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class GuestAccount extends Model
{
    protected $fillable = ['token', 'email', 'name'];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public static function createForCheckout(string $email, ?string $name = null, ?string $existingToken = null): self
    {
        if ($existingToken) {
            $guest = self::where('token', $existingToken)->first();
            if ($guest) {
                $guest->update([
                    'email' => $email,
                    'name' => $name ?? $guest->name,
                ]);

                return $guest;
            }
        }

        return self::create([
            'token' => (string) Str::uuid(),
            'email' => $email,
            'name' => $name,
        ]);
    }
}
