
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Field, FieldType } from '@/components/FieldCard';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Simulated fields data
const allFields: Field[] = [
  {
    id: 1,
    name: 'Foot à 7 - Terrain A',
    type: 'foot',
    capacity: 14,
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80',
    status: 'available',
  },
  {
    id: 2,
    name: 'Foot à 6 - Terrain B',
    type: 'foot',
    capacity: 12,
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d?auto=format&fit=crop&q=80',
    status: 'available',
  },
  {
    id: 3,
    name: 'Foot à 8 - Terrain C',
    type: 'foot',
    capacity: 16,
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80',
    status: 'reserved',
  },
  {
    id: 4,
    name: 'Tennis - Court 1',
    type: 'tennis',
    capacity: 4,
    price: 30,
    imageUrl: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&q=80',
    status: 'available',
  },
  {
    id: 5,
    name: 'Tennis - Court 2',
    type: 'tennis',
    capacity: 4,
    price: 30,
    imageUrl: 'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?auto=format&fit=crop&q=80',
    status: 'reserved',
  },
  {
    id: 6,
    name: 'Padel - Court 1',
    type: 'padel',
    capacity: 4,
    price: 40,
    imageUrl: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&q=80',
    status: 'available',
  },
  {
    id: 7,
    name: 'Padel - Court 2',
    type: 'padel',
    capacity: 4,
    price: 40,
    imageUrl: 'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?auto=format&fit=crop&q=80',
    status: 'available',
  },
];

// Available time slots
const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

// Duration options
const durationOptions = [
  { value: '1', label: '1 heure' },
  { value: '1.5', label: '1 heure 30 minutes' },
  { value: '2', label: '2 heures' },
  { value: '3', label: '3 heures' },
];

const Reservation = () => {
  const [searchParams] = useSearchParams();
  const fieldIdParam = searchParams.get('fieldId');
  const typeParam = searchParams.get('type') as FieldType | null;
  
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedType, setSelectedType] = useState<FieldType | ''>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('1');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  // Available fields based on type selection
  const filteredFields = allFields.filter(
    field => !selectedType || field.type === selectedType
  );

  // Initialize from URL parameters
  useEffect(() => {
    if (fieldIdParam) {
      const field = allFields.find(f => f.id === parseInt(fieldIdParam));
      if (field) {
        setSelectedField(field);
        setSelectedType(field.type);
      }
    } else if (typeParam) {
      setSelectedType(typeParam);
    }
  }, [fieldIdParam, typeParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!selectedField || !selectedDate || !selectedTime || !selectedDuration || !name || !email || !phone) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    
    // Simulate reservation submission
    toast.success('Réservation envoyée avec succès! Nous vous contacterons pour confirmer.');
    
    // In a real app, we would send this data to Supabase
    console.log({
      fieldId: selectedField.id,
      fieldName: selectedField.name,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      duration: selectedDuration,
      name,
      email,
      phone,
      message,
    });
  };

  return (
    <>
      <Navbar />
      
      {/* Header */}
      <div className="bg-sport-dark text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-4">Réservation de terrain</h1>
          <p className="text-xl max-w-2xl">
            Remplissez le formulaire ci-dessous pour réserver votre terrain. Tous les champs marqués d'un astérisque (*) sont obligatoires.
          </p>
        </div>
      </div>
      
      {/* Reservation Form */}
      <section className="section-padding bg-sport-gray">
        <div className="container-custom">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Field Selection and Date/Time */}
                <div>
                  <h2 className="text-2xl font-bold mb-6">Détails de la réservation</h2>
                  
                  {/* Field Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de terrain *
                    </label>
                    <select 
                      className="w-full border rounded-md p-3"
                      value={selectedType}
                      onChange={(e) => {
                        setSelectedType(e.target.value as FieldType | '');
                        setSelectedField(null); // Reset selected field when type changes
                      }}
                      required
                    >
                      <option value="">Sélectionnez un type</option>
                      <option value="foot">Football</option>
                      <option value="tennis">Tennis</option>
                      <option value="padel">Padel</option>
                    </select>
                  </div>
                  
                  {/* Field Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terrain *
                    </label>
                    <select 
                      className="w-full border rounded-md p-3"
                      value={selectedField?.id || ''}
                      onChange={(e) => {
                        const fieldId = parseInt(e.target.value);
                        const field = allFields.find(f => f.id === fieldId) || null;
                        setSelectedField(field);
                      }}
                      required
                      disabled={!selectedType}
                    >
                      <option value="">Sélectionnez un terrain</option>
                      {filteredFields.map((field) => (
                        <option key={field.id} value={field.id}>
                          {field.name} - {field.price} DT/h
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Date Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <div className="border rounded-md p-1 bg-white pointer-events-auto">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date(Date.now() - 86400000)} // Disable past dates
                        locale={fr}
                        className="pointer-events-auto"
                      />
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Date sélectionnée: {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Aucune date sélectionnée'}
                    </div>
                  </div>
                  
                  {/* Time Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure de début *
                    </label>
                    <select 
                      className="w-full border rounded-md p-3"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                    >
                      <option value="">Sélectionnez une heure</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Duration Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée *
                    </label>
                    <select 
                      className="w-full border rounded-md p-3"
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      required
                    >
                      {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Right Column - Contact Information */}
                <div>
                  <h2 className="text-2xl font-bold mb-6">Vos coordonnées</h2>
                  
                  {/* Name */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input 
                      type="text"
                      className="w-full border rounded-md p-3"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom et prénom"
                      required
                    />
                  </div>
                  
                  {/* Email */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse email *
                    </label>
                    <input 
                      type="email"
                      className="w-full border rounded-md p-3"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  
                  {/* Phone */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input 
                      type="tel"
                      className="w-full border rounded-md p-3"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Votre numéro de téléphone"
                      required
                    />
                  </div>
                  
                  {/* Message */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (optionnel)
                    </label>
                    <textarea 
                      className="w-full border rounded-md p-3 h-32"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Informations supplémentaires ou demandes spéciales"
                    />
                  </div>
                  
                  {/* Price Calculation */}
                  {selectedField && selectedDuration && (
                    <div className="mb-6 p-4 bg-sport-green/10 rounded-md">
                      <h3 className="font-bold text-lg mb-2">Résumé de la réservation</h3>
                      <div className="flex justify-between mb-2">
                        <span>Terrain:</span>
                        <span className="font-medium">{selectedField.name}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Prix par heure:</span>
                        <span className="font-medium">{selectedField.price} DT</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Durée:</span>
                        <span className="font-medium">{selectedDuration} heure(s)</span>
                      </div>
                      <div className="border-t border-gray-300 my-2 pt-2 flex justify-between">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold text-sport-green">
                          {selectedField.price * parseFloat(selectedDuration)} DT
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="mt-8 text-center">
                <button 
                  type="submit" 
                  className="btn-primary text-lg px-10 py-3"
                >
                  Confirmer la réservation
                </button>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-600">
                Paiement sur place. Vous recevrez un email de confirmation.
              </div>
            </form>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Reservation;
