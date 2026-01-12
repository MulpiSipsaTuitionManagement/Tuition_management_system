import { useState, useEffect } from 'react';
import { ChevronLeft, Save, Calendar, Clock, BookOpen, User as UserIcon } from 'lucide-react';
import Card from '../Cards/Card';
import { API } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function AddSchedule() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [options, setOptions] = useState({ classes: [], subjects: [], tutors: [] });

    const [formData, setFormData] = useState({
        class_id: '',
        subject_id: '',
        tutor_id: '',
        schedule_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        status: 'Upcoming'
    });

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const result = await API.schedules.getOptions();
            if (result.success) {
                setOptions(result.data);

                // If Tutor, pre-select and lock if they only have one class/subject
                if (user.role === 'tutor' && result.data.subjects.length > 0) {
                    const sub = result.data.subjects[0];
                    setFormData(prev => ({
                        ...prev,
                        tutor_id: user.tutor.tutor_id,
                        class_id: sub.class_id,
                        subject_id: sub.subject_id
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching options:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = (classId) => {
        setFormData(prev => ({ ...prev, class_id: classId, subject_id: '', tutor_id: '' }));
    };

    const handleSubjectChange = (subjectId) => {
        const subject = options.subjects.find(s => s.subject_id == subjectId);
        setFormData(prev => ({
            ...prev,
            subject_id: subjectId,
            tutor_id: subject ? subject.tutor_id : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const result = await API.schedules.create(formData);
            if (result.success) {
                navigate('/schedules');
            } else {
                alert(result.message || 'Failed to save schedule');
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            alert(error.response?.data?.message || 'Error saving schedule');
        } finally {
            setSaving(false);
        }
    };

    // Filter subjects based on selected class (for Admin)
    const filteredSubjects = formData.class_id
        ? options.subjects.filter(s => s.class_id == formData.class_id)
        : [];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/schedules')}
                    className="flex items-center text-purple-600 hover:text-purple-800 transition-colors font-medium"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Schedules
                </button>
                <h2 className="text-2xl font-bold text-gray-800">New Class Schedule</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                                <BookOpen size={20} /> Class Details
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
                                <select
                                    required
                                    disabled={user.role === 'tutor'}
                                    value={formData.class_id}
                                    onChange={(e) => handleClassChange(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-slate-100"
                                >
                                    <option value="">Select Class</option>
                                    {options?.classes?.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                                <select
                                    required
                                    disabled={user.role === 'tutor' && options.subjects.length <= 1}
                                    value={formData.subject_id}
                                    onChange={(e) => handleSubjectChange(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">Select Subject</option>
                                    {(user.role === 'tutor' ? options?.subjects : filteredSubjects)?.map(s => (
                                        <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tutor</label>
                                <select
                                    required
                                    disabled={user.role === 'tutor' || !!formData.subject_id}
                                    value={formData.tutor_id}
                                    onChange={(e) => setFormData({ ...formData, tutor_id: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-slate-100"
                                >
                                    <option value="">Select Tutor</option>
                                    {options?.tutors?.map(t => <option key={t.tutor_id} value={t.tutor_id}>{t.full_name}</option>)}
                                </select>
                                <p className="text-[10px] text-slate-400 mt-1 italic">
                                    Tutor is automatically selected based on subject assignment
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                                <Calendar size={20} /> Timing & Date
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                                <input
                                    required
                                    type="date"
                                    value={formData.schedule_date}
                                    onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="Upcoming">Upcoming</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Postponed">Postponed</option>
                                </select>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="mt-8">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-4 rounded-xl shadow-xl hover:shadow-purple-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Save Schedule</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
