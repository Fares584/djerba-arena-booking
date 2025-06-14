
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const url = new URL(req.url);
    const { token } =
      req.method === "POST"
        ? await req.json()
        : Object.fromEntries(url.searchParams.entries());

    // LOG: Affichage du token reçu
    console.log("[EdgeFunction] Token reçu :", token);

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token manquant", debug: { step: "token_missing", url: req.url } }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Recherche toutes les réservations liées à ce token
    const { data: checkData, error: checkErr } = await supabase
      .from("reservations")
      .select("*")
      .eq("confirmation_token", token)
      .order("created_at", { ascending: false });

    // LOG : ce qu'on trouve
    console.log("[EdgeFunction] Rows trouvées avec ce token :", checkData);

    if (checkErr) {
      console.error("[EdgeFunction] Erreur check token:", checkErr);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la recherche de la réservation", details: checkErr }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!checkData || checkData.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Aucune réservation trouvée avec ce token",
          debug: {
            step: "no_res_found",
            token,
            url: req.url,
            candidates: []
          }
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Essayons de trouver la réservation en attente uniquement
    const waiting = checkData.filter(res =>
      res.confirmed_by_user === false && res.statut === "en_attente"
    );

    // LOG: On affiche quand même les candidats "en_attente"
    console.log("[EdgeFunction] Candidats en_attente pour update :", waiting);

    if (waiting.length === 0) {
      // Si aucune, loguons toutes les lignes candidates pour analyse
      return new Response(
        JSON.stringify({
          error: "Lien invalide ou déjà confirmé",
          debug: {
            step: "no_pending_found",
            token,
            url: req.url,
            all_rows_with_token: checkData,
            pending_candidates: waiting
          }
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // On confirme la toute dernière réservation en attente (la plus récente)
    const toConfirmId = waiting[0].id;
    const { data: confirmedRow, error: updError } = await supabase
      .from("reservations")
      .update({ confirmed_by_user: true, statut: "confirmee" })
      .eq("id", toConfirmId)
      .select()
      .maybeSingle();

    console.log("[EdgeFunction] Résultat update :", confirmedRow, updError);

    if (updError) {
      return new Response(
        JSON.stringify({
          error: "Erreur lors de la confirmation de la réservation",
          details: updError,
          debug: {
            step: "update_failed",
            token,
            url: req.url,
            row_id: toConfirmId
          }
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!confirmedRow) {
      return new Response(
        JSON.stringify({
          error: "Impossible de confirmer la réservation.",
          debug: {
            step: "update_no_row",
            tried_row: toConfirmId,
            token,
            url: req.url
          }
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Tout fonctionne
    return new Response(
      JSON.stringify({
        success: true,
        nom_client: confirmedRow.nom_client,
        debug: {
          step: "success",
          token,
          id_confirmed: confirmedRow.id
        }
      }), { headers: corsHeaders }
    );
  } catch (e) {
    console.error("[EdgeFunction] Exception", e);
    return new Response(
      JSON.stringify({
        error: e.message,
        debug: { step: "exception", stack: e.stack ?? undefined }
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
