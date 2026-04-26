
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Phone, Clock } from "lucide-react";

interface ReservationSuccessDialogProps {
  open: boolean;
  onOk: () => void;
}

const ReservationSuccessDialog: React.FC<ReservationSuccessDialogProps> = ({
  open,
  onOk,
}) => (
  <Dialog open={open}>
    <DialogContent className="max-w-md">
      <DialogHeader className="mb-2">
        <CheckCircle2
          className="text-sport-green w-12 h-12 mx-auto mb-3"
          strokeWidth={1.5}
        />
        <DialogTitle className="text-center text-xl">
          Réservation Validée !
        </DialogTitle>
      </DialogHeader>
      <div className="text-center space-y-4 text-gray-800">
        <p className="text-base font-medium text-gray-700">
          Votre demande de réservation a bien été reçue et est en cours de traitement.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Phone className="text-amber-600 w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold text-amber-800 mb-1">
                Merci de rester joignable
              </p>
              <p className="text-sm text-amber-700 leading-relaxed">
                Notre équipe pourra vous contacter par téléphone si une vérification 
                ou une information complémentaire concernant votre réservation s'avère nécessaire.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          <span>Veuillez garder votre téléphone à portée de main</span>
        </div>
      </div>
      <DialogFooter>
        <Button 
          className="mx-auto min-w-[140px] bg-sport-green hover:bg-sport-dark" 
          onClick={onOk} 
          autoFocus
        >
          Compris, merci !
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ReservationSuccessDialog;
