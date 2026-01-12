import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Users, ArrowRight, TrendingUp } from 'lucide-react';
import Card from '../Cards/Card';
import { API } from '../api/api';
import { useNavigate } from 'react-router-dom';


export default function AttendanceManagement() {
  const [schedules, setSchedules] = useState([]);
  const [analytics, setAnalytics] = useState({ today_percentage: 0, weekly_overview: [] });
  const [options, setOptions] = useState({ classes: [], subjects: [] });
  const [filters, setFilters] = useState({
    class_id: '',
    subject_id: '',
    range: 'today'
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchOptions = async () => {
    try {
      const res = await API.schedules.getOptions();
      if (res.success) setOptions(res.data);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, analyticsRes] = await Promise.all([
        API.schedules.getAll(filters),
        API.attendance.getAnalytics()
      ]);

      if (schedulesRes.success) setSchedules(schedulesRes.data);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };


  return (

    <div className="space-y-6 animate-fade-in" >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">
            Attendance Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Monitor and manage student presence</p>
        </div>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-800 text-white border-none shadow-purple-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm font-medium">Today's Attendance</p>
              <h3 className="text-4xl font-bold mt-2">{analytics.today_percentage}%</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-purple-200 mt-4">Calculated from all active classes today</p>
        </Card>

        <Card className="p-6 col-span-2 border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar size={16} className="text-purple-500" /> Weekly Overview
            </h4>
          </div>
          <div className="flex items-end justify-between h-24 gap-2">
            {analytics.weekly_overview.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-purple-50 rounded-t-lg relative group h-full flex items-end">
                  <div
                    className="w-full bg-purple-500 rounded-t-lg transition-all duration-500 hover:bg-purple-600"
                    style={{ height: `${day.percentage}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      {day.percentage}%
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{day.day}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Time Range</label>
          <select
            value={filters.range}
            onChange={(e) => setFilters({ ...filters, range: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 outline-none text-sm font-medium text-slate-700 transition-all"
          >
            <option value="today">Today's Classes</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Schedules</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Select Class</label>
          <select
            value={filters.class_id}
            onChange={(e) => setFilters({ ...filters, class_id: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 outline-none text-sm font-medium text-slate-700 transition-all"
          >
            <option value="">All Classes</option>
            {options.classes?.map(c => (
              <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Select Subject</label>
          <select
            value={filters.subject_id}
            onChange={(e) => setFilters({ ...filters, subject_id: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 outline-none text-sm font-medium text-slate-700 transition-all"
          >
            <option value="">All Subjects</option>
            {options.subjects?.map(s => (
              <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => setFilters({ class_id: '', subject_id: '', range: 'today' })}
            className="w-full px-4 py-2.5 bg-purple-50 text-purple-600 rounded-xl text-sm font-bold hover:bg-purple-100 transition-all"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="overflow-hidden border-purple-100 p-0">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-purple-900">
              {filters.range === 'today' ? "Today's Scheduled Classes" :
                filters.range === 'week' ? "This Week's Scheduled Classes" :
                  filters.range === 'month' ? "This Month's Scheduled Classes" : "All Scheduled Classes"}
            </h3>
            <button onClick={fetchData} className="text-xs text-purple-600 font-semibold hover:underline">Refresh</button>
          </div>
          <div className="divide-y divide-purple-50">
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-medium">Loading schedules...</div>
            ) : schedules.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium">No classes scheduled for today</div>
            ) : schedules.map((sch) => (
              <div key={sch.schedule_id} className="p-4 hover:bg-purple-50/50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="bg-white border border-purple-100 p-3 rounded-xl shadow-sm text-center min-w-[70px]">
                    <span className="block text-xs font-bold text-purple-500 uppercase">{sch.start_time.slice(0, 5)}</span>
                    <span className="block text-[10px] text-slate-400">{sch.end_time.slice(0, 5)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{sch.subject?.subject_name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Users size={12} className="text-purple-400" /> {sch.school_class?.class_name}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} className="text-purple-400" /> {sch.status}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/attendance/mark/${sch.schedule_id}`)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${sch.status === 'Completed'
                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                    : 'bg-purple-600 text-white shadow-lg shadow-purple-100 hover:bg-purple-700'
                    }`}
                >
                  {sch.status === 'Completed' ? (
                    <>
                      <CheckCircle size={14} />
                      <span>View Attendance</span>
                    </>
                  ) : (
                    <>
                      <span>Mark Attendance</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}