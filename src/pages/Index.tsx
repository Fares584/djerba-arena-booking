import React from 'react';
import Hero from '@/components/Hero';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTerrains } from '@/hooks/useTerrains';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { data: terrains, isLoading } = useTerrains({ actif: true });

  // Affiche uniquement le foot à 7 ("foot à 7"), tennis pelouse ("tennis pelouse"), et padel 1 ("padel 1") dans les populaires
  const featuredTerrains = React.useMemo(() => {
    if (!terrains) return [];
    // On sélectionne ces terrains par leur nom précis
    const foot7 = terrains.find(
      (t) => t.nom?.toLowerCase().includes("foot à 7")
    );
    const tennisPelouse = terrains.find(
      (t) => t.nom?.toLowerCase().includes("tennis pelouse")
    );
    const padel1 = terrains.find(
      (t) => t.nom?.toLowerCase().includes("padel 1")
    );
    // On filtre les doublons et valeurs nulles
    return [foot7, tennisPelouse, padel1].filter(Boolean);
  }, [terrains]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'foot':
        return 'Football';
      case 'tennis':
        return 'Tennis';
      case 'padel':
        return 'Padel';
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'foot':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l-3 3m0 0L9 9m3 3V6m0 0v6" />
          </svg>
        );
      case 'tennis':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.5 7.5 6.5 16.5 12 22M12 2c5.5 5.5 5.5 14.5 0 20" />
          </svg>
        );
      case 'padel':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9H9m0 0v6" />
          </svg>
        );
    }
  };

  // Mise à jour des labels de tarifs selon la spécification utilisateur
  const getPrixParType = (type: string) => {
    switch (type) {
      case 'foot_6':
        return <>50&nbsp;DT<span className="text-sm font-normal text-gray-600">/heure (jour), 60&nbsp;DT&nbsp;(nuit)</span></>;
      case 'foot_7':
        return <>84&nbsp;DT<span className="text-sm font-normal text-gray-600">/heure (jour), 96&nbsp;DT&nbsp;(nuit)</span></>;
      case 'foot_8':
        return <>96&nbsp;DT<span className="text-sm font-normal text-gray-600">/heure (jour), 110&nbsp;DT&nbsp;(nuit)</span></>;
      case 'tennis_green_set':
        return <>10&nbsp;DT/joueur<span className="text-sm font-normal text-gray-600"> (jour), 12.5&nbsp;DT/joueur (nuit)</span></>;
      case 'tennis_green_set_autre':
        return <>7.5&nbsp;DT/joueur<span className="text-sm font-normal text-gray-600"> (jour), 10&nbsp;DT/joueur (nuit)</span></>;
      case 'padel':
        return <>50&nbsp;DT/4 joueurs<span className="text-sm font-normal text-gray-600"> (jour), 60&nbsp;DT/4 joueurs (nuit)</span></>;
      case 'foot':
        return <>60&nbsp;DT<span className="text-sm font-normal text-gray-600">/heure</span></>;
      case 'tennis':
        return <>30&nbsp;DT<span className="text-sm font-normal text-gray-600">/heure</span></>;
      case 'padel':
        return <>40&nbsp;DT<span className="text-sm font-normal text-gray-600">/heure</span></>;
      default:
        return <>{type}</>;
    }
  };

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
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-sport-green" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTerrains.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500">Aucun terrain populaire trouvé.</div>
              ) : (
                featuredTerrains.map((terrain) => (
                  <div key={terrain.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <img 
                        src={terrain.image_url || '/placeholder.svg'} 
                        alt={terrain.nom} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Disponible
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sport-green">
                          {getTypeIcon(terrain.type)}
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                          {getTypeLabel(terrain.type)}
                        </span>
                      </div>
                      <h3 className="font-bold text-xl mb-2">{terrain.nom}</h3>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Capacité: {terrain.capacite} personnes</p>
                          <p className="text-lg font-bold text-sport-green">{terrain.prix} DT/heure</p>
                        </div>
                      </div>
                      <Link 
                        to={`/reservation?fieldId=${terrain.id}`} 
                        className="w-full btn-primary block text-center"
                      >
                        Réserver
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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
      
      {/* Section Tarifs - Mis à jour selon la grille utilisateur */}
      <section className="section-padding bg-sport-green text-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">Nos tarifs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Foot à 6 */}
            <div className="bg-white text-sport-dark p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-2">Football 6 vs 6</h3>
              <p className="text-gray-600 mb-4">Terrains synthétiques</p>
              <div className="text-3xl font-bold text-sport-green mb-6">
                50 DT <span className="text-sm font-normal text-gray-600">/heure (jour)</span><br />
                60 DT <span className="text-sm font-normal text-gray-600">/heure (nuit)</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>3 terrains disponibles</span></li>
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>Ballons inclus</span></li>
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>Vestiaires & douches</span></li>
              </ul>
              <Link to="/reservation?type=foot_6" className="btn-primary block text-center w-full">
                Réserver maintenant
              </Link>
            </div>
            {/* Foot à 7 */}
            <div className="bg-white text-sport-dark p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-2">Football 7 vs 7</h3>
              <p className="text-gray-600 mb-4">Terrains synthétiques</p>
              <div className="text-3xl font-bold text-sport-green mb-6">
                84 DT <span className="text-sm font-normal text-gray-600">/heure (jour)</span><br />
                96 DT <span className="text-sm font-normal text-gray-600">/heure (nuit)</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>2 terrains disponibles</span></li>
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>Ballons inclus</span></li>
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>Vestiaires & douches</span></li>
              </ul>
              <Link to="/reservation?type=foot_7" className="btn-primary block text-center w-full">
                Réserver maintenant
              </Link>
            </div>
            {/* Foot à 8 */}
            <div className="bg-white text-sport-dark p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-2">Football 8 vs 8</h3>
              <p className="text-gray-600 mb-4">Terrains synthétiques</p>
              <div className="text-3xl font-bold text-sport-green mb-6">
                96 DT <span className="text-sm font-normal text-gray-600">/heure (jour)</span><br />
                110 DT <span className="text-sm font-normal text-gray-600">/heure (nuit)</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>1 terrain disponible</span></li>
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>Ballons inclus</span></li>
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>Vestiaires & douches</span></li>
              </ul>
              <Link to="/reservation?type=foot_8" className="btn-primary block text-center w-full">
                Réserver maintenant
              </Link>
            </div>
            {/* Tennis green set */}
            <div className="bg-white text-sport-dark p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-2">Tennis Green Set</h3>
              <p className="text-gray-600 mb-4">Courts en dur (Green Set)</p>
              <div className="text-2xl font-bold text-sport-green mb-6">
                10 DT/joueur <span className="text-sm font-normal text-gray-600">(jour)</span><br/>
                12.5 DT/joueur <span className="text-sm font-normal text-gray-600">(nuit)</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>2 courts disponibles</span></li>
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>Location de raquettes</span></li>
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>Vestiaires & douches</span></li>
              </ul>
              <Link to="/reservation?type=tennis_green_set" className="btn-primary block text-center w-full">
                Réserver maintenant
              </Link>
            </div>
            {/* Tennis green set autre */}
            <div className="bg-white text-sport-dark p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-2">Tennis Green Set (Autre)</h3>
              <p className="text-gray-600 mb-4">Court particulier</p>
              <div className="text-2xl font-bold text-sport-green mb-6">
                7.5 DT/joueur <span className="text-sm font-normal text-gray-600">(jour)</span><br/>
                10 DT/joueur <span className="text-sm font-normal text-gray-600">(nuit)</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>Disponible</span></li>
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>Location de raquettes</span></li>
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>Vestiaires & douches</span></li>
              </ul>
              <Link to="/reservation?type=tennis_green_set_autre" className="btn-primary block text-center w-full">
                Réserver maintenant
              </Link>
            </div>
            {/* Padel */}
            <div className="bg-white text-sport-dark p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-2">Padel</h3>
              <p className="text-gray-600 mb-4">Courts couverts</p>
              <div className="text-2xl font-bold text-sport-green mb-6">
                50 DT/4 joueurs <span className="text-sm font-normal text-gray-600">(jour)</span><br/>
                60 DT/4 joueurs <span className="text-sm font-normal text-gray-600">(nuit)</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>2 courts disponibles</span></li>
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>Location de raquettes</span></li>
                <li className="flex items-center"><svg className="w-5 h-5 text-sport-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg><span>Vestiaires & douches</span></li>
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
