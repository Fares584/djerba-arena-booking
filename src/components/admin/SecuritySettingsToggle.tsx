
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Settings } from 'lucide-react';
import { useAppSetting, useUpdateAppSetting } from '@/hooks/useAppSettings';
import { toast } from 'sonner';

const SecuritySettingsToggle = () => {
  const { data: securitySetting, isLoading } = useAppSetting('security_limits_enabled');
  const updateSetting = useUpdateAppSetting();
  const [isUpdating, setIsUpdating] = useState(false);

  const isSecurityEnabled = securitySetting?.setting_value === 'true';

  const handleToggleSecurity = async () => {
    setIsUpdating(true);
    try {
      const newValue = isSecurityEnabled ? 'false' : 'true';
      
      await updateSetting.mutateAsync({
        settingName: 'security_limits_enabled',
        settingValue: newValue
      });

      toast.success(
        newValue === 'true' 
          ? 'Sécurité des réservations activée' 
          : 'Sécurité des réservations désactivée'
      );
    } catch (error) {
      console.error('Error updating security setting:', error);
      toast.error('Erreur lors de la mise à jour du paramètre');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Paramètres de Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-6 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Paramètres de Sécurité
        </CardTitle>
        <CardDescription>
          Contrôlez les limitations de réservation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Limitations de Réservation
            </label>
            <p className="text-xs text-muted-foreground">
              {isSecurityEnabled 
                ? 'Actif: 2 réservations max/jour, 5min entre réservations'
                : 'Désactivé: Aucune limitation appliquée'
              }
            </p>
          </div>
          <Switch
            checked={isSecurityEnabled}
            onCheckedChange={handleToggleSecurity}
            disabled={isUpdating}
          />
        </div>
        
        <div className="pt-2 border-t">
          <Button
            onClick={handleToggleSecurity}
            disabled={isUpdating}
            variant={isSecurityEnabled ? "destructive" : "default"}
            size="sm"
            className="w-full"
          >
            <Settings className="mr-2 h-4 w-4" />
            {isUpdating 
              ? 'Mise à jour...' 
              : isSecurityEnabled 
                ? 'Désactiver la Sécurité' 
                : 'Activer la Sécurité'
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettingsToggle;
