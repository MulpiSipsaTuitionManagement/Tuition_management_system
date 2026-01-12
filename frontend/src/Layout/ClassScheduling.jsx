import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../Cards/Card';
import { API } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function ClassScheduling() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState({ classes: [], subjects: [], tutors: [] });
  const [filters, setFilters] = useState({
    range: 'week',
    class_id: '',
    subject_id: '',
    tutor_id: ''
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchOptions();
    fetchSchedules();
  }, [filters]);

  const fetchOptions = async () => {
    try {
      const result = await API.schedules.getOptions();
      if (result.success) {
        setOptions(result.data);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const result = await API.schedules.getAll(filters);
      if (result.success) {
        setSchedules(result.data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        const result = await API.schedules.delete(id);
        if (result.success) fetchSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">
            Class Scheduling
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage and track class timetables</p>
        </div>

        {(user.role === 'admin' || user.role === 'tutor') && (
          <button
            onClick={() => navigate('/schedules/add')}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-2.5 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-purple-200"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Create Schedule</span>
          </button>
        )}
      </div>

      <Card className="p-4 bg-white/50 backdrop-blur-sm border-purple-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-purple-50 p-1 rounded-lg">
            {['today', 'week', 'month', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setFilters({ ...filters, range })}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filters.range === range
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-purple-400 hover:text-purple-600'
                  }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-purple-100 hidden md:block"></div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filters.class_id}
              onChange={(e) => setFilters({ ...filters, class_id: e.target.value })}
              className="px-3 py-2 bg-white border border-purple-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Classes</option>
              {options?.classes?.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
            </select>

            <select
              value={filters.subject_id}
              onChange={(e) => setFilters({ ...filters, subject_id: e.target.value })}
              className="px-3 py-2 bg-white border border-purple-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Subjects</option>
              {options?.subjects?.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
            </select>

            {user.role === 'admin' && (
              <select
                value={filters.tutor_id}
                onChange={(e) => setFilters({ ...filters, tutor_id: e.target.value })}
                className="px-3 py-2 bg-white border border-purple-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Tutors</option>
                {options?.tutors?.map(t => <option key={t.tutor_id} value={t.tutor_id}>{t.full_name}</option>)}
              </select>
            )}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-purple-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Class & Subject</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Tutor</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Status</th>
                {(user.role === 'admin' || user.role === 'tutor') && (
                  <th className="px-6 py-4 text-right text-xs font-bold text-purple-700 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading schedules...</td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-lg">No schedules found</td>
                </tr>
              ) : schedules.map((sch) => (
                <tr key={sch.schedule_id} onClick={() => navigate(`/schedules/${sch.schedule_id}/edit`)} className="hover:bg-purple-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <Calendar size={14} className="text-purple-500" /> {new Date(sch.schedule_date).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <Clock size={14} /> {sch.start_time.slice(0, 5)} - {sch.end_time.slice(0, 5)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-purple-900">{sch.school_class?.class_name}</span>
                      <span className="text-xs text-slate-500">{sch.subject?.subject_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 font-medium">{sch.tutor?.full_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sch.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      sch.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        sch.status === 'Upcoming' || sch.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                          sch.status === 'Postponed' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                      }`}>
                      {sch.status}
                    </span>
                  </td>
                  {(user.role === 'admin' || user.role === 'tutor') && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-1 transition-opacity">
                        <button
                          onClick={() => navigate(`/schedules/${sch.schedule_id}/edit`)}
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                          title="Edit Schedule"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/attendance/mark/${sch.schedule_id}`)}
                          className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                          title="Mark Attendance"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(sch.schedule_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Helper icons that were missing
function CheckCircle({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
  );
}