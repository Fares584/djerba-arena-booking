
import React, { useState } from 'react';
import { useBlacklist } from '@/hooks/useBlacklist';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Shield, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const BlacklistManager = () => {
  const { blacklist, isLoading, addToBlacklist, removeFromBlacklist } = useBlacklist();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: 'phone' as 'phone' | 'email',
    value: '',
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.value.trim()) {
      toast.error('Veuillez saisir une valeur à bloquer');
      return;
    }

    // Nettoyer la valeur
    const cleanValue = newEntry.type === 'email' 
      ? newEntry.value.trim().toLowerCase()
      : newEntry.value.trim();

    // Validation basique
    if (newEntry.type === 'phone' && !/^\d{8}$/.test(cleanValue)) {
      toast.error('Le numéro de téléphone doit contenir exactement 8 chiffres');
      return;
    }

    if (newEntry.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue)) {
      toast.error('L\'adresse email n\'est pas valide');
      return;
    }

    addToBlacklist.mutate({
      ...newEntry,
      value: cleanValue
    }, {
      onSuccess: () => {
        setNewEntry({ type: 'phone', value: '', reason: '' });
        setIsDialogOpen(false);
        toast.success(`${newEntry.type === 'phone' ? 'Numéro' : 'Email'} ajouté à la blacklist avec succès`);
      },
    });
  };

  const handleRemove = (id: number, value: string, type: string) => {
    if (confirm(`Êtes-vous sûr de vouloir débloquer ce ${type === 'phone' ? 'numéro' : 'email'} : ${value} ?`)) {
      removeFromBlacklist.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sport-green mx-auto mb-2"></div>
        <p>Chargement de la blacklist...</p>
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Gestion de la Blacklist
          </h2>
          <p className="text-gray-600 mt-1">
            Contacts bloqués : {blacklist?.length || 0} élément(s)
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter à la blacklist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un contact à la blacklist</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Type de contact</Label>
                <Select
                  value={newEntry.type}
                  onValueChange={(value: 'phone' | 'email') => 
                    setNewEntry({ ...newEntry, type: value, value: '' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">📞 Numéro de téléphone</SelectItem>
                    <SelectItem value="email">📧 Adresse email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">
                  {newEntry.type === 'phone' ? 'Numéro de téléphone' : 'Adresse email'}
                </Label>
                <Input
                  id="value"
                  value={newEntry.value}
                  onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                  placeholder={newEntry.type === 'phone' ? 'Ex: 27339837' : 'email@example.com'}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newEntry.type === 'phone' 
                    ? 'Saisissez uniquement les 8 chiffres du numéro tunisien'
                    : 'Saisissez l\'adresse email complète'
                  }
                </p>
              </div>

              <div>
                <Label htmlFor="reason">Raison du blocage</Label>
                <Textarea
                  id="reason"
                  value={newEntry.reason}
                  onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                  placeholder="Expliquez pourquoi ce contact est bloqué..."
                  className="h-20"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={addToBlacklist.isPending} className="bg-red-600 hover:bg-red-700">
                  {addToBlacklist.isPending ? 'Ajout...' : 'Bloquer ce contact'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerte d'information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Comment fonctionne la blacklist ?</h3>
              <p className="text-sm text-blue-700 mt-1">
                Les contacts ajoutés à cette liste ne pourront plus effectuer de réservations, 
                même via l'interface publique. La vérification se fait automatiquement lors de chaque tentative de réservation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {blacklist && blacklist.length > 0 ? (
          blacklist.map((entry) => (
            <Card key={entry.id} className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {entry.type === 'phone' ? '📞' : '📧'} {entry.value}
                      </span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {entry.type === 'phone' ? 'Téléphone' : 'Email'} bloqué
                      </span>
                    </div>
                    {entry.reason && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Raison :</strong> {entry.reason}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Bloqué le {format(new Date(entry.created_at), 'PPP à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(entry.id, entry.value, entry.type)}
                    disabled={removeFromBlacklist.isPending}
                    title="Débloquer ce contact"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun contact bloqué
              </h3>
              <p className="text-gray-500 mb-4">
                La blacklist est vide. Vous pouvez ajouter des contacts pour les empêcher de faire des réservations.
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter le premier contact
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BlacklistManager;
