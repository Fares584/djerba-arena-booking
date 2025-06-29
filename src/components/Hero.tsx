
import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative bg-sport-dark text-white overflow-hidden min-h-screen">
      {/* Background video */}
      <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0">
          <source
            src="https://ik.imagekit.io/k4czw9rkh/videoMainPagePlanetSport.mp4?updatedAt=1750691619266"
            type="video/mp4"/>
          Your browser does not support the video tag.
      </video>

      {/* Optional: Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* Foreground content */}
      <div className="container-custom relative z-10 py-16 md:py-24 lg:py-32 min-h-screen flex items-center">
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
            {/* Le bouton "Nous contacter" a été supprimé */}
          </div>

          {/* Reservation promo */}
          <div className="mt-12 bg-black/30 backdrop-blur-sm p-4 rounded-lg inline-block">
            <p className="text-white text-sm md:text-base">
              🆕 Notre système de réservation en ligne est maintenant disponible !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
