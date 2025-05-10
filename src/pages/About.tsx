
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
          <h2 className="text-3xl font-bold mb-10 text-center">Nos Installations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Facility 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-sport-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m-4-4h8" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Terrains de Football</h3>
              <p className="text-gray-700 mb-4">
                3 terrains de football à 6, 7 et 8 joueurs avec gazon synthétique de haute qualité, éclairage LED pour les matchs nocturnes et vestiaires équipés.
              </p>
              <ul className="text-gray-700 space-y-1">
                <li>• Surface synthétique professionnelle</li>
                <li>• Éclairage LED pour jouer la nuit</li>
                <li>• Filets et buts de compétition</li>
              </ul>
            </div>
            
            {/* Facility 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-sport-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.5 7.5 6.5 16.5 12 22M12 2c5.5 5.5 5.5 14.5 0 20" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Courts de Tennis</h3>
              <p className="text-gray-700 mb-4">
                2 courts de tennis en dur entretenus quotidiennement, avec possibilité de location de matériel et de prendre des cours avec nos entraîneurs certifiés.
              </p>
              <ul className="text-gray-700 space-y-1">
                <li>• Surface en dur de qualité</li>
                <li>• Location de raquettes et balles</li>
                <li>• Cours disponibles avec nos pros</li>
              </ul>
            </div>
            
            {/* Facility 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-sport-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9H9m0 0v6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Courts de Padel</h3>
              <p className="text-gray-700 mb-4">
                2 courts de padel couverts pour jouer toute l'année, quelles que soient les conditions météorologiques. Matériel disponible à la location.
              </p>
              <ul className="text-gray-700 space-y-1">
                <li>• Courts couverts panoramiques</li>
                <li>• Équipement de qualité professionnelle</li>
                <li>• Initiation pour débutants disponible</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-10 text-center">Notre Équipe</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="text-center">
              <div className="w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80" 
                  alt="Mohamed Ben Ali" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-1">Mohamed Ben Ali</h3>
              <p className="text-sport-green mb-3">Directeur</p>
              <p className="text-gray-600">
                Ancien joueur professionnel de football, Mohamed a créé Planet Sports pour partager sa passion du sport.
              </p>
            </div>
            
            {/* Team Member 2 */}
            <div className="text-center">
              <div className="w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&q=80" 
                  alt="Sonia Mansour" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-1">Sonia Mansour</h3>
              <p className="text-sport-green mb-3">Responsable des réservations</p>
              <p className="text-gray-600">
                Avec son sens de l'organisation et sa gentillesse, Sonia veille à la parfaite coordination des réservations.
              </p>
            </div>
            
            {/* Team Member 3 */}
            <div className="text-center">
              <div className="w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80" 
                  alt="Karim Zouari" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-1">Karim Zouari</h3>
              <p className="text-sport-green mb-3">Coach Sportif</p>
              <p className="text-gray-600">
                Spécialiste du tennis et du padel, Karim propose des cours pour tous les niveaux et tous les âges.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="section-padding bg-sport-green text-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-10 text-center">Témoignages</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <svg className="w-12 h-12 text-sport-green" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Ahmed</h4>
                  <p className="text-gray-600">Client régulier</p>
                </div>
              </div>
              <p className="italic">
                "Je joue au foot ici chaque semaine avec mes amis depuis l'ouverture. Les terrains sont impeccables et l'ambiance est toujours au rendez-vous!"
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <svg className="w-12 h-12 text-sport-green" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Fatma</h4>
                  <p className="text-gray-600">Joueuse de tennis</p>
                </div>
              </div>
              <p className="italic">
                "J'ai découvert le padel grâce aux courts de Planet Sports. Les installations sont top et le système de réservation en ligne est très pratique."
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <svg className="w-12 h-12 text-sport-green" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Youssef</h4>
                  <p className="text-gray-600">Entreprise locale</p>
                </div>
              </div>
              <p className="italic">
                "Nous avons organisé un tournoi d'entreprise ici et tout était parfait. L'équipe est très professionnelle et à l'écoute."
              </p>
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
            <a href="/contact" className="btn-secondary text-lg px-8 py-3">
              Nous contacter
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default About;
