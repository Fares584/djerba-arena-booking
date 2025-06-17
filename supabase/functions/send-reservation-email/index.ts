
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reservation_id, email, nom_client, terrain_nom, date, heure, duree, confirmation_token } = await req.json();

    console.log('Envoi de l\'email avec Resend pour la réservation:', reservation_id);

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // URL de confirmation - utilise l'URL de votre application Lovable
    const confirmationUrl = `https://gentle-pony-e6a7e4.lovableproject.com/confirm-reservation?token=${confirmation_token}`;

    const result = await resend.emails.send({
      from: "Sport Center <noreply@resend.dev>",
      to: [email],
      subject: "Confirmation de votre réservation - Sport Center",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #16a34a; margin: 0;">Sport Center</h1>
          </div>
          
          <h2 style="color: #16a34a;">Confirmation de votre réservation</h2>
          
          <p>Bonjour <strong>${nom_client}</strong>,</p>
          
          <p>Votre réservation a été créée avec succès !</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #374151; margin-top: 0;">Détails de votre réservation :</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Terrain :</td>
                <td style="padding: 8px 0; color: #6b7280;">${terrain_nom}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Date :</td>
                <td style="padding: 8px 0; color: #6b7280;">${new Date(date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Heure :</td>
                <td style="padding: 8px 0; color: #6b7280;">${heure}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Durée :</td>
                <td style="padding: 8px 0; color: #6b7280;">${duree}h</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #16a34a; 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);">
              ✅ Confirmer ma réservation
            </a>
          </div>
          
          <div style="background-color: #fef3c7; 
                      border: 1px solid #f59e0b; 
                      border-radius: 6px; 
                      padding: 15px; 
                      margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">
              ⚠️ Important : Veuillez confirmer votre réservation en cliquant sur le bouton ci-dessus dans les 15 minutes, sinon elle sera automatiquement annulée.
            </p>
          </div>
          
          <p style="color: #6b7280; margin-top: 30px;">
            Si vous ne pouvez pas cliquer sur le bouton, copiez et collez ce lien dans votre navigateur :
          </p>
          <p style="word-break: break-all; color: #16a34a; font-size: 14px;">
            ${confirmationUrl}
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <div style="text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Merci de nous faire confiance !
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              Sport Center - Votre centre sportif de confiance
            </p>
          </div>
        </div>
      `,
    });

    console.log('Email envoyé avec succès via Resend:', result);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Email envoyé avec succès', emailId: result.data?.id }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erreur dans send-reservation-email:', error);
    return new Response(
      JSON.stringify({ 
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
