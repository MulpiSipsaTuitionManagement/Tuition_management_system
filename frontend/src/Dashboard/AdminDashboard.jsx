import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, DollarSign, BookOpen, UserPlus, FileBarChart, Calendar, TrendingUp, TrendingDown, ChevronRight, MoreHorizontal, Wallet, Target, CreditCard, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../Cards/Card';
import StatCard from '../Cards/StatCard';
import { API } from '../api/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [feeStats, setFeeStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, classesRes, analyticsRes, notifRes] = await Promise.all([
        API.admin.getDashboardStats(),
        API.schedules.getAll({ range: 'week' }),
        API.attendance.getAnalytics(),
        API.notifications.getAll(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (classesRes.success) setUpcomingClasses(classesRes.data);
      if (analyticsRes.success) {
        setWeeklyAttendance(analyticsRes.data.weekly_overview);
        // Assuming fee stats might be part of analytics or generic
        setFeeStats({
          collection_rate: 85,
          collected: statsRes.data?.total_fees_collected || 0,
          pending: statsRes.data?.pending_fees || 0
        });
      }
      if (notifRes.success) setNotifications(notifRes.data.data || notifRes.data || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const userDisplayName = user?.profile?.full_name || user?.username || 'Admin';

  return (
    <div className="min-h-screen bg-slate-50/50 -m-8 animate-fade-in">
      {/* Top Dark Hero Section */}
      <div className="bg-purple-950 relative overflow-hidden pt-12 pb-24 px-12">
        {/* Decorative background gradient */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-br from-purple-600 via-transparent to-transparent -skew-x-12 transform translate-x-1/4"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-gradient-to-br from-purple-600 to-purple-900 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Hello, {userDisplayName.split('  ')[0]} 👋
              </h1>
              <p className="text-purple-300/70 mt-1.5 font-medium">
                Welcome on board, great to see you there
              </p>
            </div>

            {/* Simple Navigation links like in the reference */}
            <nav className="hidden xl:flex items-center space-x-8 text-sm font-semibold text-white/50">
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-full border border-white/10 ml-4 group">
                <Search className="w-4 h-4 mr-2 text-white/40 group-focus-within:text-white" />
                <input
                  type="text"
                  placeholder="Search"
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

            {/* Overview Section */}
            <Card className="p-6 border-none shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-800">Overview</h3>
                <button className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors">See detail</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Income Stat */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100/50 group hover:border-purple-200 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                      <ArrowUpRight className="w-3 h-3 mr-0.5" /> 3.2%
                    </span>
                    <div className="p-2 bg-purple-50 text-purple-500 rounded-xl group-hover:bg-purple-100 transition-colors">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">
                    Rs {(stats?.total_fees_collected || 0).toLocaleString()}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Total Income</p>
                </div>

                {/* Total Students Stat */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100/50 group hover:border-pink-200 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                      <ArrowUpRight className="w-3 h-3 mr-0.5" /> 2%
                    </span>
                    <div className="p-2 bg-pink-50 text-pink-500 rounded-xl group-hover:bg-pink-100 transition-colors">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">
                    {stats?.total_students?.toLocaleString() || '0'}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Total Students</p>
                </div>

                {/* Pending Fees Stat */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100/50 group hover:border-orange-200 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                      <ArrowDownRight className="w-3 h-3 mr-0.5" /> 0.8%
                    </span>
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-xl group-hover:bg-orange-100 transition-colors">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">
                    Rs {stats?.pending_fees?.toLocaleString() || '0'}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Outstanding Fees</p>
                </div>
              </div>
            </Card>

            {/* Income/Attendance Visualization */}
            <Card className="p-8 border-none shadow-xl shadow-slate-200/50 overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-800">Weekly Attendance Trend</h3>
                <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                  <button className="px-4 py-1.5 bg-white text-purple-700 shadow-sm rounded-lg text-xs font-bold transition-all">Daily</button>
                  <button className="px-4 py-1.5 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-bold transition-all">Weekly</button>
                </div>
              </div>

              <div className="h-[280px] w-full relative flex items-end justify-between px-2 pt-12">
                {/* Horizontal grid lines */}
                {[0, 25, 50, 75, 100].map(line => (
                  <div key={line} className="absolute inset-x-0 border-t border-slate-100" style={{ bottom: `${line}%` }}>
                    <span className="absolute -left-8 -top-2 text-[10px] font-bold text-slate-300">{line}%</span>
                  </div>
                ))}

                {/* Chart Bars (representing attendance) */}
                {weeklyAttendance.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center group relative w-full h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-800 text-white text-[10px] py-1 px-2 rounded-lg font-bold z-10 -translate-y-2 pointer-events-none mb-2">
                      {day.percentage}%
                    </div>
                    <div
                      className="w-[30%] bg-gradient-to-t from-purple-600 to-pink-400 rounded-t-xl transition-all duration-1000 ease-out hover:brightness-110 shadow-lg shadow-purple-200/40"
                      style={{ height: `${day.percentage}%` }}
                    ></div>
                    <span className="text-[10px] font-bold text-slate-400 mt-4 group-hover:text-purple-600 transition-colors uppercase tracking-wider">{day.day.slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Classes / Transactions */}
            <Card className="p-0 border-none shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-6 flex items-center justify-between border-b border-slate-50">
                <h3 className="text-lg font-bold text-slate-800">Upcoming Classes</h3>
                <button className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors">View all</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="text-left py-4 px-6 text-[10px] font-bold text-purple-900 uppercase tracking-widest">Class Details</th>
                      <th className="text-left py-4 px-6 text-[10px] font-bold text-purple-900 uppercase tracking-widest">Date & Time</th>
                      <th className="text-left py-4 px-6 text-[10px] font-bold text-purple-900 uppercase tracking-widest">Tutor</th>
                      <th className="text-left py-4 px-6 text-[10px] font-bold text-purple-900 uppercase tracking-widest">Status</th>
                      <th className="text-center py-4 px-6 text-[10px] font-bold text-purple-900 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {upcomingClasses.slice(0, 5).map((cls) => (
                      <tr key={cls.schedule_id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs ring-1 ring-purple-100">
                              {cls.subject?.subject_name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{cls.subject?.subject_name}</p>
                              <p className="text-[10px] text-slate-500 font-medium">Class ID: #{cls.schedule_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-bold text-slate-700">{cls.schedule_date}</p>
                          <p className="text-[10px] text-slate-500">{cls.start_time?.slice(0, 5)} - {cls.end_time?.slice(0, 5)}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-bold text-slate-700">{cls.tutor?.full_name || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${cls.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {cls.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button className="p-2 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Column (4/12) */}
          <div className="col-span-12 lg:col-span-4 space-y-8">

            {/* Work Progress Card (Circular Progress Mockup) */}
            <Card className="p-8 border-none shadow-xl shadow-slate-200/50 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-slate-800 leading-tight">Collection<br />Efficiency</h3>
                <button className="p-1 px-3 text-[10px] font-bold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all">Details</button>
              </div>

              <div className="relative h-56 flex items-center justify-center">
                {/* Simulated Radial Bar Chart with SVG */}
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={502} strokeDashoffset={502 * (1 - 0.85)} strokeLinecap="round" className="text-purple-600 transition-all duration-1000" />

                  <circle cx="96" cy="96" r="60" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                  <circle cx="96" cy="96" r="60" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={377} strokeDashoffset={377 * (1 - 0.70)} strokeLinecap="round" className="text-pink-400 transition-all duration-1000" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-black text-slate-900">85%</span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Efficiency</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
                    <span className="font-bold text-slate-600">Fee Collection</span>
                  </div>
                  <span className="font-black text-slate-900">85%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-400"></div>
                    <span className="font-bold text-slate-600">Tutor Payouts</span>
                  </div>
                  <span className="font-black text-slate-900">70%</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions Grid */}
            <Card className="p-6 border-none shadow-xl shadow-slate-200/50">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Management Shortcuts</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center p-5 bg-purple-50 hover:bg-purple-100 rounded-3xl transition-all duration-300 group border border-purple-100/50">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 mt-3">Add Student</span>
                </button>
                <button className="flex flex-col items-center p-5 bg-pink-50 hover:bg-pink-100 rounded-3xl transition-all duration-300 group border border-pink-100/50">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-600 shadow-sm group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 mt-3">Set Schedule</span>
                </button>
                <button className="flex flex-col items-center p-5 bg-orange-50 hover:bg-orange-100 rounded-3xl transition-all duration-300 group border border-orange-100/50">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 mt-3">Record Fee</span>
                </button>
                <button className="flex flex-col items-center p-5 bg-blue-50 hover:bg-blue-100 rounded-3xl transition-all duration-300 group border border-blue-100/50">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                    <FileBarChart className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 mt-3">Reports</span>
                </button>
              </div>
            </Card>

            {/* Notifications Section */}
            <Card className="p-6 border-none shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Alerts</h3>
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-lg">NEW</span>
              </div>
              <div className="space-y-4">
                {notifications.slice(0, 3).map((notif, idx) => (
                  <div key={idx} className="flex space-x-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${idx === 0 ? 'bg-orange-500 ring-4 ring-orange-100' : 'bg-slate-200'}`}></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{notif.message}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
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
