import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimeSlotButtonProps {
  time: string;
  selected: boolean;
  disabled: boolean;
  onClick: (time: string) => void;
}

export const TimeSlotButton: React.FC<TimeSlotButtonProps> = ({
  time,
  selected,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    onClick={() => !disabled && onClick(time)}
    disabled={disabled}
    className={[
      "px-4 py-2 rounded font-medium border transition-colors w-full",
      selected
        ? "bg-sport-green text-white border-sport-green"
        : disabled
        ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
        : "bg-white text-gray-900 border-gray-300 hover:bg-sport-green/10 hover:border-sport-green",
    ].join(" ")}
  >
    {time}
  </button>
);

interface TimeSlotSelectorProps {
  timeSlots: string[];
  selectedTime: string;
  isTimeSlotAvailable: (time: string) => boolean;
  onTimeSelect: (time: string) => void;
  loading?: boolean;
  useSelect?: boolean;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  timeSlots,
  selectedTime,
  isTimeSlotAvailable,
  onTimeSelect,
  loading = false,
  useSelect = false,
}) => {
  // Filtrer pour ne garder que les créneaux disponibles
  const availableSlots = timeSlots.filter((time) => isTimeSlotAvailable(time));

  if (useSelect) {
    return (
      <div>
        <Select value={selectedTime} onValueChange={onTimeSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionnez un créneau horaire" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {availableSlots.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {availableSlots.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground mt-2">
            Aucun créneau disponible pour cette date.
          </p>
        )}
        {loading && (
          <p className="text-sm text-muted-foreground mt-1">
            Vérification de la disponibilité...
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {availableSlots.map((time) => (
          <TimeSlotButton
            key={time}
            time={time}
            selected={selectedTime === time}
            disabled={false}
            onClick={onTimeSelect}
          />
        ))}
      </div>
      {availableSlots.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground mt-2">
          Aucun créneau disponible pour cette date.
        </p>
      )}
      {loading && (
        <p className="text-sm text-muted-foreground mt-1">
          Vérification de la disponibilité...
        </p>
      )}
    </div>
  );
};

export default TimeSlotSelector;
