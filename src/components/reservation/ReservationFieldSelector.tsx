
import React from "react";
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
  if (!selectedType) return null;
  return (
    <div className="mb-8">
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
