import { useEffect, useState } from 'react';
import { Users, GraduationCap, DollarSign, BookOpen, Clock, CheckCircle, FileBarChart, Download } from 'lucide-react';
import StatCard from '../Cards/StatCard';
import Card from '../Cards/Card';
import { API } from '../api/api';

export default function StudentDashboard() {
  const [classes, setClasses] = useState([]);
  const [fees, setFees] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [classesRes, feesRes, attendanceRes] = await Promise.all([
        API.students.getMyTimetable(),
        API.fees.getStudentFees(),
        API.attendance.getStudentSummary()
      ]);

      if (classesRes.success) setClasses(classesRes.data);
      if (feesRes.success) {
        setFees(feesRes.summary);
      }
      if (attendanceRes.success) {
        setAttendance({
          rate: attendanceRes.summary.present_count > 0
            ? Math.round((attendanceRes.summary.present_count / attendanceRes.summary.total_scheduled) * 100)
            : 0,
          summary: attendanceRes.summary
        });
      }
    } catch (error) {
      console.error('Error fetching student dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">Student Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          value={`${attendance?.rate || 0}%`}
          label="Attendance Rate"
          icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
          loading={loading}
        />
        <StatCard
          value={classes.length || 0}
          label="Upcoming Classes"
          icon={<Clock className="w-6 h-6 text-purple-600" />}
          loading={loading}
        />
        <StatCard
          value={`Rs ${fees?.pending?.toLocaleString() || '0'}`}
          label="Pending Fees"
          icon={<DollarSign className="w-6 h-6 text-purple-600" />}
          loading={loading}
        />
        <StatCard
          value="24"
          label="Materials Available"
          icon={<BookOpen className="w-6 h-6 text-purple-600" />}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Classes</h3>
          </div>
          {classes.length > 0 ? (
            <div className="space-y-3">
              {classes.slice(0, 5).map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{cls.subject?.subject_name}</h4>
                      <p className="text-sm text-gray-600">{cls.schedule_date} • {cls.start_time}</p>
                      <p className="text-xs text-gray-500">{cls.tutor?.full_name}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Scheduled
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No upcoming classes
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance Summary</h3>
          <div className="space-y-4">
            <div className="relative">
              <svg className="w-full h-40">
                <circle cx="80" cy="80" r="60" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="url(#studentGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(attendance?.rate / 100) * 377} 377`}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
                <defs>
                  <linearGradient id="studentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-900">{attendance?.rate}%</p>
                  <p className="text-xs text-gray-600">Present</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Classes Attended</span>
                <span className="font-semibold text-gray-900">{attendance?.summary?.present_count || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Scheduled</span>
                <span className="font-semibold text-gray-900">{attendance?.summary?.total_scheduled || 0}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Study Materials</h3>
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">View All</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileBarChart className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Mathematics - Chapter 5.pdf</p>
                  <p className="text-xs text-gray-500">Uploaded 2 days ago</p>
                </div>
              </div>
              <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg">
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileBarChart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Science - Lab Report.docx</p>
                  <p className="text-xs text-gray-500">Uploaded 5 days ago</p>
                </div>
              </div>
              <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg">
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileBarChart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">English - Essays.pdf</p>
                  <p className="text-xs text-gray-500">Uploaded 1 week ago</p>
                </div>
              </div>
              <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Fee Payment History</h3>
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">View All</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">November 2024</p>
                <p className="text-xs text-gray-500">Due: Nov 30, 2024</p>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                Pending
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">October 2024</p>
                <p className="text-xs text-gray-500">Paid: Oct 5, 2024</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Paid
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">September 2024</p>
                <p className="text-xs text-gray-500">Paid: Sep 3, 2024</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Paid
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="text-center text-sm text-gray-500">
        v2.3.1 © 2025 Mulpi-Sipsa Institute
      </div>
    </div>
  );
};
