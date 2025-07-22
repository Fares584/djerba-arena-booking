
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import TerrainSelector from "@/components/TerrainSelector";

interface Props {
  selectedType: string;
  terrainsLoading: boolean;
  filteredTerrains: any[];
  selectedTerrainId: number | null;
  setSelectedTerrainId: (id: number | null) => void;
}

const ReservationFieldSelector: React.FC<Props> = ({
  selectedType,
  terrainsLoading,
  filteredTerrains,
  selectedTerrainId,
  setSelectedTerrainId,
}) => {
  // Auto-scroll to date/time section when terrain is selected
  useEffect(() => {
    if (selectedTerrainId) {
      // Small delay to ensure the date/time section is rendered
      setTimeout(() => {
        const dateTimeSection = document.querySelector('[data-section="date-time"]');
        if (dateTimeSection) {
          dateTimeSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 300);
    }
  }, [selectedTerrainId]);

  if (!selectedType) return null;
  return (
    <div className="mb-8" data-section="terrain">
      <Label className="text-lg font-semibold mb-4 block">
        Terrain *
      </Label>
      {terrainsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <TerrainSelector
          terrains={filteredTerrains}
          selectedTerrainId={selectedTerrainId}
          onTerrainSelect={setSelectedTerrainId}
        />
      )}
    </div>
  );
};

export default ReservationFieldSelector;
