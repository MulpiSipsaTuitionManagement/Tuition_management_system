import { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, User, Lock, Mail, ChevronRight, CheckCircle2, History, Smartphone } from 'lucide-react';
import Card from '../Cards/Card';

export default function Settings() {
    const [activeSection, setActiveSection] = useState('profile');
    const user = JSON.parse(localStorage.getItem('user'));

    const sections = [
        { id: 'profile', label: 'Edit Profile', icon: User, description: 'Update your personal information' },
        { id: 'security', label: 'Security', icon: Shield, description: 'Manage password and account safety' },
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Configure alerts and reminders' },
    ];

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    defaultValue={user.profile?.full_name}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    defaultValue={user.profile?.email}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Contact No</label>
                                <input
                                    type="text"
                                    defaultValue={user.profile?.contact_no}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Address</label>
                                <textarea
                                    rows="3"
                                    defaultValue={user.profile?.address}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all font-medium text-sm outline-none resize-none"
                                ></textarea>
                            </div>
                        </div>
                        <button className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all">
                            Save Changes
                        </button>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Lock size={16} className="text-purple-600" />
                                Change Password
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 transition-all outline-none" />
                                </div>
                            </div>
                            <button className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all">
                                Update Password
                            </button>
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <History size={16} className="text-purple-600" />
                                Recent Login Activity
                            </h4>
                            <div className="space-y-3">
                                {[
                                    { device: 'Windows PC • Lahore, PK', time: 'Just now', current: true },
                                    { device: 'iPhone 13 • Karachi, PK', time: '2 days ago', current: false },
                                ].map((login, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400">
                                                <Smartphone size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">{login.device}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">{login.time}</p>
                                            </div>
                                        </div>
                                        {login.current && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 uppercase tracking-wider">Current</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-800">Communication Preferences</h4>
                            <div className="space-y-3">
                                {[
                                    { label: 'Email Notifications', desc: 'Receive updates about attendance and marks via email', default: true },
                                    { label: 'SMS Alerts', desc: 'Critical alerts sent to your mobile phone', default: false },
                                    { label: 'Portal Announcements', desc: 'In-app notifications for general news', default: true },
                                ].map((pref, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group">
                                        <div className="pr-8">
                                            <p className="text-sm font-bold text-slate-700">{pref.label}</p>
                                            <p className="text-xs text-slate-500 font-medium">{pref.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked={pref.default} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all">
                            Save Preferences
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">
                        Account Settings
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Manage your profile, security and preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full items-start">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex flex-col gap-0.5 p-4 rounded-2xl transition-all text-left ${isActive
                                        ? 'bg-white shadow-xl shadow-purple-500/10 border-l-4 border-purple-600'
                                        : 'hover:bg-white/50 border-l-4 border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isActive ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Icon size={18} />
                                    </div>
                                    <span className={`text-sm font-bold ${isActive ? 'text-purple-900' : 'text-slate-500'}`}>
                                        {section.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <Card className="lg:col-span-3 p-8 min-h-[500px]">
                    <div className="mb-8 pb-4 border-b">
                        <h3 className="text-xl font-bold text-slate-900 leading-none">
                            {sections.find(s => s.id === activeSection).label}
                        </h3>
                        <p className="text-sm text-slate-500 mt-2 font-medium">
                            {sections.find(s => s.id === activeSection).description}
                        </p>
                    </div>
                    {renderSectionContent()}
                </Card>
            </div>
        </div>
    );
}
