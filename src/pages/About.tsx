
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ParkingMeter } from 'lucide-react';

const About = () => {
  return (
    <>
      <Navbar />
      {/* Header */}
      <div className="bg-sport-dark text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-4">À Propos de Nous</h1>
          <p className="text-xl max-w-2xl">
            Découvrez Planet Sports Djerba, votre destination sportive de qualité sur l'île de Djerba.
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Notre Histoire</h2>
              <p className="text-lg mb-6 text-gray-700">
                Fondé en 2019, Planet Sports Djerba est né de la passion pour le sport et de la volonté de créer un espace où les amateurs comme les professionnels peuvent pratiquer leurs activités favorites dans les meilleures conditions.
              </p>
              <p className="text-lg mb-6 text-gray-700">
                Situé au cœur de Djerba, notre complexe sportif a été conçu pour offrir une expérience exceptionnelle à tous nos visiteurs, avec des installations modernes et un service client de première qualité.
              </p>
              <p className="text-lg text-gray-700">
                Aujourd'hui, Planet Sports Djerba est fier d'être devenu le lieu de référence pour la pratique du football, du tennis et du padel sur l'île, accueillant des milliers de sportifs chaque année.
              </p>
            </div>
            
            <div>
              <img 
                src="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80" 
                alt="Planet Sports Djerba" 
                className="rounded-lg shadow-md w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Facilities Section */}
      <section className="section-padding bg-sport-gray">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-12 text-center">Nos Installations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Facility 1: Terrains de Football */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 rounded-full bg-sport-green/20 flex items-center justify-center mr-6">
                  {/* Football Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sport-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m-4-4h8" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-sport-dark">Terrains de Football</h3>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                3 terrains de football à 6, 7 et 8 joueurs avec gazon synthétique de haute qualité, éclairage LED pour les matchs nocturnes et vestiaires équipés.
              </p>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Surface synthétique professionnelle
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Éclairage LED pour jouer la nuit
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Filets et buts de compétition
                </li>
              </ul>
            </div>

            {/* Facility 2: Courts de Tennis */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 rounded-full bg-sport-green/20 flex items-center justify-center mr-6">
                  {/* Tennis Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sport-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.5 7.5 6.5 16.5 12 22M12 2c5.5 5.5 5.5 14.5 0 20" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-sport-dark">Courts de Tennis</h3>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                3 courts de tennis dont 2 en surface Green Set et 1 en gazon synthétique, entretenus quotidiennement avec possibilité de location de matériel.
              </p>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  2 courts Green Set + 1 court pelouse
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Location de raquettes et balles
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Éclairage pour matchs nocturnes
                </li>
              </ul>
            </div>

            {/* Facility 3: Courts de Padel */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 rounded-full bg-sport-green/20 flex items-center justify-center mr-6">
                  {/* Padel Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sport-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9H9m0 0v6" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-sport-dark">Courts de Padel</h3>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                2 courts de padel en plein air avec parois vitrées panoramiques. Matériel disponible à la location sur place.
              </p>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Courts extérieurs avec parois vitrées
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Équipement de qualité professionnelle
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Initiation pour débutants disponible
                </li>
              </ul>
            </div>

            {/* Facility 4: Espace Enfant */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 rounded-full bg-sport-green/20 flex items-center justify-center mr-6 text-sport-green font-bold text-3xl">
                  👦
                </div>
                <h3 className="text-2xl font-bold text-sport-dark">Espace Enfant</h3>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Un espace sécurisé et dédié pour permettre aux enfants de s'amuser pendant que les parents profitent de leur activité sportive.
              </p>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Jeux adaptés pour petits
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Encadrement disponible
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Zone ombragée et sécurisée
                </li>
              </ul>
            </div>

            {/* Facility 5: Buvette */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 rounded-full bg-sport-green/20 flex items-center justify-center mr-6 text-sport-green font-bold text-3xl">
                  🥤
                </div>
                <h3 className="text-2xl font-bold text-sport-dark">Buvette</h3>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Rafraîchissez-vous après l'effort grâce à notre buvette conviviale proposant boissons fraîches et snacks variés.
              </p>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Boissons fraîches et chaudes
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Snacks et encas
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Espace détente
                </li>
              </ul>
            </div>

            {/* Facility 6: Location chaussures */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 rounded-full bg-sport-green/20 flex items-center justify-center mr-6 text-sport-green font-bold text-3xl">
                  👟
                </div>
                <h3 className="text-2xl font-bold text-sport-dark">Location de chaussures</h3>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Vous n'avez pas de chaussures adaptées ? Profitez de notre service de location à petit prix, pour jouer sans souci !
              </p>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Toutes tailles disponibles
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Matériel désinfecté après chaque utilisation
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Facilité de location sur place
                </li>
              </ul>
            </div>
          </div>

          {/* Additional Services */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Salle de Prière */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 rounded-full bg-sport-green/20 flex items-center justify-center mr-6 text-sport-green font-bold text-3xl">
                  🕌
                </div>
                <h3 className="text-2xl font-bold text-sport-dark">Salle de Prière</h3>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Un espace calme et propre dédié à la prière, accessible à tous nos visiteurs durant les heures d'ouverture.
              </p>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Espace propre et climatisé
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Tapis de prière disponibles
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Accessible à tout moment
                </li>
              </ul>
            </div>

            {/* Parking sécurisé */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 rounded-full bg-sport-green/20 flex items-center justify-center mr-6">
                  <ParkingMeter className="h-8 w-8 text-sport-green" />
                </div>
                <h3 className="text-2xl font-bold text-sport-dark">Parking sécurisé</h3>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Garez votre véhicule en toute sérénité grâce à notre parking sécurisé, réservé à notre clientèle.
              </p>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Vidéosurveillance et accès contrôlé
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Accès facile aux terrains
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Parking éclairé la nuit
                </li>
              </ul>
            </div>

            {/* Vestiaires */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 rounded-full bg-sport-green/20 flex items-center justify-center mr-6 text-sport-green font-bold text-3xl">
                  🚿
                </div>
                <h3 className="text-2xl font-bold text-sport-dark">Vestiaires équipés</h3>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Des vestiaires modernes et propres avec douches pour vous changer et vous rafraîchir avant et après vos matchs.
              </p>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Douches avec eau chaude
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Casiers sécurisés
                </li>
                <li className="flex items-start">
                  <span className="text-sport-green mr-3 font-bold">•</span>
                  Nettoyage quotidien
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Venez découvrir nos installations</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Que vous soyez un joueur régulier ou occasionnel, venez profiter de nos terrains de qualité et de notre ambiance conviviale!
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a href="/reservation" className="btn-primary text-lg px-8 py-3">
              Réserver un terrain
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default About;
