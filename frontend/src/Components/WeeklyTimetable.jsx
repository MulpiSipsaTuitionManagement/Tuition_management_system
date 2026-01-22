import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { API } from '../api/api';

const WeeklyTimetable = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekData, setWeekData] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWeekData = async () => {
        setLoading(true);
        try {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            const [schedulesRes, holidaysRes, eventsRes] = await Promise.all([
                API.students.getMyTimetable(), // Note: The API might need range support, but let's filter locally for now
                API.holidays.getAll(),
                API.events.getAll()
            ]);

            setWeekData(schedulesRes.data || []);
            setHolidays(holidaysRes.data || []);
            setEvents(eventsRes.data || []);
        } catch (err) {
            console.error('Failed to fetch timetable data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeekData();
    }, [currentDate]);

    const getDaysOfWeek = () => {
        const start = new Date(currentDate);
        start.setDate(currentDate.getDate() - currentDate.getDay());
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d;
        });
    };

    const days = getDaysOfWeek();

    const nextWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
    };

    const prevWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                        <CalendarIcon size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">Study Schedule</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {days[0].toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} - {days[6].toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevWeek} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={nextWeek} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {days.map((day, idx) => {
                    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                    const daySchedules = weekData.filter(s => s.schedule_date?.substring(0, 10) === dateStr);
                    const dayHolidays = holidays.filter(h => h.holiday_date?.substring(0, 10) === dateStr);
                    const dayEvents = events.filter(e => e.event_date?.substring(0, 10) === dateStr);
                    const isToday = new Date().toDateString() === day.toDateString();

                    return (
                        <div key={idx} className={`p-4 rounded-3xl border transition-all ${isToday ? 'bg-white border-purple-200 shadow-lg shadow-purple-500/5' : 'bg-slate-50/50 border-slate-100'}`}>
                            <div className="text-center mb-4">
                                <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-purple-600' : 'text-slate-400'}`}>
                                    {day.toLocaleDateString(undefined, { weekday: 'short' })}
                                </p>
                                <p className={`text-lg font-black mt-1 ${isToday ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {day.getDate()}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {dayHolidays.map((h, i) => (
                                    <div key={i} className="p-2.5 bg-red-50 border border-red-100 rounded-2xl">
                                        <p className="text-[10px] font-black text-red-700 uppercase tracking-tight leading-tight">{h.name}</p>
                                        <p className="text-[8px] text-red-400 font-bold mt-1 uppercase">Holiday</p>
                                    </div>
                                ))}

                                {dayEvents.map((e, i) => (
                                    <div key={i} className="p-2.5 bg-yellow-50 border border-yellow-100 rounded-2xl">
                                        <p className="text-[10px] font-black text-yellow-700 uppercase tracking-tight leading-tight">{e.title}</p>
                                        <p className="text-[8px] text-yellow-500 font-bold mt-1 uppercase">Special Event</p>
                                    </div>
                                ))}

                                {daySchedules.map((s, i) => (
                                    <div key={i} className="p-2.5 bg-green-50 border border-green-100 rounded-2xl group hover:bg-green-100 transition-colors">
                                        <p className="text-[10px] font-black text-green-700 uppercase tracking-tight leading-tight">{s.subject?.subject_name}</p>
                                        <div className="flex items-center gap-1 text-[8px] text-green-500 font-bold mt-1 uppercase">
                                            <Clock size={8} />
                                            {s.start_time.slice(0, 5)}
                                        </div>
                                    </div>
                                ))}

                                {daySchedules.length === 0 && dayHolidays.length === 0 && dayEvents.length === 0 && (
                                    <div className="h-12 flex items-center justify-center">
                                        <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeeklyTimetable;
