<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassSchedule extends Model
{
    use HasFactory;

    protected $primaryKey = 'schedule_id';

    protected $fillable = [
        'class_id',
        'subject_id',
        'tutor_id',
        'schedule_date',
        'start_time',
        'end_time',
        'status'
    ];

    protected $casts = [
        'schedule_date' => 'date',
    ];

    public function school_class()
    {
        return $this->belongsTo(Classes::class, 'class_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function tutor()
    {
        return $this->belongsTo(Tutor::class, 'tutor_id');
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class, 'schedule_id');
    }
}
