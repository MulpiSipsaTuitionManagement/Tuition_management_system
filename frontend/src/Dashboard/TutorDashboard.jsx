import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, DollarSign, BookOpen, Clock, CheckCircle, Calendar } from 'lucide-react';
import StatCard from '../Cards/StatCard';
import Card from '../Cards/Card';
import { API } from '../api/api';

export default function TutorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [salaries, setSalaries] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [classesRes, salariesRes] = await Promise.all([
        API.schedules.getAll({ range: 'today' }),
        API.salaries.getTutorSalaries()
      ]);

      if (classesRes.success) setTodayClasses(classesRes.data);
      if (salariesRes.success) setSalaries(salariesRes.data);
    } catch (error) {
      console.error('Error fetching tutor dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">Tutor Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          value={todayClasses.length || 0}
          label="Classes Today"
          icon={<Clock className="w-6 h-6 text-purple-600" />}
          loading={loading}
        />
        <StatCard
          value="45"
          label="Students Enrolled"
          icon={<Users className="w-6 h-6 text-purple-600" />}
          loading={loading}
        />
        <StatCard
          value="2"
          label="Pending Attendance"
          icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
          loading={loading}
        />
        <StatCard
          value="12"
          label="Materials Uploaded"
          icon={<BookOpen className="w-6 h-6 text-purple-600" />}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">My Classes Today</h3>
          </div>
          {todayClasses.length > 0 ? (
            <div className="space-y-3">
              {todayClasses.map((cls) => (
                <div key={cls.schedule_id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-purple-50 transition-all hover:shadow-md group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                      <BookOpen className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{cls.subject?.subject_name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{cls.school_class?.class_name} • {cls.start_time.slice(0, 5)} - {cls.end_time.slice(0, 5)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/attendance/mark/${cls.schedule_id}`)}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-600 hover:text-white transition-all"
                  >
                    Mark Attendance
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No classes scheduled for today
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Salary Overview</h3>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Monthly Salary</p>
              <p className="text-2xl font-bold text-purple-900">
                Rs {salaries?.summary?.total_earned?.toLocaleString() || '0'}
              </p>
            </div>
            <button className="w-full px-4 py-2 text-sm font-medium text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
              View Full History
            </button>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-900">Attendance marked for Mathematics - Grade 10</span>
            <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-900">Uploaded new study material for Science</span>
            <span className="text-xs text-gray-500 ml-auto">5 hours ago</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
            <Calendar className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-900">Rescheduled English class to next Monday</span>
            <span className="text-xs text-gray-500 ml-auto">Yesterday</span>
          </div>
        </div>
      </Card>

      <div className="text-center text-sm text-gray-500">
        v2.3.1 © 2025 Mulpi-Sipsa Institute
      </div>
    </div>
  );
};