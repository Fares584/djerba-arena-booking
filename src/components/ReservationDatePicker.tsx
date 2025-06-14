
import React from "react";
import { format, addDays, isAfter, isBefore, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ReservationDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
}

export default function ReservationDatePicker({
  value,
  onChange,
  label = "Date *"
}: ReservationDatePickerProps) {
  // Convert string to Date
  const selectedDate = value ? new Date(value) : undefined;
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 13); // 14 jours incluant aujourd'hui

  // Désactiver tous les jours en dehors de la période autorisée
  const isDateDisabled = (date: Date) => {
    return isBefore(date, today) || isAfter(date, maxDate);
  };

  return (
    <div>
      <span className="block text-lg font-semibold mb-2 flex items-center">
        <CalendarIcon className="mr-2 h-5 w-5" />
        {label}
      </span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-5 w-5 opacity-50" />
            {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span className="text-gray-400">Sélectionnez une date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-30" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) =>
              date ? onChange(format(date, "yyyy-MM-dd")) : undefined
            }
            disabled={isDateDisabled}
            initialFocus
            className="p-3 pointer-events-auto" // obligatoire pour shadcn calendar
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
