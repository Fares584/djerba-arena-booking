
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { MapPin, Construction } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Props {
  selectedType: string;
  setSelectedType: (type: string) => void;
}

const types = [
  { value: "tennis", label: "Tennis", available: true },
  { value: "padel", label: "Padel", available: true },
  { value: "foot", label: "Football", available: false },
];

const ReservationTypeSelector: React.FC<Props> = ({ selectedType, setSelectedType }) => {
  useEffect(() => {
    if (selectedType && selectedType !== 'foot') {
      setTimeout(() => {
        const terrainSection = document.querySelector('[data-section="terrain"]');
        if (terrainSection) {
          terrainSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [selectedType]);

  return (
    <div className="mb-8">
      <Label className="text-lg font-semibold mb-4 flex items-center">
        <MapPin className="mr-2 h-5 w-5" />
        Type de terrain *
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {types.map((type) => (
          <div key={type.value}>
            {type.available ? (
              <button
                type="button"
                onClick={() => setSelectedType(type.value)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all cursor-pointer focus:outline-none
                  ${selectedType === type.value
                    ? 'border-sport-green bg-green-50 text-sport-green font-semibold'
                    : 'border-gray-200 bg-white hover:border-sport-green hover:bg-green-50'
                  }`}
              >
                <span className="font-medium">{type.label}</span>
              </button>
            ) : (
              <div className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 relative opacity-70 cursor-not-allowed">
                <div className="flex items-start gap-2">
                  <Construction className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-500">{type.label}</p>
                    <p className="text-xs text-amber-600 mt-0.5 font-medium">
                      Prochainement disponible
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      En cours d'aménagement
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReservationTypeSelector;
