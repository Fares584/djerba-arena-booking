
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const CONFIRM_API = "https://gohcvgpwuzlepfcucvmj.supabase.co/functions/v1/confirm-reservation";

const ConfirmReservation = () => {
  const [status, setStatus] = useState<"pending" | "success" | "fail">("pending");
  const [clientName, setClientName] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("fail");
      return;
    }

    fetch(CONFIRM_API + "?token=" + encodeURIComponent(token))
      .then(async res => {
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setStatus("success");
        setClientName(data.nom_client);
      })
      .catch(() => setStatus("fail"));
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      {status === "pending" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-sport-green" />
          <span>Confirmation de la réservation en cours...</span>
        </div>
      )}
      {status === "success" && (
        <div className="flex flex-col items-center gap-4">
          <CheckCircle className="h-14 w-14 text-green-500" />
          <h1 className="text-2xl font-bold">Merci {clientName || ""} !</h1>
          <p className="text-lg">Votre réservation est maintenant confirmée.</p>
        </div>
      )}
      {status === "fail" && (
        <div className="flex flex-col items-center gap-4">
          <XCircle className="h-14 w-14 text-red-500" />
          <h1 className="text-2xl font-bold">Lien invalide ou déjà confirmé</h1>
          <p className="text-lg">Ce lien n&#39;est plus valide.</p>
        </div>
      )}
    </div>
  )
};

export default ConfirmReservation;
