import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, DollarSign, BookOpen, Clock, CheckCircle, Calendar, Search, ArrowUpRight, ArrowDownRight, Wallet, MoreHorizontal, Download, FileBarChart } from 'lucide-react';
import StatCard from '../Cards/StatCard';
import Card from '../Cards/Card';
import { API } from '../api/api';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [fees, setFees] = useState(null);
  const [attendance, setAttendance] = useState(null);
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

  const userDisplayName = user?.profile?.full_name || user?.username || 'Student';

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
                Welcome back, {userDisplayName.split('  ')[0]} 🎓
              </h1>
              <p className="text-purple-300/70 mt-1.5 font-medium">
                You have {classes.length} upcoming classes scheduled.
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

            {/* Performance Snapshot */}
            <Card className="p-6 border-none shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-800">Learning Progress</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100/50 group hover:border-purple-200 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                      Active
                    </span>
                    <div className="p-2 bg-purple-50 text-purple-500 rounded-xl group-hover:bg-purple-100 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">
                    {attendance?.rate || 0}%
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Attendance Rate</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100/50 group hover:border-pink-200 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                      Upcoming
                    </span>
                    <div className="p-2 bg-pink-50 text-pink-500 rounded-xl group-hover:bg-pink-100 transition-colors">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">
                    {classes.length || 0}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Classes Left</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100/50 group hover:border-orange-200 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                      Payable
                    </span>
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-xl group-hover:bg-orange-100 transition-colors">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">
                    Rs {fees?.pending?.toLocaleString() || '0'}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Pending Fees</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100/50 group hover:border-blue-200 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                      Library
                    </span>
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-100 transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">
                    24
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Study Guides</p>
                </div>
              </div>
            </Card>

            {/* Upcoming Classes Table */}
            <Card className="p-0 border-none shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-6 flex items-center justify-between border-b border-slate-50">
                <h3 className="text-lg font-bold text-slate-800">My Study Schedule</h3>
                <button
                  onClick={() => navigate('/timetable')}
                  className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Full Timetable
                </button>
              </div>

              <div className="overflow-x-auto">
                {classes.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                        <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tutor</th>
                        <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Slot</th>
                        <th className="text-center py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {classes.slice(0, 5).map((cls) => (
                        <tr key={cls.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs ring-1 ring-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                {cls.subject?.subject_name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{cls.subject?.subject_name}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{cls.schedule_date}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-slate-700">{cls.tutor?.full_name}</p>
                            <p className="text-[10px] text-slate-500">Expert Instructor</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-slate-700">{cls.start_time.slice(0, 5)} - {cls.end_time?.slice(0, 5) || 'N/A'}</p>
                            <p className="text-[10px] text-slate-500">Morning Session</p>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider rounded-lg">
                              Scheduled
                            </span>
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
                    <p className="text-sm font-bold text-slate-400">No classes scheduled</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Study Materials */}
            <Card className="p-6 border-none shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-800">Recent Materials</h3>
                <button className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors">Access Library</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Math - Chapter 5', type: 'PDF', color: 'red', date: '2 days ago' },
                  { name: 'Science - Lab Specs', type: 'DOCX', color: 'blue', date: '5 days ago' },
                  { name: 'English - Essays', type: 'PDF', color: 'green', date: '1 week ago' }
                ].map((file, i) => (
                  <div key={i} className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all group">
                    <div className={`w-10 h-10 bg-${file.color}-50 text-${file.color}-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                      <FileBarChart className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{file.date}</p>
                    </div>
                    <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column (4/12) */}
          <div className="col-span-12 lg:col-span-4 space-y-8">

            {/* Attendance Rate Card */}
            <Card className="p-8 border-none shadow-xl shadow-slate-200/50 relative overflow-hidden bg-gradient-to-br from-white to-purple-50/30">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-slate-800 leading-tight">Attendance<br />Metrics</h3>
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
              </div>

              <div className="relative flex justify-center py-6">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 * (1 - (attendance?.rate || 0) / 100)}
                    strokeLinecap="round"
                    className="text-purple-600 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900">{attendance?.rate || 0}%</span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Average</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Classes Attended</span>
                  <span className="font-black text-slate-900">{attendance?.summary?.present_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Total Lessons</span>
                  <span className="font-black text-slate-900">{attendance?.summary?.total_scheduled || 0}</span>
                </div>
              </div>
            </Card>

            {/* Payment History */}
            <Card className="p-6 border-none shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Fees History</h3>
                <button className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">View All</button>
              </div>

              <div className="space-y-4">
                {[
                  { month: 'November 2024', status: 'Pending', color: 'red', date: 'Nov 30, 2024' },
                  { month: 'October 2024', status: 'Paid', color: 'green', date: 'Oct 5, 2024' },
                  { month: 'September 2024', status: 'Paid', color: 'green', date: 'Sep 3, 2024' }
                ].map((fee, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-transparent hover:border-slate-100 hover:bg-white transition-all">
                    <div>
                      <p className="text-xs font-black text-slate-900">{fee.month}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Due: {fee.date}</p>
                    </div>
                    <span className={`px-2.5 py-1 bg-${fee.color}-100 text-${fee.color}-700 text-[10px] font-black uppercase tracking-wider rounded-lg`}>
                      {fee.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Support / Contact Card */}
            <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-slate-900 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-600/30 transition-colors"></div>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Support Center</p>
              <h4 className="text-lg font-bold text-white mb-4">Need help with your studies?</h4>
              <button className="w-full py-3 bg-white text-slate-900 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-all">
                Contact Office
              </button>
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
