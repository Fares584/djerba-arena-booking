import React from 'react';
import { useState, useEffect } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { useAppSetting } from '@/hooks/useAppSettings';
import { useCreateReservation } from '@/hooks/useReservations';
import { useReservationSecurity } from '@/hooks/useReservationSecurity';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isNightTime, calculatePrice } from '@/lib/supabase';
import { validateName, validateTunisianPhone, validateEmail } from '@/lib/validation';
import { toast } from 'sonner';

// Duration options
const durationOptions = [
  { value: '1', label: '1 heure' },
  { value: '2', label: '2 heures' },
  { value: '3', label: '3 heures' },
];

interface ReservationFormProps {
  onSuccess: () => void;
}

const ReservationForm = ({ onSuccess }: ReservationFormProps) => {
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('1');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [bypassSecurity, setBypassSecurity] = useState(false);
  
  const { data: terrains, isLoading: terrainsLoading } = useTerrains();
  const { data: nightTimeSetting } = useAppSetting('heure_debut_nuit_globale');
  const createReservation = useCreateReservation({ isAdminCreation: true });
  const { checkReservationLimits } = useReservationSecurity();

  // Get selected terrain object
  const selectedTerrain = terrains?.find(t => t.id === selectedField);

  // --- Ajout: génération dynamique créneaux horaires ---
  const isFoot6 = !!(selectedTerrain && selectedTerrain.type === 'foot' && selectedTerrain.nom.includes('6'));
  const isFoot7or8 = !!(selectedTerrain && selectedTerrain.type === 'foot' && (selectedTerrain.nom.includes('7') || selectedTerrain.nom.includes('8')));

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

  const timeSlotsForSelectedTerrain = React.useMemo(() => {
    if (isFoot6) {
      // Vérifier si c'est un samedi (jour 6 de la semaine)
      const isSaturday = selectedDate && selectedDate.getDay() === 6;
      
      if (isSaturday) {
        // Samedi : de 10:00 à 23:30 pour Foot à 6
        return generateTimeSlotsForFoot(10, 0, 23, 30);
      } else {
        // Autres jours : de 09:00 à 22:30 pour Foot à 6
        return generateTimeSlotsForFoot(9, 0, 22, 30);
      }
    }
    if (isFoot7or8) {
      // Foot à 7/8 : de 10:00 à 23:30 (inchangé)
      return generateTimeSlotsForFoot(10, 0, 23, 30);
    }
    // Autres terrains : créneaux classiques
    return [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
    ];
  }, [isFoot6, isFoot7or8, selectedDate]);

  // Get global night start time
  const getGlobalNightStartTime = (): string => {
    return nightTimeSetting?.setting_value || '19:00';
  };

  // Get effective duration based on terrain type
  const getEffectiveDuration = (): string => {
    if (selectedTerrain?.type === 'foot') {
      return '1.5'; // Football always 1.5 hours
    }
    return selectedDuration;
  };

  // Check if duration should be changeable
  const isDurationChangeable = (): boolean => {
    return selectedTerrain?.type !== 'foot';
  };

  // Calculate total price based on selected time and duration - FIXED FOR FOOTBALL
  const calculateTotalPrice = (): number => {
    if (!selectedField || !selectedTime || !terrains) return 0;
    
    const terrain = terrains.find(t => t.id === selectedField);
    if (!terrain) return 0;
    
    const effectiveDuration = getEffectiveDuration();
    const globalNightStartTime = getGlobalNightStartTime();
    
    // For football terrains, use fixed pricing for 1h30 - no hourly calculation
    if (terrain.type === 'foot') {
      return calculatePrice(terrain, selectedTime, globalNightStartTime);
    }
    
    // For other terrains, calculate hourly rate × duration
    const duration = parseFloat(effectiveDuration);
    let totalPrice = 0;
    
    // Calculate price for each hour based on day/night rates
    for (let i = 0; i < duration; i++) {
      const currentHour = parseInt(selectedTime.split(':')[0]) + i;
      const timeString = `${currentHour.toString().padStart(2, '0')}:00`;
      const hourPrice = calculatePrice(terrain, timeString, globalNightStartTime);
      totalPrice += hourPrice;
    }
    
    return totalPrice;
  };

  // Update duration when terrain changes
  useEffect(() => {
    if (selectedTerrain?.type === 'foot') {
      setSelectedDuration('1.5');
    }
  }, [selectedTerrain]);

  // Reset selected time when date changes for foot 6 terrain
  useEffect(() => {
    if (isFoot6) {
      setSelectedTime('');
    }
  }, [selectedDate, isFoot6]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔐 ADMIN FORM: Début vérification sécurité');
    
    // Validation des champs
    const nameError = validateName(name);
    const phoneError = validateTunisianPhone(phone);
    const emailError = validateEmail(email);

    if (nameError || phoneError || emailError) {
      if (nameError) toast.error(`Nom: ${nameError}`);
      if (phoneError) toast.error(`Téléphone: ${phoneError}`);
      if (emailError) toast.error(`Email: ${emailError}`);
      return;
    }
    
    if (!selectedField || !selectedDate || !selectedTime || !name || !email || !phone) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Vérification de sécurité (blacklist toujours active, limites contournables si admin)
    console.log('🔐 ADMIN FORM: Vérification sécurité...');
    console.log('Téléphone:', phone);
    console.log('Email:', email);
    console.log('Contournement activé:', bypassSecurity);
    
    try {
      // Si contournement activé, on passe isAdminCreation=true pour contourner les limites mais PAS la blacklist
      const securityCheck = await checkReservationLimits(phone, email, bypassSecurity);
      
      if (!securityCheck.canReserve) {
        console.log('❌ ADMIN FORM: Contact bloqué:', securityCheck.reason);
        toast.error(`Contact bloqué: ${securityCheck.reason}`);
        return;
      }
      
      console.log('✅ ADMIN FORM: Vérification sécurité OK');
    } catch (error) {
      console.error('❌ ADMIN FORM: Erreur vérification sécurité:', error);
      toast.error('Erreur de vérification de sécurité. Veuillez réessayer.');
      return;
    }
    
    // Format date as ISO string (YYYY-MM-DD)
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const effectiveDuration = getEffectiveDuration();
    
    createReservation.mutate({
      nom_client: name,
      tel: phone,
      email: email,
      terrain_id: selectedField,
      date: formattedDate,
      heure: selectedTime,
      duree: parseFloat(effectiveDuration),
      statut: 'en_attente', // Statut en attente
      remarque: message || undefined
    }, {
      onSuccess: () => {
        console.log('✅ ADMIN FORM: Réservation créée avec succès');
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column - Field Selection and Date/Time */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="terrain" className="text-sm">Terrain</Label>
            <Select 
              value={selectedField?.toString() || "select-terrain"} 
              onValueChange={(value) => setSelectedField(value !== "select-terrain" ? parseInt(value) : null)}
              disabled={terrainsLoading || !terrains}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Sélectionnez un terrain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select-terrain">Sélectionnez un terrain</SelectItem>
                {terrains?.map((terrain) => (
                  <SelectItem key={terrain.id} value={terrain.id.toString()}>
                    {terrain.nom} - {terrain.type} (Jour: {terrain.prix} DT/h{terrain.prix_nuit ? `, Nuit: ${terrain.prix_nuit} DT/h dès ${getGlobalNightStartTime()}` : ''})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm">Date</Label>
            <div className="border rounded-md p-1 mt-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={fr}
                className="scale-90"
              />
            </div>
          </div>
        </div>
        
        {/* Right Column - Client Information with validation */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="time" className="text-sm">Heure</Label>
              <Select 
                value={selectedTime || "select-time"} 
                onValueChange={(value) => setSelectedTime(value !== "select-time" ? value : "")}
              >
                <SelectTrigger id="time" className="h-9">
                  <SelectValue placeholder="Heure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select-time">Choisir une heure</SelectItem>
                  {timeSlotsForSelectedTerrain.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time} {isNightTime(time, getGlobalNightStartTime()) ? '🌙' : '☀️'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="duration" className="text-sm">Durée</Label>
              {selectedTerrain?.type === 'foot' ? (
                <div className="w-full border rounded-md p-2 bg-gray-100 text-gray-700 text-sm flex items-center h-9">
                  1h30 (fixe pour football)
                </div>
              ) : (
                <Select 
                  value={selectedDuration} 
                  onValueChange={setSelectedDuration}
                  disabled={!isDurationChangeable()}
                >
                  <SelectTrigger id="duration" className="h-9">
                    <SelectValue placeholder="Durée" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="clientName" className="text-sm">Nom du client</Label>
            <Input
              id="clientName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="Nom et prénom (lettres uniquement)"
              required
              className="h-9"
            />
            <p className="text-gray-500 text-xs mt-1">
              {name.length}/40 caractères (lettres uniquement)
            </p>
          </div>
          
          <div>
            <Label htmlFor="clientEmail" className="text-sm">Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="h-9"
            />
          </div>
          
          <div>
            <Label htmlFor="clientPhone" className="text-sm">Téléphone</Label>
            <Input
              id="clientPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 12345678 ou +21612345678"
              required
              className="h-9"
            />
            <p className="text-gray-500 text-xs mt-1">
              Numéro tunisien (8 chiffres)
            </p>
          </div>
          
          <div>
            <Label htmlFor="message" className="text-sm">Remarques</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-16 text-sm"
            />
          </div>
          
          {/* Nouvelle option: Contournement de sécurité */}
          <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <input
              type="checkbox"
              id="bypassSecurity"
              checked={bypassSecurity}
              onChange={(e) => setBypassSecurity(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="bypassSecurity" className="text-sm text-yellow-800">
              Contourner la blacklist (admin uniquement)
            </Label>
          </div>
          
          {selectedField && selectedTime && terrains && (
            <div className="p-3 bg-gray-50 rounded-md border">
              <h3 className="font-medium mb-1 text-sm">Prix Total</h3>
              <div className="text-sm text-gray-600 mb-1">
                {selectedTerrain?.type === 'foot' ? (
                  `Tarif fixe 1h30 (${isNightTime(selectedTime, getGlobalNightStartTime()) ? 'nuit' : 'jour'})`
                ) : (
                  `${isNightTime(selectedTime, getGlobalNightStartTime()) ? `Tarif nuit (dès ${getGlobalNightStartTime()})` : 'Tarif jour'} - ${getEffectiveDuration()}h`
                )}
                {selectedTerrain?.type === 'foot' && (
                  <span className="text-blue-600 ml-1">(durée fixe)</span>
                )}
              </div>
              <p className="text-lg font-bold text-sport-green">
                {calculateTotalPrice()} DT
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={createReservation.isPending}
          className="bg-sport-green hover:bg-sport-dark"
        >
          {createReservation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              En cours...
            </>
          ) : 'Créer la réservation'}
        </Button>
      </div>
    </form>
  );
};

export default ReservationForm;
