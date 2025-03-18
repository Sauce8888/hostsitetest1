import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing from environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async ({
  customerEmail,
  amount,
  bookingId,
  bookingDetails,
}: {
  customerEmail: string;
  amount: number; // in cents
  bookingId: string;
  bookingDetails: {
    checkIn: string;
    checkOut: string;
    guests: number;
  };
}) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Accommodation Booking',
            description: `Stay from ${bookingDetails.checkIn} to ${bookingDetails.checkOut} for ${bookingDetails.guests} guest(s)`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancel`,
    customer_email: customerEmail,
    metadata: {
      bookingId,
    },
  });

  return session;
};

export const constructWebhookEvent = (payload: string, signature: string) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is missing from environment variables');
  }
  
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: Error | unknown) {
    throw new Error(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};