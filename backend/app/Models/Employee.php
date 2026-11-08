<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'public_id',
        'name',
        'email',
        'phone',
        'department',
        'position',
        'status',
        'join_date',
        'manager',
        'location',
        'initials',
        'avatar_color',
        'assets_count',
        'grade',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'join_date' => 'date',
        'assets_count' => 'integer',
    ];

    /**
     * Route model binding uses the public employee id (e.g. EMP-2022-094).
     */
    public function getRouteKeyName(): string
    {
        return 'public_id';
    }
}
