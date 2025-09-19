import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Check, X, Edit, Users, DollarSign, Image, Sun, Moon } from 'lucide-react';
import { Terrain, getTennisPricing } from '@/lib/supabase';

interface TerrainCardProps {
  terrain: Terrain;
  onStatusChange: (id: number, isActive: boolean) => void;
  onEdit: (terrain: Terrain) => void;
  isUpdating: boolean;
}

const TerrainCard = ({
  terrain,
  onStatusChange,
  onEdit,
  isUpdating
}: TerrainCardProps) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'foot':
        return 'Football';
      case 'tennis':
        return 'Tennis';
      case 'padel':
        return 'Padel';
      default:
        return type;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
      {/* Terrain Image */}
      <div className="relative aspect-[16/9] w-full">
        {terrain.image_url ? (
          <img
            src={terrain.image_url}
            alt={terrain.nom}
            className="w-full h-full object-cover rounded-t-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full absolute inset-0 ${terrain.image_url ? 'hidden' : 'flex'} items-center justify-center bg-gray-100 rounded-t-lg`}
          style={{ display: terrain.image_url ? 'none' : 'flex' }}
        >
          <Image className="h-12 w-12 text-gray-400" />
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {terrain.nom}
          </CardTitle>
          <Badge 
            className={terrain.actif ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}
          >
            {terrain.actif ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Terrain Details */}
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Type:</span> {getTypeLabel(terrain.type)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{terrain.capacite} personnes</span>
          </div>
          <div className="text-sm text-gray-600">
            {terrain.type === 'tennis' && getTennisPricing(terrain) ? (
              <div className="space-y-2">
                <div className="bg-green-50 p-2 rounded border-l-2 border-sport-green">
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="h-3 w-3 text-sport-green" />
                    <span className="text-xs font-medium text-gray-700">Simple (2p)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Sun className="h-3 w-3 text-yellow-500" />
                      <span className="font-semibold text-sport-green">{getTennisPricing(terrain)!.simple.jour} DT</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Moon className="h-3 w-3 text-blue-500" />
                      <span className="font-semibold text-sport-green">{getTennisPricing(terrain)!.simple.nuit} DT</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-2 rounded border-l-2 border-blue-500">
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="h-3 w-3 text-blue-500" />
                    <span className="text-xs font-medium text-gray-700">Double (4p)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Sun className="h-3 w-3 text-yellow-500" />
                      <span className="font-semibold text-sport-green">{getTennisPricing(terrain)!.double.jour} DT</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Moon className="h-3 w-3 text-blue-500" />
                      <span className="font-semibold text-sport-green">{getTennisPricing(terrain)!.double.nuit} DT</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <div>
                  <span className="font-semibold">{terrain.prix} DT/h</span>
                  {terrain.prix_nuit && (
                    <div className="flex items-center gap-1 mt-1">
                      <Moon className="h-3 w-3 text-blue-500" />
                      <span className="text-xs">{terrain.prix_nuit} DT/h</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-gray-300 hover:bg-gray-50 flex-1"
            onClick={() => onEdit(terrain)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Modifier
          </Button>
          
          {terrain.actif ? (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
              disabled={isUpdating}
              onClick={() => onStatusChange(terrain.id, false)}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
              disabled={isUpdating}
              onClick={() => onStatusChange(terrain.id, true)}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TerrainCard;
