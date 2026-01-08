<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TutorController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\ClassScheduleController;
use App\Http\Controllers\FeeController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\StudyMaterialController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AnnouncementController;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware(['auth.jwt'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Admin Actions
    Route::post('/admin/users', [AdminController::class, 'createUser']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
    Route::get('/admin/stats', [AdminController::class, 'getDashboardStats']);

    // Core Resources
    Route::resource('classes', ClassController::class); // Grades
    Route::resource('subjects', SubjectController::class);
    Route::get('schedules/options', [ClassScheduleController::class, 'getSchedulingOptions']);
    Route::resource('schedules', ClassScheduleController::class);
    
    // Student Actions
    Route::get('/students', [StudentController::class, 'index']);
    Route::match(['POST', 'PUT'], '/students/{id}', [StudentController::class, 'update']); // Update profile
    Route::get('/students/{id}', [StudentController::class, 'show']);
    Route::post('/students/{id}/enroll', [StudentController::class, 'enroll']);
    Route::get('/students/{id}/timetable', [StudentController::class, 'getTimetable']);
    Route::get('/student/timetable', [StudentController::class, 'getMyTimetable']);

    // Attendance
    Route::get('/attendance/analytics', [AttendanceController::class, 'getAnalytics']);
    Route::get('/attendance/student-summary/{id?}', [AttendanceController::class, 'getStudentSummary']);
    Route::post('/attendance/mark', [AttendanceController::class, 'markAttendance']);
    Route::get('/attendance/schedule/{scheduleId}', [AttendanceController::class, 'getBySchedule']);
    
    // Fees
    Route::get('/student/fees', [FeeController::class, 'getStudentFees']);
    Route::post('/fees/generate', [FeeController::class, 'generateMonthlyFees']);
    Route::post('/fees/{id}/pay', [FeeController::class, 'markAsPaid']);
    Route::post('/fees/{id}/remind', [FeeController::class, 'sendReminder']);
    Route::resource('fees', FeeController::class);
    
    // Salaries
    Route::get('/tutor/salaries', [SalaryController::class, 'getTutorSalaries']);
    Route::post('/salaries/generate', [SalaryController::class, 'generateMonthlySalaries']);
    Route::post('/salaries/{id}/pay', [SalaryController::class, 'markAsPaid']);
    Route::resource('salaries', SalaryController::class);

    // Tutors
    Route::match(['POST', 'PUT'], '/tutors/{id}', [TutorController::class, 'updateProfile']);
    Route::resource('tutors', TutorController::class);

    Route::get('/study-materials/options', [StudyMaterialController::class, 'getOptions']);
    Route::get('/study-materials/download/{id}', [StudyMaterialController::class, 'download']);
    Route::post('/study-materials/upload', [StudyMaterialController::class, 'upload']);
    Route::resource('study-materials', StudyMaterialController::class);
    
    // Notifications & Announcements
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::get('/notifications/my', [NotificationController::class, 'getMyNotifications']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::resource('notifications', NotificationController::class);
    Route::resource('announcements', AnnouncementController::class);
});
