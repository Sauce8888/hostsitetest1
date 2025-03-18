import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get unavailable dates from the database
const getUnavailableDatesForProperty = async (propertyId: string) => {
  console.log('Getting unavailable dates for property:', propertyId);
  
  try {
    // Get unavailable dates from the dedicated table
    const { data: unavailableDates, error: unavailableError } = await supabase
      .from('unavailable_dates')
      .select('*')
      .eq('property_id', propertyId);
      
    if (unavailableError) {
      console.error('Error fetching unavailable dates:', unavailableError);
      return { error: 'Failed to fetch unavailable dates' };
    }
    
    // Also get dates from confirmed bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .eq('status', 'completed');
      
    if (bookingsError) {
      console.error('Error fetching booked dates:', bookingsError);
      return { error: 'Failed to fetch booked dates' };
    }
    
    // Convert booking ranges to individual dates
    const bookedDates = [];
    
    for (const booking of bookings || []) {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      const dates = getDatesInRange(checkIn, checkOut);
      
      for (const date of dates) {
        bookedDates.push({
          id: `booking-${booking.id}-${date.toISOString().split('T')[0]}`,
          property_id: propertyId,
          date: date.toISOString().split('T')[0],
          reason: 'Booked',
          event_id: `booking-${booking.id}`
        });
      }
    }
    
    // Combine both sources of unavailable dates
    const allUnavailableDates = [
      ...(unavailableDates || []),
      ...bookedDates
    ];
    
    console.log(`Found ${allUnavailableDates.length} unavailable dates for property ${propertyId}`);
    
    return { unavailableDates: allUnavailableDates };
  } catch (error) {
    console.error('Error in getUnavailableDatesForProperty:', error);
    return { error: 'Failed to process unavailable dates' };
  }
};

// Helper function to get all dates between start and end dates (inclusive)
function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates = [];
  const currentDate = new Date(startDate);
  
  // Remove time components to ensure we're working with full days
  currentDate.setHours(0, 0, 0, 0);
  
  const lastDate = new Date(endDate);
  lastDate.setHours(0, 0, 0, 0);
  
  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// For Next.js 15, the proper way to handle dynamic params in route handlers
export async function GET(
  request: Request,
  context: { params: { propertyId: string } }
) {
  try {
    // Properly awaiting params in Next.js 15
    const params = await Promise.resolve(context.params);
    const propertyId = params.propertyId;
    
    console.log('API received property ID:', propertyId);
    
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }
    
    // Get unavailable dates for this property
    const response = await getUnavailableDatesForProperty(propertyId);
    
    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in unavailable dates API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unavailable dates' },
      { status: 500 }
    );
  }
} 