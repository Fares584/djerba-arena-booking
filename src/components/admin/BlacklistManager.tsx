
import React, { useState } from 'react';
import { useBlacklist } from '@/hooks/useBlacklist';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
    if (!newEntry.value.trim()) return;

    addToBlacklist.mutate(newEntry, {
      onSuccess: () => {
        setNewEntry({ type: 'phone', value: '', reason: '' });
        setIsDialogOpen(false);
      },
    });
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Gestion de la Blacklist
        </h2>
        
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
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newEntry.type}
                  onValueChange={(value: 'phone' | 'email') => 
                    setNewEntry({ ...newEntry, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Téléphone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
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
                  placeholder={newEntry.type === 'phone' ? '12345678' : 'email@example.com'}
                  required
                />
              </div>

              <div>
                <Label htmlFor="reason">Raison (optionnel)</Label>
                <Textarea
                  id="reason"
                  value={newEntry.reason}
                  onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                  placeholder="Raison du blocage..."
                  className="h-20"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={addToBlacklist.isPending}>
                  {addToBlacklist.isPending ? 'Ajout...' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {blacklist && blacklist.length > 0 ? (
          blacklist.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {entry.type === 'phone' ? '📞' : '📧'} {entry.value}
                      </span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {entry.type === 'phone' ? 'Téléphone' : 'Email'}
                      </span>
                    </div>
                    {entry.reason && (
                      <p className="text-sm text-gray-600">{entry.reason}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Ajouté le {format(new Date(entry.created_at), 'PPP à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromBlacklist.mutate(entry.id)}
                    disabled={removeFromBlacklist.isPending}
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
              <p className="text-gray-500">
                La blacklist est vide. Vous pouvez ajouter des contacts pour les bloquer.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BlacklistManager;
