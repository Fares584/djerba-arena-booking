
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
          ✅ Votre réservation a été envoyée avec succès !
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Phone className="text-blue-600 w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="font-semibold text-blue-800 mb-2">
                📞 Confirmation par téléphone :
              </p>
              <p className="text-sm text-blue-700 mb-2">
                <strong>Confirmation requise :</strong> Notre équipe vous contactera prochainement 
                pour valider définitivement votre réservation. Merci de rester joignable.
              </p>
            </div>
          </div>
        </div>
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
