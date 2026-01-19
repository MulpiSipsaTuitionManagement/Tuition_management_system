import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, CheckCircle, ArrowLeft, Info, Plus, Trash2, BookOpen } from 'lucide-react';
import { API } from '../api/api';
import PageHeader from '../Components/PageHeader';
import Card from '../Cards/Card';

export default function AddClass() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [tutors, setTutors] = useState([]);

    // Form States
    const [formData, setFormData] = useState({
        class_name: '',
        description: ''
    });

    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState({
        subject_name: '',
        tutor_id: '',
        monthly_fee: ''
    });

    useEffect(() => {
        fetchTutors();
    }, []);

    const fetchTutors = async () => {
        try {
            const result = await API.tutors.getAll();
            if (result.success) {
                setTutors(result.data.data || result.data);
            }
        } catch (e) {
            console.error("Failed to load tutors", e);
        }
    };

    const handleAddSubject = () => {
        let errors = {};
        let isValid = true;

        if (!newSubject.subject_name.trim()) {
            errors.subject_name = 'Subject Name is required';
            isValid = false;
        }
        if (!newSubject.monthly_fee) {
            errors.monthly_fee = 'Fee is required';
            isValid = false;
        }

        if (!isValid) {
            setFieldErrors(errors);
            return;
        }

        setSubjects([...subjects, { ...newSubject, id: Date.now() }]); // temporary ID for UI
        setNewSubject({ subject_name: '', tutor_id: '', monthly_fee: '' }); // Reset
        setFieldErrors({}); // Clear subject related errors
        setError('');
    };

    const removeSubject = (id) => {
        setSubjects(subjects.filter(s => s.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.class_name.trim()) {
            setFieldErrors({ class_name: 'Class name is required' });
            return;
        }

        setLoading(true);
        setError('');
        try {
            // Prepare payload
            const payload = {
                ...formData,
                subjects: subjects.map(({ id, ...rest }) => rest) // Remove temp ID
            };

            const result = await API.classes.create(payload);
            if (result.success) {
                navigate('/classes');
            } else {
                setError(result.message || 'Failed to create class');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create class');
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Classes', onClick: () => navigate('/classes') },
        { label: 'Add New Record', active: true }
    ];

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <PageHeader
                title="Class Configuration"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate('/classes')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Class Details */}
                    <Card className="p-8 shadow-xl shadow-slate-200/40 border-slate-200/50">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Layers className="text-purple-600" size={20} />
                            Class Details
                        </h3>
                        <div className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Class Name / Grade *</label>
                                <div className="relative">
                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text" required
                                        placeholder="e.g., Grade 11 - Science"
                                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm ${fieldErrors.class_name ? 'border-red-500' : 'border-slate-200'}`}
                                        value={formData.class_name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, class_name: e.target.value });
                                            if (e.target.value.trim()) setFieldErrors(prev => ({ ...prev, class_name: '' }));
                                        }}
                                    />
                                    {fieldErrors.class_name && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.class_name}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Description / Notes</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none resize-none"
                                    placeholder="Add brief details about this class level..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Subject Management */}
                    <Card className="p-8 shadow-xl shadow-slate-200/40 border-slate-200/50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <BookOpen className="text-purple-600" size={20} />
                                Subject Curriculum
                            </h3>
                            <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                                {subjects.length} Added
                            </span>
                        </div>

                        {/* Add Subject Form */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Subject Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Mathematics"
                                        className={`w-full px-3 py-2 bg-white border rounded-xl text-sm outline-none focus:border-purple-500 transition-colors ${fieldErrors.subject_name ? 'border-red-500' : 'border-slate-200'}`}
                                        value={newSubject.subject_name}
                                        onChange={(e) => {
                                            setNewSubject({ ...newSubject, subject_name: e.target.value });
                                            if (e.target.value) setFieldErrors(prev => ({ ...prev, subject_name: '' }));
                                        }}
                                    />
                                    {fieldErrors.subject_name && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.subject_name}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Monthly Fee (LKR)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className={`w-full px-3 py-2 bg-white border rounded-xl text-sm outline-none focus:border-purple-500 transition-colors ${fieldErrors.monthly_fee ? 'border-red-500' : 'border-slate-200'}`}
                                        value={newSubject.monthly_fee}
                                        onChange={(e) => {
                                            setNewSubject({ ...newSubject, monthly_fee: e.target.value });
                                            if (e.target.value) setFieldErrors(prev => ({ ...prev, monthly_fee: '' }));
                                        }}
                                    />
                                    {fieldErrors.monthly_fee && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.monthly_fee}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Assign Tutor</label>
                                    <select
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-500 transition-colors"
                                        value={newSubject.tutor_id}
                                        onChange={(e) => setNewSubject({ ...newSubject, tutor_id: e.target.value })}
                                    >
                                        <option value="">Select Tutor</option>
                                        {tutors.map(t => (
                                            <option key={t.tutor_id} value={t.tutor_id}>{t.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddSubject}
                                className="w-full py-2 bg-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-300 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <Plus size={16} /> Add Subject to List
                            </button>
                        </div>

                        {/* Subjects List */}
                        {subjects.length > 0 ? (
                            <div className="space-y-3">
                                {subjects.map((sub) => (
                                    <div key={sub.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-purple-100 hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                                <BookOpen size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{sub.subject_name}</h4>
                                                <p className="text-xs text-slate-500">
                                                    {tutors.find(t => t.tutor_id == sub.tutor_id)?.full_name || 'No Tutor Assigned'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="font-bold text-slate-700 text-sm">LKR {sub.monthly_fee}</span>
                                            <button
                                                onClick={() => removeSubject(sub.id)}
                                                className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm italic border-2 border-dashed border-slate-100 rounded-xl">
                                No subjects added yet. Use the form above to add subjects to this class.
                            </div>
                        )}
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/classes')}
                            className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !formData.class_name}
                            className="px-8 py-3.5 bg-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : 'Create Class & Subjects'}
                            {!loading && <CheckCircle size={18} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 bg-slate-50 border-slate-200/60 shadow-none border-dashed border-2">
                        <div className="flex items-center gap-2 mb-4 text-slate-900">
                            <Info size={16} />
                            <span className="text-sm font-bold tracking-tight">System Info</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">
                            Creating a class record allows you to group students. You can now add subjects directly here to ensure the curriculum is set up immediately.
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Subjects added here will be automatically linked to this class and available for student enrollment.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
