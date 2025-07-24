
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, AlertCircle } from "lucide-react";

interface Props {
  selectedType: string;
  setSelectedType: (type: string) => void;
}

const ReservationTypeSelector: React.FC<Props> = ({ selectedType, setSelectedType }) => {
  // Auto-scroll to terrain section when type is selected
  useEffect(() => {
    if (selectedType) {
      // Small delay to ensure the terrain section is rendered
      setTimeout(() => {
        const terrainSection = document.querySelector('[data-section="terrain"]');
        if (terrainSection) {
          terrainSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 300);
    }
  }, [selectedType]);

  return (
    <div className="mb-8">
      <Label htmlFor="type" className="text-lg font-semibold mb-4 flex items-center">
        <MapPin className="mr-2 h-5 w-5" />
        Type de terrain *
      </Label>
      <Select value={selectedType} onValueChange={setSelectedType}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionnez un type de terrain" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="foot">Football</SelectItem>
          <SelectItem value="tennis">Tennis</SelectItem>
          <SelectItem value="padel">Padel</SelectItem>
        </SelectContent>
      </Select>

      {/* Message d'information pour le football */}
      {selectedType === 'foot' && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-orange-800 mb-2">
                Terrains de foot pas encore disponibles pour réservation
              </h4>
              <p className="text-orange-700 text-sm mb-3">
                Les réservations pour les terrains de football ne sont pas encore ouvertes.
              </p>
              <div className="flex items-center gap-2 text-orange-800">
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Pour réserver, veuillez appeler : 
                  <a 
                    href="tel:29612809" 
                    className="ml-1 font-bold underline hover:text-orange-900"
                  >
                    29 612 809
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationTypeSelector;
