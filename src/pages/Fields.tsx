
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FieldCard from '@/components/FieldCard';
import { useTerrains } from '@/hooks/useTerrains';

const Fields = () => {
  const [selectedType, setSelectedType] = useState<string>('all');

  // Fetch terrains from Supabase
  const { data: terrains, isLoading, error } = useTerrains();

  // Appliquer seulement le filtre sur le type de terrain
  const filteredFields = terrains?.filter((field) => {
    const matchesType = selectedType === 'all' || field.type === selectedType;
    return matchesType;
  }) || [];

  return (
    <>
      <Navbar />
      
      {/* Header */}
      <div className="bg-sport-dark text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-4">Nos Terrains</h1>
          <p className="text-xl max-w-2xl">
            Découvrez nos terrains de qualité disponibles pour votre prochaine activité sportive.
            Réservez facilement en quelques clics.
          </p>
        </div>
      </div>
      
      {/* Filters and Fields List */}
      <section className="section-padding bg-sport-gray">
        <div className="container-custom">
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">Filtrer les terrains</h2>
            <div className="flex flex-wrap gap-4">
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-600 mb-2">Type de terrain</label>
                <select 
                  className="w-full md:w-48 border rounded-md p-2"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  <option value="foot">Football</option>
                  <option value="tennis">Tennis</option>
                  <option value="padel">Padel</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-pulse text-xl font-medium">
                Chargement des terrains...
              </div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold mb-2 text-red-600">Erreur de chargement</h3>
              <p className="text-gray-600">
                Impossible de charger les terrains. Veuillez réessayer plus tard.
              </p>
            </div>
          )}
          
          {/* Fields Grid - Responsive layout */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
              {filteredFields.map((field) => (
                <FieldCard 
                  key={field.id} 
                  field={{
                    id: field.id,
                    name: field.nom,
                    nom: field.nom,
                    type: field.type,
                    capacity: field.capacite,
                    price: field.prix,
                    priceNight: field.prix_nuit || undefined,
                    imageUrl: field.image_url || '',
                    status: field.actif ? 'available' : 'reserved'
                  }} 
                />
              ))}
            </div>
          )}
          
          {/* No Results Message */}
          {!isLoading && !error && filteredFields.length === 0 && (
            <div className="text-center py-8">
              <h3 className="text-xl font-bold mb-2">Aucun terrain trouvé</h3>
              <p className="text-gray-600">
                Aucun terrain ne correspond à vos critères de recherche. Veuillez modifier vos filtres.
              </p>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Fields;
