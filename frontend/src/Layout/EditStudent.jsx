import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Plus, Phone, Home, BookOpen, CheckCircle, ArrowRight, ArrowLeft, ShieldAlert, Lock, Calendar, CreditCard, Shield } from 'lucide-react';
import { API, getFileUrl } from '../api/api';
import PageHeader from '../Components/PageHeader';
import Card from '../Cards/Card';

export default function EditStudent() {
    const { id } = useParams();
    const navigate = useNavigate();
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
        grade: '',
        subjects: [],
        enrollment_date: '',
    });

    const [classes, setClasses] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [profilePhoto, setProfilePhoto] = useState(null);

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'username':
                if (!value.trim()) error = 'Username is required';
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
            case 'emergency_contact':
                if (!value.trim()) error = 'Contact is required';
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
    const [currentPhoto, setCurrentPhoto] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const classesRes = await API.classes.getAll();
                if (classesRes.success) {
                    setClasses(classesRes.data.data || classesRes.data);
                }

                const studentRes = await API.students.getById(id);
                if (studentRes.success) {
                    const s = studentRes.data;
                    setFormData({
                        username: s.user?.username || '',
                        password: '',
                        full_name: s.full_name || '',
                        address: s.address || '',
                        contact_no: s.contact_no || '',
                        nic: s.nic || '',
                        email: s.email || '',
                        guardian_name: s.guardian_name || '',
                        guardian_contact: s.guardian_contact || '',
                        emergency_contact: s.emergency_contact || '',
                        dob: s.dob || '',
                        gender: s.gender || '',
                        grade: s.class_id || '',
                        subjects: s.subjects ? s.subjects.map(sub => sub.subject_id) : [],
                        enrollment_date: s.enrollment_date || '',
                    });

                    setCurrentPhoto(s.profile_photo);

                    if (s.class_id) {
                        const subjectsRes = await API.subjects.getAll(`?class_id=${s.class_id}`);
                        if (subjectsRes.success) {
                            setAvailableSubjects(subjectsRes.data.data || subjectsRes.data);
                        }
                    }
                }
            } catch (e) {
                console.error('Error fetching data:', e);
                setError('Failed to load student data');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchInitialData();
    }, [id]);

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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfilePhoto(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate all fields
        let errors = {};
        let hasError = false;
        Object.keys(formData).forEach(key => {
            // Password is optional in edit
            if (key !== 'password') {
                const errorMsg = validateField(key, formData[key]);
                if (errorMsg) {
                    errors[key] = errorMsg;
                    hasError = true;
                }
            }
        });

        if (hasError) {
            setFieldErrors(errors);
            setError('Please correct the validation errors');
            // Basic scroll to top or just let user see red fields
            return;
        }

        try {
            const formDataObj = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'password' && !formData.password) return;
                if (key !== 'subjects' && key !== 'grade') {
                    formDataObj.append(key, formData[key] || '');
                }
            });

            formDataObj.append('class_id', formData.grade);
            formData.subjects.forEach(subjectId => {
                formDataObj.append('subject_ids[]', subjectId);
            });

            if (profilePhoto) {
                formDataObj.append('profile_photo', profilePhoto);
            }

            formDataObj.append('_method', 'PUT');

            const result = await API.students.update(id, formDataObj);
            if (result.success) {
                navigate(`/students/${id}`);
            } else {
                setError(result.message || 'Failed to update student');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update student');
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Students', onClick: () => navigate('/students') },
        { label: formData.full_name || 'Student', onClick: () => navigate(`/students/${id}`) },
        { label: 'Edit', active: true }
    ];

    if (fetchLoading) return <div className="p-10 text-center text-slate-500 font-bold animate-pulse">Retrieving student record...</div>;

    const totalCalculatedFee = availableSubjects
        .filter(s => formData.subjects.includes(s.subject_id))
        .reduce((sum, s) => sum + (parseFloat(s.monthly_fee) || 0), 0);

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            <PageHeader
                title="Edit Student Profile"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate(`/students/${id}`)}
            />

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Profile Photo Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 flex flex-col items-center border-slate-200/60 shadow-lg shadow-purple-100/20">
                        <div className="w-32 h-32 rounded-3xl bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden mb-4 relative group">
                            {profilePhoto ? (
                                <img src={URL.createObjectURL(profilePhoto)} alt="Preview" className="w-full h-full object-cover" />
                            ) : currentPhoto ? (
                                <img src={getFileUrl(currentPhoto)} alt="Current" className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-slate-200" size={48} />
                            )}

                            <label className="absolute inset-0 bg-purple-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white">
                                <Plus size={20} className="mb-1" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Update Photo</span>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 text-center">{formData.full_name || 'Update Student'}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Student ID: #{id}</p>
                    </Card>

                    <Card className="p-6 bg-slate-900 border-none">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 font-display">Financial Guard</h4>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-slate-400">Monthly Fee</span>
                            <span className="text-sm font-bold text-white tracking-tight">LKR {totalCalculatedFee.toFixed(2)}</span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-medium leading-tight mt-2 italic">Fees are automatically recalculated based on subject selection.</p>
                    </Card>
                </div>

                {/* Main Form Content */}
                <div className="lg:col-span-3 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
                            <ShieldAlert size={18} />
                            {error}
                        </div>
                    )}

                    <Card className="p-8 shadow-xl shadow-slate-200/40 border-slate-200/50">
                        {/* Account Credentials Section */}
                        <div className="mb-10 pb-10 border-b border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <Shield size={18} />
                                </div>
                                <h3 className="text-md font-bold text-slate-800 font-display">Account Security</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Student Username *</label>
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
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Reset Password (Optional)</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            placeholder="Leave blank to keep current"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Bio Section */}
                        <div className="mb-10 pb-10 border-b border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <User size={18} />
                                </div>
                                <h3 className="text-md font-bold text-slate-800 font-display">Personal Profile</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Display Name *</label>
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
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {fieldErrors.gender && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.gender}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Date of Birth *</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="date" required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none font-medium text-sm"
                                            value={formData.dob}
                                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Contact Details</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="email" placeholder="Email Address"
                                                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm ${fieldErrors.email ? 'border-red-500' : 'border-slate-200'}`}
                                                value={formData.email}
                                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                            />
                                            {fieldErrors.email && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.email}</p>}
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text" placeholder="Direct Contact No"
                                                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm ${fieldErrors.contact_no ? 'border-red-500' : 'border-slate-200'}`}
                                                value={formData.contact_no}
                                                onChange={(e) => handleFieldChange('contact_no', e.target.value)}
                                            />
                                            {fieldErrors.contact_no && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.contact_no}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Residential Address *</label>
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
                            </div>
                        </div>

                        {/* Guardian Info Section */}
                        <div className="mb-10 pb-10 border-b border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <Shield size={18} />
                                </div>
                                <h3 className="text-md font-bold text-slate-800 font-display">Guardian & Emergency</h3>
                            </div>
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
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-widest ml-1 text-red-600">Emergency Hotline *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-red-300" size={18} />
                                        <input
                                            type="text" required
                                            className={`w-full pl-12 pr-4 py-3.5 bg-red-50/30 border rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 transition-all font-bold text-sm text-red-700 ${fieldErrors.emergency_contact ? 'border-red-500' : 'border-red-100'}`}
                                            value={formData.emergency_contact}
                                            onChange={(e) => handleFieldChange('emergency_contact', e.target.value)}
                                        />
                                        {fieldErrors.emergency_contact && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.emergency_contact}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Academic Config Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <BookOpen size={18} />
                                </div>
                                <h3 className="text-md font-bold text-slate-800 font-display">Academic Configuration</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Active Grade/Class *</label>
                                    <select
                                        required
                                        className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white outline-none transition-all font-medium text-sm ${fieldErrors.grade ? 'border-red-500' : 'border-slate-200'}`}
                                        value={formData.grade}
                                        onChange={(e) => {
                                            handleClassChange(e.target.value);
                                            handleFieldChange('grade', e.target.value);
                                        }}
                                    >
                                        <option value="">Transfer to Class...</option>
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

                            <div className="space-y-4 pt-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 block">Subject Enrollment</label>
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
                                                <div className={`p-1.5 rounded-lg ${formData.subjects.includes(s.subject_id) ? 'bg-white/20' : 'bg-slate-50'}`}>
                                                    <BookOpen size={14} className={formData.subjects.includes(s.subject_id) ? 'text-white' : 'text-slate-400'} />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold tracking-tight block">{s.subject_name}</span>
                                                    <span className={`text-[10px] font-bold ${formData.subjects.includes(s.subject_id) ? 'text-purple-100' : 'text-slate-400'}`}>LKR {parseFloat(s.monthly_fee).toFixed(0)}</span>
                                                </div>
                                            </div>
                                            {formData.subjects.includes(s.subject_id) && <CheckCircle size={16} />}
                                        </button>
                                    ))}
                                    {availableSubjects.length === 0 && (
                                        <div className="col-span-2 p-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Please select a valid grade to view subjects</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 flex items-center justify-between border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate(`/students/${id}`)}
                                className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all flex items-center gap-2"
                            >
                                <ArrowLeft size={16} />
                                Discard Changes
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-10 py-3.5 bg-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
                            >
                                {loading ? 'Syncing Profile...' : 'Update Records'}
                                {!loading && <CheckCircle size={18} />}
                            </button>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
