import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { getTennisPricing } from '@/lib/supabase';
import { Sun, Moon, Users } from 'lucide-react';

export type FieldType = 'foot' | 'tennis' | 'padel';
export type FieldStatus = 'available' | 'reserved' | 'pending';

export interface Field {
  id: number;
  name: string;
  type: FieldType;
  capacity: number;
  price: number;
  priceNight?: number;
  imageUrl: string;
  status: FieldStatus;
  nom?: string; // Add this for compatibility with Terrain type
}

interface FieldCardProps {
  field: Field;
}

const FieldCard: React.FC<FieldCardProps> = ({ field }) => {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status: FieldStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: FieldStatus) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'reserved':
        return 'Réservé';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: FieldType) => {
    switch (type) {
      case 'foot':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l-3 3m0 0L9 9m3 3V6m0 0v6" />
          </svg>
        );
      case 'tennis':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.5 7.5 6.5 16.5 12 22M12 2c5.5 5.5 5.5 14.5 0 20" />
          </svg>
        );
      case 'padel':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9H9m0 0v6" />
          </svg>
        );
    }
  };

  const getTypeLabel = (type: FieldType) => {
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
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col">
      {/* Photo cliquable -> ouvre un Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="relative aspect-[16/9] w-full cursor-zoom-in">
            <img
              src={field.imageUrl}
              alt={field.name}
              className="w-full h-full object-cover"
              onClick={() => setOpen(true)}
              draggable={false}
              style={{ userSelect: 'none' }}
            />
            <div className={`absolute top-4 right-4 ${getStatusColor(field.status)} px-3 py-1 rounded-full text-xs font-semibold`}>
              {getStatusLabel(field.status)}
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-2xl bg-transparent border-none shadow-none p-0 flex items-center justify-center">
          <img
            src={field.imageUrl}
            alt={field.name}
            className="w-full max-w-3xl max-h-[80vh] object-contain rounded-lg bg-black"
            draggable={false}
            style={{ background: 'black' }}
          />
        </DialogContent>
      </Dialog>
      {/* ... keep existing code (le reste de la carte/infos/bouton réserver) */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-sport-green">
            {getTypeIcon(field.type)}
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {getTypeLabel(field.type)}
          </span>
        </div>
        <h3 className="font-bold text-xl mb-2">{field.name}</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">Capacité: {field.capacity} personnes</p>
          {field.type === 'tennis' && getTennisPricing({ nom: field.nom || field.name, type: field.type } as any) ? (
            <div className="space-y-2">
              <div className="bg-green-50 p-3 rounded-lg border-l-4 border-sport-green">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-sport-green" />
                  <span className="text-sm font-medium text-gray-700">Simple (2 personnes)</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <Sun className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm font-semibold text-sport-green">
                      {getTennisPricing({ nom: field.nom || field.name, type: field.type } as any)!.simple.jour} DT
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Moon className="h-3 w-3 text-blue-500" />
                    <span className="text-sm font-semibold text-sport-green">
                      {getTennisPricing({ nom: field.nom || field.name, type: field.type } as any)!.simple.nuit} DT
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Double (4 personnes)</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <Sun className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm font-semibold text-sport-green">
                      {getTennisPricing({ nom: field.nom || field.name, type: field.type } as any)!.double.jour} DT
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Moon className="h-3 w-3 text-blue-500" />
                    <span className="text-sm font-semibold text-sport-green">
                      {getTennisPricing({ nom: field.nom || field.name, type: field.type } as any)!.double.nuit} DT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Sun className="h-3 w-3 text-yellow-500" />
                <p className="text-lg font-bold text-sport-green">{field.price} DT/h</p>
              </div>
              {field.priceNight && (
                <div className="flex items-center gap-1">
                  <Moon className="h-3 w-3 text-blue-500" />
                  <span className="text-sm text-gray-600">{field.priceNight} DT/h</span>
                </div>
              )}
            </div>
          )}
        </div>
        <Link 
          to={`/reservation?fieldId=${field.id}`}
          className="w-full btn-primary block text-center mt-auto"
        >
          Réserver
        </Link>
      </div>
    </div>
  );
};

export default FieldCard;
