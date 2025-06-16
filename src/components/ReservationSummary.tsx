
import React from "react";
import { isNightTime, calculatePrice } from "@/lib/supabase";
import { Clock } from "lucide-react";

interface ReservationSummaryProps {
  terrain: {
    nom: string;
    type: string;
    prix: number;
    prix_nuit?: number;
  };
  selectedDate: string;
  selectedTime: string;
  duration: string;
  totalPrice: number;
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  terrain,
  selectedDate,
  selectedTime,
  duration,
  totalPrice,
}) => {
  // Recalculate price directly in component to ensure freshness
  const recalculatedPrice = React.useMemo(() => {
    if (!terrain || !selectedTime) return totalPrice;
    
    const effectiveDuration = parseFloat(duration);
    const globalNightStartTime = '19:00';
    
    // Pour les terrains de football : tarif fixe pour 1h30
    if (terrain.type === 'foot') {
      return calculatePrice(terrain as any, selectedTime, globalNightStartTime);
    }
    
    // Pour les autres terrains : calcul par heure
    let total = 0;
    let timeHour = parseInt(selectedTime.split(':')[0], 10);
    let timeMinute = parseInt(selectedTime.split(':')[1], 10);

    for (let i = 0; i < effectiveDuration; i++) {
      const slotTime = 
        timeHour.toString().padStart(2, '0') + ':' + 
        timeMinute.toString().padStart(2, '0');
      total += calculatePrice(terrain as any, slotTime, globalNightStartTime);

      let newDate = new Date(2000, 0, 1, timeHour, timeMinute);
      newDate.setHours(newDate.getHours() + 1);
      timeHour = newDate.getHours();
      timeMinute = newDate.getMinutes();
    }
    return total;
  }, [terrain, selectedTime, duration, totalPrice]);

  return (
    <div className="bg-sport-gray p-6 rounded-lg mb-8">
      <h3 className="text-lg font-semibold mb-4">Résumé de la réservation</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Terrain:</span>
          <span className="font-medium">{terrain.nom}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span className="font-medium">{selectedDate}</span>
        </div>
        <div className="flex justify-between">
          <span>Heure:</span>
          <span className="font-medium">{selectedTime}</span>
        </div>
        <div className="flex justify-between">
          <span>Durée:</span>
          <span className="font-medium">{duration}h</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between text-lg font-bold">
            <span>Prix total:</span>
            <span className="text-sport-green">
              {recalculatedPrice.toFixed(2)} DT
            </span>
          </div>
          {terrain.type === 'foot' && (
            <div className="text-sm text-gray-600 mt-1">
              Tarif fixe pour 1h30 ({isNightTime(selectedTime, '19:00') ? 'nuit' : 'jour'})
            </div>
          )}
          {terrain.type !== 'foot' && (
            <div className="text-sm text-gray-600 mt-1">
              Tarif {isNightTime(selectedTime, '19:00') ? 'nuit' : 'jour'}
              {terrain.prix_nuit && isNightTime(selectedTime, '19:00') 
                ? ` (${terrain.prix_nuit} DT/h)` 
                : ` (${terrain.prix} DT/h)`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationSummary;
