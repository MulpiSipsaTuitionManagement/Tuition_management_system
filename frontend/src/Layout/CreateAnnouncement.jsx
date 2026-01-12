import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Send, Info, ArrowLeft, Users, Layers, BookOpen } from 'lucide-react';
import Card from '../Cards/Card';
import { API } from '../api/api';
import { toast } from 'react-hot-toast';

const CreateAnnouncement = () => {
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        audience: 'all',
        scope: 'entire_system',
        class_id: '',
        subject_id: ''
    });

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        if (user.role !== 'admin' && user.role !== 'tutor') {
            navigate('/announcements');
            return;
        }
        fetchOptions();

        // If tutor, default audience is students
        if (user.role === 'tutor') {
            setFormData(prev => ({ ...prev, audience: 'students' }));
        }
    }, []);

    const fetchOptions = async () => {
        try {
            const [classesRes, subjectsRes] = await Promise.all([
                API.classes.getAll(),
                API.subjects.getAll()
            ]);
            setClasses(classesRes.data || []);
            setSubjects(subjectsRes.data || []);
        } catch (error) {
            console.error('Error fetching options', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await API.announcements.create(formData);
            if (result.success) {
                toast.success('Announcement broadcasted successfully via Feed & SMS');
                navigate('/announcements');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send announcement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/announcements')}
                        className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-purple-600 border border-transparent hover:border-purple-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Post Announcement</h1>
                        <p className="text-slate-500 text-sm">Reach out to students and staff instantly via multiple channels.</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-0 overflow-hidden border-none shadow-2xl shadow-purple-100/50">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Megaphone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Compose Message</h2>
                                    <p className="text-purple-100 text-xs">Craft your announcement carefully.</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Announcement Title</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Headline for your announcement..."
                                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium text-slate-900"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Content</label>
                                    <textarea
                                        required
                                        rows="6"
                                        placeholder="Write your message here. Be clear and concise. This content will also be sent as an SMS."
                                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all resize-none font-medium text-slate-900"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/announcements')}
                                    className="px-8 py-3.5 rounded-2xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all border border-transparent"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-10 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-purple-200 hover:shadow-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Post & Broadcast
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50 p-6 space-y-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                            Distribution Settings
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Audience</label>
                                <div className="grid gap-2">
                                    {['all', 'students', 'tutors'].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            disabled={user.role === 'tutor' && opt !== 'students'}
                                            onClick={() => setFormData({ ...formData, audience: opt })}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all font-semibold text-sm ${formData.audience === opt
                                                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                                                    : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'
                                                } ${user.role === 'tutor' && opt !== 'students' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <span className="capitalize">{opt === 'all' ? 'Everyone' : opt}</span>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.audience === opt ? 'border-purple-600 bg-purple-600' : 'border-slate-300'}`}>
                                                {formData.audience === opt && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Delivery Scope</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-purple-500 outline-none transition-all font-semibold text-slate-700"
                                    value={formData.scope}
                                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                                >
                                    {user.role === 'admin' && <option value="entire_system">Entire System</option>}
                                    <option value="class">Specific Class (Grade)</option>
                                    <option value="subject">Specific Subject</option>
                                </select>
                            </div>

                            {formData.scope === 'class' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Class</label>
                                    <div className="relative">
                                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            required
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-purple-500 outline-none transition-all font-semibold text-slate-700"
                                            value={formData.class_id}
                                            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                        >
                                            <option value="">Select a class...</option>
                                            {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {formData.scope === 'subject' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Subject</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            required
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-purple-500 outline-none transition-all font-semibold text-slate-700"
                                            value={formData.subject_id}
                                            onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                        >
                                            <option value="">Select a subject...</option>
                                            {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name} ({s.school_class?.class_name})</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="bg-amber-50 border-amber-100 p-6">
                        <div className="flex gap-4">
                            <div className="p-2 bg-amber-100 rounded-lg h-fit">
                                <Info className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-extrabold text-amber-900 text-sm">Delivery Notice</h4>
                                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                    Announcements are delivered via the web dashboard AND sent as **instant SMS alerts** to registered contact numbers of recipients and guardians.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CreateAnnouncement;
