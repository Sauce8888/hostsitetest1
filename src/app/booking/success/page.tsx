'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Booking } from '@/lib/supabase';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!sessionId) {
        setError('Invalid session information');
        setLoading(false);
        return;
      }

      try {
        // Find the booking with this session ID
        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select('*')
          .eq('payment_id', sessionId)
          .single();

        if (fetchError || !data) {
          console.error('Booking fetch error:', fetchError);
          setError('Could not find your booking');
          setLoading(false);
          return;
        }

        // Update the booking status to completed if not already
        if (data.status !== 'completed') {
          await supabase
            .from('bookings')
            .update({ status: 'completed' })
            .eq('id', data.id);
        }

        // Transform data if necessary to match Booking type
        // Database might have fields like "guest_name" instead of "first_name"
        const transformedData: Booking = {
          id: data.id,
          created_at: data.created_at,
          // Handle name fields - they might be combined or separate
          first_name: data.first_name || (data.guest_name ? data.guest_name.split(' ')[0] : ''),
          last_name: data.last_name || (data.guest_name ? data.guest_name.split(' ').slice(1).join(' ') : ''),
          email: data.email || data.guest_email || '',
          phone: data.phone || data.guest_phone || '',
          check_in: data.check_in,
          check_out: data.check_out,
          guests: data.guests || data.guests_count || 0,
          // Handle potentially missing or differently named price field
          total_price: typeof data.total_price === 'number' ? data.total_price : 
                      (typeof data.total === 'number' ? data.total : 0),
          confirmation_code: data.confirmation_code || '',
          payment_status: data.payment_status || data.status || 'pending',
          stripe_session_id: data.stripe_session_id || data.payment_id || '',
        };

        setBooking(transformedData);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('An error occurred while retrieving your booking information');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-semibold mt-4">Processing your booking...</h2>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <div className="h-16 w-16 bg-red-100 text-red-500 rounded-full inline-flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mt-4">Booking Error</h2>
            <p className="mt-2 text-gray-600">{error || 'Something went wrong with your booking'}</p>
            <div className="mt-6">
              <Link 
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                tabIndex={0}
                aria-label="Return to home page"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-green-100 text-green-500 rounded-full inline-flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Booking Confirmed!</h1>
          
          <div className="border-t border-b border-gray-200 py-4 mb-4">
            <p className="text-center font-medium text-gray-700">Confirmation Code</p>
            <p className="text-center text-2xl font-bold text-blue-600 mt-1">{booking.confirmation_code}</p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Check-in</p>
                <p className="font-medium">{new Date(booking.check_in).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check-out</p>
                <p className="font-medium">{new Date(booking.check_out).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Guest Name</p>
              <p className="font-medium">{booking.first_name} {booking.last_name}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Number of Guests</p>
              <p className="font-medium">{booking.guests}</p>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Total Payment</p>
              <p className="font-bold text-xl">${booking?.total_price ? booking.total_price.toFixed(2) : '0.00'}</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              A confirmation email has been sent to {booking.email}
            </p>
            
            <Link 
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              tabIndex={0}
              aria-label="Return to home page"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 