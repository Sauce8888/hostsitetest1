"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Users } from "lucide-react";
import { useState, useEffect } from "react";
import DateRangePicker from "../components/ui/DateRangePicker";
import { supabase } from "@/lib/supabase";

// Custom property type to match what we receive from the database
type Property = {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
};

export default function Home() {
  // Hardcoded host ID - use your actual host ID from the database
  const hostId = "c78b2719-486b-4c77-bf8f-beadf7dc5d02";
  
  // State for property data
  const [property, setProperty] = useState<Property>({
    id: "",
    name: "Loading...",
    description: "Loading property details...",
    location: "Loading...",
    rating: 0,
    reviews: 0,
    price: 0,
    guests: 2,
    bedrooms: 0,
    bathrooms: 0,
    images: [],
    amenities: []
  });
  
  // State for loading status
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for booking details
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [guestCount, setGuestCount] = useState(2);

  // Fetch property data from Supabase
  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      
      try {
        // Fetch properties that belong to the specified host
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('host_id', hostId)
          .limit(1);
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Use the first property found for this host
          const propertyData = data[0];
          
          // Transform the data to match our property structure
          setProperty({
            id: propertyData.id,
            name: propertyData.name,
            description: propertyData.description,
            location: propertyData.address || "No location specified",
            rating: propertyData.rating || 4.5,
            reviews: propertyData.reviews_count || 0,
            price: propertyData.base_rate,
            guests: propertyData.max_guests || 2,
            bedrooms: propertyData.bedrooms || 1,
            bathrooms: propertyData.bathrooms || 1,
            images: propertyData.images || [],
            amenities: propertyData.amenities || [
              "Wifi", "Kitchen", "Free Parking", "Air Conditioning"
            ]
          });
        } else {
          setError("No properties found for this host. Please check the host ID or add a property.");
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        setError("Failed to load property data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperty();
  }, [hostId]);

  // Handle date range changes
  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    setCheckInDate(startDate);
    setCheckOutDate(endDate);
  };

  // Calculate number of nights
  const calculateNights = (): number => {
    if (!checkInDate || !checkOutDate) return 0;
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate total price
  const calculateTotalPrice = (): number => {
    const nights = calculateNights();
    const subtotal = property.price * nights;
    const cleaningFee = 85; // Example cleaning fee
    const serviceFee = Math.round(subtotal * 0.12); // Example service fee (12%)
    
    return subtotal + cleaningFee + serviceFee;
  };

  // Format date for URL
  const formatDateForUrl = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Property Images */}
      <div className="relative w-full h-[50vh] bg-gray-200">
        {property.images && property.images.length > 0 ? (
          <Image 
            src={property.images[0]} 
            alt={property.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            No Property Images Available
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Property Information */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-t border-b">
              <div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <span className="font-medium">{property.rating}</span>
                  <span className="mx-1 text-gray-500">·</span>
                  <span className="text-gray-500">{property.reviews} reviews</span>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-500 mr-2" />
                <span>{property.guests} guests · {property.bedrooms} bedrooms · {property.bathrooms} bathrooms</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{property.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Amenities</h2>
              <div className="grid grid-cols-2 gap-2">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <svg className="h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="sticky top-8 h-fit z-10">
            <div className="bg-white shadow-lg rounded-lg border overflow-visible">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-2xl font-bold">${property.price}</span>
                    <span className="text-gray-600"> / night</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{property.rating}</span>
                  </div>
                </div>

                <form className="space-y-4">
                  {/* Date Range Picker */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Dates
                    </label>
                    <DateRangePicker
                      onDateRangeChange={handleDateRangeChange}
                      property_id={property.id}
                      minDate={new Date()}
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="guests" className="block text-sm font-medium text-gray-700">
                      Guests
                    </label>
                    <select
                      id="guests"
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value))}
                    >
                      {[...Array(property.guests)].map((_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1} {i === 0 ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {checkInDate && checkOutDate && (
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex justify-between">
                        <span>${property.price} x {calculateNights()} nights</span>
                        <span>${property.price * calculateNights()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cleaning fee</span>
                        <span>$85</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service fee</span>
                        <span>${Math.round(property.price * calculateNights() * 0.12)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-3 border-t">
                        <span>Total</span>
                        <span>${calculateTotalPrice()}</span>
                      </div>
                    </div>
                  )}

                  <Link 
                    href={{
                      pathname: '/booking',
                      query: {
                        propertyId: property.id,
                        propertyName: property.name,
                        location: property.location,
                        checkIn: formatDateForUrl(checkInDate),
                        checkOut: formatDateForUrl(checkOutDate),
                        guests: guestCount,
                      }
                    }}
                    className={`block w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium text-center hover:bg-blue-700 transition ${(!checkInDate || !checkOutDate) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-disabled={!checkInDate || !checkOutDate}
                    tabIndex={!checkInDate || !checkOutDate ? -1 : 0}
                    onClick={(e) => {
                      if (!checkInDate || !checkOutDate) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {checkInDate && checkOutDate ? "Reserve" : "Select dates to continue"}
                  </Link>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
