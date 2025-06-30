
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  title: string;
  body: string;
  data?: any;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("📱 Début de l'envoi de notification push");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, data }: PushNotificationRequest = await req.json();
    
    console.log("📱 Envoi de notification push:", { title, body });

    // Initialiser le client Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer tous les abonnements push actifs
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des abonnements:', fetchError);
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('📱 Aucun abonnement push trouvé');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Aucun abonnement push actif",
          sent: 0
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`📱 ${subscriptions.length} abonnement(s) trouvé(s)`);

    // Clés VAPID (vous devrez les configurer comme secrets)
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('❌ Clés VAPID manquantes');
      throw new Error('Clés VAPID non configurées');
    }

    const payload = {
      title,
      body,
      data: data || {}
    };

    let successCount = 0;
    let errorCount = 0;

    // Envoyer la notification à chaque abonnement
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        // Envoyer la notification push
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: subscription.endpoint,
            notification: {
              title: payload.title,
              body: payload.body,
              icon: '/favicon.ico',
              click_action: '/admin/reservations'
            },
            data: payload.data
          })
        });

        if (response.ok) {
          successCount++;
          console.log(`✅ Notification envoyée avec succès à ${subscription.endpoint.slice(0, 50)}...`);
        } else {
          errorCount++;
          console.error(`❌ Échec d'envoi à ${subscription.endpoint.slice(0, 50)}...`, response.status);
          
          // Si l'abonnement n'est plus valide, le supprimer
          if (response.status === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', subscription.endpoint);
            console.log(`🗑️ Abonnement invalide supprimé: ${subscription.endpoint.slice(0, 50)}...`);
          }
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur lors de l'envoi à ${subscription.endpoint.slice(0, 50)}...`, error);
      }
    }

    console.log(`📱 Résumé: ${successCount} envoyées, ${errorCount} échecs`);

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: successCount,
        failed: errorCount,
        total: subscriptions.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ Erreur lors de l'envoi des notifications push:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
