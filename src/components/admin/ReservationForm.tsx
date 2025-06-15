import { useState, useEffect } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { useAppSetting } from '@/hooks/useAppSettings';
import { useCreateReservation } from '@/hooks/useReservations';
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

// Available time slots
const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

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
  
  const { data: terrains, isLoading: terrainsLoading } = useTerrains();
  const { data: nightTimeSetting } = useAppSetting('heure_debut_nuit_globale');
  const createReservation = useCreateReservation();

  // Get selected terrain object
  const selectedTerrain = terrains?.find(t => t.id === selectedField);

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

  // Calculate total price based on selected time and duration
  const calculateTotalPrice = (): number => {
    if (!selectedField || !selectedTime || !terrains) return 0;
    
    const terrain = terrains.find(t => t.id === selectedField);
    if (!terrain) return 0;
    
    const effectiveDuration = getEffectiveDuration();
    const globalNightStartTime = getGlobalNightStartTime();
    
    // For football terrains, use fixed pricing
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedField || !selectedDate || !selectedTime || !name || !email || !phone) {
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
      statut: 'confirmee', // Admin-created reservations are automatically confirmed
      remarque: message || undefined
    }, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Field Selection and Date/Time */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="terrain">Terrain</Label>
            <Select 
              value={selectedField?.toString() || "select-terrain"} 
              onValueChange={(value) => setSelectedField(value !== "select-terrain" ? parseInt(value) : null)}
              disabled={terrainsLoading || !terrains}
            >
              <SelectTrigger>
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
            <Label>Date</Label>
            <div className="border rounded-md p-1 mt-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={fr}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time">Heure</Label>
              <Select 
                value={selectedTime || "select-time"} 
                onValueChange={(value) => setSelectedTime(value !== "select-time" ? value : "")}
              >
                <SelectTrigger id="time">
                  <SelectValue placeholder="Heure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select-time">Choisir une heure</SelectItem>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time} {isNightTime(time, getGlobalNightStartTime()) ? '🌙' : '☀️'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="duration">Durée</Label>
              {selectedTerrain?.type === 'foot' ? (
                <div className="w-full border rounded-md p-2 bg-gray-100 text-gray-700 text-sm flex items-center h-10">
                  1h30 (fixe pour football)
                </div>
              ) : (
                <Select 
                  value={selectedDuration} 
                  onValueChange={setSelectedDuration}
                  disabled={!isDurationChangeable()}
                >
                  <SelectTrigger id="duration">
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
        </div>
        
        {/* Right Column - Client Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="clientName">Nom du client</Label>
            <Input
              id="clientName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="clientEmail">Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="clientPhone">Téléphone</Label>
            <Input
              id="clientPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="message">Remarques</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-24"
            />
          </div>
          
          {selectedField && selectedTime && terrains && (
            <div className="p-4 bg-gray-50 rounded-md border">
              <h3 className="font-medium mb-2">Prix Total</h3>
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
      
      <div className="flex justify-end space-x-2 pt-4">
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
