import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Calendar, Clock, MapPin, User, Phone, Trash2, RotateCcw } from 'lucide-react';
import { Abonnement } from '@/lib/supabase';
import { getMonthName, getDayName } from '@/lib/supabase';

interface AbonnementCardProps {
  abonnement: Abonnement;
  terrainLabel: string;
  typeLabel: string;
  onStatusChange: (id: number, status: 'actif' | 'expire') => void;
  onEdit: (abonnement: Abonnement) => void;
  onDelete: (id: number) => void;
  onRenew: (abonnement: Abonnement) => void;
}

const AbonnementCard = ({ 
  abonnement, 
  terrainLabel, 
  typeLabel, 
  onStatusChange, 
  onEdit, 
  onDelete,
  onRenew
}: AbonnementCardProps) => {
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'actif':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expire':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'actif' | 'expire';
    onStatusChange(abonnement.id, newStatus);
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      onDelete(abonnement.id);
    }
  };

  const handleRenew = () => {
    if (window.confirm('Créer un nouvel abonnement pour le mois suivant ?')) {
      onRenew(abonnement);
    }
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {abonnement.client_nom}
          </CardTitle>
          <Badge className={`${getStatusColor(abonnement.statut)} font-medium`}>
            {abonnement.statut.charAt(0).toUpperCase() + abonnement.statut.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-sport-green" />
            <span className="font-medium">{terrainLabel}</span>
            <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
              {typeLabel}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-sport-green" />
            <span>
              {getMonthName(abonnement.mois_abonnement)} {abonnement.annee_abonnement}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-sport-green" />
            <span>
              {abonnement.jour_semaine !== null && getDayName(abonnement.jour_semaine)} à {abonnement.heure_fixe}
            </span>
          </div>

          {abonnement.client_tel && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 text-sport-green" />
              <span>{abonnement.client_tel}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-3 mt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={abonnement.statut}
              onChange={handleStatusChange}
              className="text-xs border rounded px-2 py-1 flex-1"
            >
              <option value="actif">Actif</option>
              <option value="expire">Expiré</option>
            </select>
            
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRenew}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                title="Renouveler pour le mois suivant"
              >
                <RotateCcw className="h-3 w-3" />
                Renouveler
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(abonnement)}
                className="flex items-center gap-1 text-xs"
              >
                <Edit className="h-3 w-3" />
                Modifier
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AbonnementCard;
