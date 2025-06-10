
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, X, Edit, Trash2, Clock, MapPin, User, Phone, Mail } from 'lucide-react';
import { Reservation } from '@/lib/supabase';

interface ReservationCardProps {
  reservation: Reservation;
  terrainName: string;
  onStatusChange: (id: number, status: 'confirmee' | 'annulee') => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: number) => void;
  isUpdating: boolean;
}

const ReservationCard = ({
  reservation,
  terrainName,
  onStatusChange,
  onEdit,
  onDelete,
  isUpdating
}: ReservationCardProps) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmee':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'annulee':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmee':
        return 'Confirmée';
      case 'en_attente':
        return 'En attente';
      case 'annulee':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Réservation #{reservation.id}
          </CardTitle>
          <Badge className={getStatusClass(reservation.statut)}>
            {getStatusLabel(reservation.statut)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Client Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <User className="h-4 w-4" />
            <span className="font-medium">{reservation.nom_client}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Mail className="h-4 w-4" />
            <span>{reservation.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Phone className="h-4 w-4" />
            <span>{reservation.tel}</span>
          </div>
        </div>

        {/* Reservation Details */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="h-4 w-4" />
            <span>{terrainName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="h-4 w-4" />
            <span>
              {format(new Date(reservation.date), 'dd/MM/yyyy', { locale: fr })} à {reservation.heure} ({reservation.duree}h)
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
            onClick={() => onEdit(reservation)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Modifier
          </Button>
          
          {reservation.statut === 'en_attente' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
                disabled={isUpdating}
                onClick={() => onStatusChange(reservation.id, 'confirmee')}
              >
                <Check className="h-4 w-4 mr-1" />
                Confirmer
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                disabled={isUpdating}
                onClick={() => onStatusChange(reservation.id, 'annulee')}
              >
                <X className="h-4 w-4 mr-1" />
                Annuler
              </Button>
            </>
          )}
          
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
            disabled={isUpdating}
            onClick={() => onDelete(reservation.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationCard;
