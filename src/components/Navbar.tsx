import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3" onClick={handleLinkClick}>
            <img 
              src="/lovable-uploads/7a0e1bd3-9d40-4c98-8eb6-8cf126706db0.png" 
              alt="Planet Sports Logo" 
              className="h-10 w-auto object-contain"
            />
            <div className="flex items-center">
              <span className="text-sport-green font-bold text-2xl">Planet</span>
              <span className="text-sport-accent font-bold text-2xl">Sports</span>
            </div>
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
            <Link to="/" className="text-sport-dark hover:text-sport-green font-medium transition-colors" onClick={handleLinkClick}>
              Accueil
            </Link>
            <Link to="/fields" className="text-sport-dark hover:text-sport-green font-medium transition-colors" onClick={handleLinkClick}>
              Nos Terrains
            </Link>
            <Link to="/reservation" className="text-sport-dark hover:text-sport-green font-medium transition-colors" onClick={handleLinkClick}>
              Réservation
            </Link>
            <Link to="/about" className="text-sport-dark hover:text-sport-green font-medium transition-colors" onClick={handleLinkClick}>
              À Propos
            </Link>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link 
              to="/" 
              className="block text-sport-dark hover:text-sport-green font-medium transition-colors"
              onClick={handleLinkClick}
            >
              Accueil
            </Link>
            <Link 
              to="/fields" 
              className="block text-sport-dark hover:text-sport-green font-medium transition-colors"
              onClick={handleLinkClick}
            >
              Nos Terrains
            </Link>
            <Link 
              to="/reservation" 
              className="block text-sport-dark hover:text-sport-green font-medium transition-colors"
              onClick={handleLinkClick}
            >
              Réservation
            </Link>
            <Link 
              to="/about" 
              className="block text-sport-dark hover:text-sport-green font-medium transition-colors"
              onClick={handleLinkClick}
            >
              À Propos
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
