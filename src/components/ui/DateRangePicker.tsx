'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type DateInfo = {
  date: Date;
  isCurrentMonth: boolean;
  isAvailable: boolean;
};

type DateRangePickerProps = {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  property_id?: string;
  minDate?: Date;
  maxDate?: Date;
};

export default function DateRangePicker({
  onDateRangeChange,
  property_id,
  minDate = new Date(),
  maxDate
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<DateInfo[]>([]);
  const [selectingEndDate, setSelectingEndDate] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Generate calendar days whenever month changes
  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth, minDate, maxDate]);

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

  // Simplified isDateAvailable function - only check min/max dates
  const isDateAvailable = (date: Date): boolean => {
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
  };

  // Handle date selection
  const handleDateClick = (date: Date, isAvailable: boolean) => {
    if (!isAvailable) return;
    
    if (!startDate || (startDate && endDate) || date < startDate) {
      // Start new selection or reset if we already have a range
      setStartDate(date);
      setEndDate(null);
      setSelectingEndDate(true);
      onDateRangeChange(date, null);
    } else {
      // Complete selection
      setEndDate(date);
      setSelectingEndDate(false);
      onDateRangeChange(startDate, date);
    }
  };

  // Handle date hover for preview
  const handleDateHover = (date: Date) => {
    if (selectingEndDate) {
      setHoverDate(date);
    }
  };

  // Check if date is in the selected range
  const isInRange = (date: Date) => {
    if (!startDate) return false;
    
    const end = endDate || hoverDate;
    if (!end) return false;
    
    return date > startDate && date < end;
  };

  // Navigate to previous month
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getMonthName = (month: number) => {
    return new Date(0, month).toLocaleString('default', { month: 'long' });
  };

  // Format display date
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="p-2 flex">
        <div className="w-full">
          <div className="flex items-center justify-between p-2 border-b">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="font-medium">
              {getMonthName(currentMonth.getMonth())} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="p-2">
            {/* Dates display */}
            <div className="flex justify-between text-sm mb-4 mt-1">
              <div className="font-medium">
                {startDate ? formatDate(startDate) : 'Check-in'}
              </div>
              <div className="mx-2">→</div>
              <div className="font-medium">
                {endDate ? formatDate(endDate) : 'Check-out'}
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isStart = startDate && 
                  startDate.getDate() === day.date.getDate() && 
                  startDate.getMonth() === day.date.getMonth() && 
                  startDate.getFullYear() === day.date.getFullYear();
                  
                const isEnd = endDate && 
                  endDate.getDate() === day.date.getDate() && 
                  endDate.getMonth() === day.date.getMonth() && 
                  endDate.getFullYear() === day.date.getFullYear();
                  
                const inRange = isInRange(day.date);
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateClick(day.date, day.isAvailable)}
                    onMouseEnter={() => handleDateHover(day.date)}
                    disabled={!day.isAvailable}
                    className={`
                      h-9 w-full flex items-center justify-center rounded-md text-xs relative
                      ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                      ${!day.isAvailable ? 'cursor-not-allowed bg-gray-100 line-through' : 'hover:bg-gray-100'}
                      ${isStart || isEnd ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                      ${inRange ? 'bg-blue-100 text-blue-800' : ''}
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
        </div>
      </div>
    </div>
  );
} 