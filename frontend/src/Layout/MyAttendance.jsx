import { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, CheckCircle, XCircle, Filter, RotateCcw } from 'lucide-react';
import Card from '../Cards/Card';
import { API } from '../api/api';

export default function MyAttendance() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ total_scheduled: 0, present_count: 0, absent_count: 0, late_count: 0 });
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [stats, setStats] = useState({ rate: 0 });
    const [filters, setFilters] = useState({ status: '', subject: '' });

    useEffect(() => {
        fetchAttendance();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, records]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const result = await API.attendance.getStudentSummary();
            if (result.success) {
                setSummary(result.summary);
                setRecords(result.records);
                setFilteredRecords(result.records);

                // Calculate rate
                const rate = result.summary.total_scheduled > 0
                    ? Math.round(((result.summary.present_count + result.summary.late_count) / result.summary.total_scheduled) * 100)
                    : 0;
                setStats({ rate });
            }
        } catch (error) {
            console.error('Error fetching student attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...records];
        if (filters.status) {
            filtered = filtered.filter(rec => rec.status === filters.status);
        }
        if (filters.subject) {
            filtered = filtered.filter(rec => rec.schedule?.subject?.subject_name === filters.subject);
        }
        setFilteredRecords(filtered);
    };

    // Get unique subjects for filter
    const uniqueSubjects = [...new Set(records.map(rec => rec.schedule?.subject?.subject_name))].filter(Boolean);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">
                        My Attendance
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Tracking your academic presence and punctuality</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchAttendance}
                        className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-white rounded-xl transition-all border border-slate-100 bg-slate-50 shadow-sm"
                        title="Refresh Data"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border-none shadow-lg shadow-purple-500/5 bg-gradient-to-br from-purple-600 to-purple-800 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-md">
                            <CheckCircle size={20} />
                        </div>
                        <h3 className="text-3xl font-black">{stats.rate}%</h3>
                        <p className="text-xs font-bold text-purple-100 uppercase tracking-widest mt-1 opacity-80">Overall Rate</p>
                    </div>
                </Card>

                <Card className="p-6 border-slate-100 hover:border-emerald-200 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 leading-none">{summary.present_count}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Present Days</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-slate-100 hover:border-amber-200 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 leading-none">{summary.late_count}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Arrivals Late</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-slate-100 hover:border-red-200 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                            <XCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 leading-none">{summary.absent_count}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Missed Classes</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-purple-600 mr-2">
                    <Filter size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
                </div>

                <div className="flex-1 min-w-[150px]">
                    <select
                        value={filters.subject}
                        onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                    >
                        <option value="">All Subjects</option>
                        {uniqueSubjects.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 min-w-[150px]">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                    >
                        <option value="">All Statuses</option>
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                    </select>
                </div>

                {(filters.status || filters.subject) && (
                    <button
                        onClick={() => setFilters({ status: '', subject: '' })}
                        className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Attendance History Table */}
            <Card className="overflow-hidden border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-sm font-bold text-purple-900">Attendance History</h3>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                            Showing {filteredRecords.length} records
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-purple-700 uppercase tracking-widest">Session Details</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-purple-700 uppercase tracking-widest">Class & Subject</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-purple-700 uppercase tracking-widest">Attendance Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center">
                                        <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm text-slate-400 font-medium italic">No attendance records found matching filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((rec) => (
                                    <tr key={rec.attendance_id} className="hover:bg-purple-50/30 transition-all group">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">
                                                    {new Date(rec.attendance_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-1">
                                                    <Clock size={12} className="opacity-70" />
                                                    {rec.schedule?.start_time?.slice(0, 5)} - {rec.schedule?.end_time?.slice(0, 5)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 font-black text-xs border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                                    {rec.schedule?.subject?.subject_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 leading-none mb-1">{rec.schedule?.subject?.subject_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{rec.schedule?.school_class?.class_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${rec.status === 'Present'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-500/5'
                                                : rec.status === 'Late'
                                                    ? 'bg-amber-50 text-amber-600 border border-amber-100 shadow-sm shadow-amber-500/5'
                                                    : 'bg-red-50 text-red-600 border border-red-100 shadow-sm shadow-red-500/5'
                                                }`}>
                                                <div className={`w-1 h-1 rounded-full ${rec.status === 'Present' ? 'bg-emerald-500' :
                                                    rec.status === 'Late' ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}></div>
                                                {rec.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
