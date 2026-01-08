<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $primaryKey = 'student_id';

    protected $fillable = [
        'user_id', 'class_id', 'full_name', 'address', 'gender', 'grade',
        'guardian_name', 'guardian_contact', 'emergency_contact', 'enrollment_date',
        'dob', 'contact_no', 'nic', 'email', 'total_monthly_fee', 'profile_photo'
    ];

    // Encryption
    public function setAddressAttribute($value)
    {
        $this->attributes['address'] = encrypt($value);
    }

    public function getAddressAttribute($value)
    {
        try {
            return decrypt($value);
        } catch (\Exception $e) {
            return $value;
        }
    }

    public function setGuardianContactAttribute($value)
    {
        $this->attributes['guardian_contact'] = encrypt($value);
    }

    public function getGuardianContactAttribute($value)
    {
        try {
            return decrypt($value);
        } catch (\Exception $e) {
            return $value;
        }
    }

    public function setEmergencyContactAttribute($value)
    {
        $this->attributes['emergency_contact'] = $value ? encrypt($value) : null;
    }

    public function getEmergencyContactAttribute($value)
    {
        if (!$value) return null;
        try {
            return decrypt($value);
        } catch (\Exception $e) {
            return $value;
        }
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'student_subjects', 'student_id', 'subject_id');
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class, 'student_id');
    }

    public function fees()
    {
        return $this->hasMany(Fee::class, 'student_id');
    }

    public function school_class()
    {
        return $this->belongsTo(Classes::class, 'class_id');
    }
}