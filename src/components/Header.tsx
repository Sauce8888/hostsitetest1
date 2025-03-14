"use client";

import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleToggleMenu();
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-xl font-bold text-blue-600"
            tabIndex={0}
            aria-label="Mountain View Retreat home"
          >
            Mountain View Retreat
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
              tabIndex={0}
              aria-label="View property details"
            >
              Property
            </Link>
            <Link 
              href="#" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
              tabIndex={0}
              aria-label="View amenities"
            >
              Amenities
            </Link>
            <Link 
              href="#" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
              tabIndex={0}
              aria-label="Read guest reviews"
            >
              Reviews
            </Link>
            <Link 
              href="#" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
              tabIndex={0}
              aria-label="View location information"
            >
              Location
            </Link>
            <Link
              href="tel:+15551234567"
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
              tabIndex={0}
              aria-label="Call property manager"
            >
              <Phone className="h-4 w-4 mr-1" />
              <span>Call Us</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={handleToggleMenu}
              onKeyDown={handleKeyDown}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              tabIndex={0}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div id="mobile-menu" className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <Link 
              href="/" 
              className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
              tabIndex={0}
              aria-label="View property details"
              onClick={() => setIsMenuOpen(false)}
            >
              Property
            </Link>
            <Link 
              href="#" 
              className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
              tabIndex={0}
              aria-label="View amenities"
              onClick={() => setIsMenuOpen(false)}
            >
              Amenities
            </Link>
            <Link 
              href="#" 
              className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
              tabIndex={0}
              aria-label="Read guest reviews"
              onClick={() => setIsMenuOpen(false)}
            >
              Reviews
            </Link>
            <Link 
              href="#" 
              className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
              tabIndex={0}
              aria-label="View location information"
              onClick={() => setIsMenuOpen(false)}
            >
              Location
            </Link>
            <Link
              href="tel:+15551234567"
              className="flex items-center py-2 text-gray-700 hover:text-blue-600 transition-colors"
              tabIndex={0}
              aria-label="Call property manager"
              onClick={() => setIsMenuOpen(false)}
            >
              <Phone className="h-4 w-4 mr-1" />
              <span>Call Us</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 