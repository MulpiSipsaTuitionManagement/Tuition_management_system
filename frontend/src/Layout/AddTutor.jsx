import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, CreditCard, Home, DollarSign, Calendar, Briefcase, GraduationCap, Camera, Upload, CheckCircle, ShieldAlert, ArrowLeft } from 'lucide-react';
import { API } from '../api/api';
import PageHeader from '../Components/PageHeader';
import Card from '../Cards/Card';

export default function AddTutor() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        address: '',
        contact_no: '',
        nic: '',
        email: '',
        emergency_contact: '',
        basic_salary: '',
        dob: '',
        gender: '',
        join_date: new Date().toISOString().split('T')[0],
        experience: '',
        qualification: ''
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'username':
                if (!value.trim()) error = 'Username is required';
                break;
            case 'password':
                if (!value) error = 'Password is required';
                else if (value.length < 6) error = 'Min 6 characters required';
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
            case 'emergency_contact':
                if (!value.trim()) error = 'Emergency contact is required';
                else if (!/^\d{11}$/.test(value.replace(/\D/g, ''))) error = 'Invalid Contact No (11 digits)';
                break;
            case 'email':
                if (!value.trim()) error = 'Email is required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
                break;
            case 'nic':
                if (!value.trim()) error = 'NIC is required';
                break;
            case 'gender':
                if (!value) error = 'Gender is required';
                break;
            case 'basic_salary':
                if (!value) error = 'Salary is required';
                break;
            default:
                break;
        }
        return error;
    };

    const handleFieldChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        const errorMsg = validateField(name, value);
        setFieldErrors(prev => ({
            ...prev,
            [name]: errorMsg
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
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
            setError('Please fix the errors in the form');
            // Scroll to top or first error could be good, but simple error message is enough for now
            return;
        }

        setLoading(true);
        setError('');
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (profilePhoto) {
                data.append('profile_photo', profilePhoto);
            }
            data.append('role', 'tutor');

            const result = await API.admin.createUser(data);
            if (result.success) {
                navigate('/tutors');
            } else {
                setError(result.message || 'Failed to create tutor');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create tutor');
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
        { label: 'Tutors', onClick: () => navigate('/tutors') },
        { label: 'Faculty Enrollment', active: true }
    ];

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            <PageHeader
                title="Faculty Registration"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate('/tutors')}
            />

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-8 flex flex-col items-center border-slate-200/50 shadow-lg shadow-purple-100/20">
                        <div className="relative group mb-6">
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="w-36 h-36 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-purple-400 transition-all shadow-inner"
                            >
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera size={40} className="text-slate-300 group-hover:text-purple-400" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="absolute -bottom-2 -right-2 p-2.5 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition-all transform hover:scale-110 active:scale-95"
                            >
                                <Upload size={16} />
                            </button>
                        </div>
                        <div className="text-center space-y-1">
                            <h4 className="font-extrabold text-slate-800 tracking-tight">Identity Image</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">PNG / JPG (Max 2MB)</p>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </Card>

                    <Card className="p-6 bg-purple-900 text-white border-none shadow-xl shadow-purple-100/20">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle size={18} className="text-purple-300" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-200">System Ready</span>
                        </div>
                        <p className="text-xs leading-relaxed text-purple-100 font-medium italic">
                            Newly registered faculty members will have immediate access to their dashboard once credentials are created.
                        </p>
                    </Card>
                </div>

                {/* Main Form Fields */}
                <div className="lg:col-span-3 space-y-8">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
                            <ShieldAlert size={18} />
                            {error}
                        </div>
                    )}

                    <Card className="p-8 md:p-10 border-slate-200/50 shadow-xl shadow-slate-200/40 space-y-12">
                        {/* Account Access Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <Lock size={18} />
                                </div>
                                <h3 className="font-bold text-slate-900 tracking-tight text-lg">System Credentials</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Username (Login ID) *</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text" required
                                            placeholder="e.g. johndoe_faculty"
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all font-medium text-sm ${fieldErrors.username ? 'border-red-500' : 'border-slate-200'}`}
                                            value={formData.username}
                                            onChange={(e) => handleFieldChange('username', e.target.value)}
                                        />
                                        {fieldErrors.username && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.username}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Password *</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password" required
                                            placeholder="Min 6 characters"
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all font-medium text-sm ${fieldErrors.password ? 'border-red-500' : 'border-slate-200'}`}
                                            value={formData.password}
                                            onChange={(e) => handleFieldChange('password', e.target.value)}
                                        />
                                        {fieldErrors.password && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.password}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Identification Section */}
                        <div className="space-y-8 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <User size={18} />
                                </div>
                                <h3 className="font-bold text-slate-900 tracking-tight text-lg">Personal Identification</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Legal Name *</label>
                                    <input
                                        type="text" required
                                        className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all font-bold text-slate-700 text-sm ${fieldErrors.full_name ? 'border-red-500' : 'border-slate-200'}`}
                                        value={formData.full_name}
                                        onChange={(e) => handleFieldChange('full_name', e.target.value)}
                                    />
                                    {fieldErrors.full_name && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.full_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Birthday</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="date"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none font-medium text-sm"
                                            value={formData.dob}
                                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Gender Identification *</label>
                                    <select
                                        required
                                        className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none appearance-none font-bold text-slate-700 text-sm ${fieldErrors.gender ? 'border-red-500' : 'border-slate-200'}`}
                                        value={formData.gender}
                                        onChange={(e) => handleFieldChange('gender', e.target.value)}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {fieldErrors.gender && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.gender}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">N.I.C / Passport ID *</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text" required
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 transition-all font-bold text-slate-700 text-sm ${fieldErrors.nic ? 'border-red-500' : 'border-slate-200'}`}
                                            value={formData.nic}
                                            onChange={(e) => handleFieldChange('nic', e.target.value)}
                                        />
                                        {fieldErrors.nic && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.nic}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <Phone size={18} />
                                </div>
                                <h3 className="font-bold text-slate-900 tracking-tight text-lg">Contact Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Direct Contact No *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text" required
                                            placeholder="+94 XX XXX XXXX"
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-sm ${fieldErrors.contact_no ? 'border-red-500' : 'border-slate-200'}`}
                                            value={formData.contact_no}
                                            onChange={(e) => handleFieldChange('contact_no', e.target.value)}
                                        />
                                        {fieldErrors.contact_no && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.contact_no}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Professional Email Address *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email" required
                                            placeholder="faculty@example.com"
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-sm ${fieldErrors.email ? 'border-red-500' : 'border-slate-200'}`}
                                            value={formData.email}
                                            onChange={(e) => handleFieldChange('email', e.target.value)}
                                        />
                                        {fieldErrors.email && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.email}</p>}
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Residential Address *</label>
                                    <div className="relative">
                                        <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text" required
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all font-medium text-sm ${fieldErrors.address ? 'border-red-500' : 'border-slate-200'}`}
                                            value={formData.address}
                                            onChange={(e) => handleFieldChange('address', e.target.value)}
                                        />
                                        {fieldErrors.address && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.address}</p>}
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-red-600 uppercase tracking-widest ml-1">Emergency Contact Hotline *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-red-300" size={18} />
                                        <input
                                            type="text" required
                                            placeholder="Emergency Number"
                                            className={`w-full pl-12 pr-4 py-3.5 bg-red-50/30 border rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 transition-all font-bold text-red-700 text-sm ${fieldErrors.emergency_contact ? 'border-red-500' : 'border-red-100'}`}
                                            value={formData.emergency_contact}
                                            onChange={(e) => handleFieldChange('emergency_contact', e.target.value)}
                                        />
                                        {fieldErrors.emergency_contact && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.emergency_contact}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <Briefcase size={18} />
                                </div>
                                <h3 className="font-bold text-slate-900 tracking-tight text-lg">Faculty Profile & Experience</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Academic Qualifications</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Degrees, Certifications"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-sm"
                                            value={formData.qualification}
                                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Teaching Experience</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="e.g. 5 Years in Advanced Level"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-sm"
                                            value={formData.experience}
                                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Base Monthly Salary (LKR) *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="number" required
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none font-extrabold text-purple-700 text-sm ${fieldErrors.basic_salary ? 'border-red-500' : 'border-slate-200'}`}
                                            value={formData.basic_salary}
                                            onChange={(e) => handleFieldChange('basic_salary', e.target.value)}
                                        />
                                        {fieldErrors.basic_salary && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{fieldErrors.basic_salary}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Joined Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="date"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none font-medium text-sm"
                                            value={formData.join_date}
                                            onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submission Section */}
                        <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate('/tutors')}
                                className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all group"
                            >
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Discard Registration
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-12 py-4 bg-purple-600 text-white font-extrabold rounded-2xl shadow-xl shadow-purple-100 hover:shadow-purple-200 hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-3"
                            >
                                {loading ? 'Registering Factuly...' : 'Finalize Registration'}
                                {!loading && <CheckCircle size={20} />}
                            </button>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
