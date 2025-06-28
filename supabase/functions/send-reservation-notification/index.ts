
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReservationNotificationRequest {
  reservation: {
    id: number;
    nom_client: string;
    tel: string;
    email: string;
    terrain_id: number;
    date: string;
    heure: string;
    duree: number;
    statut: string;
  };
  terrain: {
    nom: string;
    type: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🔔 Début de l'envoi de notification de réservation");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reservation, terrain }: ReservationNotificationRequest = await req.json();
    
    console.log("📧 Envoi d'email pour la réservation:", reservation.id);
    console.log("🔑 Clé API Resend configurée:", Deno.env.get("RESEND_API_KEY") ? "✅ Oui" : "❌ Non");

    // Format de la date en français
    const dateFormatted = new Date(reservation.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a472a; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🏟️ Nouvelle Réservation</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #1a472a; margin-bottom: 20px;">Détails de la réservation</h2>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Client:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.nom_client}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Téléphone:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.tel}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Email:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Terrain:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${terrain.nom} (${terrain.type})</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Date:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${dateFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Heure:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.heure}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Durée:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.duree}h</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #555;">Statut:</td>
                <td style="padding: 10px 0;">
                  <span style="background-color: #fbbf24; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    ${reservation.statut === 'en_attente' ? 'EN ATTENTE' : reservation.statut.toUpperCase()}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
            <h3 style="margin: 0 0 10px 0; color: #1976d2;">Action requise</h3>
            <p style="margin: 0; color: #555;">
              Cette réservation est en attente de confirmation. Connectez-vous à votre panel d'administration pour confirmer ou annuler cette réservation.
            </p>
          </div>
        </div>
        
        <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Email automatique - Planet Sports 25</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Planet Sports 25 <notifications@resend.dev>",
      to: ["planetsports25@gmail.com"],
      subject: `🏟️ Nouvelle réservation - ${terrain.nom} le ${dateFormatted}`,
      html: emailHtml,
    });

    console.log("✅ Email envoyé avec succès:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
