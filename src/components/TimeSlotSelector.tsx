
import React from "react";

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
        ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
        : "bg-white text-gray-900 border-gray-300 hover:bg-sport-green/10 hover:border-sport-green",
    ].join(" ")}
  >
    {time}
    {disabled && (
      <span className="ml-1 text-xs align-middle">(Occupé)</span>
    )}
  </button>
);

interface TimeSlotSelectorProps {
  timeSlots: string[];
  selectedTime: string;
  isTimeSlotAvailable: (time: string) => boolean;
  onTimeSelect: (time: string) => void;
  loading?: boolean;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  timeSlots,
  selectedTime,
  isTimeSlotAvailable,
  onTimeSelect,
  loading = false,
}) => (
  <div>
    <div className="grid grid-cols-3 gap-2">
      {timeSlots.map((time) => {
        const available = isTimeSlotAvailable(time);
        return (
          <TimeSlotButton
            key={time}
            time={time}
            selected={selectedTime === time}
            disabled={!available}
            onClick={onTimeSelect}
          />
        );
      })}
    </div>
    {loading && (
      <p className="text-sm text-gray-500 mt-1">
        Vérification de la disponibilité...
      </p>
    )}
  </div>
);

export default TimeSlotSelector;

