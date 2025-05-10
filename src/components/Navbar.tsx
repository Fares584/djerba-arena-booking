
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="text-sport-green font-bold text-2xl">Planet</span>
            <span className="text-sport-dark font-bold text-2xl">Sports</span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-sport-dark p-2"
            onClick={toggleMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sport-dark hover:text-sport-green font-medium transition-colors">
              Accueil
            </Link>
            <Link to="/fields" className="text-sport-dark hover:text-sport-green font-medium transition-colors">
              Nos Terrains
            </Link>
            <Link to="/reservation" className="text-sport-dark hover:text-sport-green font-medium transition-colors">
              Réservation
            </Link>
            <Link to="/about" className="text-sport-dark hover:text-sport-green font-medium transition-colors">
              À Propos
            </Link>
            <Link to="/contact" className="text-sport-dark hover:text-sport-green font-medium transition-colors">
              Contact
            </Link>
            <Link to="/login" className="btn-primary">
              Admin
            </Link>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link 
              to="/" 
              className="block text-sport-dark hover:text-sport-green font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link 
              to="/fields" 
              className="block text-sport-dark hover:text-sport-green font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Nos Terrains
            </Link>
            <Link 
              to="/reservation" 
              className="block text-sport-dark hover:text-sport-green font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Réservation
            </Link>
            <Link 
              to="/about" 
              className="block text-sport-dark hover:text-sport-green font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              À Propos
            </Link>
            <Link 
              to="/contact" 
              className="block text-sport-dark hover:text-sport-green font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              to="/login" 
              className="block btn-primary inline-block"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
