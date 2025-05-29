import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTerrains, useTerrain } from '@/hooks/useTerrains';
import { useCreateReservation } from '@/hooks/useReservations';
import { useReservations, isTimeSlotAvailable, getUnavailableDates } from '@/hooks/useAvailability';
import { Terrain } from '@/lib/supabase';
import { cn } from '@/lib/utils';

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
  const typeParam = searchParams.get('type') as 'foot' | 'tennis' | 'padel' | null;
  
  const [selectedField, setSelectedField] = useState<Terrain | null>(null);
  const [selectedType, setSelectedType] = useState<'foot' | 'tennis' | 'padel' | ''>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('1');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  // Fetch all terrains
  const { data: terrains, isLoading: terrainsLoading, error: terrainsError } = useTerrains({
    actif: true
  });
  
  // Fetch single terrain if ID provided
  const { data: terrain } = useTerrain(fieldIdParam ? parseInt(fieldIdParam) : undefined);
  
  // Fetch reservations for availability checking
  const { data: reservations } = useReservations({
    terrain_id: selectedField?.id,
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined
  });
  
  // Mutation to create a reservation
  const createReservation = useCreateReservation();
  
  // Available fields based on type selection
  const filteredFields = terrains?.filter(
    field => !selectedType || field.type === selectedType
  ) || [];

  // Get unavailable dates for the selected field
  const unavailableDates = selectedField ? getUnavailableDates(reservations, selectedField.id) : [];

  // Initialize from URL parameters and fetched data
  useEffect(() => {
    if (terrain) {
      setSelectedField(terrain);
      setSelectedType(terrain.type);
    } else if (typeParam) {
      setSelectedType(typeParam);
    }
  }, [terrain, typeParam]);

  // Reset time when date or field changes
  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate, selectedField]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!selectedField || !selectedDate || !selectedTime || !selectedDuration || !name || !email || !phone) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    
    // Check availability before submitting
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const isAvailable = isTimeSlotAvailable(
      reservations,
      selectedField.id,
      formattedDate,
      selectedTime,
      parseFloat(selectedDuration)
    );
    
    if (!isAvailable) {
      toast.error('Ce créneau n\'est plus disponible. Veuillez choisir un autre horaire.');
      return;
    }
    
    // Create reservation in Supabase
    createReservation.mutate({
      nom_client: name,
      tel: phone,
      email: email,
      terrain_id: selectedField.id,
      date: formattedDate,
      heure: selectedTime,
      duree: parseFloat(selectedDuration),
      statut: 'en_attente',
      remarque: message || undefined
    });
  };

  if (terrainsError) {
    return (
      <>
        <Navbar />
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Erreur de chargement</h2>
            <p>Impossible de charger les terrains. Veuillez réessayer plus tard.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Header */}
      <div className="bg-sport-dark text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-4">Réservation de terrain</h1>
          <p className="text-xl max-w-2xl">
            Remplissez le formulaire ci-dessous pour réserver votre terrain. Les créneaux indisponibles sont affichés en rouge.
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
                        setSelectedType(e.target.value as 'foot' | 'tennis' | 'padel' | '');
                        setSelectedField(null);
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
                        if (e.target.value) {
                          const fieldId = parseInt(e.target.value);
                          const field = filteredFields.find(f => f.id === fieldId) || null;
                          setSelectedField(field);
                        } else {
                          setSelectedField(null);
                        }
                      }}
                      required
                      disabled={!selectedType || terrainsLoading}
                    >
                      <option value="">Sélectionnez un terrain</option>
                      {filteredFields.map((field) => (
                        <option key={field.id} value={field.id}>
                          {field.nom} - {field.prix} DT/h
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
                        disabled={(date) => {
                          const isPast = date < new Date(Date.now() - 86400000);
                          const isUnavailable = selectedField ? 
                            unavailableDates.includes(format(date, 'yyyy-MM-dd')) : false;
                          return isPast || isUnavailable;
                        }}
                        locale={fr}
                        className="pointer-events-auto"
                        modifiers={{
                          unavailable: selectedField ? 
                            unavailableDates.map(dateStr => new Date(dateStr)) : []
                        }}
                        modifiersStyles={{
                          unavailable: { 
                            color: '#dc2626',
                            backgroundColor: '#fef2f2',
                            textDecoration: 'line-through'
                          }
                        }}
                      />
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Date sélectionnée: {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Aucune date sélectionnée'}
                    </div>
                    {selectedField && unavailableDates.length > 0 && (
                      <div className="mt-2 text-sm text-red-600">
                        <span className="font-medium">Dates complets:</span> Les dates barrées en rouge sont entièrement réservées
                      </div>
                    )}
                  </div>
                  
                  {/* Time Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure de début *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => {
                        const isAvailable = selectedField && selectedDate ? 
                          isTimeSlotAvailable(
                            reservations,
                            selectedField.id,
                            format(selectedDate, 'yyyy-MM-dd'),
                            time,
                            parseFloat(selectedDuration)
                          ) : true;
                        
                        return (
                          <button
                            key={time}
                            type="button"
                            className={cn(
                              "p-2 text-sm border rounded-md transition-colors",
                              selectedTime === time 
                                ? "bg-sport-green text-white border-sport-green"
                                : isAvailable 
                                  ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                  : "bg-red-100 text-red-600 border-red-300 cursor-not-allowed line-through"
                            )}
                            onClick={() => isAvailable && setSelectedTime(time)}
                            disabled={!isAvailable}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="text-red-600">■</span> Créneaux indisponibles
                      <span className="ml-4 text-green-600">■</span> Créneaux disponibles
                    </div>
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
                        <span className="font-medium">{selectedField.nom}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Prix par heure:</span>
                        <span className="font-medium">{selectedField.prix} DT</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Durée:</span>
                        <span className="font-medium">{selectedDuration} heure(s)</span>
                      </div>
                      <div className="border-t border-gray-300 my-2 pt-2 flex justify-between">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold text-sport-green">
                          {selectedField.prix * parseFloat(selectedDuration)} DT
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
                  disabled={createReservation.isPending}
                >
                  {createReservation.isPending ? 'Traitement en cours...' : 'Confirmer la réservation'}
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
