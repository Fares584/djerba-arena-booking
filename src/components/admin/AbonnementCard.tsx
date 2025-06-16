
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Calendar, Clock, MapPin, User, Mail, Phone, AlertTriangle, CreditCard, CalendarDays } from 'lucide-react';
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
  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case 'actif':
        return {
          color: 'bg-green-500',
          textColor: 'text-white',
          label: 'ACTIF',
          bgLight: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'expire':
        return {
          color: 'bg-red-500',
          textColor: 'text-white',
          label: 'EXPIRÉ',
          bgLight: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'annule':
        return {
          color: 'bg-gray-500',
          textColor: 'text-white',
          label: 'ANNULÉ',
          bgLight: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          color: 'bg-blue-500',
          textColor: 'text-white',
          label: statut.toUpperCase(),
          bgLight: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
    }
  };

  const statusConfig = getStatusConfig(abonnement.statut);

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

  const getClientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className={`hover:shadow-xl transition-all duration-300 ${statusConfig.bgLight} ${statusConfig.borderColor} border-2`}>
      {/* Header avec statut et numéro */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${statusConfig.color} ${statusConfig.textColor} px-3 py-1 rounded-full text-sm font-bold`}>
              {statusConfig.label}
            </div>
            <span className="text-lg font-bold text-gray-700">#{abonnement.id}</span>
          </div>
          {abonnement.statut === 'actif' && (
            <div className={`flex items-center gap-1 text-sm font-medium ${getDaysRemainingColor(daysRemaining)}`}>
              {daysRemaining <= 7 && <AlertTriangle className="h-4 w-4" />}
              <span>{getDaysRemainingText(daysRemaining)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Section Client - Plus proéminente */}
        <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 bg-blue-100">
              <AvatarFallback className="bg-blue-500 text-white font-bold text-lg">
                {getClientInitials(abonnement.client_nom)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{abonnement.client_nom}</h3>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-lg">{abonnement.client_tel}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{abonnement.client_email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Abonnement - Informations principales */}
        <div className="bg-white rounded-lg p-4 border-l-4 border-sport-green">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-sport-green p-2 rounded-full">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Terrain & Type</span>
                <span className="text-lg font-bold text-gray-900">{terrainLabel}</span>
                <span className="text-sm text-gray-600 block">{typeLabel}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-sport-green p-2 rounded-full">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Période</span>
                <span className="text-lg font-bold text-gray-900">
                  {new Date(abonnement.date_debut).toLocaleDateString('fr-FR')} au {new Date(abonnement.date_fin).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
            
            {abonnement.jour_semaine !== null && abonnement.heure_fixe && (
              <div className="flex items-center gap-3">
                <div className="bg-sport-green p-2 rounded-full">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Horaire fixe</span>
                  <span className="text-lg font-bold text-gray-900">
                    {getDayName(abonnement.jour_semaine)} à {abonnement.heure_fixe} ({abonnement.duree_seance || 1}h)
                  </span>
                </div>
              </div>
            )}

            {abonnement.montant && (
              <div className="flex items-center gap-3">
                <div className="bg-sport-green p-2 rounded-full">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Montant</span>
                  <span className="text-lg font-bold text-gray-900">{abonnement.montant}€</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date de création */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <span className="text-sm text-gray-500">Créé le </span>
          <span className="font-medium text-gray-700">
            {abonnement.created_at 
              ? new Date(abonnement.created_at).toLocaleDateString('fr-FR')
              : 'Date inconnue'
            }
          </span>
        </div>

        {/* Status and Actions - Plus visibles */}
        <div className="pt-4 border-t-2 border-gray-100">
          <div className="flex items-center gap-2 mb-3">
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
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 font-medium"
              onClick={() => onEdit(abonnement)}
            >
              <Edit className="h-5 w-5 mr-2" />
              Modifier
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="lg"
                  variant="outline" 
                  className="text-red-600 border-red-600 hover:bg-red-50 font-medium"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Supprimer
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
