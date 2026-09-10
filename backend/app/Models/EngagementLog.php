<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EngagementLog extends Model
{
    use HasFactory;

    #[Fillable([
        'campaign_id',
        'user_id',
        'action_type',
        'metadata',
        'ip_address',
        'user_agent'
    ])]

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
