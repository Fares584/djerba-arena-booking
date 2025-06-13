
import { useState, useEffect } from 'react';
import { useAppSetting, useUpdateAppSetting } from '@/hooks/useAppSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Clock } from 'lucide-react';

const GlobalSettings = () => {
  const { data: nightTimeSetting, isLoading } = useAppSetting('heure_debut_nuit_globale');
  const updateSetting = useUpdateAppSetting();
  const [nightStartTime, setNightStartTime] = useState('19:00');

  useEffect(() => {
    if (nightTimeSetting) {
      setNightStartTime(nightTimeSetting.setting_value);
    }
  }, [nightTimeSetting]);

  const handleSave = async () => {
    if (!nightStartTime) return;
    
    updateSetting.mutate({
      settingName: 'heure_debut_nuit_globale',
      settingValue: nightStartTime
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-sport-green" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Paramètres Globaux des Tarifs
        </CardTitle>
        <CardDescription>
          Configurez l'heure de début des tarifs de nuit qui s'appliquera à tous les terrains
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nightStartTime">Heure de début des tarifs de nuit</Label>
          <Input
            id="nightStartTime"
            type="time"
            value={nightStartTime}
            onChange={(e) => setNightStartTime(e.target.value)}
            className="max-w-xs"
          />
          <p className="text-sm text-gray-500 mt-1">
            Cette heure s'appliquera à tous les terrains ayant un prix de nuit configuré
          </p>
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={updateSetting.isPending}
          className="bg-sport-green hover:bg-sport-dark"
        >
          {updateSetting.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : 'Sauvegarder'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GlobalSettings;
