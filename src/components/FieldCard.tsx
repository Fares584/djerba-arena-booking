
import React from 'react';
import { Link } from 'react-router-dom';

export type FieldType = 'foot' | 'tennis' | 'padel';
export type FieldStatus = 'available' | 'reserved' | 'pending';

export interface Field {
  id: number;
  name: string;
  type: FieldType;
  capacity: number;
  price: number;
  imageUrl: string;
  status: FieldStatus;
}

interface FieldCardProps {
  field: Field;
}

const FieldCard: React.FC<FieldCardProps> = ({ field }) => {
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
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <img 
          src={field.imageUrl} 
          alt={field.name} 
          className="w-full h-full object-contain"
        />
        <div className={`absolute top-4 right-4 ${getStatusColor(field.status)} px-3 py-1 rounded-full text-xs font-semibold`}>
          {getStatusLabel(field.status)}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-sport-green">
            {getTypeIcon(field.type)}
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {getTypeLabel(field.type)}
          </span>
        </div>
        <h3 className="font-bold text-xl mb-2">{field.name}</h3>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600">Capacité: {field.capacity} personnes</p>
            <p className="text-lg font-bold text-sport-green">{field.price} DT/heure</p>
          </div>
        </div>
        <Link 
          to={`/reservation?fieldId=${field.id}`} 
          className="w-full btn-primary block text-center"
        >
          Réserver
        </Link>
      </div>
    </div>
  );
};

export default FieldCard;
