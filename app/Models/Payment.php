<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'compensation_id',
    'payment_reference',
    'amount_paid',
    'payment_date',
    'payment_method',
    'bank_name',
    'account_number',
    'status',
    'document_id',
    'remarks',
])]
class Payment extends Model
{
    protected $casts = [
        'payment_date' => 'date',
        'amount_paid' => 'decimal:2',
    ];

    public function compensation()
    {
        return $this->belongsTo(Compensation::class, 'compensation_id');
    }

    public function document()
    {
        return $this->belongsTo(Documents::class, 'document_id');
    }
}
