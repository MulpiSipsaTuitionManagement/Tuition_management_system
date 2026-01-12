import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, BookOpen, Clock, Calendar, Mail, Phone, MapPin,
    Briefcase, CreditCard, Award, DollarSign, Edit, ArrowLeft,
    CheckCircle, ShieldCheck, GraduationCap, Users, Layers, History
} from 'lucide-react';
import { API, getFileUrl } from '../api/api';
import PageHeader from '../Components/PageHeader';
import Card from '../Cards/Card';

export default function TutorDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTutor = async () => {
            try {
                const res = await API.tutors.getById(id);
                if (res.success) {
                    setTutor(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch tutor details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTutor();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold">Accessing faculty vault...</p>
            </div>
        );
    }

    if (!tutor) return (
        <div className="p-20 text-center">
            <ShieldCheck size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Record Not Found</h3>
            <p className="text-slate-500 mt-2">The faculty member you are looking for does not exist in our systems.</p>
            <button onClick={() => navigate('/tutors')} className="mt-6 text-purple-600 font-bold hover:underline">Return to Directory</button>
        </div>
    );

    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Faculty', onClick: () => navigate('/tutors') },
        { label: tutor.full_name, active: true }
    ];

    const actions = (
        <button
            onClick={() => navigate(`/tutors/${tutor.tutor_id}/edit`)}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all transform hover:-translate-y-0.5 active:scale-95 font-bold"
        >
            <Edit size={18} />
            <span>Update Profile</span>
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 animate-fade-in">
            <PageHeader
                title="Faculty Intelligence"
                breadcrumbs={breadcrumbs}
                onBack={() => navigate('/tutors')}
                actions={actions}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
                {/* Profile Identity Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-0 overflow-hidden border-slate-200/60 shadow-xl shadow-purple-50">
                        <div className="h-20  relative">
                            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 p-1.5 bg-white rounded-[1rem] shadow-xl">

                                {tutor.profile_photo ? (
                                    <img
                                        src={getFileUrl(tutor.profile_photo)}
                                        alt={tutor.full_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    tutor.full_name?.charAt(0).toUpperCase()
                                )}

                            </div>
                        </div>

                        <div className="pt-20 pb-6 px-6 text-center">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{tutor.full_name}</h2>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1 mb-6 italic">Faculty Identity #{tutor.tutor_id}</p>

                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 rounded-full border border-green-100 mb-8">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Active Status</span>
                            </div>

                            <div className="space-y-4 border-t border-slate-50 pt-2 mt-2 text-left">
                                <div className="flex justify-between items-center group">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Joined Date</span>
                                    <span className="text-xs font-extrabold text-slate-700 group-hover:text-purple-600 transition-colors">
                                        {tutor.join_date ? new Date(tutor.join_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Monthly Pay</span>
                                    <span className="text-xs font-black text-purple-600">LKR {tutor.basic_salary ? parseFloat(tutor.basic_salary).toLocaleString() : '0.00'}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-slate-200/60 shadow-md bg-white">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-purple-500" />
                            Compliance Data
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">NIC</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5">{tutor.nic || 'Not Verified'}</p>
                            </div>
                            <button
                                onClick={() => navigate(`/tutors/${tutor.tutor_id}/salaries`)}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-50 text-purple-600 rounded-xl font-bold text-xs hover:bg-purple-600 hover:text-white transition-all group"
                            >
                                <History size={14} className="group-hover:rotate-[-45deg] transition-transform" />
                                <span>Financial History</span>
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Main Profile Content */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Assigned Portfolio Section */}
                    <Card className="p-8 border-slate-200/60 shadow-xl shadow-purple-50 bg-white overflow-hidden relative">
                        <BookOpen className="absolute -right-12 -top-12 w-48 h-48 text-purple-50 rotate-12 -z-0" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 border border-purple-100">
                                    <Layers size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Academic Portfolio</h3>
                                    <p className="text-xs text-slate-500 font-medium">Current teaching assignments and grade responsibilities</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tutor.subjects && tutor.subjects.length > 0 ? (
                                    tutor.subjects.map((subject) => (
                                        <div
                                            key={subject.subject_id}
                                            className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-white hover:shadow-lg transition-all group"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-2 bg-white rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                                    <BookOpen size={16} />
                                                </div>
                                                <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-widest">{subject.school_class?.class_name || 'Grade ' + subject.grade}</span>
                                            </div>
                                            <h4 className="font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors truncate">{subject.subject_name}</h4>
                                            <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <Users size={12} />
                                                    <span>{subject.total_students || 0} Students</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                        <Layers className="mx-auto text-slate-300 mb-3" size={32} />
                                        <p className="text-sm font-bold text-slate-500 italic">No academic assignments identified for this faculty.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Personal & Professional Insight */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="p-8 border-slate-200/60 shadow-md bg-white h-full">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                                    <GraduationCap size={22} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Professional Details</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Qualifications</label>
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed bg-slate-50/50 border p-5 rounded-2xl border-slate-100">
                                        {tutor.qualification || 'Academic qualifications not yet cataloged.'}
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Professional Experience</label>
                                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600 leading-relaxed bg-slate-50/50 border p-5 rounded-2xl border-slate-100">
                                        <Clock size={18} />
                                        <span>{tutor.experience || 'Experience records pending.'}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 border-slate-200/60 shadow-md bg-white h-full">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 border border-purple-100">
                                    <Mail size={22} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Contact Information</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-purple-400"><Phone size={16} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Mobile Number</p>
                                        <p className="text-xs font-semibold text-slate-700">{tutor.contact_no || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-purple-400"><Mail size={16} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Email</p>
                                        <p className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">{tutor.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-50/50 border border-red-100">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-red-500"><Phone size={16} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">Emergency Hotline</p>
                                        <p className="text-sm font-black text-red-700">{tutor.emergency_contact || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card className="p-8 border-slate-200/60 shadow-md bg-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600 border border-slate-200">
                                <MapPin size={22} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Residential Intelligence</h3>
                        </div>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl">
                            {tutor.address || 'Address information not formally documented.'}
                        </p>
                    </Card>
                </div>
            </div >
        </div >
    );
}
