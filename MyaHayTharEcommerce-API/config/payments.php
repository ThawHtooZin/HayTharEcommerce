<?php

return [
    /*
    | Manual payment methods — customer pays via app, then uploads a screenshot.
    | Update account numbers for production.
    */
    'manual_methods' => ['kpay', 'wavepay', 'aya_pay', 'bank_transfer'],

    'methods' => [
        'card' => [
            'label' => 'Credit / Debit Card',
            'description' => 'Demo checkout — no real charge.',
            'manual' => false,
        ],
        'kpay' => [
            'label' => 'KPay / KBZ Pay',
            'description' => 'Pay via KPay or KBZ Pay app, then upload your transfer screenshot.',
            'manual' => true,
            'account_name' => 'Hay Thar',
            'account_number' => '09XXXXXXXX',
            'instructions' => 'Send the exact order total to this KPay / KBZ Pay number. Use your order number as the payment note.',
        ],
        'wavepay' => [
            'label' => 'WavePay',
            'description' => 'Pay via WavePay, then upload your transfer screenshot.',
            'manual' => true,
            'account_name' => 'Hay Thar',
            'account_number' => '09XXXXXXXX',
            'instructions' => 'Send the exact order total to this WavePay number. Use your order number as the payment note.',
        ],
        'aya_pay' => [
            'label' => 'AYA Pay',
            'description' => 'Pay via AYA Pay, then upload your transfer screenshot.',
            'manual' => true,
            'account_name' => 'Hay Thar',
            'account_number' => '09XXXXXXXX',
            'instructions' => 'Send the exact order total to this AYA Pay number. Use your order number as the payment note.',
        ],
        'bank_transfer' => [
            'label' => 'Bank Transfer',
            'description' => 'Transfer to our bank account, then upload the receipt.',
            'manual' => true,
            'account_name' => 'Hay Thar Co., Ltd.',
            'account_number' => '1234567890',
            'bank_name' => 'KBZ Bank',
            'instructions' => 'Transfer the exact order total and upload a clear photo of the bank receipt.',
        ],
    ],
];
