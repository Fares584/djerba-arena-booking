
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

interface Props {
  selectedType: string;
  setSelectedType: (type: string) => void;
}

const ReservationTypeSelector: React.FC<Props> = ({ selectedType, setSelectedType }) => (
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
  </div>
);

export default ReservationTypeSelector;
