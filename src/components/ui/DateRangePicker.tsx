'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

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

// Match the database schema
type UnavailableDate = {
  id: string;
  property_id: string;
  date: string;
  reason: string;
  event_id: string;
};

// Match the database schema for bookings
type Booking = {
  id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  status: string;
  guest_name: string;
  guest_email: string;
};

export default function DateRangePicker({
  onDateRangeChange,
  property_id = '123e4567-e89b-12d3-a456-426614174000',
  minDate = new Date(),
  maxDate
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<DateInfo[]>([]);
  const [selectingEndDate, setSelectingEndDate] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Fetch unavailable dates and bookings when component mounts or property_id changes
  useEffect(() => {
    if (property_id) {
      fetchUnavailableDates(property_id);
      fetchBookings(property_id);
    }
  }, [property_id]);

  // Add a refresh timer to periodically check for updates
  useEffect(() => {
    // Refresh data every 2 minutes if the component is visible
    const refreshInterval = setInterval(() => {
      if (property_id && document.visibilityState === 'visible') {
        fetchUnavailableDates(property_id);
        fetchBookings(property_id);
      }
    }, 120000); // 2 minutes
    
    // Refresh when the user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          property_id && 
          Date.now() - lastFetchTime > 60000) { // Only refresh if it's been more than a minute
        fetchUnavailableDates(property_id);
        fetchBookings(property_id);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [property_id, lastFetchTime]);

  // Generate calendar days whenever month, unavailable dates, or bookings change
  useEffect(() => {
    console.log('Regenerating calendar days...');
    console.log('Unavailable dates count:', unavailableDates.length);
    console.log('Bookings count:', bookings.length);
    generateCalendarDays();
    console.log('Calendar days regenerated with unavailable dates and bookings');
  }, [currentMonth, minDate, maxDate, unavailableDates, bookings]);

  // Method to manually refresh availability
  const refreshAvailability = () => {
    if (property_id) {
      setError(null);
      setIsLoading(true);
      // Add a message to let users know a refresh is in progress
      console.log("Refreshing availability...");
      
      Promise.all([
        fetchUnavailableDates(property_id),
        fetchBookings(property_id)
      ]).then(() => {
        // Update the calendar with latest data
        generateCalendarDays();
        console.log("Availability refreshed successfully");
      }).catch(err => {
        console.error("Error refreshing availability:", err);
        setError("Failed to refresh availability");
      }).finally(() => {
        setIsLoading(false);
      });
    }
  };

  const fetchUnavailableDates = async (propertyId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure correct ID is included in the URL
      const url = `/api/properties/${propertyId}/unavailable-dates`;
      
      console.log('Fetching unavailable dates from URL:', url);
      
      const response = await fetch(url, {
        // Add cache control headers to avoid stale data
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch unavailable dates: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received unavailable dates response:', data);
      
      // Convert string dates to Date objects
      const unavailableDateObjects: Date[] = [];
      
      // The API returns an array of individual unavailable dates
      if (data.unavailableDates && Array.isArray(data.unavailableDates)) {
        data.unavailableDates.forEach((dateItem: UnavailableDate) => {
          const dateObj = new Date(dateItem.date);
          unavailableDateObjects.push(dateObj);
        });
        
        console.log('Parsed unavailable dates:', unavailableDateObjects.length, unavailableDateObjects);
        setUnavailableDates(unavailableDateObjects);
      } else {
        // Handle unexpected data format
        console.warn('Unexpected unavailable dates format:', data);
        throw new Error('Received unexpected data format from API');
      }
      
      setLastFetchTime(Date.now());
    } catch (err) {
      console.error('Error fetching unavailable dates:', err);
      setError('Unable to load availability data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async (propertyId: string) => {
    try {
      const url = `/api/properties/${propertyId}/bookings`;
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.bookings && Array.isArray(data.bookings)) {
        console.log('Bookings data received:', data.bookings);
        console.log('Booking statuses:', data.bookings.map((b: Booking) => b.status));
        setBookings(data.bookings);
      } else {
        // Handle unexpected data format
        console.warn('Unexpected booking data format:', data);
        throw new Error('Received unexpected data format from API');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Unable to load booking data. Please try again later.');
    }
  };

  // Check if a date is within any booking range
  const isDateBooked = (date: Date): boolean => {
    // No bookings to check
    if (!bookings || bookings.length === 0) {
      return false;
    }
    
    // Reset time part for accurate comparison
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    const dateTime = dateToCheck.getTime();
    
    // For debugging - log on the first day of the current month
    if (date.getDate() === 1 && date.getMonth() === currentMonth.getMonth()) {
      console.log('Checking bookings for current month. Total bookings:', bookings.length);
      console.log('Booking date ranges:', bookings.map(b => ({
        status: b.status,
        checkIn: new Date(b.check_in).toISOString().split('T')[0],
        checkOut: new Date(b.check_out).toISOString().split('T')[0]
      })));
    }
    
    // Check against all active bookings
    for (const booking of bookings) {
      // Skip cancelled bookings - this matches the backend check
      if (booking.status === 'cancelled') {
        continue;
      }
      
      try {
        // Handle different date formats safely
        let checkInDate, checkOutDate;
        
        try {
          checkInDate = new Date(booking.check_in);
          if (isNaN(checkInDate.getTime())) throw new Error('Invalid check-in date');
        } catch (err) {
          console.error('Invalid check_in date format:', booking.check_in);
          continue; // Skip this booking
        }
        
        try {
          checkOutDate = new Date(booking.check_out);
          if (isNaN(checkOutDate.getTime())) throw new Error('Invalid check-out date');
        } catch (err) {
          console.error('Invalid check_out date format:', booking.check_out);
          continue; // Skip this booking
        }
        
        checkInDate.setHours(0, 0, 0, 0);
        checkOutDate.setHours(0, 0, 0, 0);
        
        // A date is booked if it falls on or between check-in and check-out dates
        if (dateTime >= checkInDate.getTime() && dateTime < checkOutDate.getTime()) {
          // For debugging - log matches
          if (date.getDate() === 15 && date.getMonth() === currentMonth.getMonth()) {
            console.log('Date is booked:', date.toISOString().split('T')[0], 'by booking:', {
              status: booking.status,
              checkIn: checkInDate.toISOString().split('T')[0],
              checkOut: checkOutDate.toISOString().split('T')[0]
            });
          }
          return true;
        }
      } catch (err) {
        console.error('Error processing booking dates:', err);
      }
    }
    
    return false;
  };

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

  // Check if date is available based on min/max dates, unavailable dates, and bookings
  const isDateAvailable = (date: Date): boolean => {
    // Check against min and max dates
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
    
    // Normalize the date - remove time component for accurate comparison
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    const dateTimeToCheck = dateToCheck.getTime();
    
    // For debugging
    if (date.getDate() === 1 && date.getMonth() === currentMonth.getMonth()) {
      console.log('Current unavailable dates:', unavailableDates.length, unavailableDates);
    }
    
    // Check against explicit unavailable dates - fast path
    if (unavailableDates.length > 0) {
      // First try a direct comparison
      for (const unavailableDate of unavailableDates) {
        if (!unavailableDate) continue; // Skip if undefined
        
        const unavailableDateCopy = new Date(unavailableDate);
        unavailableDateCopy.setHours(0, 0, 0, 0);
        
        if (dateTimeToCheck === unavailableDateCopy.getTime()) {
          // This is an explicitly unavailable date
          return false;
        }
      }
    }
    
    // Check if date is part of any booking
    const isBooked = isDateBooked(date);
    
    // For debugging specific dates
    if (date.getDate() === 15 && date.getMonth() === currentMonth.getMonth()) {
      console.log('Is date booked check for:', date.toISOString().split('T')[0], isBooked);
    }
    
    if (isBooked) {
      return false;
    }
    
    // If we get here, the date is available
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

  // Effect to track changes to unavailable dates
  useEffect(() => {
    console.log('Unavailable dates updated:', unavailableDates.length);
  }, [unavailableDates]);

  // Add function to check if a date is booked without availability check
  const isDateInBookedPeriod = (date: Date): boolean => {
    if (!bookings || bookings.length === 0) return false;
    
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    const dateTime = dateToCheck.getTime();
    
    for (const booking of bookings) {
      // Skip cancelled bookings to match backend logic
      if (booking.status === 'cancelled') {
        continue;
      }
      
      try {
        const checkInDate = new Date(booking.check_in);
        if (isNaN(checkInDate.getTime())) continue;
        
        const checkOutDate = new Date(booking.check_out);
        if (isNaN(checkOutDate.getTime())) continue;
        
        checkInDate.setHours(0, 0, 0, 0);
        checkOutDate.setHours(0, 0, 0, 0);
        
        if (dateTime >= checkInDate.getTime() && dateTime < checkOutDate.getTime()) {
          return true;
        }
      } catch (err) {
        // Skip problematic bookings
      }
    }
    
    return false;
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
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handlePrevMonth()}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="font-medium">
              {getMonthName(currentMonth.getMonth())} {currentMonth.getFullYear()}
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={refreshAvailability}
                className={`p-1 mr-1 rounded-md hover:bg-gray-100 ${isLoading ? 'bg-blue-50' : ''}`}
                aria-label="Refresh availability"
                title={isLoading ? "Refreshing availability..." : "Refresh availability"}
                disabled={isLoading}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && refreshAvailability()}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-blue-500' : 'text-gray-500'}`} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-md hover:bg-gray-100"
                aria-label="Next month"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNextMonth()}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
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

            {isLoading && (
              <div className="text-center py-2 text-sm text-blue-500 bg-blue-50 rounded mb-2 flex items-center justify-center">
                <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                Refreshing availability...
              </div>
            )}

            {error && (
              <div className="text-center py-2 text-sm text-red-500 bg-red-50 rounded mb-2">
                {error}
              </div>
            )}

            {/* Calendar legend */}
            <div className="flex justify-start gap-3 mb-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-100 rounded-sm mr-1"></div>
                <span>Unavailable</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-100 rounded-sm mr-1"></div>
                <span>Booked</span>
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
                
                // Check if date is in a booked period (regardless of availability)
                const isBooked = isDateInBookedPeriod(day.date);
                
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
                      ${!day.isAvailable && !isBooked ? 'cursor-not-allowed bg-gray-100 line-through' : ''}
                      ${!day.isAvailable && isBooked ? 'cursor-not-allowed bg-red-100 text-red-800' : ''}
                      ${day.isAvailable ? 'hover:bg-gray-100' : ''}
                      ${isStart || isEnd ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                      ${inRange ? 'bg-blue-100 text-blue-800' : ''}
                    `}
                    aria-label={`${day.date.getDate()} ${getMonthName(day.date.getMonth())}, ${day.date.getFullYear()}, ${day.isAvailable ? 'available' : isBooked ? 'booked' : 'unavailable'}`}
                    tabIndex={day.isAvailable ? 0 : -1}
                    onKeyDown={(e) => e.key === 'Enter' && handleDateClick(day.date, day.isAvailable)}
                  >
                    {day.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {property_id && (
            <div className="text-xs text-gray-500 mt-2 px-2 pb-2">
              Property ID: {property_id}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 