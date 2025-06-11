
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Terrain } from '@/lib/supabase';

interface TerrainFormProps {
  onSuccess: () => void;
  terrainToEdit?: Terrain | null;
}

const TerrainForm = ({ onSuccess, terrainToEdit }: TerrainFormProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'foot' | 'tennis' | 'padel'>('foot');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [nightPrice, setNightPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Populate form if editing an existing terrain
  useEffect(() => {
    if (terrainToEdit) {
      setName(terrainToEdit.nom);
      setType(terrainToEdit.type as 'foot' | 'tennis' | 'padel');
      setCapacity(terrainToEdit.capacite.toString());
      setPrice(terrainToEdit.prix.toString());
      setNightPrice(terrainToEdit.prix_nuit?.toString() || '');
      setImageUrl(terrainToEdit.image_url || '');
      setIsActive(terrainToEdit.actif || false);
    }
  }, [terrainToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !type || !capacity || !price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const terrainData = {
        nom: name,
        type,
        capacite: parseInt(capacity),
        prix: parseFloat(price),
        prix_nuit: nightPrice ? parseFloat(nightPrice) : null,
        image_url: imageUrl || null,
        actif: isActive
      };
      
      let result;
      
      if (terrainToEdit) {
        // Update existing terrain
        result = await supabase
          .from('terrains')
          .update(terrainData)
          .eq('id', terrainToEdit.id);
      } else {
        // Create new terrain
        result = await supabase
          .from('terrains')
          .insert(terrainData);
      }
      
      if (result.error) throw result.error;
      
      toast.success(
        terrainToEdit ? 'Terrain mis à jour avec succès' : 'Terrain ajouté avec succès'
      );
      
      onSuccess();
    } catch (error) {
      console.error('Error saving terrain:', error);
      toast.error('Une erreur est survenue lors de l\'enregistrement du terrain');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div>
        <Label htmlFor="name">Nom du terrain*</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="type">Type de terrain*</Label>
        <Select 
          value={type} 
          onValueChange={(value) => setType(value as 'foot' | 'tennis' | 'padel')}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Sélectionnez un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="foot">Football</SelectItem>
            <SelectItem value="tennis">Tennis</SelectItem>
            <SelectItem value="padel">Padel</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="capacity">Capacité (personnes)*</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="price">Prix jour (DT/heure)*</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="nightPrice">Prix nuit (DT/heure) - optionnel</Label>
        <Input
          id="nightPrice"
          type="number"
          min="0"
          step="0.01"
          value={nightPrice}
          onChange={(e) => setNightPrice(e.target.value)}
          placeholder="Prix pour les créneaux 19h et après"
        />
      </div>
      
      <div>
        <Label htmlFor="imageUrl">URL de l'image</Label>
        <Input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="isActive" 
          checked={isActive} 
          onCheckedChange={setIsActive} 
        />
        <Label htmlFor="isActive">Actif</Label>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-sport-green hover:bg-sport-dark"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              En cours...
            </>
          ) : terrainToEdit ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
};

export default TerrainForm;
