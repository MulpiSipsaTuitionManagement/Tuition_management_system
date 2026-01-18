import React from 'react';
import { Megaphone, Users, Calendar, X, Send, User } from 'lucide-react';
import Card from '../Cards/Card';

const AnnouncementDetailsModal = ({ announcement, onClose }) => {
    if (!announcement) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <Card noPadding className="w-full max-w-2xl overflow-hidden border-l-4 border-l-purple-500 shadow-2xl">
                <div className="p-0">
                    {/* Header */}
                    <div className="flex justify-between items-start p-6 bg-slate-50 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                    <Megaphone className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-900 leading-tight">
                                    {announcement.title}
                                </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                                <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded shadow-sm">
                                    <Users className="w-3.5 h-3.5" />
                                    Target: {announcement.audience === 'all' ? 'Everyone' :
                                        announcement.audience === 'students' ? 'Students' : 'Tutors'}
                                </span>
                                <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded shadow-sm">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(announcement.created_at).toLocaleDateString(undefined, {
                                        day: 'numeric', month: 'long', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                                {announcement.scope !== 'entire_system' && (
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded shadow-sm">
                                        {announcement.scope === 'class' ? announcement.school_class?.class_name : announcement.subject?.subject_name}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-sm bg-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium text-lg">
                            {announcement.message}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <User className="w-4 h-4" />
                            </div>
                            <span>
                                Posted by <span className="text-purple-600">{announcement.creator?.username || 'System'}</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-green-600 font-extrabold uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                            <Send className="w-3 h-3" />
                            Delivered via Dashboard & SMS Alerts
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AnnouncementDetailsModal;
