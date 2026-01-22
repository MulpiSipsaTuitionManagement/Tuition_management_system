import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { API } from '../api/api';

const Calendar = ({ isAdmin = false, onDayClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [data, setData] = useState({
        schedules: [],
        holidays: [],
        events: []
    });
    const [loading, setLoading] = useState(true);

    const fetchCalendarData = async () => {
        setLoading(true);
        try {
            const [schedulesRes, holidaysRes, eventsRes] = await Promise.all([
                API.schedules.getAll({ range: 'all' }),
                API.holidays.getAll(),
                API.events.getAll()
            ]);

            setData({
                schedules: schedulesRes.data || [],
                holidays: holidaysRes.data || [],
                events: eventsRes.data || []
            });
        } catch (err) {
            console.error('Failed to fetch calendar data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate]);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const days = [];

        // Padding for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-14 lg:h-20 border border-slate-50/50"></div>);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            const daySchedules = data.schedules.filter(s => s.schedule_date?.substring(0, 10) === dateStr);
            const dayHolidays = data.holidays.filter(h => h.holiday_date?.substring(0, 10) === dateStr);
            const dayEvents = data.events.filter(e => e.event_date?.substring(0, 10) === dateStr);

            let bgColor = 'bg-white';
            let dotColor = '';
            let tooltipContent = '';

            if (dayHolidays.length > 0) {
                bgColor = 'bg-red-100';
                dotColor = 'bg-red-600';
                tooltipContent = `Holiday: ${dayHolidays[0].name}`;
            } else if (dayEvents.length > 0) {
                bgColor = 'bg-yellow-100';
                dotColor = 'bg-yellow-500';
                tooltipContent = `Event: ${dayEvents[0].title}`;
            } else if (daySchedules.length > 0) {
                bgColor = 'bg-green-100';
                dotColor = 'bg-green-500';
                tooltipContent = `${daySchedules.length} Class(es) Scheduled`;
            }

            days.push(
                <div
                    key={day}
                    onClick={() => onDayClick && (isAdmin || dayHolidays.length > 0 || dayEvents.length > 0) && onDayClick({
                        date: dateStr,
                        holiday: dayHolidays[0],
                        event: dayEvents[0],
                        type: dayHolidays.length > 0 ? 'holiday' : dayEvents.length > 0 ? 'event' : 'none'
                    })}
                    className={`h-14 lg:h-20 border border-slate-50 relative group cursor-pointer transition-all hover:bg-purple-100 ${bgColor}`}
                    title={tooltipContent}
                >
                    <span className={`absolute top-2 left-2 text-[10px] font-bold ${isToday ? 'bg-purple-600 text-white w-5 h-5 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>
                        {day}
                    </span>
                    {dotColor && (
                        <div className={`absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`}></div>
                    )}

                    {/* Tooltip emulation */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                        {tooltipContent || 'No events'}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                    </div>
                </div>
            )
        }

        return days;
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                        <CalendarIcon size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Monthly Outlook</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-t border-l border-slate-50 rounded-xl overflow-hidden shadow-sm">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50/50 border-r border-b border-slate-50">
                        {day}
                    </div>
                ))}
                {renderDays()}
            </div>

            <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Classes</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Holidays</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Events</span>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
