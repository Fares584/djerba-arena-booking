import React, { useState, useEffect, useRef } from 'react';
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
import ReservationDatePicker from "@/components/ReservationDatePicker";
import ReservationSuccessDialog from "@/components/ReservationSuccessDialog";
import TimeSlotSelector from "@/components/TimeSlotSelector";
import ReservationSummary from "@/components/ReservationSummary";

// Créneaux horaires par défaut (pour terrains autres que foot à 7 ou 8)
const defaultTimeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

// Options de durée pour les terrains non-football
const durationOptions = [
  { value: '1', label: '1 heure' },
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
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Utilisé pour empêcher le reset lors de l'init
  const initialSelectionDone = React.useRef(false);

  // Hooks
  const { data: allTerrains, isLoading: terrainsLoading } = useTerrains({ actif: true });
  const createReservation = useCreateReservation({
    onSuccess: () => {
      setShowSuccessDialog(true);
    },
  });

  // Filter terrains by selected type
  const filteredTerrains = allTerrains?.filter(terrain => 
    selectedType === '' || terrain.type === selectedType
  ) || [];

  // Get selected terrain object
  const selectedTerrain = allTerrains?.find(t => t.id === selectedTerrainId);

  // Helper: détermine si le terrain sélectionné est Foot à 6, 7 ou 8
  const isFoot6 = !!(selectedTerrain && selectedTerrain.type === 'foot' && selectedTerrain.nom.includes('6'));
  const isFoot7or8 = !!(selectedTerrain && selectedTerrain.type === 'foot' && (selectedTerrain.nom.includes('7') || selectedTerrain.nom.includes('8')));

  // Get effective duration - ALWAYS 1.5 for football
  const getEffectiveDuration = (): string => {
    if (selectedTerrain?.type === 'foot') {
      return '1.5'; // Football always 1.5 hours
    }
    return duration;
  };

  // Fonction générique pour générer les slots pour foot à 6, 7 et 8
  // Pour foot à 6 : 9:00 à 22:30, pour foot à 7/8 : 10:00 à 23:30, pas de 1h30
  const generateTimeSlotsForFoot = (startHour: number, startMinute: number, endHour: number, endMinute: number) => {
    const slots: string[] = [];
    let dt = new Date(2000, 0, 1, startHour, startMinute);
    const endDt = new Date(2000, 0, 1, endHour, endMinute);
    while (dt <= endDt) {
      slots.push(
        dt.getHours().toString().padStart(2, '0') +
        ':' +
        dt.getMinutes().toString().padStart(2, '0')
      );
      dt.setMinutes(dt.getMinutes() + 90);
    }
    return slots;
  };

  // Détermine dynamiquement les créneaux horaires selon le type de terrain sélectionné
  const timeSlotsForSelectedTerrain = React.useMemo(() => {
    if (isFoot6) {
      // Foot à 6 : de 09:00 à 22:30
      return generateTimeSlotsForFoot(9, 0, 22, 30);
    }
    if (isFoot7or8) {
      // Foot à 7/8 : de 10:00 à 23:30
      return generateTimeSlotsForFoot(10, 0, 23, 30);
    }
    // Pour les autres terrains, on retourne les créneaux standards
    return defaultTimeSlots;
  }, [isFoot6, isFoot7or8]);

  // Init depuis l’URL, sélectionner type puis terrain
  useEffect(() => {
    if (
      !allTerrains ||
      initialSelectionDone.current // déjà fait une fois...
    )
      return;
    const fieldId = searchParams.get('fieldId');
    if (fieldId) {
      const fieldIdNum = parseInt(fieldId, 10);
      const terrain = allTerrains.find((t) => t.id === fieldIdNum);
      if (terrain) {
        // Étape 1 : d’abord setter le type (déclenche re-render), puis un autre effet set l’ID
        setSelectedType(terrain.type);
        // On sauvegarde l'info pour l'effet suivant
        initialSelectionDone.current = { terrainId: terrain.id };
      }
    }
  }, [allTerrains, searchParams]);

  // Une fois le type mis à jour, appliquer la sélection terrain si demandé via URL
  useEffect(() => {
    // Si initialSelectionDone est un objet (donc on vient de la logique fieldId), on peut setter le terrain
    if (
      initialSelectionDone.current &&
      typeof initialSelectionDone.current === 'object' &&
      selectedType
    ) {
      setSelectedTerrainId(initialSelectionDone.current.terrainId);
      // Clôt, pour empêcher d'autres exécutions
      initialSelectionDone.current = true;
      return;
    }
    // Si l'utilisateur change le type à la main, reset la séléction terrain
    if (initialSelectionDone.current === true) return;
    setSelectedTerrainId(null);
  }, [selectedType]);

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

  // Calcul du prix total avec gestion jour/nuit pour toute la durée
  const calculateTotalPrice = (): number => {
    if (!selectedTerrain || !selectedTime) return 0;

    const effectiveDuration = parseFloat(getEffectiveDuration());
    const globalNightStartTime = '19:00'; // peut rester statique

    let total = 0;
    let timeHour = parseInt(selectedTime.split(':')[0], 10);
    let timeMinute = parseInt(selectedTime.split(':')[1], 10);

    for (let i = 0; i < effectiveDuration; i++) {
      const slotTime = 
        timeHour.toString().padStart(2, '0') + ':' + 
        timeMinute.toString().padStart(2, '0');
      total += calculatePrice(selectedTerrain, slotTime, globalNightStartTime);

      // Avance de 1h pour chaque unité d'heure supplémentaire (même pour foot, où c'est par 1.5)
      let newDate = new Date(2000, 0, 1, timeHour, timeMinute);
      newDate.setHours(newDate.getHours() + 1);
      timeHour = newDate.getHours();
      timeMinute = newDate.getMinutes();
    }
    return total;
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

  // Quand l'utilisateur clique sur "OK", fermer la popup et rediriger vers l'accueil
  const handleDialogOk = () => {
    setShowSuccessDialog(false);
    navigate('/');
  };

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
                {/* Remplace input date par ReservationDatePicker */}
                <div>
                  <ReservationDatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-lg font-semibold mb-2 flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Heure *
                  </Label>
                  <TimeSlotSelector
                    timeSlots={timeSlotsForSelectedTerrain}
                    selectedTime={selectedTime}
                    isTimeSlotAvailable={isTimeSlotAvailable}
                    onTimeSelect={setSelectedTime}
                    loading={availabilityLoading && !!selectedDate}
                  />
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
            </div>

            {/* Price Summary */}
            {selectedTerrain && selectedTime && (
              <ReservationSummary
                terrain={selectedTerrain}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                duration={getEffectiveDuration()}
                totalPrice={calculateTotalPrice()}
              />
            )}

            {/* Submit Button */}
            <div className="mt-8 flex flex-col sm:flex-row sm:justify-end">
              <Button
                type="submit"
                disabled={createReservation.isPending || !selectedTerrainId}
                className="w-full sm:w-auto bg-sport-green hover:bg-sport-dark text-white px-8 py-3 text-lg"
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

      <ReservationSuccessDialog
        open={showSuccessDialog}
        onOk={handleDialogOk}
      />

      <Footer />
    </>
  );
};

export default Reservation;
