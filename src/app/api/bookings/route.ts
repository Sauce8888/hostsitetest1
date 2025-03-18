import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    console.log("Booking API request:", {
      route: request.url,
      body: data,
    });

    // Validate required fields
    const requiredFields = [
      "firstName", "lastName", "email", "phone",
      "checkIn", "checkOut", "guests", "totalPrice"
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Get the property ID from the request or use a default if not provided
    const propertyId = data.propertyId || '123e4567-e89b-12d3-a456-426614174000';
    
    // First check if any of the dates are explicitly marked as unavailable
    // This matches the DateRangePicker's first availability check
    const { data: unavailableDates, error: unavailableError } = await supabase
      .from('unavailable_dates')
      .select('date')
      .eq('property_id', propertyId)
      .gte('date', data.checkIn)
      .lt('date', data.checkOut);
      
    if (unavailableError) {
      console.error("Unavailable dates check error:", unavailableError);
      return NextResponse.json(
        { error: "Failed to check date availability" },
        { status: 500 }
      );
    }
    
    // If we found any dates in the unavailable_dates table, reject the booking
    if (unavailableDates && unavailableDates.length > 0) {
      console.log("Found unavailable dates:", unavailableDates);
      return NextResponse.json(
        { error: "Selected dates are not available", unavailableDates },
        { status: 400 }
      );
    }
    
    // Then check for overlapping bookings - consider ALL statuses except 'cancelled'
    // This matches the DateRangePicker's booking availability check
    const { data: existingBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .not('status', 'eq', 'cancelled')
      .or(`check_in.lte.${data.checkOut},check_out.gt.${data.checkIn}`);

    if (bookingsError) {
      console.error("Booking availability check error:", bookingsError);
      return NextResponse.json(
        { error: "Failed to check booking availability" },
        { status: 500 }
      );
    }

    // If the function returns any results, the dates overlap with existing bookings
    if (existingBookings && existingBookings.length > 0) {
      console.log("Found overlapping bookings:", existingBookings.map(b => ({
        id: b.id,
        status: b.status,
        checkIn: b.check_in,
        checkOut: b.check_out
      })));
      
      return NextResponse.json(
        { error: "Selected dates are not available", conflictingBookings: existingBookings.length },
        { status: 400 }
      );
    }

    // Generate a booking confirmation code
    const confirmationCode = `BOK-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Create a booking record in Supabase
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        guest_name: `${data.firstName} ${data.lastName}`,
        guest_email: data.email,
        guest_phone: data.phone,
        check_in: data.checkIn,
        check_out: data.checkOut,
        guests_count: data.guests,
        special_requests: data.specialRequests || '',
        status: 'pending',
        payment_id: '',
        property_id: propertyId
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking creation error:", bookingError);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    // Create a Stripe checkout session
    const session = await createCheckoutSession({
      customerEmail: data.email,
      amount: Math.round(data.totalPrice * 100), // Convert to cents
      bookingId: booking.id,
      bookingDetails: {
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: data.guests
      }
    });

    // Update the booking with the Stripe session ID
    await supabase
      .from('bookings')
      .update({ payment_id: session.id })
      .eq('id', booking.id);

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      redirectUrl: session.url,
      booking: {
        confirmationCode,
        ...data,
        createdAt: new Date().toISOString(),
        status: "pending"
      }
    });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: "Failed to process booking" },
      { status: 500 }
    );
  }
} 