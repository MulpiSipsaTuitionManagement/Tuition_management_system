import { useState, useEffect } from 'react';
import { Save, Calendar, Clock, BookOpen, Trash2, Info, CheckCircle } from 'lucide-react';
import Card from '../Cards/Card';
import PageHeader from '../Components/PageHeader';
import { API } from '../api/api';
import { useNavigate, useParams } from 'react-router-dom';

export default function UpdateSchedule() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [options, setOptions] = useState({ classes: [], subjects: [], tutors: [] });
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        class_id: '',
        subject_id: '',
        tutor_id: '',
        schedule_date: '',
        start_time: '',
        end_time: '',
        status: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [optRes, schRes] = await Promise.all([
                API.schedules.getOptions(),
                API.schedules.getById(id)
            ]);

            if (optRes.success) setOptions(optRes.data);
            if (schRes.success) {
                const sch = schRes.data;
                setFormData({
                    class_id: sch.class_id,
                    subject_id: sch.subject_id,
                    tutor_id: sch.tutor_id,
                    schedule_date: sch.schedule_date,
                    start_time: sch.start_time.slice(0, 5),
                    end_time: sch.end_time.slice(0, 5),
                    status: sch.status
                });
            }
        } catch (error) {
            console.error('Error fetching schedule data:', error);
            setError('Failed to load schedule details');
            navigate('/schedules');
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectChange = (subjectId) => {
        const subject = options.subjects.find(s => s.subject_id == subjectId);
        setFormData(prev => ({
            ...prev,
            subject_id: subjectId,
            tutor_id: subject ? subject.tutor_id : prev.tutor_id
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const result = await API.schedules.update(id, formData);
            if (result.success) {
                navigate('/schedules');
            } else {
                setError(result.message || 'Failed to update schedule');
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
            setError(error.response?.data?.message || 'Error updating schedule');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this schedule? This will also delete any marked attendance.')) {
            try {
                const result = await API.schedules.delete(id);
                if (result.success) {
                    navigate('/schedules');
                }
            } catch (error) {
                console.error('Error deleting schedule:', error);
                setError('Failed to delete schedule');
            }
        }
    };

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Schedules', onClick: () => navigate('/schedules') },
        { label: 'Edit Schedule', active: true }
    ];

    if (loading) {
        return <div className="p-10 text-center text-slate-500">Loading schedule details...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <PageHeader
                title="Edit Class Schedule"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate('/schedules')}
                actions={
                    user.role === 'admin' && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-bold text-sm border border-red-100"
                        >
                            <Trash2 size={18} />
                            <span>Delete Schedule</span>
                        </button>
                    )
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Class Details */}
                    <Card className="p-8 shadow-xl shadow-slate-200/40 border-slate-200/50">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <BookOpen className="text-purple-600" size={20} />
                            Class Information
                        </h3>
                        <div className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Class / Grade</label>
                                <select
                                    disabled={true}
                                    value={formData.class_id}
                                    className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl outline-none text-slate-500 font-medium cursor-not-allowed"
                                >
                                    {options?.classes?.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
                                </select>
                                <p className="text-[10px] text-slate-400 ml-1 italic">Class cannot be changed after creation</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Subject</label>
                                <select
                                    disabled={user.role === 'tutor'}
                                    value={formData.subject_id}
                                    onChange={(e) => handleSubjectChange(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none"
                                >
                                    {options?.subjects?.filter(s => s.class_id == formData.class_id).map(s => (
                                        <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Assigned Tutor</label>
                                <select
                                    disabled={user.role === 'tutor' || !!formData.subject_id}
                                    value={formData.tutor_id}
                                    onChange={(e) => setFormData({ ...formData, tutor_id: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                                >
                                    {options?.tutors?.map(t => <option key={t.tutor_id} value={t.tutor_id}>{t.full_name}</option>)}
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Timing & Status */}
                    <Card className="p-8 shadow-xl shadow-slate-200/40 border-slate-200/50">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Calendar className="text-purple-600" size={20} />
                            Timing & Status
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Schedule Date *</label>
                                <input
                                    required
                                    type="date"
                                    value={formData.schedule_date}
                                    onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Start Time *</label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">End Time *</label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Schedule Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none"
                                >
                                    <option value="Upcoming">Upcoming / Scheduled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Postponed">Postponed</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/schedules')}
                            className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-8 py-3.5 bg-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
                        >
                            {saving ? 'Updating...' : 'Save Changes'}
                            {!saving && <CheckCircle size={18} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 bg-slate-50 border-slate-200/60 shadow-none border-dashed border-2">
                        <div className="flex items-center gap-2 mb-4 text-slate-900">
                            <Info size={16} />
                            <span className="text-sm font-bold tracking-tight">Schedule Info</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">
                            You are editing an existing class schedule. Changes to timing or status will be reflected immediately across the system.
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            <strong>Note:</strong> If attendance has already been marked for this schedule, changing the status to "Cancelled" or "Postponed" may affect attendance records.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
