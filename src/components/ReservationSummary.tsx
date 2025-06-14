
import React from "react";
import { isNightTime } from "@/lib/supabase";
import { Clock } from "lucide-react";

interface ReservationSummaryProps {
  terrain: {
    nom: string;
    type: string;
    prix: number;
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
}) => (
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
            {totalPrice.toFixed(2)} DT
          </span>
        </div>
        {terrain.type === 'foot' && (
          <div className="text-sm text-gray-600 mt-1">
            Tarif fixe pour 1h30 ({isNightTime(selectedTime, '19:00') ? 'nuit' : 'jour'})
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ReservationSummary;
