import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Layout/LoginPage';
import Layout from './Components/Layout';
import AdminDashboard from './Dashboard/AdminDashboard';
import StudentsList from './List/StudentsList';
import TutorsList from './List/TutorsList';
import { API } from './api/api';
import TutorDashboard from './Dashboard/TutorDashboard';
import StudentDashboard from './Dashboard/StudentDashboard';
import AttendanceManagement from './Layout/AttendanceMarking';
import FeeManagement from './Layout/FeeManagement';
import ClassScheduling from './Layout/ClassScheduling';
import AddSchedule from './Layout/AddSchedule';
import MarkAttendance from './Layout/MarkAttendance';
import StudentAttendanceSummary from './Layout/StudentAttendanceSummary';
import StudyMaterials from './Layout/StudyMaterials';
import SalaryHistory from './Layout/SalaryHistory';
import StudentFees from './Layout/StudentFees_temp';
import ClassesList from './List/ClassesList';
import UpdateSchedule from './Layout/UpdateSchedule';
import SalaryManagement from './Layout/SalaryManagement';
import AddStudent from './Layout/AddStudent';
import AddTutor from './Layout/AddTutor';
import AddClass from './Layout/AddClass';
import EditClass from './Layout/EditClass';
import AddSubject from './Layout/AddSubject';
import StudentDetails from './Layout/StudentDetails';
import EditStudent from './Layout/EditStudent';
import TutorDetails from './Layout/TutorDetails';
import EditTutor from './Layout/EditTutor';
import ClassDetails from './Layout/ClassDetails';
import SubjectDetails from './Layout/SubjectDetails';
import EditSalary from './Layout/EditSalary';
import TutorSalaryHistory from './Layout/TutorSalaryHistory';
import StudentFeeHistory from './Layout/StudentFeeHistory';
import Profile from './Layout/Profile';
import Settings from './Layout/Settings';
import MyAttendance from './Layout/MyAttendance';
import Announcements from './Layout/Announcements';
import CreateAnnouncement from './Layout/CreateAnnouncement';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        const result = await API.auth.me();
        if (result.success) {
          let userData = result.user;
          // Persistent local profile for Admin (since backend doesn't have an admin profile table)
          if (userData.role === 'admin' && savedUser) {
            const localUser = JSON.parse(savedUser);
            if (localUser.role === 'admin' && localUser.profile) {
              userData.profile = localUser.profile;
            }
          }
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await API.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            {/* Admin Routes */}
            {user.role === 'admin' && (
              <>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/classes" element={<ClassesList />} />
                <Route path="/classes/add" element={<AddClass />} />
                <Route path="/classes/:id" element={<ClassDetails />} />
                <Route path="/classes/:id/edit" element={<EditClass />} />
                <Route path="/students" element={<StudentsList />} />
                <Route path="/students/add" element={<AddStudent />} />
                <Route path="/students/:id" element={<StudentDetails />} />
                <Route path="/students/:id/edit" element={<EditStudent />} />
                <Route path="/tutors" element={<TutorsList />} />
                <Route path="/tutors/add" element={<AddTutor />} />
                <Route path="/tutors/:id" element={<TutorDetails />} />
                <Route path="/tutors/:id/edit" element={<EditTutor />} />

                <Route path="/subjects/add" element={<AddSubject />} />
                <Route path="/subjects/:id" element={<SubjectDetails />} />
                <Route path="/attendance" element={<AttendanceManagement />} />
                <Route path="/attendance/mark/:scheduleId" element={<MarkAttendance />} />
                <Route path="/fees" element={<FeeManagement />} />
                <Route path="/salaries" element={<SalaryManagement />} />
                <Route path="/salaries/:id/edit" element={<EditSalary />} />
                <Route path="/tutors/:id/salaries" element={<TutorSalaryHistory />} />
                <Route path="/students/:id/fees" element={<StudentFeeHistory />} />
                <Route path="/students/:id/attendance" element={<StudentAttendanceSummary />} />
                <Route path="/schedules" element={<ClassScheduling />} />
                <Route path="/schedules/add" element={<AddSchedule />} />
                <Route path="/schedules/:id/edit" element={<UpdateSchedule />} />
                <Route path="/materials" element={<StudyMaterials userRole={user.role} />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/announcements/create" element={<CreateAnnouncement />} />
              </>
            )}

            {/* Tutor Routes */}
            {user.role === 'tutor' && (
              <>
                <Route path="/" element={<TutorDashboard />} />
                <Route path="/dashboard" element={<TutorDashboard />} />
                <Route path="/tutor/dashboard" element={<TutorDashboard />} />
                <Route path="/attendance" element={<AttendanceManagement />} />
                <Route path="/attendance/mark/:scheduleId" element={<MarkAttendance />} />
                <Route path="/schedules" element={<ClassScheduling />} />
                <Route path="/schedules/add" element={<AddSchedule />} />
                <Route path="/schedules/:id/edit" element={<UpdateSchedule />} />
                <Route path="/materials" element={<StudyMaterials userRole={user.role} />} />
                <Route path="/salary" element={<SalaryHistory />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/announcements/create" element={<CreateAnnouncement />} />
              </>
            )}

            {/* Student Routes */}
            {user.role === 'student' && (
              <>
                <Route path="/" element={<StudentDashboard />} />
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/attendance" element={<MyAttendance />} />
                <Route path="/fees" element={<StudentFees />} />
                <Route path="/schedules" element={<ClassScheduling />} />
                <Route path="/materials" element={<StudyMaterials userRole={user.role} />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/announcements" element={<Announcements />} />
              </>
            )}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </BrowserRouter>
  );
}