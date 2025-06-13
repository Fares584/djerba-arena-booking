import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTerrains } from '@/hooks/useTerrains';
import { useCreateReservation } from '@/hooks/useReservations';
import { useAvailability } from '@/hooks/useAvailability';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Calendar, Clock, User, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import TerrainSelector from '@/components/TerrainSelector';
import { calculatePrice, isNightTime } from '@/lib/supabase';

// Créneaux horaires
const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

// Options de durée pour les terrains non-football
const durationOptions = [
  { value: '1', label: '1 heure' },
  { value: '1.5', label: '1 heure 30 minutes' },
  { value: '2', label: '2 heures' },
  { value: '3', label: '3 heures' },
];

const Reservation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Form state
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [remarks, setRemarks] = useState('');

  // Hooks
  const { data: allTerrains, isLoading: terrainsLoading } = useTerrains({ actif: true });
  const createReservation = useCreateReservation();

  // Filter terrains by selected type
  const filteredTerrains = allTerrains?.filter(terrain => 
    selectedType === '' || terrain.type === selectedType
  ) || [];

  // Get selected terrain object
  const selectedTerrain = allTerrains?.find(t => t.id === selectedTerrainId);

  // Get effective duration - ALWAYS 1.5 for football
  const getEffectiveDuration = (): string => {
    if (selectedTerrain?.type === 'foot') {
      return '1.5'; // Football always 1.5 hours
    }
    return duration;
  };

  // Initialize from URL params
  useEffect(() => {
    const fieldId = searchParams.get('fieldId');
    if (fieldId && allTerrains) {
      const terrain = allTerrains.find(t => t.id === parseInt(fieldId));
      if (terrain) {
        setSelectedType(terrain.type);
        setSelectedTerrainId(terrain.id);
      }
    }
  }, [searchParams, allTerrains]);

  // Update duration when terrain changes
  useEffect(() => {
    if (selectedTerrain?.type === 'foot') {
      setDuration('1.5');
    }
  }, [selectedTerrain]);

  // Reset terrain selection when type changes
  useEffect(() => {
    setSelectedTerrainId(null);
  }, [selectedType]);

  // Availability check
  const { data: availability, isLoading: availabilityLoading } = useAvailability({
    terrainId: selectedTerrainId,
    date: selectedDate,
    enabled: !!(selectedTerrainId && selectedDate)
  });

  // Check if selected time slot is available
  const isTimeSlotAvailable = (time: string): boolean => {
    if (!availability || !selectedTerrainId) return true;
    
    const effectiveDuration = parseFloat(getEffectiveDuration());
    const timeHour = parseInt(time.split(':')[0]);
    const timeMinutes = parseInt(time.split(':')[1]);
    const startTime = timeHour + timeMinutes / 60;
    const endTime = startTime + effectiveDuration;
    
    return !availability.some(reservation => {
      const resHour = parseInt(reservation.heure.split(':')[0]);
      const resMinutes = parseInt(reservation.heure.split(':')[1]);
      const resStart = resHour + resMinutes / 60;
      const resEnd = resStart + reservation.duree;
      
      return !(endTime <= resStart || startTime >= resEnd);
    });
  };

  // Calculate total price based on selected time and terrain
  const calculateTotalPrice = (): number => {
    if (!selectedTerrain || !selectedTime) return 0;
    
    const duration = parseFloat(getEffectiveDuration());
    
    // For football terrains, use fixed pricing regardless of duration
    if (selectedTerrain.type === 'foot') {
      const globalNightStartTime = '19:00'; // Default night start time
      return calculatePrice(selectedTerrain, selectedTime, globalNightStartTime);
    }
    
    // For other terrains, calculate based on hourly rate × duration
    const hourlyRate = selectedTerrain.prix; // Using day rate for simplicity in public form
    return hourlyRate * duration;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTerrainId || !selectedDate || !selectedTime || !customerName || !customerPhone || !customerEmail) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!isTimeSlotAvailable(selectedTime)) {
      toast.error('Ce créneau horaire n\'est pas disponible.');
      return;
    }

    const effectiveDuration = parseFloat(getEffectiveDuration());

    createReservation.mutate({
      nom_client: customerName,
      tel: customerPhone,
      email: customerEmail,
      terrain_id: selectedTerrainId,
      date: selectedDate,
      heure: selectedTime,
      duree: effectiveDuration,
      statut: 'en_attente',
      remarque: remarks || null,
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <Navbar />
      
      <div className="bg-sport-dark text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-4">Réserver un Terrain</h1>
          <p className="text-xl max-w-2xl">
            Réservez facilement votre terrain préféré en quelques étapes simples.
          </p>
        </div>
      </div>

      <section className="section-padding bg-sport-gray">
        <div className="container-custom max-w-4xl">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            
            {/* Type Selection */}
            <div className="mb-8">
              <Label htmlFor="type" className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Type de terrain *
              </Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez un type de terrain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="foot">Football</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="padel">Padel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Terrain Selection */}
            {selectedType && (
              <div className="mb-8">
                <Label className="text-lg font-semibold mb-4 block">
                  Terrain *
                </Label>
                {terrainsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <TerrainSelector
                    terrains={filteredTerrains}
                    selectedTerrainId={selectedTerrainId}
                    onTerrainSelect={setSelectedTerrainId}
                  />
                )}
              </div>
            )}

            {/* Date and Time Selection */}
            {selectedTerrainId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <Label htmlFor="date" className="text-lg font-semibold mb-2 flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={today}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="time" className="text-lg font-semibold mb-2 flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Heure *
                  </Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une heure" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => {
                        const available = isTimeSlotAvailable(time);
                        return (
                          <SelectItem
                            key={time}
                            value={time}
                            disabled={!available}
                            className={!available ? 'text-gray-400' : ''}
                          >
                            {time} {!available && '(Occupé)'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {availabilityLoading && selectedDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      Vérification de la disponibilité...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Duration Selection - Only for non-football terrains */}
            {selectedTerrain && selectedTerrain.type !== 'foot' && (
              <div className="mb-8">
                <Label htmlFor="duration" className="text-lg font-semibold mb-2 block">
                  Durée de la réservation *
                </Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez la durée" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Duration Display for Football */}
            {selectedTerrain && selectedTerrain.type === 'foot' && (
              <div className="mb-8">
                <Label className="text-lg font-semibold mb-2 block">
                  Durée de la réservation
                </Label>
                <div className="w-full border rounded-md p-3 bg-gray-100 text-gray-700 flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  1h30 (durée fixe pour le football)
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="border-t pt-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <User className="mr-2 h-6 w-6" />
                Informations personnelles
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="name" className="text-base font-medium mb-2 block">
                    Nom complet *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Votre nom et prénom"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-base font-medium mb-2 flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    Téléphone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Votre numéro de téléphone"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="email" className="text-base font-medium mb-2 flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Adresse email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div className="mb-8">
                <Label htmlFor="remarks" className="text-base font-medium mb-2 block">
                  Remarques (optionnel)
                </Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Ajoutez des informations supplémentaires..."
                  rows={3}
                />
              </div>
            </div>

            {/* Price Summary */}
            {selectedTerrain && selectedTime && (
              <div className="bg-sport-gray p-6 rounded-lg mb-8">
                <h3 className="text-lg font-semibold mb-4">Résumé de la réservation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Terrain:</span>
                    <span className="font-medium">{selectedTerrain.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heure:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Durée:</span>
                    <span className="font-medium">{getEffectiveDuration()}h</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Prix total:</span>
                      <span className="text-sport-green">
                        {calculateTotalPrice().toFixed(2)} DT
                      </span>
                    </div>
                    {selectedTerrain.type === 'foot' && (
                      <div className="text-sm text-gray-600 mt-1">
                        Tarif fixe pour 1h30 ({isNightTime(selectedTime, '19:00') ? 'nuit' : 'jour'})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={createReservation.isPending || !selectedTerrainId}
                className="bg-sport-green hover:bg-sport-dark text-white px-8 py-3 text-lg"
              >
                {createReservation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer la demande de réservation'
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Reservation;
