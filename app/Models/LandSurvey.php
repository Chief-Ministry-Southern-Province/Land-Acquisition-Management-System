<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'land_parcel_id',
    'surveyor_name',
    'survey_date',
    'survey_ref_number',
    'survey_coordinates',
    'surveyed_size_perches',
    'status',
    'document_id',
    'remarks',
])]
class LandSurvey extends Model
{
    protected $casts = [
        'survey_date' => 'date',
        'survey_coordinates' => 'array',
        'surveyed_size_perches' => 'decimal:2',
    ];

    public function landParcel()
    {
        return $this->belongsTo(LandParcel::class, 'land_parcel_id');
    }

    public function document()
    {
        return $this->belongsTo(Documents::class, 'document_id');
    }
}
