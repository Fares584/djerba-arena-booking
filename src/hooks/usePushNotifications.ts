
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        setSubscription(subscription as any);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'abonnement:', error);
    }
  };

  const subscribeToPushNotifications = async () => {
    if (!isSupported) {
      toast.error('Les notifications push ne sont pas supportées sur cet appareil');
      return;
    }

    try {
      // Demander la permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast.error('Permission de notification refusée');
        return;
      }

      // Enregistrer le service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Créer l'abonnement push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa40HI80YkC1srgDmg' // Clé VAPID publique
        )
      });

      // Sauvegarder l'abonnement dans Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          p256dh: (subscription as any).keys.p256dh,
          auth: (subscription as any).keys.auth,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde de l\'abonnement:', error);
        toast.error('Erreur lors de l\'activation des notifications');
        return;
      }

      setSubscription(subscription as any);
      setIsSubscribed(true);
      toast.success('Notifications push activées avec succès !');

    } catch (error) {
      console.error('Erreur lors de l\'abonnement aux notifications push:', error);
      toast.error('Erreur lors de l\'activation des notifications');
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      
      // Supprimer l'abonnement de Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);

      if (error) {
        console.error('Erreur lors de la suppression de l\'abonnement:', error);
      }

      setSubscription(null);
      setIsSubscribed(false);
      toast.success('Notifications push désactivées');

    } catch (error) {
      console.error('Erreur lors de la désinscription:', error);
      toast.error('Erreur lors de la désactivation des notifications');
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications
  };
};

// Fonction utilitaire pour convertir la clé VAPID
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
