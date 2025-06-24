
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import ReservationDatePicker from "@/components/ReservationDatePicker";
import TimeSlotSelector from "@/components/TimeSlotSelector";

interface Props {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  selectedTime: string;
  setSelectedTime: (s: string) => void;
  timeSlots: string[];
  isTimeSlotAvailable: (time: string) => boolean;
  availabilityLoading: boolean;
  selectedTerrainId: number | null;
}

const ReservationDateTimeSelector: React.FC<Props> = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  timeSlots,
  isTimeSlotAvailable,
  availabilityLoading,
  selectedTerrainId
}) => {
  // Auto-scroll to customer info section when both date and time are selected
  useEffect(() => {
    if (selectedDate && selectedTime) {
      // Small delay to ensure the customer info section is rendered
      setTimeout(() => {
        const customerInfoSection = document.querySelector('[data-section="customer-info"]');
        if (customerInfoSection) {
          customerInfoSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 300);
    }
  }, [selectedDate, selectedTime]);

  if (!selectedTerrainId) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" data-section="date-time">
      <div>
        <ReservationDatePicker value={selectedDate} onChange={setSelectedDate} />
      </div>
      <div>
        <Label htmlFor="time" className="text-lg font-semibold mb-2 flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Heure *
        </Label>
        <TimeSlotSelector
          timeSlots={timeSlots}
          selectedTime={selectedTime}
          isTimeSlotAvailable={isTimeSlotAvailable}
          onTimeSelect={setSelectedTime}
          loading={availabilityLoading && !!selectedDate}
        />
      </div>
    </div>
  );
};

export default ReservationDateTimeSelector;
