'use client';

import Link from 'next/link';

export default function BookingCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="h-16 w-16 bg-yellow-100 text-yellow-500 rounded-full inline-flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mt-5 text-gray-900">Booking Cancelled</h1>
          
          <p className="mt-4 text-gray-600">
            Your booking was not completed because the payment process was cancelled.
          </p>
          
          <div className="mt-8 space-y-4">
            <Link 
              href="/booking"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              tabIndex={0}
              aria-label="Try booking again"
            >
              Try Again
            </Link>
            
            <Link 
              href="/"
              className="inline-block w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded border border-gray-300 transition-colors"
              tabIndex={0}
              aria-label="Return to home page"
            >
              Return to Home
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            If you have any questions or need assistance, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
} 