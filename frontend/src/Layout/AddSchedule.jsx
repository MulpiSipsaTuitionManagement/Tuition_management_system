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
    const [fieldErrors, setFieldErrors] = useState({});

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'class_id':
                if (!value) error = 'Class is required';
                break;
            case 'subject_id':
                if (!value) error = 'Subject is required';
                break;
            case 'tutor_id':
                if (!value) error = 'Tutor is required';
                break;
            case 'schedule_date':
                if (!value) error = 'Date is required';
                break;
            case 'start_time':
                if (!value) error = 'Start time is required';
                break;
            case 'end_time':
                if (!value) error = 'End time is required';
                else if (formData.start_time && value <= formData.start_time) error = 'End time must be after start time';
                break;
            default:
                break;
        }
        return error;
    };

    const handleFieldChange = (name, value) => {
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // Special check for end_time if start_time changes or vice versa
            if (name === 'start_time' && newData.end_time) {
                if (newData.end_time <= value) setFieldErrors(e => ({ ...e, end_time: 'End time must be after start time' }));
                else setFieldErrors(e => ({ ...e, end_time: '' }));
            }
            return newData;
        });

        const errorMsg = validateField(name, value);
        setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
    };

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
                        tutor_id: user.tutor?.tutor_id || '',
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
        const errorMsg = validateField('class_id', classId);
        setFieldErrors(prev => ({ ...prev, class_id: errorMsg }));
    };

    const handleSubjectChange = (subjectId) => {
        const subject = options.subjects.find(s => s.subject_id == subjectId);
        setFormData(prev => ({
            ...prev,
            subject_id: subjectId,
            tutor_id: subject ? subject.tutor_id : ''
        }));
        const errorMsg = validateField('subject_id', subjectId);
        setFieldErrors(prev => ({ ...prev, subject_id: errorMsg }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let errors = {};
        let hasError = false;
        Object.keys(formData).forEach(key => {
            if (key !== 'status') { // Status is optional/has default
                const errorMsg = validateField(key, formData[key]);
                if (errorMsg) {
                    errors[key] = errorMsg;
                    hasError = true;
                }
            }
        });

        if (formData.start_time && formData.end_time && formData.end_time <= formData.start_time) {
            errors.end_time = 'End time must be after start time';
            hasError = true;
        }

        if (hasError) {
            setFieldErrors(errors);
            return;
        }

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
                                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-slate-100 ${fieldErrors.class_id ? 'border-red-500' : 'border-slate-200'}`}
                                >
                                    <option value="">Select Class</option>
                                    {options?.classes?.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
                                </select>
                                {fieldErrors.class_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.class_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                                <select
                                    required
                                    disabled={user.role === 'tutor' && options.subjects.length <= 1}
                                    value={formData.subject_id}
                                    onChange={(e) => handleSubjectChange(e.target.value)}
                                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none ${fieldErrors.subject_id ? 'border-red-500' : 'border-slate-200'}`}
                                >
                                    <option value="">Select Subject</option>
                                    {(user.role === 'tutor' ? options?.subjects : filteredSubjects)?.map(s => (
                                        <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                                    ))}
                                </select>
                                {fieldErrors.subject_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.subject_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tutor</label>
                                <select
                                    required
                                    disabled={user.role === 'tutor' || !!formData.subject_id}
                                    value={formData.tutor_id}
                                    onChange={(e) => handleFieldChange('tutor_id', e.target.value)}
                                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-slate-100 ${fieldErrors.tutor_id ? 'border-red-500' : 'border-slate-200'}`}
                                >
                                    <option value="">Select Tutor</option>
                                    {options?.tutors?.map(t => <option key={t.tutor_id} value={t.tutor_id}>{t.full_name}</option>)}
                                </select>
                                {fieldErrors.tutor_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.tutor_id}</p>}
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
                                    onChange={(e) => handleFieldChange('schedule_date', e.target.value)}
                                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none ${fieldErrors.schedule_date ? 'border-red-500' : 'border-slate-200'}`}
                                />
                                {fieldErrors.schedule_date && <p className="text-red-500 text-xs mt-1">{fieldErrors.schedule_date}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => handleFieldChange('start_time', e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none ${fieldErrors.start_time ? 'border-red-500' : 'border-slate-200'}`}
                                    />
                                    {fieldErrors.start_time && <p className="text-red-500 text-xs mt-1">{fieldErrors.start_time}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => handleFieldChange('end_time', e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none ${fieldErrors.end_time ? 'border-red-500' : 'border-slate-200'}`}
                                    />
                                    {fieldErrors.end_time && <p className="text-red-500 text-xs mt-1">{fieldErrors.end_time}</p>}
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
