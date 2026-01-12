import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, BookOpen, Clock, Calendar, Mail, Phone, MapPin,
    Shield, CreditCard, Activity, GraduationCap, DollarSign,
    CheckCircle, AlertCircle, TrendingUp
} from 'lucide-react';
import { API, getFileUrl } from '../api/api';
import PageHeader from '../Components/PageHeader';
import Card from '../Cards/Card';

export default function StudentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await API.students.getById(id);
                if (res.success) {
                    setStudent(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch student details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    if (loading) return <div className="p-10 text-center text-slate-500">Loading profile...</div>;
    if (!student) return <div className="p-10 text-center text-red-500">Student not found</div>;

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Students', onClick: () => navigate('/students') },
        { label: student.full_name, active: true }
    ];

    // Calculate Fees
    const totalFees = parseFloat(student.total_monthly_fee || 0);
    const paidFees = student.fees?.filter(f => f.status === 'paid').reduce((sum, f) => sum + parseFloat(f.amount), 0) || 0;
    const pendingFees = student.fees?.filter(f => f.status === 'pending').reduce((sum, f) => sum + parseFloat(f.amount), 0) || 0;
    const feeStatus = pendingFees > 0 ? 'Pending' : 'Cleared';

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            <PageHeader
                title="Student Profile"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate('/students')}
                actions={
                    <button
                        onClick={() => navigate(`/students/${student.student_id}/edit`)}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl text-sm font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 transform hover:-translate-y-0.5"
                    >
                        <User size={18} />
                        Edit Profile
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Key Identity */}
                <div className="space-y-6">
                    <Card className="p-8 flex flex-col items-center border-slate-200/60 shadow-lg shadow-slate-200/40 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                        <div className="relative z-10 w-32 h-32 rounded-3xl bg-white p-1 border-4 border-white shadow-xl flex items-center justify-center text-purple-600 text-4xl font-bold mb-6 overflow-hidden">
                            {student.profile_photo ? (
                                <img
                                    src={getFileUrl(student.profile_photo)}
                                    alt={student.full_name}
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            ) : (
                                student.full_name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 text-center">{student.full_name}</h2>
                        <span className="mt-2 font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-xs tracking-tight">
                            @{student.user?.username || 'no-username'}
                        </span>

                        <div className="mt-4 flex items-center gap-2 text-slate-500 font-medium text-sm">
                            <GraduationCap size={16} />
                            <span>{student.grade}</span>
                        </div>

                        <div className="w-full mt-8 space-y-4 border-t border-slate-100 pt-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Student ID</span>
                                <span className="font-bold text-slate-900 tracking-tight">#{student.student_id}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Account Status</span>
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${student.user?.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                    {student.user?.is_active ? 'Active' : 'Deactivated'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Enrollment Date</span>
                                <span className="font-bold text-slate-900">
                                    {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card
                        className="p-6 bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-none shadow-xl shadow-purple-200 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                        onClick={() => navigate(`/students/${student.student_id}/fees`)}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-bold text-lg mb-1">Financial Summary</h3>
                                <p className="text-purple-100 text-xs">Overview of all dues</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                <DollarSign size={24} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <span className="text-xs font-medium text-purple-100">Monthly Commitment</span>
                                <span className="text-2xl font-extrabold uppercase tracking-tighter">LKR {totalFees.toFixed(2)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest block">Total Paid</span>
                                    <span className="text-lg font-bold">LKR {paidFees.toFixed(0)}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest block">Pending</span>
                                    <span className="text-lg font-bold text-amber-300">LKR {pendingFees.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold justify-center ${pendingFees > 0 ? 'bg-amber-400/20 text-amber-300' : 'bg-green-400/20 text-green-300'}`}>
                                {pendingFees > 0 ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                                <span> {pendingFees > 0 ? `Dues Detected: LKR ${pendingFees}` : 'Financials Healthy - All Paid'}</span>
                            </div>
                        </div>
                    </Card>

                    <Card
                        className="p-6 bg-white text-slate-900 border border-slate-200 shadow-xl shadow-slate-100 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                        onClick={() => navigate(`/students/${student.student_id}/attendance`)}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-purple-900 mb-1">Attendance Summary</h3>
                                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Presence & Punctuality</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                <Activity size={24} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-center">
                                <span className="block text-[10px] font-bold text-green-600 uppercase tracking-tighter">Present</span>
                                <span className="text-xl font-bold text-green-700">85%</span>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
                                <span className="block text-[10px] font-bold text-amber-600 uppercase tracking-tighter">Late</span>
                                <span className="text-xl font-bold text-amber-700">5</span>
                            </div>
                            <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center">
                                <span className="block text-[10px] font-bold text-red-600 uppercase tracking-tighter">Absent</span>
                                <span className="text-xl font-bold text-red-700">2</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between text-xs font-bold text-purple-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                            <span>View Detailed Records</span>
                            <TrendingUp size={16} />
                        </div>
                    </Card>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Contact & Personal */}
                    <Card className="p-8 border-slate-200/60 shadow-md">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                                <Activity size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Personal & Contact Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Full Name</label>
                                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                    <User size={16} className="text-slate-300" />
                                    <span>{student.full_name}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Date of Birth</label>
                                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                    <Calendar size={16} className="text-slate-300" />
                                    <span>{student.dob ? new Date(student.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not provided'}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Official Email</label>
                                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                    <Mail size={16} className="text-slate-300" />
                                    <span className="truncate">{student.email || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Contact Number</label>
                                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                    <Phone size={16} className="text-slate-300" />
                                    <span>{student.contact_no || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Residential Address</label>
                                <div className="flex items-start gap-3 text-slate-700 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <MapPin size={18} className="text-slate-300 mt-0.5 shrink-0" />
                                    <span className="leading-relaxed">{student.address || 'Address not listed'}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Guardian Information</label>
                                <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                        <Shield size={14} className="text-purple-400" />
                                        <span>{student.guardian_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                                        <Phone size={12} />
                                        <span>{student.guardian_contact}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Emergency Hotline</label>
                                <div className="flex items-center gap-3 text-red-600 font-bold text-sm bg-red-50 p-4 rounded-2xl border border-red-100">
                                    <Phone size={18} className="animate-pulse" />
                                    <span>{student.emergency_contact || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Academic Info */}
                    <Card className="p-8 border-slate-200/60 shadow-md">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                                    <GraduationCap size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Academic Curriculum</h3>
                            </div>
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full uppercase tracking-tighter">
                                {student.subjects?.length || 0} Registered Subjects
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {student.subjects?.map((sub, idx) => (
                                <div key={idx} className="flex flex-col p-4 border border-slate-100 rounded-2xl bg-white hover:border-purple-200 hover:shadow-sm transition-all group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-[10px] transition-colors group-hover:bg-purple-600 group-hover:text-white">
                                            {sub.subject_name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">Monthly: LKR {sub.monthly_fee}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">{sub.subject_name}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Assigned: {sub.tutor?.full_name || 'TBA'}</p>
                                </div>
                            ))}
                        </div>
                        {(!student.subjects || student.subjects.length === 0) && (
                            <div className="p-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                                <BookOpen className="mx-auto text-slate-300 mb-2" size={32} />
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Subjects Cataloged</p>
                            </div>
                        )}
                    </Card>

                </div>
            </div>
        </div>
    );
}
