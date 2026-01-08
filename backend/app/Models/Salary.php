<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salary extends Model
{
    use HasFactory;

    protected $primaryKey = 'salary_id';

    protected $fillable = [
        'tutor_id',
        'month',
        'base_amount',
        'allowances',
        'bonus',
        'deductions',
        'net_salary',
        'payment_date',
        'status',
        'recorded_by'
    ];

    protected $casts = [
        'payment_date' => 'date',
        'base_amount' => 'decimal:2',
        'allowances' => 'decimal:2',
        'bonus' => 'decimal:2',
        'deductions' => 'decimal:2',
        'net_salary' => 'decimal:2',
    ];

    public function tutor()
    {
        return $this->belongsTo(Tutor::class, 'tutor_id');
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}