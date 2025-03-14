"use client";

import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      action();
    }
  };
  
  const handleSocialClick = (platform: string) => {
    // In a real app, this would navigate to the appropriate social media page
    console.log(`Navigating to ${platform}`);
  };

  return (
    <footer className="bg-gray-800 text-white pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Property Info */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Mountain View Retreat</h3>
            <div className="space-y-2">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 text-blue-400" />
                <span>123 Mountain View Road<br />Blue Ridge Mountains, NC 28786</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-400" />
                <Link 
                  href="tel:+15551234567" 
                  className="hover:text-blue-400 transition-colors"
                  tabIndex={0}
                  aria-label="Call the property"
                >
                  +1 (555) 123-4567
                </Link>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-400" />
                <Link 
                  href="mailto:info@mountainviewretreat.com" 
                  className="hover:text-blue-400 transition-colors"
                  tabIndex={0}
                  aria-label="Email the property"
                >
                  info@mountainviewretreat.com
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <nav className="space-y-2">
              <div>
                <Link 
                  href="/" 
                  className="hover:text-blue-400 transition-colors"
                  tabIndex={0}
                  aria-label="Go to property page"
                >
                  Property
                </Link>
              </div>
              <div>
                <Link 
                  href="#" 
                  className="hover:text-blue-400 transition-colors"
                  tabIndex={0}
                  aria-label="View booking policies"
                >
                  Booking Policies
                </Link>
              </div>
              <div>
                <Link 
                  href="#" 
                  className="hover:text-blue-400 transition-colors"
                  tabIndex={0}
                  aria-label="View cancellation policy"
                >
                  Cancellation Policy
                </Link>
              </div>
              <div>
                <Link 
                  href="#" 
                  className="hover:text-blue-400 transition-colors"
                  tabIndex={0}
                  aria-label="Contact us"
                >
                  Contact Us
                </Link>
              </div>
            </nav>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <div 
                className="p-2 bg-gray-700 rounded-full hover:bg-blue-600 transition-colors cursor-pointer"
                onClick={() => handleSocialClick("facebook")}
                onKeyDown={(e) => handleKeyDown(e, () => handleSocialClick("facebook"))}
                tabIndex={0}
                aria-label="Visit our Facebook page"
                role="link"
              >
                <Facebook className="h-5 w-5" />
              </div>
              <div 
                className="p-2 bg-gray-700 rounded-full hover:bg-pink-600 transition-colors cursor-pointer"
                onClick={() => handleSocialClick("instagram")}
                onKeyDown={(e) => handleKeyDown(e, () => handleSocialClick("instagram"))}
                tabIndex={0}
                aria-label="Visit our Instagram profile"
                role="link"
              >
                <Instagram className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-gray-400">
          <div className="flex flex-col md:flex-row md:justify-between">
            <p>© {new Date().getFullYear()} Mountain View Retreat. All rights reserved.</p>
            <div className="mt-2 md:mt-0 space-x-4">
              <Link 
                href="#" 
                className="hover:text-white transition-colors"
                tabIndex={0}
                aria-label="View privacy policy"
              >
                Privacy Policy
              </Link>
              <Link 
                href="#" 
                className="hover:text-white transition-colors"
                tabIndex={0}
                aria-label="View terms and conditions"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 