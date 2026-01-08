<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $primaryKey = 'notification_id';

    protected $fillable = [
        'title',
        'type',
        'message',
        'user_id',
        'student_id',
        'recipient_phone',
        'status',
        'sent_date',
        'is_read'
    ];

    protected $casts = [
        'sent_date' => 'datetime',
        'is_read' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}