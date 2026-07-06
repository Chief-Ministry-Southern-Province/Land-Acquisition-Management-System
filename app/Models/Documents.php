<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'name',
    'type',
    'category',
    'size',
    'upload_date',
    'document_type',
    'link',
])]
class Documents extends Model
{
    //
}
