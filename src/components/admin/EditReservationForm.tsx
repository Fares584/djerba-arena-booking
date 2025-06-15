import { useState, useEffect } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { useAppSetting } from '@/hooks/useAppSettings';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Reservation, isNightTime, calculatePrice } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Available time slots
const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

// Duration options for non-football fields
const durationOptions = [
  { value: '1', label: '1 heure' },
  { value: '1.5', label: '1 heure 30 minutes' },
  { value: '2', label: '2 heures' },
  { value: '3', label: '3 heures' },
];

// Status options
const statusOptions = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'confirmee', label: 'Confirmée' },
  { value: 'annulee', label: 'Annulée' },
];

interface EditReservationFormProps {
  reservation: Reservation;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditReservationForm = ({ reservation, onSuccess, onCancel }: EditReservationFormProps) => {
  const [selectedField, setSelectedField] = useState<number>(reservation.terrain_id);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(reservation.date));
  const [selectedTime, setSelectedTime] = useState<string>(reservation.heure);
  const [selectedDuration, setSelectedDuration] = useState<string>(reservation.duree.toString());
  const [selectedStatus, setSelectedStatus] = useState<string>(reservation.statut);
  const [name, setName] = useState(reservation.nom_client);
  const [email, setEmail] = useState(reservation.email);
  const [phone, setPhone] = useState(reservation.tel);
  const [message, setMessage] = useState(reservation.remarque || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { data: terrains, isLoading: terrainsLoading } = useTerrains();
  const { data: nightTimeSetting } = useAppSetting('heure_debut_nuit_globale');

  // Get selected terrain object
  const selectedTerrain = terrains?.find(t => t.id === selectedField);

  // Get global night start time
  const getGlobalNightStartTime = (): string => {
    return nightTimeSetting?.setting_value || '19:00';
  };

  // Get effective duration - ALWAYS 1.5 for football
  const getEffectiveDuration = (): string => {
    if (selectedTerrain?.type === 'foot') {
      return '1.5'; // Football always 1.5 hours
    }
    return selectedDuration;
  };

  // Update duration when terrain changes
  useEffect(() => {
    if (selectedTerrain?.type === 'foot') {
      setSelectedDuration('1.5');
    }
  }, [selectedTerrain]);

  // Calculate total price based on selected time and duration - FIXED FOR FOOTBALL
  const calculateTotalPrice = (): number => {
    if (!selectedField || !selectedTime || !terrains) return 0;
    
    const terrain = terrains.find(t => t.id === selectedField);
    if (!terrain) return 0;
    
    const duration = parseFloat(getEffectiveDuration());
    const globalNightStartTime = getGlobalNightStartTime();
    
    // For football terrains, use fixed pricing for 1h30 - no hourly calculation
    if (terrain.type === 'foot') {
      return calculatePrice(terrain, selectedTime, globalNightStartTime);
    }
    
    // For other terrains, calculate hourly rate × duration
    const startHour = parseInt(selectedTime.split(':')[0]);
    let totalPrice = 0;
    
    // Calculate price for each hour based on day/night rates
    for (let i = 0; i < duration; i++) {
      const currentHour = startHour + i;
      const timeString = `${currentHour.toString().padStart(2, '0')}:00`;
      const hourPrice = calculatePrice(terrain, timeString, globalNightStartTime);
      totalPrice += hourPrice;
    }
    
    return totalPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedField || !selectedDate || !selectedTime || !name || !email || !phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Format date as ISO string (YYYY-MM-DD)
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const effectiveDuration = getEffectiveDuration();
      
      const { error } = await supabase
        .from('reservations')
        .update({
          nom_client: name,
          tel: phone,
          email: email,
          terrain_id: selectedField,
          date: formattedDate,
          heure: selectedTime,
          duree: parseFloat(effectiveDuration),
          statut: selectedStatus as 'en_attente' | 'confirmee' | 'annulee',
          remarque: message || null
        })
        .eq('id', reservation.id);
      
      if (error) throw error;
      
      toast.success('Réservation modifiée avec succès');
      onSuccess();
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Erreur lors de la modification de la réservation');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column - Field Selection and Date/Time */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="terrain" className="text-sm">Terrain</Label>
              <Select 
                value={selectedField?.toString()} 
                onValueChange={(value) => setSelectedField(parseInt(value))}
                disabled={terrainsLoading || !terrains}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Sélectionnez un terrain" />
                </SelectTrigger>
                <SelectContent>
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
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={fr}
                  className="scale-90"
                />
              </div>
            </div>
          </div>
          
          {/* Right Column - Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="time" className="text-sm">Heure</Label>
                <Select 
                  value={selectedTime} 
                  onValueChange={setSelectedTime}
                >
                  <SelectTrigger id="time" className="h-9">
                    <SelectValue placeholder="Heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
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
              <Label htmlFor="status" className="text-sm">Statut</Label>
              <Select 
                value={selectedStatus} 
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger id="status" className="h-9">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="clientName" className="text-sm">Nom du client</Label>
              <Input
                id="clientName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9"
              />
            </div>
            
            <div>
              <Label htmlFor="clientEmail" className="text-sm">Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
                className="h-9"
              />
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
          </div>
        </div>
        
        {/* Price Display */}
        {selectedField && selectedTime && terrains && (
          <div className="p-3 bg-gray-50 rounded-md border">
            <h3 className="font-medium mb-1 text-sm">Prix Total</h3>
            <div className="text-sm text-gray-600 mb-1">
              {isNightTime(selectedTime, getGlobalNightStartTime()) ? `Tarif nuit (dès ${getGlobalNightStartTime()})` : 'Tarif jour'} - {getEffectiveDuration()}h
              {selectedTerrain?.type === 'foot' && (
                <span className="text-blue-600 ml-1">(durée fixe)</span>
              )}
            </div>
            <p className="text-lg font-bold text-sport-green">
              {calculateTotalPrice()} DT
            </p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isUpdating}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isUpdating}
            className="bg-sport-green hover:bg-sport-dark"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Modification...
              </>
            ) : 'Valider la modification'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditReservationForm;
