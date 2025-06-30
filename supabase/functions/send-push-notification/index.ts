
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  title: string;
  body: string;
  url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("📱 Début de l'envoi de notification push");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, url = '/admin/reservations' }: PushNotificationRequest = await req.json();
    
    console.log("📱 Envoi de notification push:", { title, body });

    // Vérifier les clés VAPID
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error("Clés VAPID manquantes");
    }

    // Initialiser Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer tous les abonnements
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) {
      throw new Error(`Erreur base de données: ${error.message}`);
    }

    console.log(`📱 Nombre d'abonnements trouvés: ${subscriptions?.length || 0}`);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Aucun abonnement push trouvé",
          sent: 0
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Préparer le payload de notification
    const payload = JSON.stringify({
      title,
      body,
      url
    });

    let sentCount = 0;
    let failedCount = 0;

    // Envoyer à chaque abonnement
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        // Utiliser web-push pour envoyer la notification
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${vapidPrivateKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: subscription.endpoint.split('/').pop(),
            data: {
              title,
              body,
              url
            }
          })
        });

        if (response.ok) {
          sentCount++;
          console.log(`✅ Notification envoyée avec succès à ${subscription.endpoint.substring(0, 50)}...`);
        } else {
          failedCount++;
          console.error(`❌ Échec d'envoi à ${subscription.endpoint.substring(0, 50)}...`);
        }
      } catch (error) {
        failedCount++;
        console.error(`❌ Erreur lors de l'envoi à un abonnement:`, error);
      }
    }

    console.log(`📱 Résumé: ${sentCount} envoyées, ${failedCount} échouées`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications push envoyées`,
        sent: sentCount,
        failed: failedCount,
        total: subscriptions.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("❌ Erreur lors de l'envoi de notifications push:", error);
    
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
