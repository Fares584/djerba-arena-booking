import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAbonnementTypes } from '@/hooks/useAbonnementTypes';
import { useCreateAbonnement } from '@/hooks/useAbonnements';
import { useTerrains } from '@/hooks/useTerrains';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  client_nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  client_email: z.string().email('Email invalide'),
  client_tel: z.string().min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères'),
  abonnement_type_id: z.string().min(1, 'Veuillez sélectionner un type d\'abonnement'),
  terrain_id: z.string().min(1, 'Veuillez sélectionner un terrain'),
  jour_semaine: z.string().min(1, 'Veuillez sélectionner un jour'),
  heure_fixe: z.string().min(1, 'Veuillez sélectionner une heure'),
  duree_seance: z.string().min(1, 'Veuillez sélectionner une durée'),
  date_debut: z.string().min(1, 'Date de début requise'),
});

interface AbonnementFormProps {
  onSuccess: () => void;
}

const AbonnementForm = ({ onSuccess }: AbonnementFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: abonnementTypes } = useAbonnementTypes({ actif: true });
  const { data: terrains } = useTerrains({ actif: true });
  const createAbonnement = useCreateAbonnement();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_nom: '',
      client_email: '',
      client_tel: '',
      abonnement_type_id: '',
      terrain_id: '',
      jour_semaine: '',
      heure_fixe: '',
      duree_seance: '1',
      date_debut: new Date().toISOString().split('T')[0],
    },
  });

  const calculateEndDate = (startDate: string, durationMonths: number): string => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);
    return end.toISOString().split('T')[0];
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const selectedType = abonnementTypes?.find(t => t.id === parseInt(values.abonnement_type_id));
      if (!selectedType) {
        throw new Error('Type d\'abonnement non trouvé');
      }

      const endDate = calculateEndDate(values.date_debut, selectedType.duree_mois);

      const abonnementData = {
        client_nom: values.client_nom,
        client_email: values.client_email,
        client_tel: values.client_tel,
        abonnement_type_id: parseInt(values.abonnement_type_id),
        terrain_id: parseInt(values.terrain_id),
        jour_semaine: parseInt(values.jour_semaine),
        heure_fixe: values.heure_fixe,
        duree_seance: parseFloat(values.duree_seance),
        date_debut: values.date_debut,
        date_fin: endDate,
        statut: 'actif' as const,
        reservations_utilisees: 0,
      };

      await createAbonnement.mutateAsync(abonnementData);
      onSuccess();
    } catch (error) {
      console.error('Error creating abonnement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dayOptions = [
    { value: '1', label: 'Lundi' },
    { value: '2', label: 'Mardi' },
    { value: '3', label: 'Mercredi' },
    { value: '4', label: 'Jeudi' },
    { value: '5', label: 'Vendredi' },
    { value: '6', label: 'Samedi' },
    { value: '0', label: 'Dimanche' },
  ];

  const timeOptions = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const durationOptions = [
    { value: '1', label: '1 heure' },
    { value: '1.5', label: '1h30' },
    { value: '2', label: '2 heures' },
    { value: '2.5', label: '2h30' },
    { value: '3', label: '3 heures' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="client_nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du client</FormLabel>
              <FormControl>
                <Input placeholder="Nom complet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_tel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input placeholder="Numéro de téléphone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="abonnement_type_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type d'abonnement</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {abonnementTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.nom} - {type.prix} DT
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terrain_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terrain</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un terrain" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {terrains?.map((terrain) => (
                    <SelectItem key={terrain.id} value={terrain.id.toString()}>
                      {terrain.nom} ({terrain.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jour_semaine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jour de la semaine</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un jour" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dayOptions.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="heure_fixe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Heure</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une heure" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duree_seance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durée de la séance</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une durée" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {durationOptions.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_debut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de début</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Créer l'abonnement
        </Button>
      </form>
    </Form>
  );
};

export default AbonnementForm;
