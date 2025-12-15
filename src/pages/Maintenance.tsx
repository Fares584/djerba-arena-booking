import React from 'react';
import { Wrench, Mail, Phone, MapPin } from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sport-dark via-gray-900 to-sport-dark flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/lovable-uploads/da65ca25-1f6f-45df-9eb8-8a034e6e6b38.png" 
            alt="Planet Sport Logo" 
            className="h-24 mx-auto"
          />
        </div>

        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-sport-green/20 rounded-full flex items-center justify-center animate-pulse">
              <Wrench className="w-12 h-12 text-sport-green" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-sport-green/10 rounded-full animate-ping" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Site en <span className="text-sport-green">Maintenance</span>
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          Nous travaillons actuellement à l'amélioration de notre site pour vous offrir une meilleure expérience.
        </p>

        <p className="text-lg text-gray-400 mb-12">
          Nous serons de retour très bientôt. Merci de votre patience !
        </p>

        {/* Contact Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">
            Besoin de nous contacter ?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <a 
              href="tel:+21620123456" 
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-sport-green/20 transition-colors group"
            >
              <Phone className="w-6 h-6 text-sport-green group-hover:scale-110 transition-transform" />
              <span className="text-gray-300 text-sm">+216 20 123 456</span>
            </a>
            
            <a 
              href="mailto:contact@planetsport.tn" 
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-sport-green/20 transition-colors group"
            >
              <Mail className="w-6 h-6 text-sport-green group-hover:scale-110 transition-transform" />
              <span className="text-gray-300 text-sm">contact@planetsport.tn</span>
            </a>
            
            <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5">
              <MapPin className="w-6 h-6 text-sport-green" />
              <span className="text-gray-300 text-sm">Djerba, Tunisie</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-12 text-gray-500 text-sm">
          © {new Date().getFullYear()} Planet Sport. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
