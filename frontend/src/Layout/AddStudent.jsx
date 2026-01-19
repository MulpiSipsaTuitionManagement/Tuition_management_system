import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Home, CreditCard, Calendar, BookOpen, GraduationCap, CheckCircle, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';
import { API } from '../api/api';
import PageHeader from '../Components/PageHeader';
import Card from '../Cards/Card';

export default function AddStudent() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        address: '',
        contact_no: '',
        nic: '',
        email: '',
        guardian_name: '',
        guardian_contact: '',
        emergency_contact: '',
        dob: '',
        gender: '',
        grade: '', // Used for frontend state, will map to class_id
        subjects: [], // Used for frontend state, will map to subject_ids
        enrollment_date: new Date().toISOString().split('T')[0]
    });

    const [classes, setClasses] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'username':
                if (!value.trim()) error = 'Username is required';
                else if (value.length < 3) error = 'Username must be at least 3 characters';
                break;
            case 'password':
                if (!value) error = 'Password is required';
                else if (value.length < 6) error = 'Password must be at least 6 characters';
                break;
            case 'full_name':
                if (!value.trim()) error = 'Full Name is required';
                break;
            case 'address':
                if (!value.trim()) error = 'Address is required';
                break;
            case 'contact_no':
                if (!value.trim()) error = 'Contact No is required';
                else if (!/^\d{11}$/.test(value.replace(/\D/g, ''))) error = 'Invalid Contact No (11 digits)';
                break;
            case 'guardian_contact':
                if (!value.trim()) error = 'Guardian Contact is required';
                else if (!/^\d{11}$/.test(value.replace(/\D/g, ''))) error = 'Invalid Contact No (11 digits)';
                break;
            case 'emergency_contact':
                if (!value.trim()) error = 'Emergency Contact is required';
                else if (!/^\d{11}$/.test(value.replace(/\D/g, ''))) error = 'Invalid Contact No (11 digits)';
                break;
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
                break;
            case 'guardian_name':
                if (!value.trim()) error = 'Guardian Name is required';
                break;
            case 'grade':
                if (!value) error = 'Grade is required';
                break;
            case 'gender':
                if (!value) error = 'Gender is required';
                break;
            case 'dob':
                // Optional validation for DOB
                break;
            case 'enrollment_date':
                // Optional
                break;
            default:
                break;
        }
        return error;
    };

    const handleFieldChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error immediately on change, or validate on change? 
        // Let's validate on change to give instant feedback or at least clear the error
        const errorMsg = validateField(name, value);
        setFieldErrors(prev => ({
            ...prev,
            [name]: errorMsg
        }));
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const classesRes = await API.classes.getAll();
            if (classesRes.success) {
                setClasses(classesRes.data.data || classesRes.data);
            }
        } catch (e) {
            console.error('Error fetching data:', e);
        }
    };

    const handleClassChange = async (classId) => {
        setFormData({ ...formData, grade: classId, subjects: [] });
        if (!classId) {
            setAvailableSubjects([]);
            return;
        }
        try {
            const subjectsRes = await API.subjects.getAll(`?class_id=${classId}`);
            if (subjectsRes.success) {
                setAvailableSubjects(subjectsRes.data.data || subjectsRes.data);
            }
        } catch (e) {
            console.error('Error fetching subjects:', e);
        }
    };

    const toggleSubject = (subjectId) => {
        const current = [...formData.subjects];
        const index = current.indexOf(subjectId);
        if (index > -1) current.splice(index, 1);
        else current.push(subjectId);
        setFormData({ ...formData, subjects: current });
    };

    const [profilePhoto, setProfilePhoto] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfilePhoto(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate current step fields
        let errors = {};
        let hasError = false;

        const step1Fields = ['username', 'password', 'full_name', 'address', 'contact_no', 'gender', 'email'];
        const step2Fields = ['guardian_name', 'guardian_contact', 'emergency_contact', 'grade'];

        const fieldsToValidate = step === 1 ? step1Fields : step2Fields;

        fieldsToValidate.forEach(field => {
            const errorMsg = validateField(field, formData[field]);
            if (errorMsg) {
                errors[field] = errorMsg;
                hasError = true;
            }
        });

        if (hasError) {
            setFieldErrors(errors);
            setError('Please fix the errors in the form');
            return;
        }

        if (step === 1) {
            setStep(2);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const formDataObj = new FormData();

            // Append all simple text fields
            Object.keys(formData).forEach(key => {
                if (key !== 'subjects' && key !== 'grade') {
                    formDataObj.append(key, formData[key]);
                }
            });

            // Specific mappings
            formDataObj.append('class_id', formData.grade);
            formDataObj.append('role', 'student');

            // Handle array for subjects
            formData.subjects.forEach(subjectId => {
                formDataObj.append('subject_ids[]', subjectId);
            });

            // Handle file
            if (profilePhoto) {
                formDataObj.append('profile_photo', profilePhoto);
            }

            // If we're using axios, it handles the boundary automatically
            const result = await API.admin.createUser(formDataObj);

            if (result.success) {
                navigate('/students');
            } else {
                setError(result.message || 'Failed to create student');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create student');
            if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0][0];
                setError(firstError);
            }
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Students', onClick: () => navigate('/students') },
        { label: 'Registration', active: true }
    ];

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <PageHeader
                title="Student Registration"
                breadcrumbs={breadcrumbs}
                onBack={() => step > 1 ? setStep(1) : navigate('/students')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Progress Sidebar */}
                <div className="lg:col-span-1">
                    <div className="space-y-4 sticky top-24">
                        <div className={`p-4 rounded-2xl border transition-all ${step === 1 ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-100 text-slate-400'}`}>
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${step === 1 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
                                <span className="font-bold tracking-tight">Basic Profile</span>
                            </div>
                        </div>
                        <div className={`p-4 rounded-2xl border transition-all ${step === 2 ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-100 text-slate-400'}`}>
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${step === 2 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
                                <span className="font-bold tracking-tight">Registration Details</span>
                            </div>
                        </div>

                        <Card className="mt-8 bg-slate-900 border-none p-6 rounded-2xl">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Summary</p>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-xs text-slate-400">Name:</span>
                                    <span className="text-xs font-bold text-white truncate ml-2">{formData.full_name || 'Not set'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-slate-400">Class:</span>
                                    <span className="text-xs font-bold text-white">{classes.find(c => c.class_id == formData.grade)?.class_name || 'Pending'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-slate-400">Subjects:</span>
                                    <span className="text-xs font-bold text-purple-400">{formData.subjects.length} Selected</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Form Main Area */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium flex items-center gap-3">
                                <ShieldAlert size={18} />
                                {error}
                            </div>
                        )}

                        <Card className="p-8 shadow-xl shadow-slate-200/40 border-slate-200/50">
                            {step === 1 ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Account Username *</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="text" required
                                                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm ${fieldErrors.username ? 'border-red-500' : 'border-slate-200'}`}
                                                    value={formData.username}
                                                    onChange={(e) => handleFieldChange('username', e.target.value)}
                                                />
                                                {fieldErrors.username && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.username}</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Account Password *</label>
                                            <input
                                                type="password" required
                                                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm ${fieldErrors.password ? 'border-red-500' : 'border-slate-200'}`}
                                                value={formData.password}
                                                onChange={(e) => handleFieldChange('password', e.target.value)}
                                            />
                                            {fieldErrors.password && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.password}</p>}
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Profile Photo (Optional)</label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                                    {profilePhoto ? (
                                                        <img src={URL.createObjectURL(profilePhoto)} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="text-slate-300" size={24} />
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name *</label>
                                            <input
                                                type="text" required
                                                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm ${fieldErrors.full_name ? 'border-red-500' : 'border-slate-200'}`}
                                                value={formData.full_name}
                                                onChange={(e) => handleFieldChange('full_name', e.target.value)}
                                            />
                                            {fieldErrors.full_name && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.full_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Gender *</label>
                                            <select
                                                required
                                                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white outline-none transition-all font-medium text-sm ${fieldErrors.gender ? 'border-red-500' : 'border-slate-200'}`}
                                                value={formData.gender}
                                                onChange={(e) => handleFieldChange('gender', e.target.value)}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                            {fieldErrors.gender && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.gender}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">DOB</label>
                                            <input
                                                type="date"
                                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none font-medium text-sm"
                                                value={formData.dob}
                                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Address *</label>
                                            <div className="relative">
                                                <Home className="absolute left-4 top-4 text-slate-400" size={18} />
                                                <textarea
                                                    required
                                                    rows="2"
                                                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none resize-none ${fieldErrors.address ? 'border-red-500' : 'border-slate-200'}`}
                                                    value={formData.address}
                                                    onChange={(e) => handleFieldChange('address', e.target.value)}
                                                />
                                                {fieldErrors.address && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.address}</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="email"
                                                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm ${fieldErrors.email ? 'border-red-500' : 'border-slate-200'}`}
                                                    value={formData.email}
                                                    onChange={(e) => handleFieldChange('email', e.target.value)}
                                                />
                                                {fieldErrors.email && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.email}</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Contact No *</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="text" required
                                                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm ${fieldErrors.contact_no ? 'border-red-500' : 'border-slate-200'}`}
                                                    value={formData.contact_no}
                                                    onChange={(e) => handleFieldChange('contact_no', e.target.value)}
                                                />
                                                {fieldErrors.contact_no && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.contact_no}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Guardian Name *</label>
                                            <input
                                                type="text" required
                                                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm ${fieldErrors.guardian_name ? 'border-red-500' : 'border-slate-200'}`}
                                                value={formData.guardian_name}
                                                onChange={(e) => handleFieldChange('guardian_name', e.target.value)}
                                            />
                                            {fieldErrors.guardian_name && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.guardian_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Guardian Contact *</label>
                                            <input
                                                type="text" required
                                                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm ${fieldErrors.guardian_contact ? 'border-red-500' : 'border-slate-200'}`}
                                                value={formData.guardian_contact}
                                                onChange={(e) => handleFieldChange('guardian_contact', e.target.value)}
                                            />
                                            {fieldErrors.guardian_contact && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.guardian_contact}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Emergency Contact *</label>
                                            <input
                                                type="text" required
                                                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm ${fieldErrors.emergency_contact ? 'border-red-500' : 'border-slate-200'}`}
                                                value={formData.emergency_contact}
                                                onChange={(e) => handleFieldChange('emergency_contact', e.target.value)}
                                            />
                                            {fieldErrors.emergency_contact && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.emergency_contact}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Assigned Grade *</label>
                                            <select
                                                required
                                                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white outline-none transition-all font-medium text-sm ${fieldErrors.grade ? 'border-red-500' : 'border-slate-200'}`}
                                                value={formData.grade}
                                                onChange={(e) => {
                                                    handleClassChange(e.target.value);
                                                    handleFieldChange('grade', e.target.value);
                                                }}
                                            >
                                                <option value="">Select Class</option>
                                                {classes.map(c => (
                                                    <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                                                ))}
                                            </select>
                                            {fieldErrors.grade && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.grade}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Enrollment Date</label>
                                            <input
                                                type="date"
                                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none font-medium text-sm"
                                                value={formData.enrollment_date}
                                                onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Available Subjects</label>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                    Total Fee: LKR {availableSubjects.filter(s => formData.subjects.includes(s.subject_id)).reduce((sum, s) => sum + (parseFloat(s.monthly_fee) || 0), 0).toFixed(2)}
                                                </span>
                                                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                    {availableSubjects.length} Found
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {availableSubjects.map(s => (
                                                <button
                                                    key={s.subject_id}
                                                    type="button"
                                                    onClick={() => toggleSubject(s.subject_id)}
                                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${formData.subjects.includes(s.subject_id)
                                                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200'
                                                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 text-left">
                                                        <BookOpen size={16} className={formData.subjects.includes(s.subject_id) ? 'text-purple-200' : 'text-slate-300'} />
                                                        <div>
                                                            <span className="text-sm font-bold tracking-tight block">{s.subject_name}</span>
                                                            <span className={`text-[10px] font-medium ${formData.subjects.includes(s.subject_id) ? 'text-purple-200' : 'text-slate-400'}`}>LKR {s.monthly_fee}</span>
                                                        </div>
                                                    </div>
                                                    {formData.subjects.includes(s.subject_id) && <CheckCircle size={16} />}
                                                </button>
                                            ))}
                                            {availableSubjects.length === 0 && (
                                                <div className="col-span-2 p-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select a class to view subjects</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => step > 1 ? setStep(1) : navigate('/students')}
                                    className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all flex items-center gap-2"
                                >
                                    <ArrowLeft size={16} />
                                    {step === 1 ? 'Cancel Registration' : 'Back to Profile'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-10 py-3.5 bg-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
                                >
                                    {loading ? 'Processing...' : (step === 1 ? 'Next Phase' : 'Complete Registration')}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                            </div>
                        </Card>
                    </form>
                </div>
            </div>
        </div>
    );
}
