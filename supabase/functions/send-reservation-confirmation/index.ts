
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Accept POST with reservation details and confirmation_link
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, nom_client, confirmation_link, field_name, date, heure } = await req.json();

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const result = await resend.emails.send({
      from: "Sport Center <noreply@resend.dev>",
      to: [email],
      subject: "Confirmez votre réservation",
      html: `
        <h2>Bonjour ${nom_client},</h2>
        <p>Merci pour votre demande de réservation au terrain <b>${field_name}</b> le <b>${date}</b> à <b>${heure}</b>.</p>
        <p>Pour confirmer cette réservation, veuillez cliquer sur ce lien :<br/>
        <a href="${confirmation_link}" style="font-size: 18px;font-weight:bold;color: #16a34a">Confirmer ma réservation</a></p>
        <p>Ce lien est valable une seule fois. Votre réservation sera validée uniquement après confirmation.</p>
        <p>Sport Center</p>
      `,
    });

    console.log("Confirmation email sent:", result);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error) {
    console.error("Error sending confirmation email", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
