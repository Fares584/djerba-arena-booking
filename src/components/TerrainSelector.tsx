import React from 'react';
import { Terrain } from '@/lib/supabase';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {terrains.map((terrain) => (
        <div
          key={terrain.id}
          className={`bg-white rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
            selectedTerrainId === terrain.id
              ? 'border-sport-green bg-sport-green/5'
              : 'border-gray-200 hover:border-sport-green/50'
          }`}
          onClick={() => onTerrainSelect(terrain.id)}
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
            {terrain.image_url ? (
              <img
                src={terrain.image_url}
                alt={terrain.nom}
                className="w-full h-full object-cover"
                loading="lazy"
                style={{ imageRendering: "auto" }}
              />
            ) : (
              <img
                src="/placeholder.svg"
                alt="placeholder"
                className="w-16 h-16 opacity-60"
              />
            )}
            {selectedTerrainId === terrain.id && (
              <div className="absolute inset-0 bg-sport-green/20 flex items-center justify-center rounded-t-lg">
                <div className="bg-sport-green text-white rounded-full p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{terrain.nom}</h3>
            <div className="text-sm text-gray-600 mb-1">
              Capacité: {terrain.capacite} personnes
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-bold text-sport-green">
                  {terrain.prix} DT/h
                </div>
                {terrain.prix_nuit && (
                  <div className="text-sm text-gray-600">
                    Nuit: {terrain.prix_nuit} DT/h
                  </div>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
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
