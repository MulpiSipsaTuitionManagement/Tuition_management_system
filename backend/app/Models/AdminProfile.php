<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminProfile extends Model
{
    use HasFactory;

    protected $primaryKey = 'admin_id';

    protected $fillable = [
        'user_id', 'full_name', 'profile_photo', 'nic', 'dob', 'gender', 'email', 'contact_no', 'address', 'join_date'
    ];

    // Encryption & Decryption for all fields (following existing pattern in Student/Tutor)
    
    // Full Name
    public function setFullNameAttribute($value) { $this->attributes['full_name'] = $value ? encrypt($value) : null; }
    public function getFullNameAttribute($value) { try { return $value ? decrypt($value) : null; } catch (\Exception $e) { return $value; } }

    // Profile Photo
    public function setProfilePhotoAttribute($value) { $this->attributes['profile_photo'] = $value ? encrypt($value) : null; }
    public function getProfilePhotoAttribute($value) { try { return $value ? decrypt($value) : null; } catch (\Exception $e) { return $value; } }

    // NIC
    public function setNicAttribute($value) { $this->attributes['nic'] = $value ? encrypt($value) : null; }
    public function getNicAttribute($value) { try { return $value ? decrypt($value) : null; } catch (\Exception $e) { return $value; } }

    // DOB
    public function setDobAttribute($value) { $this->attributes['dob'] = $value ? encrypt($value) : null; }
    public function getDobAttribute($value) { try { return $value ? decrypt($value) : null; } catch (\Exception $e) { return $value; } }

    // Gender
    public function setGenderAttribute($value) { $this->attributes['gender'] = $value ? encrypt($value) : null; }
    public function getGenderAttribute($value) { try { return $value ? decrypt($value) : null; } catch (\Exception $e) { return $value; } }

    // Email
    public function setEmailAttribute($value) { $this->attributes['email'] = $value ? encrypt($value) : null; }
    public function getEmailAttribute($value) { try { return $value ? decrypt($value) : null; } catch (\Exception $e) { return $value; } }

    // Contact No
    public function setContactNoAttribute($value) { $this->attributes['contact_no'] = $value ? encrypt($value) : null; }
    public function getContactNoAttribute($value) { try { return $value ? decrypt($value) : null; } catch (\Exception $e) { return $value; } }

    // Address
    public function setAddressAttribute($value) { $this->attributes['address'] = $value ? encrypt($value) : null; }
    public function getAddressAttribute($value) { try { return $value ? decrypt($value) : null; } catch (\Exception $e) { return $value; } }

    // Join Date
    public function setJoinDateAttribute($value) { $this->attributes['join_date'] = $value ? encrypt($value) : null; }
    public function getJoinDateAttribute($value) { try { return $value ? decrypt($value) : null; } catch (\Exception $e) { return $value; } }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
