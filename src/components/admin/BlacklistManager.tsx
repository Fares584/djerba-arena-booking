
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

  const handleRemove = (id: number, value: string) => {
    if (confirm(`Êtes-vous sûr de vouloir débloquer : ${value} ?`)) {
      removeFromBlacklist.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sport-green mx-auto mb-2"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Blacklist
          </h2>
          <p className="text-gray-600">
            {blacklist?.length || 0} contact(s) bloqué(s)
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Bloquer un contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bloquer un contact</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Type</Label>
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
                    <SelectItem value="phone">Téléphone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  {newEntry.type === 'phone' ? 'Numéro de téléphone' : 'Adresse email'}
                </Label>
                <Input
                  value={newEntry.value}
                  onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                  placeholder={
                    newEntry.type === 'phone' 
                      ? 'Ex: 27339837 ou +21627339837' 
                      : 'email@example.com'
                  }
                  required
                />
              </div>

              <div>
                <Label>Raison (optionnel)</Label>
                <Textarea
                  value={newEntry.reason}
                  onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                  placeholder="Pourquoi bloquer ce contact..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={addToBlacklist.isPending} className="bg-red-600 hover:bg-red-700">
                  {addToBlacklist.isPending ? 'Ajout...' : 'Bloquer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {blacklist && blacklist.length > 0 ? (
          blacklist.map((entry) => (
            <Card key={entry.id} className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">
                        {entry.type === 'phone' ? '📞' : '📧'} {entry.value}
                      </span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {entry.type === 'phone' ? 'Téléphone' : 'Email'}
                      </span>
                    </div>
                    {entry.reason && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Raison:</strong> {entry.reason}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Bloqué le {format(new Date(entry.created_at), 'PPP à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(entry.id, entry.value)}
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
              <h3 className="text-lg font-medium mb-2">Aucun contact bloqué</h3>
              <p className="text-gray-500 mb-4">
                La blacklist est vide.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BlacklistManager;
