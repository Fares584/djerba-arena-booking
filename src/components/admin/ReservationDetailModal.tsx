import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Check, 
  X, 
  Trash2, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Shield, 
  Globe,
  AlertTriangle 
} from 'lucide-react';
import { Reservation } from '@/lib/supabase';

interface ReservationDetailModalProps {
  reservation: Reservation | null;
  terrainName: string;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: number, status: 'confirmee' | 'annulee') => void;
  onDelete: (id: number) => void;
  isUpdating: boolean;
}

const ReservationDetailModal = ({
  reservation,
  terrainName,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
  isUpdating
}: ReservationDetailModalProps) => {
  if (!reservation) return null;

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
  const isAdminReservation = reservation.email?.includes('admin.reservation.') || false;
  
  const getClientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handlePhoneCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_blank');
  };

  const handleConfirm = () => {
    onStatusChange(reservation.id, 'confirmee');
    onClose();
  };

  const handleCancel = () => {
    onStatusChange(reservation.id, 'annulee');
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      onDelete(reservation.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Réservation #{reservation.id}
            </DialogTitle>
            <div className={`${statusConfig.color} ${statusConfig.textColor} px-3 py-1 rounded-full text-sm font-bold`}>
              {statusConfig.label}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section Client */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16 bg-blue-500">
                <AvatarFallback className="bg-blue-500 text-white font-bold text-xl">
                  {getClientInitials(reservation.nom_client)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {reservation.nom_client}
                </h3>
                <div className="flex items-center gap-2">
                  {isAdminReservation ? (
                    <Badge className="bg-blue-600 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Réservation Admin
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Globe className="h-3 w-3 mr-1" />
                      Site Web
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-white/70 rounded-lg p-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <button 
                    onClick={() => handlePhoneCall(reservation.tel)}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {reservation.tel}
                  </button>
                </div>
              </div>

              {!isAdminReservation && (
                <div className="flex items-center gap-3 bg-white/70 rounded-lg p-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm font-medium text-gray-900 break-all">
                      {reservation.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Réservation */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-500">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Détails de la réservation
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/70 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Terrain</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{terrainName}</p>
              </div>

              <div className="bg-white/70 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Date</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {format(new Date(reservation.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                </p>
              </div>

              <div className="bg-white/70 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Horaire</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {reservation.heure}
                </p>
              </div>

              <div className="bg-white/70 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Durée</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {reservation.duree}h
                </p>
              </div>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Informations de création</h4>
            <p className="text-sm text-gray-600">
              {isAdminReservation ? 'Créée par un administrateur le ' : 'Réservée sur le site le '}
              <span className="font-medium">
                {reservation.created_at 
                  ? format(new Date(reservation.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })
                  : 'Date inconnue'
                }
              </span>
            </p>
          </div>

          {/* Remarques */}
          {reservation.remarque && (
            <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Remarques</h4>
              </div>
              <p className="text-yellow-700">{reservation.remarque}</p>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {reservation.statut === 'en_attente' && (
                <>
                  <Button
                    onClick={handleConfirm}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirmer
                  </Button>
                  
                  <Button
                    onClick={handleCancel}
                    disabled={isUpdating}
                    variant="outline"
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                </>
              )}
              
              <Button
                onClick={handleDelete}
                disabled={isUpdating}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationDetailModal;