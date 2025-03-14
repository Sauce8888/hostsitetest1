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

    // Check availability for the dates with a simplified query approach
    const { data: existingBookings, error: availabilityError } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'completed')
      .lte('check_in', data.checkOut)
      .gte('check_out', data.checkIn);

    if (availabilityError) {
      console.error("Availability check error:", availabilityError);
      return NextResponse.json(
        { error: "Failed to check availability" },
        { status: 500 }
      );
    }

    // If the function returns any results, the dates are not available
    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        { error: "Selected dates are not available" },
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
        property_id: data.propertyId || null
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