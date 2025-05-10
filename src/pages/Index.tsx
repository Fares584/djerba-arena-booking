
import React from 'react';
import Hero from '@/components/Hero';
import FieldCard, { Field } from '@/components/FieldCard';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Simulated fields data for the featured fields section
const featuredFields: Field[] = [
  {
    id: 1,
    name: 'Foot à 7 - Terrain A',
    type: 'foot',
    capacity: 14,
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80',
    status: 'available',
  },
  {
    id: 2,
    name: 'Tennis - Court 1',
    type: 'tennis',
    capacity: 4,
    price: 30,
    imageUrl: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&q=80',
    status: 'reserved',
  },
  {
    id: 3,
    name: 'Padel - Court 1',
    type: 'padel',
    capacity: 4,
    price: 40,
    imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80',
    status: 'available',
  },
];

const Index = () => {
  return (
    <>
      <Navbar />
      <Hero />
      
      {/* Featured Fields Section */}
      <section className="section-padding bg-sport-gray">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Terrains populaires</h2>
            <Link to="/fields" className="text-sport-green hover:underline font-medium">
              Voir tous les terrains →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredFields.map((field) => (
              <FieldCard key={field.id} field={field} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi choisir Planet Sports Djerba?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-sport-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-sport-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3">Qualité garantie</h3>
              <p className="text-gray-600">
                Des terrains de sport de haute qualité, entretenus quotidiennement pour une expérience de jeu optimale.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-sport-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-sport-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3">Réservation facile</h3>
              <p className="text-gray-600">
                Réservez votre terrain en quelques clics, 24h/24 et 7j/7, via notre plateforme en ligne.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-sport-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-sport-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3">Pour tous</h3>
              <p className="text-gray-600">
                Que vous soyez amateur ou professionnel, seul ou en groupe, nous avons le terrain qu'il vous faut.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="section-padding bg-sport-green text-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">Nos tarifs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pricing Card 1 */}
            <div className="bg-white text-sport-dark p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-2">Football</h3>
              <p className="text-gray-600 mb-4">Terrains synthétiques</p>
              <div className="text-3xl font-bold text-sport-green mb-6">60 DT <span className="text-sm font-normal text-gray-600">/heure</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>3 terrains disponibles</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Ballons inclus</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Vestiaires & douches</span>
                </li>
              </ul>
              <Link to="/reservation?type=foot" className="btn-primary block text-center w-full">
                Réserver maintenant
              </Link>
            </div>
            
            {/* Pricing Card 2 */}
            <div className="bg-white text-sport-dark p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-2">Tennis</h3>
              <p className="text-gray-600 mb-4">Courts en dur</p>
              <div className="text-3xl font-bold text-sport-green mb-6">30 DT <span className="text-sm font-normal text-gray-600">/heure</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>2 courts disponibles</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Location de raquettes</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Vestiaires & douches</span>
                </li>
              </ul>
              <Link to="/reservation?type=tennis" className="btn-primary block text-center w-full">
                Réserver maintenant
              </Link>
            </div>
            
            {/* Pricing Card 3 */}
            <div className="bg-white text-sport-dark p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-2">Padel</h3>
              <p className="text-gray-600 mb-4">Courts couverts</p>
              <div className="text-3xl font-bold text-sport-green mb-6">40 DT <span className="text-sm font-normal text-gray-600">/heure</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>2 courts disponibles</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Location de raquettes</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Vestiaires & douches</span>
                </li>
              </ul>
              <Link to="/reservation?type=padel" className="btn-primary block text-center w-full">
                Réserver maintenant
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à jouer?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Ne perdez plus de temps, réservez votre terrain maintenant et venez profiter de nos installations de qualité!
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/reservation" className="btn-primary text-lg px-8 py-3">
              Réserver un terrain
            </Link>
            <Link to="/contact" className="btn-secondary text-lg px-8 py-3">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Index;
