import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, Shield, Camera } from 'lucide-react';
import Card from '../Cards/Card';
import { API, getFileUrl } from '../api/api';

export default function Profile() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [loading, setLoading] = useState(false);

    const profile = user?.profile;
    const role = user?.role;

    const renderDetail = (icon, label, value) => (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-purple-600">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-slate-700">{value || 'Not provided'}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header Profile Card */}
            <Card className="p-8 bg-gradient-to-br from-purple-600 to-purple-900  border-none overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-900/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                <div className="relative flex flex-col md:flex-row items-center gap-8 text-white">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-white/10 backdrop-blur-md">
                            {profile?.profile_photo ? (
                                <img
                                    src={getFileUrl(profile.profile_photo)}
                                    alt={profile.full_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User size={48} className="text-white/50" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                            <h2 className="text-3xl font-extrabold tracking-tight">{profile?.full_name || user?.username}</h2>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {role}
                            </span>
                        </div>
                        <p className="text-purple-100 font-medium opacity-90">
                            {role === 'admin' ? 'System Administrator' : role === 'tutor' ? 'Faculty Member' : 'Enrolled Student'}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                            <div className="flex items-center gap-2 text-sm text-purple-50">
                                <Mail size={14} className="opacity-70" />
                                <span>{profile?.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-purple-50">
                                <Shield size={14} className="opacity-70" />
                                <span>ID: {role === 'tutor' ? profile?.tutor_id : role === 'student' ? profile?.student_id : user?.user_id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Quick Stats/Actions */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 border-b pb-2">Account Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">Joined On</span>
                                <span className="text-xs font-bold text-slate-700">
                                    {new Date(profile?.join_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) || new Date(profile?.enrollment_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) || 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">Member Since</span>
                                <span className="text-xs font-bold text-slate-700">2024</span>
                            </div>
                            <div className="pt-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                    ACTIVE ACCOUNT
                                </div>
                            </div>
                        </div>
                    </Card>

                    {role === 'student' && (
                        <Card className="p-6 bg-purple-50 border-purple-100">
                            <h3 className="text-sm font-bold text-purple-900 mb-4">Current Grade</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                                    <GraduationCap size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-purple-600 font-bold uppercase tracking-widest leading-none mb-1">Grade</p>
                                    <p className="text-xl font-black text-purple-900">{profile?.grade || 'Not Assigned'}</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {role === 'tutor' && (
                        <Card className="p-6 bg-purple-50 border-purple-100">
                            <h3 className="text-sm font-bold text-purple-900 mb-4">Experience</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-purple-600 font-bold uppercase tracking-widest leading-none mb-1">Total</p>
                                    <p className="text-xl font-black text-purple-900">{profile?.experience || '0'}</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Columns - Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <User size={20} className="text-purple-600" />
                                Personal Information
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {renderDetail(<User size={18} />, "Full Name", profile?.full_name)}
                            {renderDetail(<Shield size={18} />, "NIC/ID Number", profile?.nic)}
                            {renderDetail(<Calendar size={18} />, "Date of Birth", new Date(profile?.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }))}
                            {renderDetail(<Shield size={18} />, "Gender", profile?.gender)}
                        </div>
                    </Card>

                    <Card className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Phone size={20} className="text-purple-600" />
                                Contact Details
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {renderDetail(<Mail size={18} />, "Email Address", profile?.email)}
                            {renderDetail(<Phone size={18} />, "Contact Number", profile?.contact_no)}
                            <div className="sm:col-span-2">
                                {renderDetail(<MapPin size={18} />, "Residential Address", profile?.address)}
                            </div>
                            {profile?.emergency_contact &&
                                <div className="sm:col-span-2">
                                    {renderDetail(<Phone size={18} />, "Emergency Contact", profile?.emergency_contact)}
                                </div>
                            }
                        </div>
                    </Card>

                    {role === 'tutor' && (
                        <Card className="p-8">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                                <Briefcase size={20} className="text-purple-600" />
                                Professional Background
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {renderDetail(<GraduationCap size={18} />, "Qualification", profile?.qualification)}
                                {renderDetail(<Briefcase size={18} />, "Joined Date", new Date(profile?.join_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }))}
                            </div>
                        </Card>
                    )}

                    {role === 'student' && (
                        <Card className="p-8">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                                <User size={20} className="text-purple-600" />
                                Guardian Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {renderDetail(<User size={18} />, "Guardian Name", profile?.guardian_name)}
                                {renderDetail(<Phone size={18} />, "Guardian Contact", profile?.guardian_contact)}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
