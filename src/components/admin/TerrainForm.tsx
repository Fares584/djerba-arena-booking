import React, { useState, useEffect } from 'react';
import { useTerrains, useInvalidateTerrains } from '@/hooks/useTerrains';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Terrain } from '@/lib/supabase';

interface TerrainFormProps {
  terrainToEdit?: Terrain | null;
  onSuccess: () => void;
}

const TerrainForm = ({ terrainToEdit, onSuccess }: TerrainFormProps) => {
  const [formData, setFormData] = useState({
    nom: '',
    type: 'foot' as 'foot' | 'tennis' | 'padel',
    capacite: '',
    prix: '',
    prix_nuit: '',
    image_url: '',
    actif: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const invalidateTerrains = useInvalidateTerrains();

  useEffect(() => {
    if (terrainToEdit) {
      setFormData({
        nom: terrainToEdit.nom,
        type: terrainToEdit.type,
        capacite: terrainToEdit.capacite.toString(),
        prix: terrainToEdit.prix.toString(),
        prix_nuit: (terrainToEdit.prix_nuit || '').toString(),
        image_url: terrainToEdit.image_url || '',
        actif: terrainToEdit.actif
      });
    }
  }, [terrainToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.capacite || !formData.prix) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);

    try {
      const terrainData = {
        nom: formData.nom,
        type: formData.type,
        capacite: parseInt(formData.capacite),
        prix: parseFloat(formData.prix),
        prix_nuit: formData.prix_nuit ? parseFloat(formData.prix_nuit) : null,
        image_url: formData.image_url || null,
        actif: formData.actif
      };

      let result;
      if (terrainToEdit) {
        result = await supabase
          .from('terrains')
          .update(terrainData)
          .eq('id', terrainToEdit.id);
      } else {
        result = await supabase
          .from('terrains')
          .insert([terrainData]);
      }

      if (result.error) throw result.error;

      // Invalider le cache des terrains pour forcer le rafraîchissement
      invalidateTerrains();
      
      toast.success(
        terrainToEdit ? 'Terrain modifié avec succès' : 'Terrain créé avec succès'
      );
      
      onSuccess();
    } catch (error) {
      console.error('Error saving terrain:', error);
      toast.error('Erreur lors de la sauvegarde du terrain');
    } finally {
      setIsSubmitting(false);
    }
  };

  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nom">Nom du terrain</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="type">Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value: 'foot' | 'tennis' | 'padel') => 
              setFormData(prev => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="foot">Football</SelectItem>
              <SelectItem value="tennis">Tennis</SelectItem>
              <SelectItem value="padel">Padel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="capacite">Capacité</Label>
          <Input
            id="capacite"
            type="number"
            value={formData.capacite}
            onChange={(e) => setFormData(prev => ({ ...prev, capacite: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="prix">Prix (DT/heure)</Label>
          <Input
            id="prix"
            type="number"
            step="0.01"
            value={formData.prix}
            onChange={(e) => setFormData(prev => ({ ...prev, prix: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="prix_nuit">Prix nuit (DT/heure) - Optionnel</Label>
          <Input
            id="prix_nuit"
            type="number"
            step="0.01"
            value={formData.prix_nuit}
            onChange={(e) => setFormData(prev => ({ ...prev, prix_nuit: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="image_url">URL de l'image - Optionnel</Label>
          <Input
            id="image_url"
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="actif"
          checked={formData.actif}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, actif: checked }))}
        />
        <Label htmlFor="actif">Terrain actif</Label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-sport-green hover:bg-sport-dark">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {terrainToEdit ? 'Modification...' : 'Création...'}
            </>
          ) : (
            terrainToEdit ? 'Mettre à jour' : 'Créer'
          )}
        </Button>
      </div>
    </form>
  );
};

export default TerrainForm;
