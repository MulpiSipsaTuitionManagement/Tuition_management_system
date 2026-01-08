<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tutor extends Model
{
    use HasFactory;

    protected $primaryKey = 'tutor_id';

    protected $fillable = [
        'user_id', 'full_name', 'nic', 'email', 'contact_no',
        'address', 'basic_salary', 'emergency_contact',
        'dob', 'gender', 'join_date', 'experience', 'qualification', 'profile_photo'
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'dob' => 'date',
        'join_date' => 'date',
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

    public function setNicAttribute($value)
    {
        $this->attributes['nic'] = encrypt($value);
    }

    public function getNicAttribute($value)
    {
        try {
            return decrypt($value);
        } catch (\Exception $e) {
            return $value;
        }
    }

    public function setContactNoAttribute($value)
    {
        $this->attributes['contact_no'] = encrypt($value);
    }

    public function getContactNoAttribute($value)
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
        return $this->hasMany(Subject::class, 'tutor_id');
    }

    public function schedules()
    {
        return $this->hasMany(ClassSchedule::class, 'tutor_id');
    }

    public function salaries()
    {
        return $this->hasMany(Salary::class, 'tutor_id');
    }
}