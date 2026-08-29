<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    #[Fillable([
        'title',
        'description',
        'start_date',
        'end_date',
        'target_audience',
        'status',
        'created_by',
        'priority',
        'budget',
        'location',
        'expected_reach',
    ])]

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date'   => 'datetime',
            'budget'     => 'decimal:2',
        ];
    }
}
