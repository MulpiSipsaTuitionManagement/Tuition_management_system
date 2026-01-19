import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, DollarSign, User, CheckCircle, Info } from 'lucide-react';
import { API } from '../api/api';
import PageHeader from '../Components/PageHeader';
import Card from '../Cards/Card';

export default function AddSubject() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tutors, setTutors] = useState([]);
    const [classes, setClasses] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'subject_name':
                if (!value.trim()) error = 'Subject name is required';
                break;
            case 'class_id':
                if (!value) error = 'Grade is required';
                break;
            case 'tutor_id':
                if (!value) error = 'Tutor is required';
                break;
            case 'monthly_fee':
                if (!value) error = 'Fee is required';
                break;
            default:
                break;
        }
        return error;
    };

    const handleFieldChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        const errorMsg = validateField(name, value);
        setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
    };

    const [formData, setFormData] = useState({
        subject_name: '',
        class_id: '',
        tutor_id: '',
        monthly_fee: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [tutorsRes, classesRes] = await Promise.all([
                API.tutors.getAll(),
                API.classes.getAll()
            ]);

            if (tutorsRes.success) {
                setTutors(tutorsRes.data.data || tutorsRes.data);
            }
            if (classesRes.success) {
                setClasses(classesRes.data.data || classesRes.data);
            }
        } catch (e) {
            console.error('Error fetching data:', e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        let errors = {};
        let hasError = false;
        Object.keys(formData).forEach(key => {
            const errorMsg = validateField(key, formData[key]);
            if (errorMsg) {
                errors[key] = errorMsg;
                hasError = true;
            }
        });

        if (hasError) {
            setFieldErrors(errors);
            setError('Please complete all required fields');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const result = await API.subjects.create(formData);
            if (result.success) {
                navigate('/subjects');
            } else {
                setError(result.message || 'Failed to add subject');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add subject');
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Subjects', onClick: () => navigate('/subjects') },
        { label: 'Create Curriculum', active: true }
    ];

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <PageHeader
                title="Subject Creation"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate('/subjects')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="p-8 shadow-xl shadow-slate-200/40 border-slate-200/50">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Subject Name */}
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Curriculum Name *</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text" required
                                            placeholder="e.g., Mathematics, Physics..."
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all font-medium text-sm ${fieldErrors.subject_name ? 'border-red-500' : 'border-slate-200'}`}
                                            value={formData.subject_name}
                                            onChange={(e) => handleFieldChange('subject_name', e.target.value)}
                                        />
                                        {fieldErrors.subject_name && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.subject_name}</p>}
                                    </div>
                                </div>

                                {/* Class Assignment */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Academic Grade *</label>
                                    <select
                                        required
                                        className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-medium text-sm ${fieldErrors.class_id ? 'border-red-500' : 'border-slate-200'}`}
                                        value={formData.class_id}
                                        onChange={(e) => handleFieldChange('class_id', e.target.value)}
                                    >
                                        <option value="">Select Grade</option>
                                        {classes.map(c => (
                                            <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                                        ))}
                                    </select>
                                    {fieldErrors.class_id && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.class_id}</p>}
                                </div>

                                {/* Monthly Fee */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Monthly Fee (LKR) *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="number" required
                                            placeholder="Fee per student"
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none font-bold text-sm ${fieldErrors.monthly_fee ? 'border-red-500' : 'border-slate-200'}`}
                                            value={formData.monthly_fee}
                                            onChange={(e) => handleFieldChange('monthly_fee', e.target.value)}
                                        />
                                        {fieldErrors.monthly_fee && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.monthly_fee}</p>}
                                    </div>
                                </div>

                                {/* Tutor Assignment */}
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Associate Faculty *</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <select
                                            required
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-medium text-sm ${fieldErrors.tutor_id ? 'border-red-500' : 'border-slate-200'}`}
                                            value={formData.tutor_id}
                                            onChange={(e) => handleFieldChange('tutor_id', e.target.value)}
                                        >
                                            <option value="">Choose Tutor</option>
                                            {tutors.map(t => (
                                                <option key={t.tutor_id} value={t.tutor_id}>{t.full_name}</option>
                                            ))}
                                        </select>
                                        {fieldErrors.tutor_id && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.tutor_id}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/subjects')}
                                    className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-10 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
                                >
                                    {loading ? 'Publishing...' : 'Confirm Subject'}
                                    {!loading && <CheckCircle size={18} />}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 bg-slate-900 border-none shadow-xl shadow-slate-200">
                        <div className="flex items-center gap-2 mb-4 text-indigo-400">
                            <Info size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Enrollment Guide</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                            Assigned tutors will be able to view students enrolled in this curriculum and manage their monthly progress.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
