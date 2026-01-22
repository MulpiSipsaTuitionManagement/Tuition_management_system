import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, DollarSign, BookOpen, Clock, CheckCircle, Calendar, Search, ArrowUpRight, ArrowDownRight, Wallet, MoreHorizontal } from 'lucide-react';
import StatCard from '../Cards/StatCard';
import Card from '../Cards/Card';
import { API } from '../api/api';
import CalendarView from '../Components/Calendar';

export default function TutorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [salaries, setSalaries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      const tutorId = storedUser?.tutor?.tutor_id || storedUser?.tutor_id;

      // Fetch basic data
      const [classesRes, salariesRes, materialsRes] = await Promise.all([
        API.schedules.getAll({ range: 'today' }).catch(e => ({ success: false, data: [] })),
        API.salaries.getTutorSalaries().catch(e => ({ success: false, data: null })),
        API.materials.getAll().catch(e => ({ success: false, data: [] }))
      ]);

      if (classesRes.success) setTodayClasses(classesRes.data || []);
      if (salariesRes.success) setSalaries(salariesRes);

      let enrolledCount = 0;
      if (tutorId) {
        try {
          const tutorRes = await API.tutors.getById(tutorId);
          if (tutorRes.success) {
            enrolledCount = tutorRes.data?.subjects?.reduce((sum, s) => sum + (s.total_students || 0), 0) || 0;
          }
        } catch (err) {
          console.error('Error fetching tutor specific stats:', err);
        }
      }

      const materialsCount = (materialsRes.success && Array.isArray(materialsRes.data)) ? materialsRes.data.length : 0;
      const pendingAttendance = (classesRes.success && Array.isArray(classesRes.data))
        ? classesRes.data.filter(c => c.status === 'Scheduled' || c.status === 'Upcoming').length
        : 0;

      setStats({
        students_enrolled: enrolledCount,
        pending_attendance: pendingAttendance,
        materials_uploaded: materialsCount
      });
    } catch (error) {
      console.error('Error fetching tutor dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const userDisplayName = user?.profile?.full_name || user?.username || 'Tutor';

  return (
    <div className="min-h-screen bg-slate-50/50 -m-8 animate-fade-in">
      {/* Top Dark Hero Section */}
      <div className="bg-purple-950 relative overflow-hidden pt-12 pb-24 px-12">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-br from-purple-600 via-transparent to-transparent -skew-x-12 transform translate-x-1/4"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-gradient-to-br from-purple-600 to-purple-900 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {userDisplayName.split('  ')[0]} 👋
              </h1>
              <p className="text-purple-300/70 mt-1.5 font-medium">
                You have {todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'} scheduled for today.
              </p>
            </div>

            <nav className="hidden xl:flex items-center space-x-8 text-sm font-semibold text-white/50">
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-full border border-white/10 ml-4 group">
                <Search className="w-4 h-4 mr-2 text-white/40 group-focus-within:text-white" />
                <input
                  type="text"
                  placeholder="Search materials"
                  className="bg-transparent border-none outline-none text-xs text-white placeholder-white/40 w-32 focus:w-48 transition-all duration-300"
                />
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-8 -mt-16 pb-12 relative z-20">
        <div className="grid grid-cols-12 gap-8 max-w-[1600px] mx-auto">

          {/* Left Column (8/12) */}
          <div className="col-span-12 lg:col-span-8 space-y-8">

            {/* Overview Stats */}
            <Card className="p-6 border-none shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-800">Performance Snapshot</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100/50 group hover:border-purple-200 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                      Today
                    </span>
                    <div className="p-2 bg-purple-50 text-purple-500 rounded-xl group-hover:bg-purple-100 transition-colors">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">
                    {todayClasses.length}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Classes Today</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100/50 group hover:border-pink-200 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                      Active
                    </span>
                    <div className="p-2 bg-pink-50 text-pink-500 rounded-xl group-hover:bg-pink-100 transition-colors">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">
                    {stats?.students_enrolled || 0}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Students Enrolled</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100/50 group hover:border-orange-200 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                      Pending
                    </span>
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-xl group-hover:bg-orange-100 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">
                    {stats?.pending_attendance || 0}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Attendance Tasks</p>
                </div>
              </div>
            </Card>

            {/* Today's Schedule Table */}
            <Card className="p-0 border-none shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-6 flex items-center justify-between border-b border-slate-50">
                <h3 className="text-lg font-bold text-slate-800">My Classes Today</h3>
                <button
                  onClick={() => navigate('/schedules')}
                  className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  View Schedule
                </button>
              </div>

              <div className="overflow-x-auto">
                {todayClasses.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject & Grade</th>
                        <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Slot</th>
                        <th className="text-center py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {todayClasses.map((cls) => (
                        <tr key={cls.schedule_id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs ring-1 ring-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                {cls.subject?.subject_name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{cls.subject?.subject_name}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{cls.school_class?.class_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-slate-700">{cls.start_time.slice(0, 5)} - {cls.end_time.slice(0, 5)}</p>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => navigate(`/attendance/mark/${cls.schedule_id}`)}
                              className="px-4 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-purple-600 hover:text-white transition-all"
                            >
                              Mark
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">No classes scheduled for today</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column (4/12) */}
          <div className="col-span-12 lg:col-span-4 space-y-8">

            {/* Salary / Earning Card */}
            <Card className="p-8 border-none shadow-xl shadow-slate-200/50 relative overflow-hidden bg-gradient-to-br from-white to-purple-50/30">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-slate-800 leading-tight">Earnings Survey</h3>
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                  <Wallet className="w-5 h-5 text-purple-600" />
                </div>
              </div>

              <div className="mb-8">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                  {salaries?.data?.data?.[0] ? `Total Earned (${salaries.data.data[0].month})` : 'Total Earned (No Record)'}
                </p>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Rs {salaries?.data?.data?.[0]?.net_salary?.toLocaleString() || '0'}
                </h3>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Basic Salary</span>
                  <span className="font-black text-slate-900">Rs {salaries?.data?.data?.[0]?.base_amount?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Incentives</span>
                  <span className="font-black text-green-600">+ Rs {(parseInt(salaries?.data?.data?.[0]?.bonus || 0) + parseInt(salaries?.data?.data?.[0]?.allowances || 0))?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Deductions</span>
                  <span className="font-black text-red-600">- Rs {salaries?.data?.data?.[0]?.deductions?.toLocaleString() || '0'}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/salary')}
                className="w-full mt-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                View Earning Details
              </button>
            </Card>

            {/* Calendar View (Replaces Recent Tasks) */}
            <Card className="p-6 border-none shadow-xl shadow-slate-200/50">
              <CalendarView isAdmin={false} />
            </Card>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="py-8 text-center">
        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">
          v2.4.0 • © 2026 Mulpi-Sipsa Academy
        </p>
      </div>
    </div>
  );
}
;