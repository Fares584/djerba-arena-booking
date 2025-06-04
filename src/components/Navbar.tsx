
import React, { useState } from 'react';
import { Menu, X, MapPin, Phone } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-sport-dark text-white py-2">
        <div className="container-custom flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Djerba, Tunisie</span>
            </div>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-1" />
            <span>+216 29 61 28 09</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-sport-green">
              Planet Sports
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-700 hover:text-sport-green transition-colors">
              Accueil
            </a>
            <a href="/tarifs" className="text-gray-700 hover:text-sport-green transition-colors">
              Tarifs
            </a>
            <a href="/reservation" className="text-gray-700 hover:text-sport-green transition-colors">
              Réservation
            </a>
            <a href="/contact" className="text-gray-700 hover:text-sport-green transition-colors">
              Contact
            </a>
            <a href="/admin" className="btn-primary">
              Admin
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-sport-green transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <a 
                href="/" 
                className="text-gray-700 hover:text-sport-green transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Accueil
              </a>
              <a 
                href="/tarifs" 
                className="text-gray-700 hover:text-sport-green transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Tarifs
              </a>
              <a 
                href="/reservation" 
                className="text-gray-700 hover:text-sport-green transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Réservation
              </a>
              <a 
                href="/contact" 
                className="text-gray-700 hover:text-sport-green transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </a>
              <a 
                href="/admin" 
                className="btn-primary inline-block text-center"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
