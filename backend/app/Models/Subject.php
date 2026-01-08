<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $primaryKey = 'subject_id';

    protected $fillable = [
        'subject_name',
        'grade',
        'class_id',
        'tutor_id',
        'monthly_fee',
        'total_students',
        'study_materials'
    ];

    public function school_class()
    {
        return $this->belongsTo(Classes::class, 'class_id');
    }

    public function tutor()
    {
        return $this->belongsTo(Tutor::class, 'tutor_id');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_subjects', 'subject_id', 'student_id');
    }

    public function schedules()
    {
        return $this->hasMany(ClassSchedule::class, 'subject_id');
    }

    public function fees()
    {
        return $this->hasMany(Fee::class, 'subject_id');
    }

    public function studyMaterials()
    {
        return $this->hasMany(StudyMaterial::class, 'subject_id');
    }
}
