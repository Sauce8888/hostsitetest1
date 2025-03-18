# Host Site Booking System

A simple and elegant booking system for hosts to accept reservations and payments from customers.

## Features

- Modern, responsive UI built with Next.js and Tailwind CSS
- Secure payment processing with Stripe
- Database storage with Supabase
- Booking management system
- Availability calendar
- Email notifications
- Mobile-friendly design

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase and Stripe credentials

4. Set up Supabase:
   - Create a new Supabase project
   - Create a `bookings` table with the following schema:
     ```sql
     create table bookings (
       id uuid default uuid_generate_v4() primary key,
       created_at timestamp with time zone default now(),
       first_name text not null,
       last_name text not null,
       email text not null,
       phone text not null,
       check_in date not null,
       check_out date not null,
       guests integer not null,
       total_price numeric not null,
       confirmation_code text not null,
       payment_status text not null,
       stripe_session_id text
     );
     ```

5. Set up Stripe:
   - Create a Stripe account
   - Get your API keys from the Stripe dashboard
   - Set up a webhook endpoint for `https://your-domain.com/api/webhook`
   - Add the webhook secret to your `.env` file

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository

2. Connect your repository to Vercel:
   - Sign in to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the Next.js framework preset

3. Configure environment variables:
   - Add all variables from your `.env` file to the Vercel project settings
   - Make sure to update `NEXT_PUBLIC_APP_URL` to your production URL

4. Deploy:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

5. Set up the Stripe webhook for your production URL:
   - Go to the Stripe dashboard
   - Navigate to Developers > Webhooks
   - Add a new webhook endpoint: `https://your-vercel-domain.com/api/webhook`
   - Select the events to listen for (typically `checkout.session.completed`)
   - Update the `STRIPE_WEBHOOK_SECRET` in your Vercel environment variables

### Post-Deployment Checks

- Verify that authentication with Supabase works correctly
- Test the booking process and payment flow
- Confirm that emails are being sent properly
- Check that the calendar is displaying availability correctly

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and API clients

## License

This project is licensed under the MIT License.
