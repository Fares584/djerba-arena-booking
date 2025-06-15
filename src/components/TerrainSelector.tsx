
import React from 'react';
import { Terrain } from '@/lib/supabase';
import { Image } from 'lucide-react';

interface TerrainSelectorProps {
  terrains: Terrain[];
  selectedTerrainId: number | null;
  onTerrainSelect: (terrainId: number) => void;
}

const TerrainSelector = ({ terrains, selectedTerrainId, onTerrainSelect }: TerrainSelectorProps) => {
  if (terrains.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Aucun terrain disponible pour ce type
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {terrains.map((terrain) => (
        <div
          key={terrain.id}
          className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col cursor-pointer border-2 ${
            selectedTerrainId === terrain.id
              ? 'border-sport-green bg-sport-green/5'
              : 'border-gray-200 hover:border-sport-green/50'
          }`}
          onClick={() => onTerrainSelect(terrain.id)}
        >
          <div className="relative aspect-[16/9] w-full">
            {terrain.image_url ? (
              <img
                src={terrain.image_url}
                alt={terrain.nom}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  const fallback = img.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
                draggable={false}
              />
            ) : null}
            <div
              className="absolute inset-0 flex items-center justify-center bg-gray-100"
              style={{ display: terrain.image_url ? 'none' : 'flex' }}
            >
              <Image className="h-12 w-12 text-gray-400" />
            </div>
            {selectedTerrainId === terrain.id && (
              <div className="absolute inset-0 bg-sport-green/30 flex items-center justify-center pointer-events-none">
                <div className="bg-sport-green text-white rounded-full p-2 shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-bold text-xl mb-2">{terrain.nom}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600 font-medium">
                Capacité: {terrain.capacite} personnes
              </span>
            </div>
            <div className="flex justify-between items-center mt-auto">
              <div>
                <p className="text-lg font-bold text-sport-green">{terrain.prix} DT/h</p>
                {terrain.prix_nuit && (
                  <p className="text-sm text-gray-600">
                    Nuit&nbsp;: {terrain.prix_nuit} DT/h
                  </p>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                terrain.actif 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {terrain.actif ? 'Disponible' : 'Indisponible'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TerrainSelector;

