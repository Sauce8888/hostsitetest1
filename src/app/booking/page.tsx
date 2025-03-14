"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CreditCard, Loader2, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function BookingPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get booking details from URL params or session storage
  const [bookingDetails, setBookingDetails] = useState({
    propertyName: "",
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 0,
    nights: 0,
    pricePerNight: 0,
    cleaningFee: 0,
    serviceFee: 0,
    total: 0,
  });
  
  useEffect(() => {
    // Try to get booking details from URL params first
    const propertyName = searchParams.get('propertyName') || "";
    const location = searchParams.get('location') || "";
    const checkIn = searchParams.get('checkIn') || "";
    const checkOut = searchParams.get('checkOut') || "";
    const guests = parseInt(searchParams.get('guests') || "0", 10);
    
    // If URL params are missing, try to get from session storage
    if (!propertyName || !checkIn || !checkOut) {
      const storedDetails = sessionStorage.getItem('selectedBookingDetails');
      if (storedDetails) {
        setBookingDetails(JSON.parse(storedDetails));
        setInitialLoading(false);
        return;
      }
    }
    
    // If we have URL params, calculate the rest of the details
    if (checkIn && checkOut) {
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // These values could come from your database in a real app
      const pricePerNight = 189;
      const cleaningFee = 85;
      const serviceFee = 79;
      const total = pricePerNight * nights + cleaningFee + serviceFee;
      
      const newDetails = {
        propertyName: propertyName || "Mountain View Retreat",
        location: location || "Blue Ridge Mountains, NC",
        checkIn,
        checkOut,
        guests: guests || 2,
        nights,
        pricePerNight,
        cleaningFee,
        serviceFee,
        total
      };
      
      setBookingDetails(newDetails);
      
      // Store in session for reference
      sessionStorage.setItem('selectedBookingDetails', JSON.stringify(newDetails));
    }
    
    setInitialLoading(false);
  }, [searchParams]);

  // If no valid booking details, redirect back to property page
  useEffect(() => {
    if (!initialLoading && (!bookingDetails.checkIn || !bookingDetails.checkOut)) {
      toast.error("Please select dates before proceeding to booking");
      router.push('/');
    }
  }, [initialLoading, bookingDetails, router]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    zipCode: "",
  });

  // Add validation state for form fields
  const [validationErrors, setValidationErrors] = useState({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    zipCode: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validation based on field type
    if (name === "cardNumber") {
      // Only allow numbers and spaces, maximum 19 characters (16 digits + 3 spaces)
      const strippedValue = value.replace(/\D/g, "").substring(0, 16);
      
      // Format with spaces after every 4 digits
      const formattedValue = strippedValue.replace(/(\d{4})(?=\d)/g, "$1 ");
      
      setFormData({
        ...formData,
        [name]: formattedValue,
      });
      
      // Validate card number (only show error if user has entered something)
      if (strippedValue && strippedValue.length < 16) {
        setValidationErrors({
          ...validationErrors,
          cardNumber: "Card number must be 16 digits",
        });
      } else if (strippedValue && !isValidCardNumber(strippedValue)) {
        setValidationErrors({
          ...validationErrors,
          cardNumber: "Please enter a valid card number",
        });
      } else {
        setValidationErrors({
          ...validationErrors,
          cardNumber: "",
        });
      }
    } else if (name === "cvc") {
      // Only allow numbers, maximum 4 characters
      const newValue = value.replace(/\D/g, "").substring(0, 4);
      setFormData({
        ...formData,
        [name]: newValue,
      });
      
      // Validate CVC (only show error if user has entered something)
      if (newValue && !/^\d{3,4}$/.test(newValue)) {
        setValidationErrors({
          ...validationErrors,
          cvc: "CVC must be 3-4 digits",
        });
      } else {
        setValidationErrors({
          ...validationErrors,
          cvc: "",
        });
      }
    } else if (name === "expiryDate") {
      // Format as MM/YY and validate
      let newValue = value.replace(/[^\d/]/g, "");
      
      // Auto-add slash after 2 digits if not already there
      if (newValue.length === 2 && !newValue.includes("/") && !value.includes("/")) {
        newValue += "/";
      }
      
      // Limit to 5 chars (MM/YY)
      newValue = newValue.substring(0, 5);
      
      setFormData({
        ...formData,
        [name]: newValue,
      });
      
      // Validate expiry date format and logic
      if (newValue && !/^\d{2}\/\d{2}$/.test(newValue)) {
        setValidationErrors({
          ...validationErrors,
          expiryDate: "Format must be MM/YY",
        });
      } else if (newValue && /^\d{2}\/\d{2}$/.test(newValue)) {
        // Check if date is valid
        const [month, year] = newValue.split("/");
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
        const currentMonth = currentDate.getMonth() + 1; // 1-12
        
        if (parseInt(month) < 1 || parseInt(month) > 12) {
          setValidationErrors({
            ...validationErrors,
            expiryDate: "Month must be 1-12",
          });
        } else if (
          parseInt(year) < currentYear || 
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)
        ) {
          setValidationErrors({
            ...validationErrors,
            expiryDate: "Card has expired",
          });
        } else {
          setValidationErrors({
            ...validationErrors,
            expiryDate: "",
          });
        }
      }
    } else if (name === "zipCode") {
      // Only allow alphanumeric characters for zip/postal code
      const newValue = value.replace(/[^a-zA-Z0-9\s-]/g, "").substring(0, 10);
      setFormData({
        ...formData,
        [name]: newValue,
      });
    } else if (name === "phone") {
      // Only allow numbers, spaces, dashes, parentheses, and plus sign for phone numbers
      const newValue = value.replace(/[^\d\s\-+()]/g, "").substring(0, 20);
      
      // Format phone number (simple formatting, just for demonstration)
      let formattedValue = newValue;
      // If US format, could enforce (XXX) XXX-XXXX format
      if (/^\d+$/.test(newValue) && newValue.length === 10) {
        formattedValue = newValue.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      }
      
      setFormData({
        ...formData,
        [name]: formattedValue,
      });
      
      // Validate phone (only show error if user has entered something)
      if (newValue && newValue.replace(/\D/g, "").length < 10) {
        setValidationErrors({
          ...validationErrors,
          phone: "Please enter a valid phone number",
        });
      } else {
        setValidationErrors({
          ...validationErrors,
          phone: "",
        });
      }
    } else {
      // For other fields, no special validation
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Simple Luhn algorithm check for card number validation
  const isValidCardNumber = (number: string): boolean => {
    // Return true for now - in a real app, you would implement the Luhn algorithm
    // This is a simplified validation just for demonstration
    return number.length === 16;
  };

  // Validate card details before submission
  const validateCardDetails = () => {
    const errors = {
      cardNumber: "",
      expiryDate: "",
      cvc: "",
      zipCode: "",
      phone: "",
    };
    
    let isValid = true;
    
    // Validate card number
    if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
      errors.cardNumber = "Please enter a valid 16-digit card number";
      isValid = false;
    }
    
    // Validate expiry date
    if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      errors.expiryDate = "Format must be MM/YY";
      isValid = false;
    } else {
      const [month, year] = formData.expiryDate.split("/");
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        errors.expiryDate = "Month must be 1-12";
        isValid = false;
      } else if (
        parseInt(year) < currentYear || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        errors.expiryDate = "Card has expired";
        isValid = false;
      }
    }
    
    // Validate CVC
    if (!/^\d{3,4}$/.test(formData.cvc)) {
      errors.cvc = "CVC must be 3-4 digits";
      isValid = false;
    }
    
    // Validate zip code
    if (!formData.zipCode.trim()) {
      errors.zipCode = "Zip code is required";
      isValid = false;
    }
    
    // Validate phone number
    if (formData.phone && formData.phone.replace(/\D/g, "").length < 10) {
      errors.phone = "Please enter a valid phone number";
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate card details before submission
    if (!validateCardDetails()) {
      toast.error("Please correct the payment information errors");
      return;
    }
    
    setLoading(true);

    // Simulate API call for booking
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          checkIn: bookingDetails.checkIn,
          checkOut: bookingDetails.checkOut,
          guests: bookingDetails.guests,
          propertyName: bookingDetails.propertyName,
          totalPrice: bookingDetails.total
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      // Redirect to Stripe checkout if URL is provided
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      
      toast.success("Booking confirmed! Check your email for details.");
      
      // Save the confirmation data to sessionStorage and redirect
      sessionStorage.setItem('bookingConfirmation', JSON.stringify(data.booking));
      router.push('/booking/confirmation');
      
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link 
          href="/" 
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          tabIndex={0}
          aria-label="Go back to property"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to property
        </Link>

        <h1 className="text-3xl font-bold mb-8">Complete your booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Guest Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        aria-invalid={!!validationErrors.phone}
                        aria-describedby={validationErrors.phone ? "phone-error" : undefined}
                      />
                      {validationErrors.phone && (
                        <p id="phone-error" className="mt-1 text-sm text-red-600">
                          {validationErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCard className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          required
                          value={formData.cardNumber}
                          onChange={handleChange}
                          className={`w-full pl-10 px-3 py-2 border ${validationErrors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          aria-invalid={!!validationErrors.cardNumber}
                          aria-describedby={validationErrors.cardNumber ? "cardNumber-error" : undefined}
                        />
                      </div>
                      {validationErrors.cardNumber && (
                        <p id="cardNumber-error" className="mt-1 text-sm text-red-600">
                          {validationErrors.cardNumber}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          placeholder="MM/YY"
                          required
                          value={formData.expiryDate}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${validationErrors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          aria-invalid={!!validationErrors.expiryDate}
                          aria-describedby={validationErrors.expiryDate ? "expiryDate-error" : undefined}
                        />
                        {validationErrors.expiryDate && (
                          <p id="expiryDate-error" className="mt-1 text-sm text-red-600">
                            {validationErrors.expiryDate}
                          </p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          id="cvc"
                          name="cvc"
                          placeholder="123"
                          required
                          value={formData.cvc}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${validationErrors.cvc ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          aria-invalid={!!validationErrors.cvc}
                          aria-describedby={validationErrors.cvc ? "cvc-error" : undefined}
                        />
                        {validationErrors.cvc && (
                          <p id="cvc-error" className="mt-1 text-sm text-red-600">
                            {validationErrors.cvc}
                          </p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          required
                          value={formData.zipCode}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${validationErrors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          aria-invalid={!!validationErrors.zipCode}
                          aria-describedby={validationErrors.zipCode ? "zipCode-error" : undefined}
                        />
                        {validationErrors.zipCode && (
                          <p id="zipCode-error" className="mt-1 text-sm text-red-600">
                            {validationErrors.zipCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Cancellation Policy</h2>
                  <p className="text-gray-600 mb-4">
                    Free cancellation before {formatDate(bookingDetails.checkIn)}. Cancel before check-in on {formatDate(bookingDetails.checkIn)} for a partial refund.
                  </p>
                  <p className="text-sm text-gray-500">
                    By selecting the button below, I agree to the Property Rules, Cancellation Policy, and the Host&apos;s Terms and Conditions.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Confirm and Pay $${bookingDetails.total}`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{bookingDetails.propertyName}</h3>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{bookingDetails.location}</span>
                  </div>
                </div>
                
                <div className="border-t border-b py-4 space-y-2">
                  <div className="flex items-start">
                    <CalendarDays className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {formatDate(bookingDetails.checkIn)} - {formatDate(bookingDetails.checkOut)}
                      </p>
                      <p className="text-gray-600 text-sm">{bookingDetails.nights} nights</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Users className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{bookingDetails.guests} guests</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>${bookingDetails.pricePerNight} x {bookingDetails.nights} nights</span>
                    <span>${bookingDetails.pricePerNight * bookingDetails.nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaning fee</span>
                    <span>${bookingDetails.cleaningFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>${bookingDetails.serviceFee}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${bookingDetails.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 