
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const PushNotificationSettings = () => {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Push
          </CardTitle>
          <CardDescription>
            Les notifications push ne sont pas supportées sur ce navigateur.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications Push Mobile
        </CardTitle>
        <CardDescription>
          Recevez des notifications sur votre téléphone quand de nouvelles réservations sont créées.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              {isSubscribed ? 'Notifications activées' : 'Notifications désactivées'}
            </p>
            <p className="text-sm text-gray-500">
              {isSubscribed 
                ? 'Vous recevrez des notifications push pour les nouvelles réservations'
                : 'Activez les notifications pour être averti des nouvelles réservations'
              }
            </p>
          </div>
          <Button
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={isLoading}
            variant={isSubscribed ? 'outline' : 'default'}
            className={isSubscribed ? '' : 'bg-sport-green hover:bg-sport-dark'}
          >
            {isLoading ? 'Chargement...' : isSubscribed ? 'Désactiver' : 'Activer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationSettings;
