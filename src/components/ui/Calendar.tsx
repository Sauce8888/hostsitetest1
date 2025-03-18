'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CalendarProps = {
  onDateSelect: (date: Date | null) => void;
  selectedDate: Date | null;
  minDate?: Date;
  maxDate?: Date;
};

type DateInfo = {
  date: Date;
  isCurrentMonth: boolean;
  isAvailable: boolean;
};

const Calendar = ({
  onDateSelect,
  selectedDate,
  minDate = new Date(),
  maxDate,
}: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<DateInfo[]>([]);

  // Memoize isDateAvailable function with useCallback
  const isDateAvailable = useCallback((date: Date): boolean => {
    // Check against min and max dates without modifying them
    if (minDate) {
      const minDateCopy = new Date(minDate);
      minDateCopy.setHours(0, 0, 0, 0);
      if (date < minDateCopy) {
        return false;
      }
    }
    
    if (maxDate) {
      const maxDateCopy = new Date(maxDate);
      maxDateCopy.setHours(23, 59, 59, 999);
      if (date > maxDateCopy) {
        return false;
      }
    }
    
    return true;
  }, [minDate, maxDate]);

  // Generate calendar days whenever month changes
  useEffect(() => {
    const generateCalendarDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // First day of the month
      const firstDayOfMonth = new Date(year, month, 1);
      // Last day of the month
      const lastDayOfMonth = new Date(year, month + 1, 0);
      
      // Day of the week for the first day (0 is Sunday, 1 is Monday, etc.)
      const firstDayWeekday = firstDayOfMonth.getDay();
      
      // Generate array of all days to display in the calendar
      const days: DateInfo[] = [];
      
      // Add days from previous month to fill the first week
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = firstDayWeekday - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i);
        days.push({
          date,
          isCurrentMonth: false,
          isAvailable: isDateAvailable(date)
        });
      }
      
      // Add days of current month
      for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const date = new Date(year, month, day);
        days.push({
          date,
          isCurrentMonth: true,
          isAvailable: isDateAvailable(date)
        });
      }
      
      // Fill remaining slots with days from next month
      const remainingSlots = 42 - days.length; // 6 rows of 7 days
      for (let day = 1; day <= remainingSlots; day++) {
        const date = new Date(year, month + 1, day);
        days.push({
          date,
          isCurrentMonth: false,
          isAvailable: isDateAvailable(date)
        });
      }
      
      setCalendarDays(days);
    };

    generateCalendarDays();
  }, [currentMonth, isDateAvailable]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Handle date selection
  const handleDateClick = (date: Date, isAvailable: boolean) => {
    if (!isAvailable) return;
    onDateSelect(date);
  };

  const getMonthName = (month: number) => {
    return new Date(0, month).toLocaleString('default', { month: 'long' });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border">
      {/* Calendar header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button 
          type="button"
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Previous month"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handlePrevMonth()}
        >
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-base font-medium text-gray-900">
          {getMonthName(currentMonth.getMonth())} {currentMonth.getFullYear()}
        </h2>
        <button 
          type="button"
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Next month"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleNextMonth()}
        >
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="p-4 pb-6">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days - removed loading state since we're not loading anything */}
        <div className="grid grid-cols-7 gap-2 min-h-[280px]">
          {calendarDays.map((day, index) => {
            const isSelected = selectedDate && 
              selectedDate.getDate() === day.date.getDate() && 
              selectedDate.getMonth() === day.date.getMonth() && 
              selectedDate.getFullYear() === day.date.getFullYear();
              
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleDateClick(day.date, day.isAvailable)}
                disabled={!day.isAvailable}
                className={`
                  h-10 flex items-center justify-center rounded-md text-sm
                  ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                  ${!day.isAvailable ? 'cursor-not-allowed bg-gray-100 line-through' : 'hover:bg-gray-100'}
                  ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                `}
                aria-label={`${day.date.getDate()} ${getMonthName(day.date.getMonth())}, ${day.date.getFullYear()}, ${day.isAvailable ? 'available' : 'unavailable'}`}
                tabIndex={day.isAvailable ? 0 : -1}
                onKeyDown={(e) => e.key === 'Enter' && handleDateClick(day.date, day.isAvailable)}
              >
                {day.date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="border-t p-4 text-sm text-gray-600 flex items-center">
        <div className="flex items-center mr-4">
          <div className="w-4 h-4 bg-gray-100 rounded-sm mr-2"></div>
          <span>Unavailable</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 