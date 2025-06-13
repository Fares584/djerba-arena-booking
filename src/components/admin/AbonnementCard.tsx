
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Calendar, Clock, MapPin, User, Mail, Phone, AlertTriangle } from 'lucide-react';
import { Abonnement, getDayName } from '@/lib/supabase';
import { calculateDaysRemaining } from '@/hooks/useAbonnementExpiration';

interface AbonnementCardProps {
  abonnement: Abonnement;
  typeLabel: string;
  terrainLabel: string;
  onStatusChange: (id: number, status: 'actif' | 'expire' | 'annule') => void;
  onEdit: (abonnement: Abonnement) => void;
  onDelete: (id: number) => void;
}

const AbonnementCard = ({
  abonnement,
  typeLabel,
  terrainLabel,
  onStatusChange,
  onEdit,
  onDelete
}: AbonnementCardProps) => {
  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'actif':
        return 'Actif';
      case 'expire':
        return 'Expiré';
      case 'annule':
        return 'Annulé';
      default:
        return statut;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'actif':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expire':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'annule':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Calculer les jours restants
  const daysRemaining = calculateDaysRemaining(abonnement.date_fin);
  
  const getDaysRemainingColor = (days: number) => {
    if (days < 0) return 'text-red-600';
    if (days <= 7) return 'text-orange-600';
    if (days <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getDaysRemainingText = (days: number) => {
    if (days < 0) return `Expiré depuis ${Math.abs(days)} jour(s)`;
    if (days === 0) return 'Expire aujourd\'hui';
    if (days === 1) return 'Expire demain';
    return `${days} jour(s) restant(s)`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {abonnement.client_nom}
          </CardTitle>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(abonnement.statut)}>
              {getStatusLabel(abonnement.statut)}
            </Badge>
            {abonnement.statut === 'actif' && (
              <div className={`flex items-center gap-1 text-sm font-medium ${getDaysRemainingColor(daysRemaining)}`}>
                {daysRemaining <= 7 && <AlertTriangle className="h-4 w-4" />}
                <span>{getDaysRemainingText(daysRemaining)}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Client Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Mail className="h-4 w-4" />
            <span>{abonnement.client_email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Phone className="h-4 w-4" />
            <span>{abonnement.client_tel}</span>
          </div>
        </div>

        {/* Abonnement Details */}
        <div className="border-t pt-3 space-y-2">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Type:</span> {typeLabel}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{terrainLabel}</span>
          </div>
          {abonnement.jour_semaine !== null && abonnement.heure_fixe && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                {getDayName(abonnement.jour_semaine)} à {abonnement.heure_fixe} ({abonnement.duree_seance || 1}h)
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              Du {new Date(abonnement.date_debut).toLocaleDateString('fr-FR')} au {new Date(abonnement.date_fin).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="border-t pt-3 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Statut:</span>
            <Select
              value={abonnement.statut}
              onValueChange={(value: 'actif' | 'expire' | 'annule') => 
                onStatusChange(abonnement.id, value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="expire">Expiré</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(abonnement)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Modifier
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer l'abonnement</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer cet abonnement ? 
                    Cette action supprimera également toutes les réservations associées et ne peut pas être annulée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(abonnement.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AbonnementCard;
