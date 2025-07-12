
import { useState, useEffect } from 'react';
import { WifiOff, Wifi, Clock } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

export default function OfflineIndicator() {
  const { isOnline, pendingItems } = useOfflineStorage();
  const [showDetails, setShowDetails] = useState(false);

  if (isOnline && pendingItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className={`rounded-lg p-3 shadow-lg cursor-pointer transition-all duration-300 ${
          isOnline ? 'bg-orange-100 border border-orange-300' : 'bg-red-100 border border-red-300'
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-orange-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${
            isOnline ? 'text-orange-700' : 'text-red-700'
          }`}>
            {isOnline ? 'Synchronisation en cours' : 'Mode hors ligne'}
          </span>
          {pendingItems.length > 0 && (
            <div className="bg-white rounded-full px-2 py-1 text-xs font-bold text-gray-700">
              {pendingItems.length}
            </div>
          )}
        </div>

        {showDetails && pendingItems.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-gray-600 border-t pt-2">
              Éléments en attente de synchronisation :
            </div>
            {pendingItems.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3 text-gray-500" />
                <span className="capitalize">{item.type}</span>
                <span className="text-gray-500">({item.action})</span>
              </div>
            ))}
            {pendingItems.length > 3 && (
              <div className="text-xs text-gray-500">
                +{pendingItems.length - 3} autres...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
