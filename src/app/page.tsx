import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Star, Users } from "lucide-react";

export default function Home() {
  // This would typically come from a database or API
  const property = {
    name: "Mountain View Retreat",
    description: "Enjoy this stunning 3-bedroom cabin with breathtaking mountain views, a hot tub, and easy access to hiking trails.",
    location: "Blue Ridge Mountains, NC",
    rating: 4.9,
    reviews: 187,
    price: 189,
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    images: [
      "/cabin-main.jpg",  // These would need to be actual images in your public folder
      "/cabin-interior.jpg",
      "/cabin-view.jpg",
    ],
    amenities: [
      "Hot Tub", "Wifi", "Kitchen", "Free Parking", 
      "Washer & Dryer", "Air Conditioning", "Fireplace", "BBQ Grill"
    ]
  };

  return (
    <div className="min-h-screen">
      {/* Property Images */}
      <div className="relative w-full h-[50vh] bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          Property Images Would Appear Here
          {/* Uncomment when you have actual images
          <Image 
            src={property.images[0]} 
            alt={property.name}
            fill
            className="object-cover"
            priority
          /> 
          */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Property Information */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{property.name}</h1>
              <div className="flex items-center mt-2 text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location}</span>
              </div>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span>{property.rating}</span>
                <span className="mx-1">·</span>
                <span>{property.reviews} reviews</span>
              </div>
            </div>

            <div className="border-t border-b py-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Users className="h-5 w-5 mx-auto mb-1" />
                  <p>{property.guests} guests</p>
                </div>
                <div>
                  <svg className="h-5 w-5 mx-auto mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <p>{property.bedrooms} bedrooms</p>
                </div>
                <div>
                  <svg className="h-5 w-5 mx-auto mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 12H20M4 12C2.89543 12 2 11.1046 2 10V6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V10C22 11.1046 21.1046 12 20 12M4 12V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12" stroke="currentColor" strokeWidth="2" />
                    <circle cx="8" cy="8" r="1" fill="currentColor" />
                    <circle cx="16" cy="8" r="1" fill="currentColor" />
                  </svg>
                  <p>{property.bathrooms} bathrooms</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">About this property</h2>
              <p className="text-gray-700">{property.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Amenities</h2>
              <div className="grid grid-cols-2 gap-2">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg border sticky top-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-2xl font-bold">${property.price}</span>
                  <span className="text-gray-600"> / night</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span>{property.rating}</span>
                </div>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="check-in" className="block text-sm font-medium text-gray-700">
                      Check-in
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="check-in"
                        className="block w-full pl-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="check-out" className="block text-sm font-medium text-gray-700">
                      Check-out
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="check-out"
                        className="block w-full pl-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="guests" className="block text-sm font-medium text-gray-700">
                    Guests
                  </label>
                  <select
                    id="guests"
                    className="block w-full py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[...Array(property.guests)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1} {i === 0 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </div>

                <Link
                  href="/booking"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  tabIndex={0}
                  aria-label="Check availability and book now"
                >
                  Check availability
                </Link>

                <div className="text-center text-sm text-gray-500">
                  You won&apos;t be charged yet
                </div>
              </form>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span>${property.price} x 5 nights</span>
                  <span>${property.price * 5}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Cleaning fee</span>
                  <span>$85</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Service fee</span>
                  <span>$79</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${property.price * 5 + 85 + 79}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
