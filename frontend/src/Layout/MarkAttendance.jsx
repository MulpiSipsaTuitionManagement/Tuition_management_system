import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, User as UserIcon, Check, X, Clock } from 'lucide-react';
import Card from '../Cards/Card';
import PageHeader from '../Components/PageHeader';
import { API } from '../api/api';

export default function MarkAttendance() {
    const { scheduleId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [attendance, setAttendance] = useState({});

    useEffect(() => {
        fetchData();
    }, [scheduleId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await API.attendance.getBySchedule(scheduleId);
            if (result.success) {
                setData(result.data);
                setSchedule(result.schedule);

                // Populate current attendance state
                const initialAttendance = {};
                result.data.forEach(s => {
                    initialAttendance[s.student_id] = s.status || 'Present';
                });
                setAttendance(initialAttendance);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const setStatus = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const students = Object.keys(attendance).map(id => ({
                student_id: id,
                status: attendance[id]
            }));

            const result = await API.attendance.mark({
                schedule_id: scheduleId,
                students
            });

            if (result.success) {
                navigate('/attendance');
            }
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Attendance', onClick: () => navigate('/attendance') },
        { label: 'Mark Attendance', active: true }
    ];

    if (loading) return <div className="p-10 text-center text-slate-500">Loading students...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <PageHeader
                title={`${schedule?.subject?.subject_name} - ${schedule?.school_class?.class_name}`}
                breadcrumbs={breadcrumbs}
                onBack={() => navigate('/attendance')}
                actions={
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Save Attendance</span>
                            </>
                        )}
                    </button>
                }
            />

            <div className="grid grid-cols-1 gap-4">
                {data.map((student) => (
                    <Card key={student.student_id} className="p-4 border-slate-100 group hover:border-purple-200 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                    {student.full_name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 tracking-tight">{student.full_name}</h4>
                                    <p className="text-xs text-slate-400 font-medium italic">ID: #{student.student_id}</p>
                                </div>
                            </div>

                            <div className="flex items-center bg-slate-50 p-1.5 rounded-xl border border-slate-200 gap-1">
                                {[
                                    { label: 'Present', val: 'Present', color: 'bg-green-500', icon: Check },
                                    { label: 'Late', val: 'Late', color: 'bg-amber-500', icon: Clock },
                                    { label: 'Absent', val: 'Absent', color: 'bg-red-500', icon: X },
                                ].map((btn) => (
                                    <button
                                        key={btn.val}
                                        onClick={() => setStatus(student.student_id, btn.val)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${attendance[student.student_id] === btn.val
                                            ? `${btn.color} text-white shadow-md`
                                            : 'text-slate-400 hover:bg-slate-200'
                                            }`}
                                    >
                                        <btn.icon size={14} />
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
