import React, { useState, useEffect, useRef } from 'react';

interface CustomDatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
}

const DAYS_OF_WEEK = ['日', '一', '二', '三', '四', '五', '六'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, placeholder = '日/月/年' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) {
            setViewDate(new Date(value));
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const days = [];
    // Previous month padding
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(currentYear, currentMonth - 1, prevMonthDays - i) });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, isCurrentMonth: true, date: new Date(currentYear, currentMonth, i) });
    }
    // Next month padding
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
        days.push({ day: i, isCurrentMonth: false, date: new Date(currentYear, currentMonth + 1, i) });
    }

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    };

    const formatDateValue = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSelectDate = (d: Date) => {
        onChange(formatDateValue(d));
        setIsOpen(false);
    };

    // Format to display like "DD/MM/YYYY" or "YYYY-MM-DD"
    const displayValue = value ? value.replace(/-/g, '/') : '';

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-x-border rounded-lg text-x-text text-[13px] font-medium transition-colors hover:bg-x-bgHover min-w-[120px] justify-between cursor-pointer"
            >
                <span>{displayValue || placeholder}</span>
                <svg className="w-4 h-4 text-x-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-72 bg-[#1A1A1A] sm:bg-[#202327] dark:bg-[#16181c] shadow-[0_0_15px_rgba(255,255,255,0.15)] rounded-xl z-50 p-3 border border-x-border flex flex-col user-select-none">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4 px-2">
                        <div className="font-bold text-x-text text-[15px]">
                            {currentYear}年{String(currentMonth + 1).padStart(2, '0')}月
                        </div>
                        <div className="flex gap-1">
                            <button onClick={handlePrevMonth} className="p-1 hover:bg-x-primary/10 rounded-full text-x-textMuted hover:text-x-text transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={handleNextMonth} className="p-1 hover:bg-x-primary/10 rounded-full text-x-textMuted hover:text-x-text transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Days Header */}
                    <div className="grid grid-cols-7 mb-2">
                        {DAYS_OF_WEEK.map((day, i) => (
                            <div key={i} className="text-center text-xs text-x-textMuted font-medium py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-y-1 gap-x-0">
                        {days.map((item, i) => {
                            const isSelected = value ? isSameDay(item.date, new Date(value)) : false;
                            const isToday = isSameDay(item.date, new Date());
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleSelectDate(item.date)}
                                    className={`
                    w-8 h-8 mx-auto flex items-center justify-center rounded-full text-[13px] transition-all
                    ${!item.isCurrentMonth ? 'text-x-textMuted opacity-40 hover:opacity-100' : 'text-x-text hover:bg-x-primary/20'}
                    ${isSelected ? 'bg-x-primary !text-white !opacity-100 font-bold hover:bg-x-primary' : ''}
                    ${isToday && !isSelected ? 'text-x-primary !opacity-100 font-bold' : ''}
                  `}
                                >
                                    {item.day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-x-border px-2">
                        <button onClick={() => { onChange(''); setIsOpen(false); }} className="text-[13px] text-x-textMuted hover:text-x-text transition-colors">
                            清除
                        </button>
                        <button onClick={() => { onChange(formatDateValue(new Date())); setIsOpen(false); }} className="text-[13px] text-x-primary hover:text-x-primary/80 font-bold transition-colors">
                            今天
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
