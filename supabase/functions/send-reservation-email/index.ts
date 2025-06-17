
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Fonction send-reservation-email appelée');
    
    const { reservation_id, email, nom_client, terrain_nom, date, heure, duree, confirmation_token } = await req.json();

    console.log('📨 Données reçues:', {
      reservation_id,
      email,
      nom_client,
      terrain_nom,
      date,
      heure,
      duree,
      confirmation_token: confirmation_token ? 'présent' : 'absent'
    });

    // Vérifier que la clé API Resend est configurée
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY non configurée');
      throw new Error('Configuration Resend manquante');
    }

    console.log('✅ Initialisation de Resend...');
    const resend = new Resend(resendApiKey);

    // URL de confirmation (utilisation du domaine Lovable)
    const confirmationUrl = `https://gentle-pony-e6a7e4.lovableproject.com/confirm-reservation?token=${confirmation_token}`;
    console.log('🔗 URL de confirmation générée:', confirmationUrl);

    console.log('📧 Tentative d\'envoi d\'email vers:', email);

    const result = await resend.emails.send({
      from: "Sport Center <onboarding@resend.dev>",
      to: [email],
      subject: "🏟️ Confirmez votre réservation de stade - Sport Center",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmation de réservation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fdf8;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                Sport Center
              </h1>
              <p style="color: #f0fdf4; margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">
                Votre terrain, votre passion
              </p>
            </div>
            
            <!-- Contenu principal -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #16a34a; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
                🎉 Votre réservation est presque confirmée !
              </h2>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Bonjour <strong style="color: #16a34a;">${nom_client}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Merci pour votre demande de réservation ! Nous avons bien reçu votre demande et nous sommes ravis de vous accueillir sur nos terrains.
              </p>
              
              <!-- Détails de la réservation -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); 
                          border: 2px solid #16a34a; 
                          border-radius: 12px; 
                          padding: 25px; 
                          margin: 30px 0;
                          box-shadow: 0 2px 8px rgba(22, 163, 74, 0.1);">
                <h3 style="color: #16a34a; margin: 0 0 20px 0; font-size: 20px; text-align: center; display: flex; align-items: center; justify-content: center;">
                  <span style="margin-right: 8px;">📋</span> Détails de votre réservation
                </h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5;">
                      <span style="font-weight: bold; color: #15803d; display: inline-flex; align-items: center;">
                        <span style="margin-right: 8px;">🏟️</span> Terrain :
                      </span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; text-align: right;">
                      <span style="color: #374151; font-weight: 600;">${terrain_nom}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5;">
                      <span style="font-weight: bold; color: #15803d; display: inline-flex; align-items: center;">
                        <span style="margin-right: 8px;">📅</span> Date :
                      </span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; text-align: right;">
                      <span style="color: #374151; font-weight: 600;">
                        ${new Date(date).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5;">
                      <span style="font-weight: bold; color: #15803d; display: inline-flex; align-items: center;">
                        <span style="margin-right: 8px;">⏰</span> Heure :
                      </span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; text-align: right;">
                      <span style="color: #374151; font-weight: 600;">${heure}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="font-weight: bold; color: #15803d; display: inline-flex; align-items: center;">
                        <span style="margin-right: 8px;">⏱️</span> Durée :
                      </span>
                    </td>
                    <td style="padding: 12px 0; text-align: right;">
                      <span style="color: #374151; font-weight: 600;">${duree}h</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Bouton de confirmation -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${confirmationUrl}" 
                   style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                          color: #ffffff;
                          padding: 18px 40px;
                          text-decoration: none;
                          border-radius: 12px;
                          font-weight: bold;
                          font-size: 18px;
                          display: inline-block;
                          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
                          text-transform: uppercase;
                          letter-spacing: 1px;">
                  ✅ CONFIRMER MA RÉSERVATION
                </a>
              </div>
              
              <!-- Alerte importante -->
              <div style="background-color: #fef3c7; 
                          border-left: 4px solid #f59e0b; 
                          border-radius: 6px; 
                          padding: 20px; 
                          margin: 30px 0;">
                <div style="display: flex; align-items: flex-start;">
                  <span style="font-size: 24px; margin-right: 12px;">⚠️</span>
                  <div>
                    <p style="margin: 0; color: #92400e; font-weight: bold; font-size: 16px;">
                      Action requise dans les 15 minutes
                    </p>
                    <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                      Veuillez confirmer votre réservation en cliquant sur le bouton ci-dessus. 
                      Passé ce délai, votre demande sera automatiquement annulée.
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Lien de secours -->
              <div style="background-color: #f9fafb; 
                          border-radius: 8px; 
                          padding: 20px; 
                          margin: 30px 0;">
                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                  Le bouton ne fonctionne pas ?
                </p>
                <p style="color: #6b7280; margin: 0; font-size: 13px; line-height: 1.4;">
                  Copiez et collez ce lien dans votre navigateur :
                </p>
                <p style="word-break: break-all; 
                          color: #16a34a; 
                          font-size: 12px; 
                          background-color: #ffffff; 
                          padding: 10px; 
                          border-radius: 4px; 
                          margin: 8px 0 0 0;
                          border: 1px solid #d1d5db;">
                  ${confirmationUrl}
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f3f4f6; 
                        padding: 30px 20px; 
                        text-align: center; 
                        border-top: 1px solid #e5e7eb;">
              <p style="color: #16a34a; 
                        font-size: 18px; 
                        font-weight: bold; 
                        margin: 0 0 10px 0;">
                Merci de nous faire confiance ! 🙏
              </p>
              <p style="color: #6b7280; 
                        font-size: 14px; 
                        margin: 0 0 15px 0;">
                Sport Center - Votre centre sportif de confiance
              </p>
              <div style="border-top: 1px solid #d1d5db; 
                          padding-top: 15px; 
                          margin-top: 15px;">
                <p style="color: #9ca3af; 
                          font-size: 12px; 
                          margin: 0;">
                  Cet email a été envoyé pour confirmer votre réservation. 
                  Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('📬 Réponse de Resend:', result);

    if (result.error) {
      console.error('❌ Erreur Resend:', result.error);
      throw new Error(`Erreur Resend: ${result.error.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email envoyé avec succès', 
        emailId: result.data?.id 
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 Erreur dans send-reservation-email:', error);
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
