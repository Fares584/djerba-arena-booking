
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Edit, Calendar, Clock, MapPin, User, Phone, Trash2, RotateCcw, Shield, Globe } from 'lucide-react';
import { Abonnement } from '@/lib/supabase';
import { getMonthName, getDayName } from '@/lib/supabase';
import { calculateDaysRemaining } from '@/hooks/useAbonnementExpiration';

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
          color: 'bg-gray-500',
          textColor: 'text-white',
          label: statut.toUpperCase(),
          bgLight: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusConfig = getStatusConfig(abonnement.statut);

  const getClientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

  // Calculate remaining days
  const daysRemaining = calculateDaysRemaining(abonnement.mois_abonnement, abonnement.annee_abonnement);
  
  const getDaysRemainingDisplay = () => {
    if (abonnement.statut === 'expire') {
      return { text: 'Expiré', color: 'text-red-600', bgColor: 'bg-red-100' };
    }
    if (abonnement.statut === 'annule') {
      return { text: 'Annulé', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
    
    if (daysRemaining < 0) {
      return { text: 'Expiré', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (daysRemaining === 0) {
      return { text: 'Expire aujourd\'hui', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    } else if (daysRemaining <= 7) {
      return { text: `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    } else {
      return { text: `${daysRemaining} jours restants`, color: 'text-green-600', bgColor: 'bg-green-100' };
    }
  };

  const daysDisplay = getDaysRemainingDisplay();

  return (
    <Card className={`hover:shadow-xl transition-all duration-300 ${statusConfig.bgLight} ${statusConfig.borderColor} border-2 w-full max-w-full`}>
      {/* Header avec statut et numéro */}
      <CardHeader className="pb-4 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
            <div className={`${statusConfig.color} ${statusConfig.textColor} px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold w-fit`}>
              {statusConfig.label}
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-700">#{abonnement.id}</span>
          </div>
          <div className="flex flex-col gap-2">
            {/* Badge pour indiquer qu'il s'agit d'un abonnement */}
            <Badge className="bg-purple-600 hover:bg-purple-700 text-white w-fit">
              <Shield className="h-3 w-3 mr-1" />
              Abonnement
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 px-4">
        {/* Section Client - Plus proéminente */}
        <div className="bg-white rounded-lg p-3 sm:p-4 border-l-4 border-blue-500">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 flex-shrink-0">
              <AvatarFallback className="bg-blue-500 text-white font-bold text-sm sm:text-lg">
                {getClientInitials(abonnement.client_nom)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">{abonnement.client_nom}</h3>
              <div className="grid grid-cols-1 gap-2">
                {abonnement.client_tel && (
                  <div className="flex items-center gap-2 text-gray-600 min-w-0">
                    <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <a 
                      href={`tel:${abonnement.client_tel}`}
                      className="font-medium text-sm sm:text-lg text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer break-all"
                      title={`Appeler ${abonnement.client_tel}`}
                    >
                      {abonnement.client_tel}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section Abonnement - Informations principales */}
        <div className="bg-white rounded-lg p-3 sm:p-4 border-l-4 border-sport-green">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-sport-green p-2 rounded-full flex-shrink-0">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm text-gray-500 block">Terrain</span>
                <span className="text-sm sm:text-lg font-bold text-gray-900 break-words block">{terrainLabel}</span>
                {typeLabel && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mt-1 inline-block">
                    {typeLabel}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-sport-green p-2 rounded-full flex-shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm text-gray-500 block">Période</span>
                <span className="text-sm sm:text-lg font-bold text-gray-900 break-words">
                  {getMonthName(abonnement.mois_abonnement)} {abonnement.annee_abonnement}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-sport-green p-2 rounded-full flex-shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm text-gray-500 block">Horaire fixe</span>
                <span className="text-sm sm:text-lg font-bold text-gray-900">
                  {abonnement.jour_semaine !== null && getDayName(abonnement.jour_semaine)} à {abonnement.heure_fixe}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section jours restants */}
        <div className={`${daysDisplay.bgColor} rounded-lg p-3 text-center border`}>
          <span className="text-xs sm:text-sm text-gray-500 block mb-1">
            Temps restant
          </span>
          <span className={`font-bold text-sm sm:text-base ${daysDisplay.color}`}>
            {daysDisplay.text}
          </span>
        </div>

        {/* Date de création */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <span className="text-xs sm:text-sm text-gray-500">
            Créé le{' '}
          </span>
          <span className="font-medium text-gray-700 text-xs sm:text-sm">
            {abonnement.created_at 
              ? new Date(abonnement.created_at).toLocaleDateString('fr-FR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Date inconnue'
            }
          </span>
        </div>

        {/* Sélecteur de statut */}
        <div className="bg-white rounded-lg p-3 border">
          <label className="text-xs sm:text-sm text-gray-500 block mb-2">Statut</label>
          <select
            value={abonnement.statut}
            onChange={handleStatusChange}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-sport-green focus:border-transparent font-medium"
          >
            <option value="actif">Actif</option>
            <option value="expire">Expiré</option>
            <option value="annule">Annulé</option>
          </select>
        </div>

        {/* Actions - Plus visibles */}
        <div className="pt-4 border-t-2 border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 font-medium w-full"
              onClick={() => onEdit(abonnement)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50 font-medium w-full"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
          
          <div className="mt-3">
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium w-full"
              onClick={handleRenew}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Renouveler pour le mois suivant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AbonnementCard;
