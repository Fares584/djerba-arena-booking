
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
  onStatusChange: (id: number, status: 'actif' | 'expire' | 'annule') => void;
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
      case 'annule':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'actif' | 'expire' | 'annule';
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
    <Card className="w-full shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white">
      <CardHeader className="pb-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
              {abonnement.client_nom}
            </CardTitle>
            {abonnement.client_tel && (
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-sport-green flex-shrink-0" />
                <span className="truncate">{abonnement.client_tel}</span>
              </div>
            )}
          </div>
          <Badge className={`${getStatusColor(abonnement.statut)} font-medium text-xs px-3 py-1 flex-shrink-0`}>
            {abonnement.statut.charAt(0).toUpperCase() + abonnement.statut.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Information principale */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 mt-1 text-sport-green flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-900 block truncate">{terrainLabel}</span>
              {typeLabel && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mt-1 inline-block">
                  {typeLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-sport-green flex-shrink-0" />
            <span className="text-sm text-gray-600">
              {getMonthName(abonnement.mois_abonnement)} {abonnement.annee_abonnement}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-sport-green flex-shrink-0" />
            <span className="text-sm text-gray-600">
              {abonnement.jour_semaine !== null && getDayName(abonnement.jour_semaine)} à {abonnement.heure_fixe}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-4 space-y-3">
          {/* Sélecteur de statut */}
          <div className="w-full">
            <select
              value={abonnement.statut}
              onChange={handleStatusChange}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-sport-green focus:border-transparent"
            >
              <option value="actif">Actif</option>
              <option value="expire">Expiré</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
          
          {/* Boutons d'actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRenew}
              className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="text-xs font-medium">Renouveler</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(abonnement)}
              className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span className="text-xs font-medium">Modifier</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-xs font-medium">Supprimer</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AbonnementCard;
