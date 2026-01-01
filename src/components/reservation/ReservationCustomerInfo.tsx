
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, Phone } from "lucide-react";
import { validateName, validateTunisianPhone } from "@/lib/validation";

interface Props {
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
}

const ReservationCustomerInfo: React.FC<Props> = ({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
}) => {
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setCustomerName(value);
    const error = validateName(value);
    setNameError(error);
  };

  const handlePhoneChange = (value: string) => {
    setCustomerPhone(value);
    const error = validateTunisianPhone(value);
    setPhoneError(error);
  };

  return (
    <div className="border-t pt-8" data-section="customer-info">
      <h3 className="text-xl font-semibold mb-6 flex items-center">
        <User className="mr-2 h-6 w-6" />
        Informations personnelles
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name" className="text-base font-medium mb-2 block">
            Nom complet *
          </Label>
          <Input
            id="name"
            type="text"
            value={customerName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Votre nom et prénom"
            maxLength={40}
            className={nameError ? "border-red-500" : ""}
            required
          />
          {nameError && (
            <p className="text-red-500 text-sm mt-1">{nameError}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            {customerName.length}/40 caractères (lettres uniquement)
          </p>
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
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="Ex: 12345678 ou +21612345678"
            className={phoneError ? "border-red-500" : ""}
            required
          />
          {phoneError && (
            <p className="text-red-500 text-sm mt-1">{phoneError}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Numéro tunisien (8 chiffres)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReservationCustomerInfo;
