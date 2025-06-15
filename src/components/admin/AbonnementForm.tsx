import React, { useState, useMemo } from "react";
import { useTerrains } from "@/hooks/useTerrains";
import { useCreateAbonnement } from "@/hooks/useAbonnements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AbonnementFormProps {
  onSuccess: () => void;
}

const typeOptions = [
  { value: "foot", label: "Football" },
  { value: "tennis", label: "Tennis" },
  { value: "padel", label: "Padel" },
];

const AbonnementForm = ({ onSuccess }: AbonnementFormProps) => {
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(null);
  const [prix, setPrix] = useState<string>("");
  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");
  const [heure, setHeure] = useState<string>("");
  const [duree, setDuree] = useState<string>("1");
  const [clientNom, setClientNom] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientTel, setClientTel] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: terrains = [], isLoading: terrainsLoading } = useTerrains({ actif: true });
  const createAbonnement = useCreateAbonnement();

  const filteredTerrains = useMemo(
    () =>
      terrains.filter((t) => selectedType === "" || t.type === selectedType),
    [terrains, selectedType]
  );

  // Simple heure slots (manuelle)
  const timeOptions = [
    "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00",
    "19:00", "20:00", "21:00", "22:00",
  ];

  const isValid =
    !!selectedType &&
    !!selectedTerrainId &&
    prix.trim() !== "" &&
    !isNaN(Number(prix)) &&
    Number(prix) > 0 &&
    !!dateDebut &&
    !!dateFin &&
    !!heure &&
    !!duree &&
    !!clientNom.trim() &&
    !!clientEmail.trim() &&
    !!clientTel.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isValid) {
      setFormError("Merci de remplir tous les champs requis.");
      import("sonner").then(({ toast }) => toast.error("Champs manquants ou invalides."));
      return;
    }

    createAbonnement.mutate(
      {
        abonnement_type_id: 1, // Remplacez par une logique si plusieurs types
        terrain_id: selectedTerrainId!,
        date_debut: dateDebut,
        date_fin: dateFin, // À remplacer par une réelle durée si besoin
        jour_semaine: undefined,
        heure_fixe: heure,
        duree_seance: Number(duree),
        client_nom: clientNom.trim(),
        client_email: clientEmail.trim(),
        client_tel: clientTel.trim(),
        statut: "actif",
      },
      {
        onSuccess: () => {
          setFormError(null);
          onSuccess();
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-semibold mb-2">Nouvel Abonnement</h2>
      {formError && (
        <div className="bg-red-100 text-red-700 rounded p-2 text-sm">{formError}</div>
      )}
      {/* Type de sport */}
      <div>
        <Label htmlFor="selectedType">Type de sport</Label>
        <select
          id="selectedType"
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setSelectedTerrainId(null);
          }}
          className="w-full py-2 px-3 border rounded"
          required
        >
          <option value="">Choisir un type</option>
          {typeOptions.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      {/* Terrain */}
      <div>
        <Label htmlFor="terrain">Terrain</Label>
        {terrainsLoading ? (
          <div className="py-8 text-center text-gray-400">Chargement...</div>
        ) : (
          <select
            id="terrain"
            value={selectedTerrainId ?? ""}
            onChange={(e) =>
              setSelectedTerrainId(
                e.target.value ? Number(e.target.value) : null
              )
            }
            className="w-full py-2 px-3 border rounded"
            required
            disabled={!selectedType}
          >
            <option value="">Choisir un terrain</option>
            {filteredTerrains.map((terrain) => (
              <option key={terrain.id} value={terrain.id}>
                {terrain.nom}
              </option>
            ))}
          </select>
        )}
      </div>
      {/* Montant */}
      <div>
        <Label htmlFor="prix">Montant (DT)</Label>
        <Input
          id="prix"
          type="number"
          min="0"
          step="0.1"
          value={prix}
          onChange={(e) => setPrix(e.target.value)}
          required
        />
      </div>
      {/* Date */}
      <div>
        <Label htmlFor="dateDebut">Date de début</Label>
        <Input
          id="dateDebut"
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          required
        />
      </div>
      {/* NOUVEAU CHAMP DATE DE FIN */}
      <div>
        <Label htmlFor="dateFin">Date de fin</Label>
        <Input
          id="dateFin"
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          required
          min={dateDebut || undefined}
        />
      </div>
      {/* Heure */}
      <div>
        <Label htmlFor="heure">Heure</Label>
        <select
          id="heure"
          value={heure}
          onChange={(e) => setHeure(e.target.value)}
          className="w-full py-2 px-3 border rounded"
          required
        >
          <option value="">Choisir une heure</option>
          {timeOptions.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>
      {/* Durée */}
      <div>
        <Label htmlFor="duree">Durée (heures)</Label>
        <select
          id="duree"
          value={duree}
          onChange={(e) => setDuree(e.target.value)}
          className="w-full py-2 px-3 border rounded"
          required
        >
          <option value="1">1h</option>
          <option value="1.5">1h30</option>
          <option value="2">2h</option>
          <option value="3">3h</option>
        </select>
      </div>
      {/* Coordonnées */}
      <div>
        <Label htmlFor="clientNom">Nom du client</Label>
        <Input
          id="clientNom"
          type="text"
          value={clientNom}
          onChange={(e) => setClientNom(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="clientEmail">Email</Label>
        <Input
          id="clientEmail"
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="clientTel">Téléphone</Label>
        <Input
          id="clientTel"
          type="tel"
          value={clientTel}
          onChange={(e) => setClientTel(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={createAbonnement.isPending || !isValid}
          className="bg-sport-green hover:bg-sport-dark"
        >
          {createAbonnement.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création...
            </>
          ) : (
            "Créer l'abonnement"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AbonnementForm;
