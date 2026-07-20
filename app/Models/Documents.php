<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'project_id',
    'original_filename',
    'stored_filename',
    'file_type',
    'file_path',
    'file_size',
    'document_category',
    'upload_date',
])]
class Documents extends Model
{
    public function project()
    {
        return $this->belongsTo(Projects::class, 'project_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
