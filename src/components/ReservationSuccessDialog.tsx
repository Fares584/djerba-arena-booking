
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ReservationSuccessDialogProps {
  open: boolean;
  onOk: () => void;
}

const ReservationSuccessDialog: React.FC<ReservationSuccessDialogProps> = ({
  open,
  onOk,
}) => (
  <Dialog open={open}>
    <DialogContent>
      <DialogHeader className="mb-2">
        <CheckCircle2
          className="text-sport-green w-10 h-10 mx-auto mb-3"
          strokeWidth={1.5}
        />
        <DialogTitle className="text-center">
          Réservation enregistrée !
        </DialogTitle>
      </DialogHeader>
      <div className="text-center mb-4 text-base text-gray-800">
        Merci pour votre réservation.<br />
        <b>Confirmez-la via l’email reçu sous 15 minutes,</b> sinon votre créneau sera libéré et la réservation annulée.
      </div>
      <DialogFooter>
        <Button className="mx-auto min-w-[120px]" onClick={onOk} autoFocus>
          OK
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ReservationSuccessDialog;
