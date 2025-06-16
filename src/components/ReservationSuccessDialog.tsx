
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Phone } from "lucide-react";

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
        <p className="text-lg font-semibold text-sport-green">
          ✅ Votre réservation a été confirmée avec succès !
        </p>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Phone className="text-orange-600 w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="font-semibold text-orange-800 mb-2">
                Important - Annulation :
              </p>
              <p className="text-sm text-orange-700">
                En cas d'annulation, veuillez nous contacter <strong>au moins 48h à l'avance</strong> au :
              </p>
              <p className="text-lg font-bold text-orange-800 mt-1">
                📞 29 612 809
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600">
          Merci de votre confiance ! Nous vous attendons pour votre séance.
        </p>
      </div>
      <DialogFooter>
        <Button 
          className="mx-auto min-w-[120px] bg-sport-green hover:bg-sport-dark" 
          onClick={onOk} 
          autoFocus
        >
          Parfait !
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ReservationSuccessDialog;
