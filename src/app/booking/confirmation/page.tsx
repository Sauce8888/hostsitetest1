"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle, Clock, Download, MapPin, Users } from "lucide-react";

// Define the booking type
type BookingDetails = {
  confirmationCode: string;
  propertyName: string;
  location?: string;
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  guests: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  total: number;
  createdAt: string;
  status: string;
};

// Default booking details for fallback
const defaultBookingDetails: BookingDetails = {
  confirmationCode: "BOK-12345678",
  propertyName: "Mountain View Retreat",
  location: "Blue Ridge Mountains, NC",
  checkIn: "2023-07-15",
  checkOut: "2023-07-20",
  checkInTime: "3:00 PM",
  checkOutTime: "11:00 AM",
  guests: 4,
  firstName: "Guest",
  lastName: "User",
  email: "guest@example.com",
  phone: "+1 (555) 123-4567",
  total: 1109,
  createdAt: new Date().toISOString(),
  status: "confirmed"
};

export default function BookingConfirmation() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>(defaultBookingDetails);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get booking details from sessionStorage
    const storedBooking = sessionStorage.getItem('bookingConfirmation');
    
    if (storedBooking) {
      try {
        const parsedBooking = JSON.parse(storedBooking);
        // Add default values for any missing properties
        setBookingDetails({
          ...defaultBookingDetails,
          ...parsedBooking,
        });
      } catch (error) {
        console.error('Error parsing booking details:', error);
        // If there's an error, we'll use the default booking details
      }
    } else {
      // If no booking found in sessionStorage, this might be a direct navigation
      // In a real app, you might want to redirect to the home page or fetch from an API
      console.warn('No booking details found in session storage');
    }
    
    setIsLoading(false);
  }, []);

  // Host information - this would typically come from a database
  const host = {
    name: "Sarah Johnson",
    phone: "+1 (555) 123-4567",
    email: "sarah@example.com"
  };

  // Format dates for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return as is if invalid date
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Calculate price breakdown
  const priceBreakdown = {
    nights: 5, // This should be calculated from checkIn and checkOut
    pricePerNight: Math.round(bookingDetails.total / 5.8), // Approximate for demo
    cleaningFee: 85,
    serviceFee: 79
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link 
          href="/" 
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          tabIndex={0}
          aria-label="Return to home"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Return to home
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-green-50 p-6 border-b">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
                <p className="text-green-600">Confirmation #{bookingDetails.confirmationCode}</p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">{bookingDetails.propertyName}</h2>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{bookingDetails.location || "Blue Ridge Mountains, NC"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Check-in</h3>
                    <p className="text-gray-700">{formatDate(bookingDetails.checkIn)}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>After {bookingDetails.checkInTime || "3:00 PM"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Check-out</h3>
                    <p className="text-gray-700">{formatDate(bookingDetails.checkOut)}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Before {bookingDetails.checkOutTime || "11:00 AM"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                <Users className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">Guests</h3>
                  <p className="text-gray-700">{bookingDetails.guests} guests</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Guest Information</h3>
              <p className="mb-1"><span className="font-medium">Name:</span> {bookingDetails.firstName} {bookingDetails.lastName}</p>
              <p className="mb-1"><span className="font-medium">Email:</span> {bookingDetails.email}</p>
              <p><span className="font-medium">Phone:</span> {bookingDetails.phone}</p>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>${priceBreakdown.pricePerNight} x {priceBreakdown.nights} nights</span>
                  <span>${priceBreakdown.pricePerNight * priceBreakdown.nights}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>${priceBreakdown.cleaningFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>${priceBreakdown.serviceFee}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total (USD)</span>
                  <span>${bookingDetails.total}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Host Information</h3>
              <p className="mb-1"><span className="font-medium">Host:</span> {host.name}</p>
              <p className="mb-1"><span className="font-medium">Phone:</span> {host.phone}</p>
              <p><span className="font-medium">Email:</span> {host.email}</p>
            </div>
            
            <div className="border-t pt-6 flex justify-between">
              <button
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                tabIndex={0}
                aria-label="Download booking confirmation"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Confirmation
              </button>
              
              <button
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                tabIndex={0}
                aria-label="Add to calendar"
              >
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-600">
          <p>Need help with your booking?</p>
          <p className="mt-1">
            <Link 
              href="#" 
              className="text-blue-600 hover:text-blue-500"
              tabIndex={0}
              aria-label="Contact support"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 