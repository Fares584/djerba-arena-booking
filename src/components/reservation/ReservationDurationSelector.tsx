
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";

interface Props {
  selectedTerrain: any;
  duration: string;
  setDuration: (val: string) => void;
  durationOptions: { value: string; label: string }[];
}

const ReservationDurationSelector: React.FC<Props> = ({
  selectedTerrain,
  duration,
  setDuration,
  durationOptions
}) => {
  if (!selectedTerrain) return null;
  if (selectedTerrain.type === 'foot') {
    return (
      <div className="mb-8">
        <Label className="text-lg font-semibold mb-2 block">
          Durée de la réservation
        </Label>
        <div className="w-full border rounded-md p-3 bg-gray-100 text-gray-700 flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          1h30 (durée fixe pour le football)
        </div>
      </div>
    );
  }
  // Non-football
  return (
    <div className="mb-8">
      <Label htmlFor="duration" className="text-lg font-semibold mb-2 block">
        Durée de la réservation *
      </Label>
      <Select value={duration} onValueChange={setDuration}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionnez la durée" />
        </SelectTrigger>
        <SelectContent>
          {durationOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ReservationDurationSelector;
