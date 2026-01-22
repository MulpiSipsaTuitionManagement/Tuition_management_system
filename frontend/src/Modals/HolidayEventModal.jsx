import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Star, Trash2, Save } from 'lucide-react';
import Card from '../Cards/Card';
import { API } from '../api/api';

const HolidayEventModal = ({ isOpen, onClose, selectedDate, existingData, onSave }) => {
    const [type, setType] = useState('holiday'); // 'holiday' or 'event'
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        description: '',
        date: selectedDate || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (existingData) {
                setType(existingData.type);
                setFormData({
                    name: existingData.name || '',
                    title: existingData.title || '',
                    description: existingData.description || '',
                    date: existingData.date || selectedDate
                });
            } else {
                setType('holiday');
                setFormData({
                    name: '',
                    title: '',
                    description: '',
                    date: selectedDate || ''
                });
            }
            setError('');
        }
    }, [isOpen, existingData, selectedDate]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let res;
            console.log('Submitting holiday/event:', { type, formData });
            if (type === 'holiday') {
                const data = { name: formData.name, holiday_date: formData.date };
                if (existingData?.holiday_id) {
                    res = await API.holidays.update(existingData.holiday_id, data);
                } else {
                    res = await API.holidays.create(data);
                }
            } else {
                const data = { title: formData.title, description: formData.description, event_date: formData.date };
                if (existingData?.event_id) {
                    res = await API.events.update(existingData.event_id, data);
                } else {
                    res = await API.events.create(data);
                }
            }

            if (res.success) {
                onSave();
                onClose();
            } else {
                setError(res.message || 'Failed to save');
            }
        } catch (err) {
            console.error('Submission error:', err.response?.data);
            const errorData = err.response?.data;
            if (errorData?.errors) {
                const firstError = Object.values(errorData.errors)[0][0];
                setError(firstError);
            } else {
                setError(errorData?.message || 'An error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this?')) return;
        setLoading(true);
        try {
            let res;
            if (type === 'holiday') {
                res = await API.holidays.delete(existingData.holiday_id);
            } else {
                res = await API.events.delete(existingData.event_id);
            }
            if (res.success) {
                onSave();
                onClose();
            }
        } catch (err) {
            setError('Failed to delete');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <Card noPadding className="w-full max-w-md overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center p-6 bg-slate-50 border-b border-slate-100">
                    <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                        {existingData ? 'Edit' : 'Add'} {type === 'holiday' ? 'Holiday' : 'Event'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {!existingData && (
                        <div className="flex p-1 bg-slate-100 rounded-xl space-x-1">
                            <button
                                type="button"
                                onClick={() => setType('holiday')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'holiday' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Flag size={14} className="inline mr-1.5" /> Holiday
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('event')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'event' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Star size={14} className="inline mr-1.5" /> Event
                            </button>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-medium outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {type === 'holiday' ? (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Holiday Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Independence Day"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-medium outline-none"
                                    required
                                />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Science Fair"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-medium outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Details about the event..."
                                        rows="3"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-medium outline-none resize-none"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {error && <p className="text-[10px] font-bold text-red-500 bg-red-50 p-2 rounded-lg text-center uppercase tracking-wider">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        {existingData && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-[2] py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <><Save size={16} /> {existingData ? 'Update' : 'Save'}</>
                            )}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default HolidayEventModal;
