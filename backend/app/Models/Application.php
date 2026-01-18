<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Application extends Model
{
    protected $fillable = [
        'user_id',
        'company_id',
        'role_title',
        'status',
        'applied_date',
        'next_follow_up',
        'job_url',
        'salary_range',
        'notes',
    ];

    protected $casts = [
        'applied_date' => 'date:Y-m-d',
        'next_follow_up' => 'date:Y-m-d',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Timeline events for this application (most recent first).
     */
    public function events(): HasMany
    {
        return $this->hasMany(ApplicationEvent::class)
            ->orderByDesc('event_date')
            ->orderByDesc('id');
    }
}
