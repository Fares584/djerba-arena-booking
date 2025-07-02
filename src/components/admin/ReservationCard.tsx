
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, X, Edit, Trash2, Clock, MapPin, User, Phone, Mail, Calendar, Shield, Globe } from 'lucide-react';
import { Reservation } from '@/lib/supabase';

interface ReservationCardProps {
  reservation: Reservation;
  terrainName: string;
  onStatusChange: (id: number, status: 'confirmee' | 'annulee') => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: number) => void;
  isUpdating: boolean;
  isHistoryView?: boolean;
}

const ReservationCard = ({
  reservation,
  terrainName,
  onStatusChange,
  onEdit,
  onDelete,
  isUpdating,
  isHistoryView = false
}: ReservationCardProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmee':
        return {
          color: 'bg-green-500',
          textColor: 'text-white',
          label: 'CONFIRMÉE',
          bgLight: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'en_attente':
        return {
          color: 'bg-orange-500',
          textColor: 'text-white',
          label: 'EN ATTENTE',
          bgLight: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'annulee':
        return {
          color: 'bg-red-500',
          textColor: 'text-white',
          label: 'ANNULÉE',
          bgLight: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-white',
          label: status.toUpperCase(),
          bgLight: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusConfig = getStatusConfig(reservation.statut);

  const getClientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Déterminer si la réservation vient de l'admin ou du site web
  const isAdminReservation = reservation.email?.includes('admin.reservation.') || false;

  return (
    <Card className={`hover:shadow-xl transition-all duration-300 ${statusConfig.bgLight} ${statusConfig.borderColor} border-2 ${isHistoryView ? 'opacity-80' : ''} w-full max-w-full`}>
      {/* Header avec statut et numéro */}
      <CardHeader className="pb-4 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
            <div className={`${statusConfig.color} ${statusConfig.textColor} px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold w-fit`}>
              {statusConfig.label}
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-700">#{reservation.id}</span>
          </div>
          <div className="flex flex-col gap-2">
            {isHistoryView && (
              <Badge variant="outline" className="text-gray-500 border-gray-300 w-fit">
                Passée
              </Badge>
            )}
            {/* Badge pour indiquer l'origine de la réservation */}
            {isAdminReservation ? (
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white w-fit">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            ) : (
              <Badge variant="outline" className="text-green-600 border-green-600 w-fit">
                <Globe className="h-3 w-3 mr-1" />
                Site Web
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 px-4">
        {/* Section Client - Plus proéminente */}
        <div className="bg-white rounded-lg p-3 sm:p-4 border-l-4 border-blue-500">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 flex-shrink-0">
              <AvatarFallback className="bg-blue-500 text-white font-bold text-sm sm:text-lg">
                {getClientInitials(reservation.nom_client)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">{reservation.nom_client}</h3>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2 text-gray-600 min-w-0">
                  <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <a 
                    href={`tel:${reservation.tel}`}
                    className="font-medium text-sm sm:text-lg text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer break-all"
                    title={`Appeler ${reservation.tel}`}
                  >
                    {reservation.tel}
                  </a>
                </div>
                {!isAdminReservation && (
                  <div className="flex items-center gap-2 text-gray-600 min-w-0">
                    <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm break-all min-w-0" title={reservation.email}>{reservation.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section Réservation - Informations principales */}
        <div className="bg-white rounded-lg p-3 sm:p-4 border-l-4 border-sport-green">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-sport-green p-2 rounded-full flex-shrink-0">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm text-gray-500 block">Terrain</span>
                <span className="text-sm sm:text-lg font-bold text-gray-900 break-words block">{terrainName}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-sport-green p-2 rounded-full flex-shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm text-gray-500 block">Date</span>
                <span className="text-sm sm:text-lg font-bold text-gray-900 break-words">
                  {format(new Date(reservation.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-sport-green p-2 rounded-full flex-shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm text-gray-500 block">Horaire</span>
                <span className="text-sm sm:text-lg font-bold text-gray-900">
                  {reservation.heure} ({reservation.duree}h)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Date de création avec indication de l'origine */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <span className="text-xs sm:text-sm text-gray-500">
            {isAdminReservation ? 'Créée par admin le ' : 'Réservée sur le site le '}
          </span>
          <span className="font-medium text-gray-700 text-xs sm:text-sm">
            {reservation.created_at 
              ? format(new Date(reservation.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })
              : 'Date inconnue'
            }
          </span>
        </div>

        {/* Actions - Plus visibles */}
        {!isHistoryView && (
          <div className="pt-4 border-t-2 border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                size="sm"
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50 font-medium w-full"
                onClick={() => onEdit(reservation)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50 font-medium w-full"
                disabled={isUpdating}
                onClick={() => onDelete(reservation.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
            
            {reservation.statut === 'en_attente' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium w-full"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(reservation.id, 'confirmee')}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirmer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 font-medium w-full"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(reservation.id, 'annulee')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Refuser
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Actions pour la vue historique - Bouton suppression seulement */}
        {isHistoryView && (
          <div className="pt-4 border-t-2 border-gray-100">
            <div className="flex justify-center">
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50 font-medium w-full sm:w-auto"
                disabled={isUpdating}
                onClick={() => onDelete(reservation.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer définitivement
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReservationCard;
