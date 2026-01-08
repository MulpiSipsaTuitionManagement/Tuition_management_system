<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudyMaterial extends Model
{
    use HasFactory;

    protected $primaryKey = 'material_id';

    protected $fillable = [
        'subject_id',
        'title',
        'description',
        'file_path',
        'file_size',
        'uploaded_by',
        'uploaded_date'
    ];

    protected $casts = [
        'uploaded_date' => 'datetime',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function uploader()
    {
        return $this->belongsTo(Tutor::class, 'uploaded_by');
    }
}