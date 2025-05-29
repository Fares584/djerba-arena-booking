
import { useState, useEffect } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Reservation } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

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
      
      const { error } = await supabase
        .from('reservations')
        .update({
          nom_client: name,
          tel: phone,
          email: email,
          terrain_id: selectedField,
          date: formattedDate,
          heure: selectedTime,
          duree: parseFloat(selectedDuration),
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

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.')) {
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservation.id);
      
      if (error) throw error;
      
      toast.success('Réservation supprimée avec succès');
      onSuccess();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Erreur lors de la suppression de la réservation');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Field Selection and Date/Time */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="terrain">Terrain</Label>
            <Select 
              value={selectedField?.toString()} 
              onValueChange={(value) => setSelectedField(parseInt(value))}
              disabled={terrainsLoading || !terrains}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un terrain" />
              </SelectTrigger>
              <SelectContent>
                {terrains?.map((terrain) => (
                  <SelectItem key={terrain.id} value={terrain.id.toString()}>
                    {terrain.nom} - {terrain.type} ({terrain.prix} DT/h)
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
                onSelect={(date) => date && setSelectedDate(date)}
                locale={fr}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time">Heure</Label>
              <Select 
                value={selectedTime} 
                onValueChange={setSelectedTime}
              >
                <SelectTrigger id="time">
                  <SelectValue placeholder="Heure" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="duration">Durée</Label>
              <Select 
                value={selectedDuration} 
                onValueChange={setSelectedDuration}
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
            </div>
          </div>
          
          <div>
            <Label htmlFor="status">Statut</Label>
            <Select 
              value={selectedStatus} 
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger id="status">
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
          
          {selectedField && selectedDuration && terrains && (
            <div className="p-4 bg-gray-50 rounded-md border">
              <h3 className="font-medium mb-2">Prix</h3>
              <p className="text-lg font-bold text-sport-green">
                {(terrains.find(t => t.id === selectedField)?.prix || 0) * parseFloat(selectedDuration)} DT
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="destructive"
          onClick={handleDelete}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Suppression...
            </>
          ) : 'Supprimer'}
        </Button>
        
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
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
                En cours...
              </>
            ) : 'Modifier'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EditReservationForm;
