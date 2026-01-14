import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Rocket, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ActivityCalendar = ({ activities = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);

    useEffect(() => {
        generateCalendar(currentDate);
    }, [currentDate, activities]);

    const generateCalendar = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Adjust for Monday start (0 = Sunday, 1 = Monday, etc.)
        // We want Monday (1) to be index 0. Sunday (0) to be index 6.
        const startingDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        const days = [];

        // Previous month days
        for (let i = startingDayIndex - 1; i >= 0; i--) {
            days.push({
                day: daysInPrevMonth - i,
                type: 'prev',
                date: new Date(year, month - 1, daysInPrevMonth - i)
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDayDate = new Date(year, month, i);
            // Check if there's an activity on this day
            // Activity date format from Strava is usually ISO string "2023-10-27T..."
            const hasActivity = activities.find(activity => {
                const actDate = new Date(activity.start_date_local || activity.start_date);
                return actDate.getDate() === i &&
                    actDate.getMonth() === month &&
                    actDate.getFullYear() === year;
            });

            days.push({
                day: i,
                type: 'current',
                active: !!hasActivity,
                date: currentDayDate,
                activity: hasActivity
            });
        }

        // Next month days to fill the grid (42 cells total for 6 rows)
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                day: i,
                type: 'next',
                date: new Date(year, month + 1, i)
            });
        }

        setCalendarDays(days);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const currentMonthActivities = activities.filter(activity => {
        const actDate = new Date(activity.start_date_local || activity.start_date);
        return actDate.getMonth() === currentDate.getMonth() &&
            actDate.getFullYear() === currentDate.getFullYear();
    });

    return (
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-white text-sm capitalize">
                    Tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
                </span>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2 text-center">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                    <div key={day} className="text-[10px] font-medium text-slate-500">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-1 gap-x-1">
                <AnimatePresence mode="wait">
                    {calendarDays.map((dateObj, index) => (
                        <div
                            key={`${dateObj.type}-${dateObj.day}-${index}`}
                            className="flex items-center justify-center aspect-square"
                        >
                            <div className={`
                                w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-all
                                ${dateObj.type === 'current' ? 'text-gray-300' : 'text-gray-700'}
                                ${dateObj.active ? 'bg-[#D32F2F] text-white shadow-lg shadow-red-900/40' : 'bg-white/5'}
                            `}>
                                {dateObj.active ? (
                                    <Rocket size={10} fill="white" />
                                ) : (
                                    dateObj.day
                                )}
                            </div>
                        </div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Rocket size={12} className="text-[#D32F2F]" />
                <span>{currentMonthActivities.length} hoạt động</span>
            </div>
        </div>
    );
};

export default ActivityCalendar;
