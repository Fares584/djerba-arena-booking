
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  console.log('Fonction send-reservation-email appelée');
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      reservation_id, 
      email, 
      nom_client, 
      terrain_nom, 
      date, 
      heure, 
      duree, 
      confirmation_token 
    } = await req.json();

    console.log('Données reçues:', {
      reservation_id,
      email,
      nom_client,
      terrain_nom,
      date,
      heure,
      duree,
      confirmation_token: confirmation_token ? 'présent' : 'manquant'
    });

    if (!confirmation_token) {
      console.error('Token de confirmation manquant');
      return new Response(
        JSON.stringify({ success: false, error: 'Token de confirmation manquant' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 400 
        }
      );
    }

    console.log('Initialisation de Resend...');
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // URL de confirmation
    const confirmUrl = `https://gentle-pony-e6a7e4.lovableproject.com/confirm-reservation?token=${confirmation_token}`;
    console.log('URL de confirmation générée:', confirmUrl);

    // Format de la date en français
    const dateFormatted = new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    console.log('Tentative d\'envoi d\'email vers:', email);

    const result = await resend.emails.send({
      from: "Sport Center <onboarding@resend.dev>", // ✅ Adresse autorisée automatiquement
      to: [email],
      subject: "Confirmez votre réservation - Sport Center",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #16a34a; text-align: center;">🏈 Sport Center</h2>
          
          <h3>Bonjour ${nom_client},</h3>
          
          <p>Merci pour votre demande de réservation !</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #374151;">📋 Détails de votre réservation :</h4>
            <ul style="list-style: none; padding: 0;">
              <li><strong>🏟️ Terrain :</strong> ${terrain_nom}</li>
              <li><strong>📅 Date :</strong> ${dateFormatted}</li>
              <li><strong>🕐 Heure :</strong> ${heure}</li>
              <li><strong>⏱️ Durée :</strong> ${duree}h</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" 
               style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              ✅ Confirmer ma réservation
            </a>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e;">
              <strong>⚠️ Important :</strong> Ce lien est valable une seule fois et expire dans 15 minutes. 
              Votre réservation sera automatiquement annulée si elle n'est pas confirmée à temps.
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="text-align: center; color: #6b7280; font-size: 14px;">
            Sport Center - Votre terrain de sport préféré ⚽🏀🎾
          </p>
        </div>
      `,
    });

    console.log('Réponse de Resend:', result);

    if (result.error) {
      console.error('Erreur Resend:', result.error);
      throw new Error(`Erreur Resend: ${result.error.message || JSON.stringify(result.error)}`);
    }

    console.log('Email envoyé avec succès, ID:', result.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de confirmation envoyé',
        email_id: result.data?.id 
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erreur dans send-reservation-email:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email',
        details: error.message 
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500 
      }
    );
  }
});
