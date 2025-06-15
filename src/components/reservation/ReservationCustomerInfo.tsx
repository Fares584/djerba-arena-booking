
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Mail } from "lucide-react";

interface Props {
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  customerEmail: string;
  setCustomerEmail: (v: string) => void;
  remarks: string;
  setRemarks: (v: string) => void;
}

const ReservationCustomerInfo: React.FC<Props> = ({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  remarks,
  setRemarks,
}) => (
  <div className="border-t pt-8">
    <h3 className="text-xl font-semibold mb-6 flex items-center">
      <User className="mr-2 h-6 w-6" />
      Informations personnelles
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <Label htmlFor="name" className="text-base font-medium mb-2 block">
          Nom complet *
        </Label>
        <Input
          id="name"
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Votre nom et prénom"
          required
        />
      </div>
      <div>
        <Label htmlFor="phone" className="text-base font-medium mb-2 flex items-center">
          <Phone className="mr-2 h-4 w-4" />
          Téléphone *
        </Label>
        <Input
          id="phone"
          type="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Votre numéro de téléphone"
          required
        />
      </div>
    </div>
    <div className="mb-6">
      <Label htmlFor="email" className="text-base font-medium mb-2 flex items-center">
        <Mail className="mr-2 h-4 w-4" />
        Adresse email *
      </Label>
      <Input
        id="email"
        type="email"
        value={customerEmail}
        onChange={(e) => setCustomerEmail(e.target.value)}
        placeholder="votre@email.com"
        required
      />
    </div>
    <div className="mb-6">
      <Label htmlFor="remarks" className="text-base font-medium mb-2 block">
        Remarques
      </Label>
      <Textarea
        id="remarks"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        placeholder="Ajoutez une remarque (optionnel)"
      />
    </div>
  </div>
);

export default ReservationCustomerInfo;
