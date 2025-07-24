
import React from 'react';
import { Terrain } from '@/lib/supabase';
import { Image, SquareCheckBig, Lock } from 'lucide-react';

interface TerrainSelectorProps {
  terrains: Terrain[];
  selectedTerrainId: number | null;
  onTerrainSelect: (terrainId: number) => void;
  isAdminContext?: boolean; // Nouveau prop pour distinguer l'admin du site public
}

const TerrainSelector = ({
  terrains,
  selectedTerrainId,
  onTerrainSelect,
  isAdminContext = false // Par défaut false (site public)
}: TerrainSelectorProps) => {
  if (terrains.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Aucun terrain disponible pour ce type
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {terrains.map((terrain) => {
        const isSelected = selectedTerrainId === terrain.id;
        const isFootball = terrain.type === 'foot';
        const isDisabled = isFootball && !isAdminContext; // Football désactivé seulement côté public
        
        return (
          <div
            key={terrain.id}
            className={`relative bg-white rounded-xl overflow-hidden shadow-md transition-all flex flex-col border-4
              ${
                isDisabled
                  ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-75'
                  : isSelected
                  ? 'border-sport-green ring-4 ring-sport-green/40 bg-green-50 shadow-xl scale-105 cursor-pointer hover:shadow-lg'
                  : 'border-gray-200 hover:border-sport-green/60 cursor-pointer hover:shadow-lg'
              }
            `}
            style={{
              transition: 'box-shadow 0.15s, border-color 0.15s, transform 0.15s'
            }}
            onClick={() => !isDisabled && onTerrainSelect(terrain.id)}
          >
            <div className="relative aspect-[16/9] w-full">
              {terrain.image_url ? (
                <img
                  src={terrain.image_url}
                  alt={terrain.nom}
                  className={`w-full h-full object-cover ${isDisabled ? 'grayscale' : ''}`}
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
                className={`absolute inset-0 flex items-center justify-center ${isDisabled ? 'bg-gray-200' : 'bg-gray-100'}`}
                style={{ display: terrain.image_url ? 'none' : 'flex' }}
              >
                <Image className={`h-12 w-12 ${isDisabled ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
              
              {/* Overlay de verrouillage pour les terrains de football côté public */}
              {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
                  <div className="bg-white text-gray-800 rounded-lg p-4 shadow-2xl border-2 border-gray-300 text-center">
                    <Lock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="font-bold text-sm">Pas encore disponible</p>
                  </div>
                </div>
              )}
              
              {isSelected && !isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in">
                  <div className="bg-sport-green text-white rounded-full p-4 shadow-2xl border-4 border-white animate-bounce-slow">
                    <SquareCheckBig className="w-10 h-10" strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>
            <div className={`p-5 flex flex-col flex-1 ${isSelected && !isDisabled ? 'bg-green-100/60' : isDisabled ? 'bg-gray-50' : ''}`}>
              <h3 className={`font-bold text-xl mb-2 ${isDisabled ? 'text-gray-500' : ''}`}>{terrain.nom}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
                  Capacité: {terrain.capacite} personnes
                </span>
              </div>
              <div className="flex justify-between items-center mt-auto">
                <div>
                  <p className={`text-lg font-bold ${isDisabled ? 'text-gray-400' : 'text-sport-green'}`}>
                    {terrain.prix} DT/h
                  </p>
                  {terrain.prix_nuit && (
                    <p className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
                      Nuit&nbsp;: {terrain.prix_nuit} DT/h
                    </p>
                  )}
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isDisabled
                      ? 'bg-gray-200 text-gray-500'
                      : terrain.actif
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isDisabled ? 'Pas encore disponible' : terrain.actif ? 'Disponible' : 'Indisponible'}
                </div>
              </div>
            </div>
            {/* Animation CSS pour la coche */}
            <style>{`
              @keyframes bounce-slow {
                0%, 100% { transform: scale(1);}
                50% { transform: scale(1.15);}
              }
              .animate-bounce-slow {
                animation: bounce-slow 1s infinite;
              }
            `}</style>
          </div>
        );
      })}
    </div>
  );
};

export default TerrainSelector;
