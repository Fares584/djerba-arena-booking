
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PushSubscriptionData {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscriptionData | null>(null);
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
      const pushSubscription = await registration.pushManager.getSubscription();
      
      if (pushSubscription) {
        const subscriptionData: PushSubscriptionData = {
          endpoint: pushSubscription.endpoint,
          expirationTime: pushSubscription.expirationTime,
          keys: {
            p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(pushSubscription.getKey('auth')!)
          }
        };
        setSubscription(subscriptionData);
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
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa40HI80YkCnN1srgDmg' // Clé VAPID publique
        )
      });

      const subscriptionData: PushSubscriptionData = {
        endpoint: pushSubscription.endpoint,
        expirationTime: pushSubscription.expirationTime,
        keys: {
          p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(pushSubscription.getKey('auth')!)
        }
      };

      // Sauvegarder l'abonnement dans Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscriptionData.endpoint,
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde de l\'abonnement:', error);
        toast.error('Erreur lors de l\'activation des notifications');
        return;
      }

      setSubscription(subscriptionData);
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
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.getSubscription();
      
      if (pushSubscription) {
        await pushSubscription.unsubscribe();
      }
      
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

// Fonction utilitaire pour convertir ArrayBuffer en Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

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
