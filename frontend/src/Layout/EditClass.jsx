import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layers, CheckCircle, ArrowLeft, Info, Plus, Trash2, BookOpen } from 'lucide-react';
import { API } from '../api/api';
import PageHeader from '../Components/PageHeader';
import Card from '../Cards/Card';

export default function EditClass() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
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
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        try {
            const [classRes, tutorsRes] = await Promise.all([
                API.classes.getById(id),
                API.tutors.getAll()
            ]);

            if (classRes.success) {
                const { class_name, academic_level, subjects: classSubjects } = classRes.data;
                setFormData({
                    class_name: class_name,
                    description: academic_level || ''
                });

                // Set subjects with a temporary UI id if not present (though valid subjects have one)
                // We map backend subjects to our UI state
                setSubjects(classSubjects.map(s => ({
                    ...s,
                    id: s.subject_id, // Use real ID for tracking
                    monthly_fee: s.monthly_fee // Ensure number/string consistency if needed
                })));
            }

            if (tutorsRes.success) {
                setTutors(tutorsRes.data.data || tutorsRes.data);
            }
        } catch (e) {
            console.error("Failed to load data", e);
            setError("Failed to load class data");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = () => {
        if (!newSubject.subject_name || !newSubject.monthly_fee) {
            setError("Please fill in Subject Name and Fee");
            return;
        }
        // Add with a temporary ID (negative or string) to distinguish from real DB IDs
        setSubjects([...subjects, { ...newSubject, id: `new_${Date.now()}` }]);
        setNewSubject({ subject_name: '', tutor_id: '', monthly_fee: '' }); // Reset
        setError('');
    };

    const removeSubject = (id) => {
        // If it's a new subject, just remove from list.
        // If it's an existing subject (numeric ID), we might need to track deletions if backend does differential sync.
        // For now, removing from the list is enough, backend sync logic will handle it.
        setSubjects(subjects.filter(s => s.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            // Prepare payload
            const payload = {
                ...formData,
                subjects: subjects.map(s => {
                    // If ID starts with 'new_', remove it so backend treats it as new
                    if (s.id && String(s.id).startsWith('new_')) {
                        const { id, ...rest } = s;
                        return rest;
                    }
                    return {
                        subject_id: s.subject_id, // explicit ID for updates
                        subject_name: s.subject_name,
                        tutor_id: s.tutor_id,
                        monthly_fee: s.monthly_fee
                    };
                })
            };

            const result = await API.classes.update(id, payload);
            if (result.success) {
                navigate(`/classes/${id}`);
            } else {
                setError(result.message || 'Failed to update class');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update class');
        } finally {
            setSaving(false);
        }
    };

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Classes', onClick: () => navigate('/classes') },
        { label: formData.class_name || 'Edit Class', active: true }
    ];

    if (loading) return <div className="p-10 text-center text-slate-500">Loading details...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <PageHeader
                title="Edit Class Configuration"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate(`/classes/${id}`)}
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
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm"
                                        value={formData.class_name}
                                        onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                                    />
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
                                {subjects.length} Subjects
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
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-500 transition-colors"
                                        value={newSubject.subject_name}
                                        onChange={(e) => setNewSubject({ ...newSubject, subject_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Monthly Fee (LKR)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-500 transition-colors"
                                        value={newSubject.monthly_fee}
                                        onChange={(e) => setNewSubject({ ...newSubject, monthly_fee: e.target.value })}
                                    />
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
                                No subjects linked yet. Add new subjects above.
                            </div>
                        )}
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/classes/${id}`)}
                            className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving || !formData.class_name}
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
                            <span className="text-sm font-bold tracking-tight">System Info</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">
                            You are editing an existing class record. Changes to the class name or subjects will be reflected across the system immediately.
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            <strong>Note:</strong> Removing subjects here may affect students currently enrolled in those subjects (depending on system configuration).
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
