
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Clock, Phone, Trophy, Calendar } from 'lucide-react';

const Tarifs = () => {
  return (
    <>
      <Navbar />
      
      {/* Header */}
      <div className="bg-sport-dark text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-4">💰 Tarifs de réservation</h1>
          <p className="text-xl max-w-2xl">
            Découvrez nos tarifs compétitifs pour profiter de nos installations de qualité
          </p>
        </div>
      </div>

      {/* Tarifs Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          
          {/* Tennis Section */}
          <div className="mb-12">
            <div className="flex items-center mb-8">
              <Trophy className="h-8 w-8 text-sport-green mr-3" />
              <h2 className="text-3xl font-bold">🏓 Tennis</h2>
            </div>
            
            <p className="text-gray-600 mb-8">
              Le complexe propose deux types de terrains de tennis : un terrain en green set et un autre en pelouse.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Green Set */}
              <div className="bg-sport-gray p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-sport-green">Terrain Green Set</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Journée (par joueur)</span>
                    <span className="font-bold">10 DT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Soirée (par joueur)</span>
                    <span className="font-bold">12,5 DT</span>
                  </div>
                </div>
                
                <h4 className="font-bold mt-6 mb-3">Formules d'abonnement (valables 2 mois)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>10 heures</span>
                    <span className="font-bold text-sport-green">180 DT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>20 heures</span>
                    <span className="font-bold text-sport-green">340 DT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>30 heures</span>
                    <span className="font-bold text-sport-green">480 DT</span>
                  </div>
                </div>
              </div>

              {/* Pelouse */}
              <div className="bg-sport-gray p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-sport-green">Terrain Pelouse</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Journée (par joueur)</span>
                    <span className="font-bold">7,5 DT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Soirée (par joueur)</span>
                    <span className="font-bold">10 DT</span>
                  </div>
                </div>
                
                <h4 className="font-bold mt-6 mb-3">Formules d'abonnement (valables 2 mois)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>10 heures</span>
                    <span className="font-bold text-sport-green">130 DT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>20 heures</span>
                    <span className="font-bold text-sport-green">240 DT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>30 heures</span>
                    <span className="font-bold text-sport-green">330 DT</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Location raquette de tennis :</strong> 3 DT
              </p>
            </div>
          </div>

          {/* Padel Section */}
          <div className="mb-12">
            <div className="flex items-center mb-8">
              <Trophy className="h-8 w-8 text-sport-green mr-3" />
              <h2 className="text-3xl font-bold">🎾 Padel</h2>
            </div>
            
            <p className="text-gray-600 mb-8">
              Planet Sports Djerba dispose de deux courts de padel modernes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tarifs horaires */}
              <div className="bg-sport-gray p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-sport-green">Tarifs à l'heure</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Journée (4 joueurs)</span>
                    <span className="font-bold">50 DT/heure</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Soirée (4 joueurs)</span>
                    <span className="font-bold">60 DT/heure</span>
                  </div>
                </div>
              </div>

              {/* Abonnements */}
              <div className="bg-sport-gray p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-sport-green">Packs d'abonnement</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>10 heures</span>
                    <span className="font-bold text-sport-green">500 DT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>20 heures</span>
                    <span className="font-bold text-sport-green">980 DT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>30 heures</span>
                    <span className="font-bold text-sport-green">1400 DT</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Location raquette de padel :</strong> 5 DT
              </p>
            </div>
          </div>

          {/* Informations pratiques */}
          <div className="bg-sport-green text-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Informations pratiques</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <Clock className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-2">Horaires</h3>
                  <p className="text-sm opacity-90">
                    Journée : 8h00 - 18h00<br />
                    Soirée : 18h00 - 23h00
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-2">Validité des abonnements</h3>
                  <p className="text-sm opacity-90">
                    Tennis : 2 mois<br />
                    Padel : 1 mois
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center bg-white bg-opacity-10 p-4 rounded-lg">
              <Phone className="h-6 w-6 mr-3" />
              <div className="text-center">
                <p className="font-bold">📞 Pour toute réservation ou demande d'information</p>
                <p className="text-lg">+216 29 61 28 09</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold mb-4">Prêt à réserver ?</h2>
            <p className="text-gray-600 mb-6">
              Choisissez votre terrain et réservez dès maintenant !
            </p>
            <div className="space-x-4">
              <a href="/reservation" className="btn-primary">
                Réserver maintenant
              </a>
              <a href="/contact" className="btn-secondary">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Tarifs;
