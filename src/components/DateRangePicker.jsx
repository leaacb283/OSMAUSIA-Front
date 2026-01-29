import { useState, useEffect, useRef } from 'react';
import './DateRangePicker.css';

/**
 * DateRangePicker - Custom calendar with blocked dates support
 * Shows a single calendar where user selects check-in then check-out
 */
const DateRangePicker = ({
    checkIn,
    checkOut,
    onDateChange,
    blockedDates = [],
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectingCheckOut, setSelectingCheckOut] = useState(false);
    const containerRef = useRef(null);

    const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get days in month
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];

        // Get day of week (0 = Sunday, adjust for Monday start)
        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;

        // Add empty slots for days before month start
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Add days of month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d));
        }

        return days;
    };

    // Check if date is blocked
    const isBlocked = (date) => {
        if (!date) return false;
        return blockedDates.some(period => {
            const start = new Date(period.start);
            const end = new Date(period.end);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return date >= start && date <= end;
        });
    };

    // Check if date is in the past
    const isPast = (date) => {
        if (!date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    // Check if date is selected
    const isSelected = (date) => {
        if (!date) return false;
        // Use local timezone formatting
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        return dateStr === checkIn || dateStr === checkOut;
    };

    // Check if date is in range
    const isInRange = (date) => {
        if (!date || !checkIn || !checkOut) return false;
        const d = date.getTime();
        const start = new Date(checkIn).getTime();
        const end = new Date(checkOut).getTime();
        return d > start && d < end;
    };

    // Handle date click
    const handleDateClick = (date) => {
        if (!date || isPast(date) || isBlocked(date)) return;

        // Format date as YYYY-MM-DD using local timezone (not UTC)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        if (!selectingCheckOut || !checkIn) {
            // Selecting check-in
            onDateChange({ checkIn: dateStr, checkOut: '' });
            setSelectingCheckOut(true);
        } else {
            // Selecting check-out
            if (new Date(dateStr) > new Date(checkIn)) {
                onDateChange({ checkIn, checkOut: dateStr });
                setIsOpen(false);
                setSelectingCheckOut(false);
            } else {
                // If selected date is before check-in, use it as new check-in
                onDateChange({ checkIn: dateStr, checkOut: '' });
            }
        }
    };

    // Navigate months
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    // Format display
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const days = getDaysInMonth(currentMonth);

    return (
        <div className="date-range-picker" ref={containerRef}>
            {/* Input Display */}
            <div
                className={`date-range-picker__input ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="date-range-picker__field">
                    <span className="date-range-picker__label">Arrivée</span>
                    <span className="date-range-picker__value">
                        {checkIn ? formatDate(checkIn) : '-- / --'}
                    </span>
                </div>
                <span className="date-range-picker__arrow">→</span>
                <div className="date-range-picker__field">
                    <span className="date-range-picker__label">Départ</span>
                    <span className="date-range-picker__value">
                        {checkOut ? formatDate(checkOut) : '-- / --'}
                    </span>
                </div>
            </div>

            {/* Calendar Dropdown */}
            {isOpen && (
                <div className="date-range-picker__calendar">
                    {/* Header */}
                    <div className="date-range-picker__header">
                        <button type="button" onClick={prevMonth} className="date-range-picker__nav">
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <span className="date-range-picker__month">
                            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <button type="button" onClick={nextMonth} className="date-range-picker__nav">
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 6l6 6-6 6" />
                            </svg>
                        </button>
                    </div>

                    {/* Hint */}
                    <div className="date-range-picker__hint">
                        {!checkIn ? 'Sélectionnez la date d\'arrivée' :
                            !checkOut ? 'Sélectionnez la date de départ' :
                                'Dates sélectionnées'}
                    </div>

                    {/* Days of week */}
                    <div className="date-range-picker__weekdays">
                        {DAYS.map(day => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="date-range-picker__days">
                        {days.map((date, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className={`date-range-picker__day ${!date ? 'empty' : ''
                                    } ${date && isPast(date) ? 'past' : ''
                                    } ${date && isBlocked(date) ? 'blocked' : ''
                                    } ${date && isSelected(date) ? 'selected' : ''
                                    } ${date && isInRange(date) ? 'in-range' : ''
                                    }`}
                                onClick={() => handleDateClick(date)}
                                disabled={!date || isPast(date) || isBlocked(date)}
                            >
                                {date?.getDate()}
                            </button>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="date-range-picker__legend">
                        <span className="date-range-picker__legend-item">
                            <span className="legend-dot blocked"></span> Indisponible
                        </span>
                        <span className="date-range-picker__legend-item">
                            <span className="legend-dot selected"></span> Sélectionné
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
