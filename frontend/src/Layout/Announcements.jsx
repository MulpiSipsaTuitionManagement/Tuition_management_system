import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Send, Users, Calendar, Trash2, Plus } from 'lucide-react';
import Card from '../Cards/Card';
import { API } from '../api/api';
import { toast } from 'react-hot-toast';

const Announcements = () => {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const result = await API.announcements.getAll();
            if (result.success) {
                setAnnouncements(result.data);
            }
        } catch (error) {
            toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await API.announcements.delete(id);
            toast.success('Deleted');
            fetchAnnouncements();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const isAdminOrTutor = user.role === 'admin' || user.role === 'tutor';

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <Megaphone className="w-8 h-8" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                            Announcements
                        </span>
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Keep up with the latest updates from the management.</p>
                </div>

                {isAdminOrTutor && (
                    <button
                        onClick={() => navigate('/announcements/create')}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-purple-200 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        New Announcement
                    </button>
                )}
            </div>

            {/* Announcements List */}
            <div className="grid gap-6">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : announcements.length > 0 ? (
                    announcements.map((announcement) => (
                        <Card key={announcement.announcement_id} className="overflow-hidden border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold text-slate-900">{announcement.title}</h3>
                                            {announcement.scope !== 'entire_system' && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                                    {announcement.scope === 'class' ? announcement.school_class?.class_name : announcement.subject?.subject_name}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5" />
                                                Target: {announcement.audience === 'all' ? 'Everyone' :
                                                    announcement.audience === 'students' ? 'Students' : 'Tutors'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(announcement.created_at).toLocaleDateString(undefined, {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                            <span className="text-purple-500 italic">
                                                - Posted by {announcement.creator?.username || 'System'}
                                            </span>
                                        </div>
                                    </div>

                                    {user.user_id === announcement.created_by && (
                                        <button
                                            onClick={() => handleDelete(announcement.announcement_id)}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                <div className="mt-4 text-slate-600 whitespace-pre-wrap leading-relaxed font-medium">
                                    {announcement.message}
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-[10px] text-green-600 font-extrabold uppercase tracking-widest">
                                    <Send className="w-3 h-3" />
                                    Delivered via Dashboard & SMS Alerts
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-slate-100">
                        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner shadow-slate-200/50">
                            <Megaphone className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">No Announcements Yet</h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">
                            All important updates and system alerts will appear here. Check back later!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Announcements;
