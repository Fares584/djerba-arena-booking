
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, Clock, MapPin, Phone, Shield, Globe } from 'lucide-react';
import { Reservation } from '@/lib/supabase';

interface ReservationCardProps {
  reservation: Reservation;
  terrainName: string;
  onView: (reservation: Reservation) => void;
}

const ReservationCard = ({
  reservation,
  terrainName,
  onView
}: ReservationCardProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmee':
        return { color: 'bg-green-500', label: 'Confirmée', textColor: 'text-green-600' };
      case 'en_attente':
        return { color: 'bg-yellow-500', label: 'En attente', textColor: 'text-yellow-600' };
      case 'annulee':
        return { color: 'bg-red-500', label: 'Annulée', textColor: 'text-red-600' };
      default:
        return { color: 'bg-gray-500', label: status, textColor: 'text-gray-600' };
    }
  };

  const statusConfig = getStatusConfig(reservation.statut);
  const isAdminReservation = reservation.email?.includes('admin.reservation.') || false;
  
  const getClientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 bg-white border border-gray-200 cursor-pointer" 
          onClick={() => onView(reservation)}>
      <CardContent className="p-4">
        {/* Header avec nom et statut */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-blue-500">
              <AvatarFallback className="bg-blue-500 text-white font-semibold">
                {getClientInitials(reservation.nom_client)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{reservation.nom_client}</h3>
              <p className="text-sm text-gray-500">#{reservation.id}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${statusConfig.color} text-white`}>
              {statusConfig.label}
            </Badge>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                onView(reservation);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Voir
            </Button>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Email:</span>
            <span className="truncate">{reservation.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Téléphone:</span>
            <span>{reservation.tel}</span>
          </div>
        </div>

        {/* Détails de la réservation */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Terrain:</span>
            <p className="text-gray-900">{terrainName}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Date:</span>
            <p className="text-gray-900">
              {format(new Date(reservation.date), 'dd/MM/yyyy', { locale: fr })}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Heure:</span>
            <p className="text-gray-900">{reservation.heure}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Durée:</span>
            <p className="text-gray-900">{reservation.duree}h</p>
          </div>
        </div>

        {/* Source de la réservation */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {isAdminReservation ? 'Créée par admin' : 'Réservée en ligne'}
            </span>
            {isAdminReservation ? (
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            ) : (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Globe className="h-3 w-3 mr-1" />
                Web
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationCard;
