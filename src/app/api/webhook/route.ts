import { NextResponse } from 'next/server';
import { stripe, constructWebhookEvent } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

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
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
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
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'completed' })
          .eq('id', bookingId);
          
        if (error) {
          console.error('Error updating booking status:', error);
          return NextResponse.json(
            { error: 'Error updating booking status' },
            { status: 500 }
          );
        }
        
        // Here you could also:
        // 1. Send confirmation email to customer
        // 2. Notify property owner of new booking
        // 3. Update availability calendar
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