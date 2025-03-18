import { NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (error: Error | unknown) {
    console.error(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return NextResponse.json(
      { error: `Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      
      // Extract the booking ID from the metadata
      const bookingId = session.metadata?.bookingId;
      
      if (bookingId) {
        // Update the booking status to completed
        const { data: booking, error } = await supabase
          .from('bookings')
          .update({ status: 'completed' })
          .eq('id', bookingId)
          .select('*')
          .single();
          
        if (error) {
          console.error('Error updating booking status:', error);
          return NextResponse.json(
            { error: 'Error updating booking status' },
            { status: 500 }
          );
        }
        
        // Update availability calendar by adding days to the unavailable_dates table
        if (booking) {
          try {
            const checkIn = new Date(booking.check_in);
            const checkOut = new Date(booking.check_out);
            const propertyId = booking.property_id;
            const eventId = uuidv4(); // Same event ID for the entire booking period
            
            // Generate dates between check-in and check-out (inclusive)
            const unavailableDates = getDatesInRange(checkIn, checkOut).map(date => ({
              id: uuidv4(),
              property_id: propertyId,
              date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
              reason: "Booked",
              event_id: eventId
            }));
            
            // Add all dates to the unavailable_dates table
            const { error: insertError } = await supabase
              .from('unavailable_dates')
              .insert(unavailableDates);
              
            if (insertError) {
              console.error('Error adding unavailable dates:', insertError);
            } else {
              console.log(`Added ${unavailableDates.length} unavailable dates for booking ${bookingId}`);
            }
          } catch (err) {
            console.error('Error processing unavailable dates:', err);
          }
        }
        
        // Send confirmation email to customer
        // TODO: Implement email notification
      }
      break;
    }
    
    case 'checkout.session.expired': {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      
      if (bookingId) {
        // Update the booking status to cancelled
        await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId);
      }
      break;
    }
    
    // Handle other event types
    case 'payment_intent.succeeded':
    case 'payment_intent.created':
    case 'charge.succeeded':
    case 'charge.updated':
      // Just log these events for now
      console.log(`Processed event: ${event.type}`);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

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