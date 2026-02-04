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
    disabled = false,
    singleDate = false
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // Initialize current month to checkIn date if available, otherwise today
    const getInitialMonth = () => {
        if (checkIn && !isNaN(new Date(checkIn).getTime())) {
            return new Date(checkIn);
        }
        return new Date();
    };

    const [currentMonth, setCurrentMonth] = useState(getInitialMonth());
    const [selectingCheckOut, setSelectingCheckOut] = useState(false);
    const containerRef = useRef(null);

    // Update calendar view when checkIn changes externally
    useEffect(() => {
        if (checkIn && !isNaN(new Date(checkIn).getTime())) {
            const date = new Date(checkIn);
            // Only switch if year/month is different to avoid jitter
            // But allows opening straight to the correct month
            setCurrentMonth(date);
        }
    }, [checkIn]);

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

    // Find the first blocked date AFTER the selected checkIn
    // This acts as a barrier: you cannot book past this date
    const getBarrierDate = () => {
        if (!checkIn) return null;

        const checkInDate = new Date(checkIn);
        checkInDate.setHours(0, 0, 0, 0);

        // Find all start dates of blocked periods that are strictly after checkIn
        const futureBlocks = blockedDates
            .map(p => new Date(p.start))
            .filter(d => d > checkInDate)
            .sort((a, b) => a - b);

        return futureBlocks.length > 0 ? futureBlocks[0] : null;
    };

    const barrierDate = getBarrierDate();

    // Check if date is blocked
    const isBlocked = (date) => {
        if (!date) return false;

        // standard block check (is inside a blocked range)
        const isInsideBlock = blockedDates.some(period => {
            const start = new Date(period.start);
            const end = new Date(period.end);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return date >= start && date <= end;
        });

        if (isInsideBlock) return true;

        // Barrier check: if we have a checkIn and this date is beyond the next reservation
        if (checkIn && barrierDate) {
            // If date is same or after the barrier, it's unreachable
            // (We compare timestamps to be safe, ignoring time part for date itself if needed,
            // but here date comes from calendar loop usually set to specific times or we standardize)
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            const barrier = new Date(barrierDate);
            barrier.setHours(0, 0, 0, 0);

            if (d >= barrier) return true;
        }

        return false;
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

        // Only show range if it's valid (start < end) and doesn't cross barrier
        // (Though isBlocked prevents selecting past barrier, so range shouldn't exist ideally)
        return d > start && d < end;
    };

    // Handle date click
    const handleDateClick = (date) => {
        // isBlocked now includes the barrier logic, so we can't click past the barrier
        if (!date || isPast(date) || isBlocked(date)) return;

        // Format date as YYYY-MM-DD using local timezone (not UTC)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        if (singleDate) {
            onDateChange({ checkIn: dateStr, checkOut: '' });
            setIsOpen(false);
            return;
        }

        // DESELECT Logic: If clicking the start date again, reset everything
        if (checkIn === dateStr && !checkOut) {
            onDateChange({ checkIn: '', checkOut: '' });
            setSelectingCheckOut(false);
            return;
        }

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
                // Keep selectingCheckOut true to let them pick the end date immediately
                setSelectingCheckOut(true);
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

    // Format display - parse manually to avoid UTC issues
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        // Parse YYYY-MM-DD manually to avoid UTC offset
        const [year, month, day] = dateStr.split('-').map(Number);
        const d = new Date(year, month - 1, day);
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
                    <span className="date-range-picker__label">{singleDate ? 'Date' : 'Arrivée'}</span>
                    <span className="date-range-picker__value">
                        {checkIn ? formatDate(checkIn) : '-- / --'}
                    </span>
                </div>
                {!singleDate && (
                    <>
                        <span className="date-range-picker__arrow">→</span>
                        <div className="date-range-picker__field">
                            <span className="date-range-picker__label">Départ</span>
                            <span className="date-range-picker__value">
                                {checkOut ? formatDate(checkOut) : '-- / --'}
                            </span>
                        </div>
                    </>
                )}
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
