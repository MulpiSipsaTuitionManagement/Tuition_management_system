<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classes extends Model
{
    use HasFactory;

    protected $primaryKey = 'class_id';

    protected $fillable = [
        'class_name', 'academic_level', 'total_students', 'status'
    ];

    public function subjects()
    {
        return $this->hasMany(Subject::class, 'class_id');
    }
    
    // Helper to count students
    public function updateStudentCount()
    {
        // Logic to count types of students. 
        // If students are linked via subjects, we count unique students in this class's subjects.
        $count = $this->subjects()->withCount('students')->get()->sum('students_count');
        // This sums enrollments, not unique students. 
        // Better: 
        // $this->subjects->flatMap->students->unique('student_id')->count();
        // For now, simple implementation or leave for controller.
    }
}