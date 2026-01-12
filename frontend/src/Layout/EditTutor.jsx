import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, Lock, Mail, Phone, CreditCard, Home, DollarSign,
    Calendar, Briefcase, GraduationCap, Camera, Upload,
    CheckCircle, ShieldAlert, ArrowLeft, Layers, BookOpen, Trash2, Plus
} from 'lucide-react';
import { API, getFileUrl } from '../api/api';
import PageHeader from '../Components/PageHeader';
import Card from '../Cards/Card';

export default function EditTutor() {
    const { id } = useParams();
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
        join_date: '',
        experience: '',
        qualification: ''
    });
    const [assignedSubjects, setAssignedSubjects] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [tutorRes, subjectsRes] = await Promise.all([
                    API.tutors.getById(id),
                    API.subjects.getAll()
                ]);

                if (tutorRes.success) {
                    const tutor = tutorRes.data;
                    setFormData({
                        username: tutor.user?.username || '',
                        password: '',
                        full_name: tutor.full_name || '',
                        address: tutor.address || '',
                        contact_no: tutor.contact_no || '',
                        nic: tutor.nic || '',
                        email: tutor.email || '',
                        emergency_contact: tutor.emergency_contact || '',
                        basic_salary: tutor.basic_salary || '',
                        dob: tutor.dob ? new Date(tutor.dob).toISOString().split('T')[0] : '',
                        gender: tutor.gender || '',
                        join_date: tutor.join_date ? new Date(tutor.join_date).toISOString().split('T')[0] : '',
                        experience: tutor.experience || '',
                        qualification: tutor.qualification || ''
                    });
                    setAssignedSubjects(tutor.subjects || []);
                    if (tutor.profile_photo) {
                        setPhotoPreview(getFileUrl(tutor.profile_photo));
                    }
                }

                if (subjectsRes.success) {
                    setAllSubjects(subjectsRes.data.data || subjectsRes.data);
                }
            } catch (err) {
                setError("Failed to load faculty intelligence dossier.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleAssignSubject = async (subjectId) => {
        if (!subjectId) return;
        try {
            const res = await API.subjects.update(subjectId, { tutor_id: id });
            if (res.success) {
                // Refresh local data
                const updated = allSubjects.find(s => s.subject_id == subjectId);
                if (updated && !assignedSubjects.find(s => s.subject_id == subjectId)) {
                    setAssignedSubjects([...assignedSubjects, updated]);
                }
            }
        } catch (e) { console.error(e); }
    };

    const handleUnassignSubject = async (subjectId) => {
        try {
            const res = await API.subjects.update(subjectId, { tutor_id: null });
            if (res.success) {
                setAssignedSubjects(assignedSubjects.filter(s => s.subject_id !== subjectId));
            }
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'password' && !formData[key]) return;
                data.append(key, formData[key]);
            });
            if (profilePhoto) {
                data.append('profile_photo', profilePhoto);
            }
            data.append('_method', 'PUT');

            const result = await API.tutors.update(id, data);
            if (result.success) {
                navigate(`/tutors/${id}`);
            } else {
                setError(result.message || 'Failed to update dossier');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Update operation failed.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold">Synchronizing faculty data...</p>
        </div>
    );

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Faculty', onClick: () => navigate('/tutors') },
        { label: formData.full_name, onClick: () => navigate(`/tutors/${id}`) },
        { label: 'Update Records', active: true }
    ];

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            <PageHeader
                title="Update Faculty Records"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate(`/tutors/${id}`)}
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
                        <h4 className="font-extrabold text-slate-800 tracking-tight">Update Photo</h4>
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
                            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-200">System Record</span>
                        </div>
                        <p className="text-xs leading-relaxed text-purple-100 font-medium italic">
                            Modifying these details will update the central database and affect all active records linked to this faculty.
                        </p>
                    </Card>

                    {/* Assigned Portfolio Management */}
                    <Card className="p-6 border-slate-200/60 shadow-md">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Layers size={14} className="text-purple-500" />
                            Academic Portfolio
                        </h4>
                        <div className="space-y-3">
                            {assignedSubjects.map(sub => (
                                <div key={sub.subject_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-700 truncate">{sub.subject_name}</p>
                                        <p className="text-[9px] text-slate-400 uppercase font-black">{sub.school_class?.class_name || 'Grade ' + sub.grade}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleUnassignSubject(sub.subject_id)}
                                        className="text-slate-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}

                            <div className="pt-4 mt-2 border-t border-slate-100">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-2 block">Quick Assign Subject</label>
                                <select
                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-purple-500"
                                    onChange={(e) => handleAssignSubject(e.target.value)}
                                    value=""
                                >
                                    <option value="">Select available...</option>
                                    {allSubjects.filter(s => s.tutor_id != id).map(s => (
                                        <option key={s.subject_id} value={s.subject_id}>{s.subject_name} ({s.school_class?.class_name || 'G' + s.grade})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
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
                                <h3 className="font-bold text-slate-900 tracking-tight text-lg">Credentials & Auth</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Username (Read-only)</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="text" disabled
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl font-medium text-sm text-slate-400 cursor-not-allowed"
                                            value={formData.username}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-purple-600 uppercase tracking-widest ml-1">Reset Password (Optional)</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                                        <input
                                            type="password"
                                            placeholder="Leave blank to keep current"
                                            className="w-full pl-12 pr-4 py-3.5 bg-purple-50/20 border border-purple-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all font-medium text-sm"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
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
                                <h3 className="font-bold text-slate-900 tracking-tight text-lg">Identity Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Legal Name *</label>
                                    <input
                                        type="text" required
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all font-bold text-slate-700 text-sm"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    />
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
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Gender *</label>
                                    <select
                                        required
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none appearance-none font-bold text-slate-700 text-sm"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">N.I.C / Passport ID *</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text" required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 transition-all font-bold text-slate-700 text-sm"
                                            value={formData.nic}
                                            onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                                        />
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
                                <h3 className="font-bold text-slate-900 tracking-tight text-lg">Contact Records</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Direct Contact No *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text" required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-sm"
                                            value={formData.contact_no}
                                            onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email" required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-sm"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Residential Address *</label>
                                    <div className="relative">
                                        <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text" required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all font-medium text-sm"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-red-600 uppercase tracking-widest ml-1">Emergency Contact Hotline *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-red-300" size={18} />
                                        <input
                                            type="text" required
                                            className="w-full pl-12 pr-4 py-3.5 bg-red-50/30 border border-red-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 transition-all font-bold text-red-700 text-sm"
                                            value={formData.emergency_contact}
                                            onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                                        />
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
                                <h3 className="font-bold text-slate-900 tracking-tight text-lg">Professional Records</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Qualifications</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-sm"
                                            value={formData.qualification}
                                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Experience</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
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
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none font-extrabold text-purple-700 text-sm"
                                            value={formData.basic_salary}
                                            onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                                        />
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
                                onClick={() => navigate(`/tutors/${id}`)}
                                className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all group"
                            >
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Discard Changes
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-12 py-4 bg-purple-600 text-white font-extrabold rounded-2xl shadow-xl shadow-purple-100 hover:shadow-purple-200 hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-3"
                            >
                                {saving ? 'Synchronizing Records...' : 'Update Faculty Dossier'}
                                {!saving && <CheckCircle size={20} />}
                            </button>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
