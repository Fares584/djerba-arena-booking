
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FieldCard, { Field, FieldType } from '@/components/FieldCard';

// Simulated fields data
const allFields: Field[] = [
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
    name: 'Foot à 6 - Terrain B',
    type: 'foot',
    capacity: 12,
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d?auto=format&fit=crop&q=80',
    status: 'available',
  },
  {
    id: 3,
    name: 'Foot à 8 - Terrain C',
    type: 'foot',
    capacity: 16,
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80',
    status: 'reserved',
  },
  {
    id: 4,
    name: 'Tennis - Court 1',
    type: 'tennis',
    capacity: 4,
    price: 30,
    imageUrl: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&q=80',
    status: 'available',
  },
  {
    id: 5,
    name: 'Tennis - Court 2',
    type: 'tennis',
    capacity: 4,
    price: 30,
    imageUrl: 'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?auto=format&fit=crop&q=80',
    status: 'reserved',
  },
  {
    id: 6,
    name: 'Padel - Court 1',
    type: 'padel',
    capacity: 4,
    price: 40,
    imageUrl: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&q=80',
    status: 'available',
  },
  {
    id: 7,
    name: 'Padel - Court 2',
    type: 'padel',
    capacity: 4,
    price: 40,
    imageUrl: 'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?auto=format&fit=crop&q=80',
    status: 'available',
  },
];

const Fields = () => {
  const [selectedType, setSelectedType] = useState<FieldType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'available' | 'reserved'>('all');

  const filteredFields = allFields.filter((field) => {
    const matchesType = selectedType === 'all' || field.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || field.status === selectedStatus;
    return matchesType && matchesStatus;
  });

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
                  onChange={(e) => setSelectedType(e.target.value as FieldType | 'all')}
                >
                  <option value="all">Tous les types</option>
                  <option value="foot">Football</option>
                  <option value="tennis">Tennis</option>
                  <option value="padel">Padel</option>
                </select>
              </div>
              
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-600 mb-2">Statut</label>
                <select 
                  className="w-full md:w-48 border rounded-md p-2"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'available' | 'reserved')}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="available">Disponible</option>
                  <option value="reserved">Réservé</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFields.map((field) => (
              <FieldCard key={field.id} field={field} />
            ))}
          </div>
          
          {/* No Results Message */}
          {filteredFields.length === 0 && (
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
