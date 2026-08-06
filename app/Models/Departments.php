<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['department_name', 'dep_code', 'dep_address', 'dep_head', 'email', 'phone', 'staff', 'status'])]
#[Hidden(['created_at', 'updated_at'])]
class Departments extends Model
{
    protected $casts = [
        'status' => 'boolean',
        'staff' => 'integer',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
