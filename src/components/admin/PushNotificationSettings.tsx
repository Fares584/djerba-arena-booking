
import React from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Smartphone } from 'lucide-react';

const PushNotificationSettings = () => {
  const { 
    isSupported, 
    isSubscribed, 
    subscribeToPushNotifications, 
    unsubscribeFromPushNotifications 
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Notifications Mobile
          </CardTitle>
          <CardDescription>
            Les notifications push ne sont pas supportées sur cet appareil/navigateur.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Notifications Mobile
        </CardTitle>
        <CardDescription>
          Recevez des notifications push sur votre téléphone pour les nouvelles réservations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSubscribed ? (
              <>
                <Bell className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Notifications activées</span>
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">Notifications désactivées</span>
              </>
            )}
          </div>
          
          {isSubscribed ? (
            <Button
              variant="outline"
              size="sm"
              onClick={unsubscribeFromPushNotifications}
            >
              <BellOff className="mr-2 h-4 w-4" />
              Désactiver
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={subscribeToPushNotifications}
              className="bg-sport-green hover:bg-sport-dark"
            >
              <Bell className="mr-2 h-4 w-4" />
              Activer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationSettings;
