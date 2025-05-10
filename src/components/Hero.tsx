
import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative bg-sport-dark text-white overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?auto=format&fit=crop&q=80)',
          filter: 'brightness(0.4)'
        }}
      />
      
      <div className="container-custom relative z-10 py-16 md:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-sport-green">Réserve</span> ton match. <span className="text-sport-green">Joue</span>. <span className="text-sport-green">Gagne</span>.
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Des terrains de qualité pour tous vos sports préférés à Djerba
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center">
            <Link to="/reservation" className="btn-primary text-center text-lg">
              Réserver un terrain
            </Link>
            <Link to="/fields" className="btn-secondary text-center text-lg">
              Voir les disponibilités
            </Link>
            <Link to="/contact" className="bg-white text-sport-dark hover:bg-gray-100 py-2 px-6 rounded-md transition-all font-medium text-center text-lg">
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
