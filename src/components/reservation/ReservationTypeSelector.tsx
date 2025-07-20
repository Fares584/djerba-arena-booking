
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

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
          <SelectItem value="tennis">Tennis</SelectItem>
          <SelectItem value="padel">Padel</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ReservationTypeSelector;
