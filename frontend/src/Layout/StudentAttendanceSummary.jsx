import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import Card from '../Cards/Card';
import PageHeader from '../Components/PageHeader';
import { API } from '../api/api';

export default function StudentAttendanceSummary() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ total_scheduled: 0, present_count: 0, absent_count: 0, late_count: 0 });
    const [records, setRecords] = useState([]);

    const user = JSON.parse(localStorage.getItem('user'));
    const studentId = id || '';

    useEffect(() => {
        fetchSummary();
    }, [studentId]);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const result = await API.attendance.getStudentSummary(studentId);
            if (result.success) {
                setSummary(result.summary);
                setRecords(result.records);
            }
        } catch (error) {
            console.error('Error fetching student summary:', error);
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Students', onClick: () => navigate('/students') },
        { label: 'Attendance History', active: true }
    ];

    if (loading) {
        return <div className="p-10 text-center text-slate-500">Loading attendance records...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <PageHeader
                title="Student Attendance History"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate(-1)}
            />

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 border-slate-100 shadow-sm bg-white hover:border-purple-200 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                            <BookOpen size={24} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{summary.total_scheduled}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">Total Scheduled Classes</p>
                </Card>

                <Card className="p-6 border-slate-100 shadow-sm bg-white hover:border-emerald-200 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <CheckCircle size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Present</span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{summary.present_count}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">Classes Attended</p>
                </Card>

                <Card className="p-6 border-slate-100 shadow-sm bg-white hover:border-amber-200 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                            <Clock size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Late</span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{summary.late_count}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">Delayed Attendance</p>
                </Card>

                <Card className="p-6 border-slate-100 shadow-sm bg-white hover:border-red-200 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                            <XCircle size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Absent</span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{summary.absent_count}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">Missed Classes</p>
                </Card>
            </div>

            {/* History Table */}
            <Card className="overflow-hidden shadow-xl shadow-slate-200/40 border-slate-200/50">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                    <h3 className="text-sm font-bold text-purple-900">Attendance Records</h3>
                    <p className="text-xs text-slate-500 mt-1">Complete history of class attendance</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Date & Time</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Class / Grade</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center text-slate-400 italic">
                                        No attendance history found for this student.
                                    </td>
                                </tr>
                            ) : records.map((rec) => (
                                <tr key={rec.attendance_id} className="hover:bg-purple-50/30 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">
                                                {new Date(rec.attendance_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium mt-1">
                                                {rec.schedule?.start_time?.slice(0, 5)} - {rec.schedule?.end_time?.slice(0, 5)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 font-bold text-sm border border-purple-100">
                                                {rec.schedule?.subject?.subject_name?.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{rec.schedule?.subject?.subject_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-600">{rec.schedule?.school_class?.class_name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${rec.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                                                rec.status === 'Late' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {rec.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
