
import { useState } from 'react';
import { useAbonnementTypes, useCreateAbonnement } from '@/hooks/useAbonnements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AbonnementFormProps {
  onSuccess: () => void;
}

const AbonnementForm = ({ onSuccess }: AbonnementFormProps) => {
  const [clientNom, setClientNom] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientTel, setClientTel] = useState('');
  const [abonnementTypeId, setAbonnementTypeId] = useState<number | null>(null);
  const [dateDebut, setDateDebut] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { data: abonnementTypes, isLoading: typesLoading } = useAbonnementTypes();
  const createAbonnement = useCreateAbonnement();

  const selectedType = abonnementTypes?.find(t => t.id === abonnementTypeId);
  const dateFin = selectedType ? addMonths(dateDebut, selectedType.duree_mois) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientNom || !clientEmail || !clientTel || !abonnementTypeId || !selectedType) {
      return;
    }

    createAbonnement.mutate({
      client_nom: clientNom,
      client_email: clientEmail,
      client_tel: clientTel,
      abonnement_type_id: abonnementTypeId,
      date_debut: format(dateDebut, 'yyyy-MM-dd'),
      date_fin: format(addMonths(dateDebut, selectedType.duree_mois), 'yyyy-MM-dd'),
      statut: 'actif',
      reservations_utilisees: 0,
    }, {
      onSuccess: () => {
        onSuccess();
        // Reset form
        setClientNom('');
        setClientEmail('');
        setClientTel('');
        setAbonnementTypeId(null);
        setDateDebut(new Date());
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientNom">Nom du client *</Label>
          <Input
            id="clientNom"
            type="text"
            value={clientNom}
            onChange={(e) => setClientNom(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="clientEmail">Email *</Label>
          <Input
            id="clientEmail"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="clientTel">Téléphone *</Label>
          <Input
            id="clientTel"
            type="tel"
            value={clientTel}
            onChange={(e) => setClientTel(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="abonnementType">Type d'abonnement *</Label>
          <Select 
            value={abonnementTypeId?.toString() || ''} 
            onValueChange={(value) => setAbonnementTypeId(parseInt(value))}
            disabled={typesLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              {abonnementTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.nom} - {type.prix} DT
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label>Date de début *</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateDebut && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateDebut ? format(dateDebut, 'PPP', { locale: fr }) : <span>Sélectionner une date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateDebut}
              onSelect={(date) => {
                if (date) {
                  setDateDebut(date);
                  setIsCalendarOpen(false);
                }
              }}
              initialFocus
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {selectedType && dateFin && (
        <div className="p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Résumé de l'abonnement</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-medium">{selectedType.nom}</span>
            </div>
            <div className="flex justify-between">
              <span>Durée:</span>
              <span className="font-medium">{selectedType.duree_mois} mois</span>
            </div>
            <div className="flex justify-between">
              <span>Réduction:</span>
              <span className="font-medium">{selectedType.reduction_pourcentage}%</span>
            </div>
            <div className="flex justify-between">
              <span>Réservations incluses/mois:</span>
              <span className="font-medium">{selectedType.reservations_incluses}</span>
            </div>
            <div className="flex justify-between">
              <span>Date de fin:</span>
              <span className="font-medium">{format(dateFin, 'dd/MM/yyyy', { locale: fr })}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Prix total:</span>
              <span className="font-bold text-sport-green">{selectedType.prix} DT</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="submit" 
          disabled={createAbonnement.isPending}
          className="bg-sport-green hover:bg-sport-dark"
        >
          {createAbonnement.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création...
            </>
          ) : 'Créer l\'abonnement'}
        </Button>
      </div>
    </form>
  );
};

export default AbonnementForm;
