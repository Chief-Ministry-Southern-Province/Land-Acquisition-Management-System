<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['role_name', 'description'])]
#[Hidden(['created_at', 'updated_at'])]
class Roles extends Model
{
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
