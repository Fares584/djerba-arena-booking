
import { supabase } from '@/integrations/supabase/client';

// Define types for our database
export type Terrain = {
  id: number;
  nom: string;
  type: 'foot' | 'tennis' | 'padel';
  capacite: number;
  prix: number;
  prix_nuit?: number; // Add night pricing
  image_url: string | null;
  actif: boolean;
  created_at?: string;
};

export type Reservation = {
  id: number;
  nom_client: string;
  tel: string;
  email: string;
  terrain_id: number;
  date: string;
  heure: string;
  duree: number;
  statut: 'en_attente' | 'confirmee' | 'annulee';
  remarque?: string | null;
  created_at?: string;
  updated_at?: string;
  abonnement_id?: number | null;
};

export type AbonnementType = {
  id: number;
  nom: string;
  description?: string | null;
  duree_mois: number;
  prix: number;
  reduction_pourcentage?: number | null;
  reservations_incluses?: number | null;
  actif: boolean;
  created_at?: string;
};

export type Abonnement = {
  id: number;
  client_nom: string;
  client_tel?: string | null;
  mois_abonnement: number;
  annee_abonnement: number;
  statut: 'actif' | 'expire' | 'annule';
  created_at?: string;
  updated_at?: string;
  terrain_id?: number | null;
  jour_semaine?: number | null; // 0=Dimanche, 1=Lundi, etc.
  heure_fixe?: string | null; // Format HH:MM
};

export type AdminUser = {
  id: string;
  email: string;
  created_at?: string;
};

export type AppSetting = {
  id: number;
  setting_name: string;
  setting_value: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

// Utility function to determine if a time slot is night time (using global setting)
export const isNightTime = (time: string, globalNightStartTime?: string): boolean => {
  const hour = parseInt(time.split(':')[0]);
  const nightHour = globalNightStartTime ? parseInt(globalNightStartTime.split(':')[0]) : 19;
  return hour >= nightHour;
};

// Function to calculate the price based on terrain and time (using global night time setting)
// Refactored to handle football terrains with fixed pricing for 1h30 sessions
// Function to get detailed tennis pricing information
export const getTennisPricing = (terrain: Terrain) => {
  if (terrain.type !== 'tennis') return null;
  
  if (/green set/i.test(terrain.nom)) {
    return {
      simple: { jour: 20, nuit: 25 },
      double: { jour: 30, nuit: 40 }
    };
  }
  
  if (/pelouse/i.test(terrain.nom)) {
    return {
      simple: { jour: 15, nuit: 20 },
      double: { jour: 20, nuit: 30 }
    };
  }
  
  return null;
};

export const calculatePrice = (terrain: Terrain, time: string, globalNightStartTime?: string): number => {
  const night = isNightTime(time, globalNightStartTime);

  // Specific football types based on 'nom' - FIXED PRICING FOR 1H30
  if (terrain.type === 'foot') {
    if (/6/.test(terrain.nom)) {
      return night ? 60 : 50; // 6v6 - tarif fixe pour 1h30
    }
    if (/7/.test(terrain.nom)) {
      return night ? 96 : 84; // 7v7 - tarif fixe pour 1h30
    }
    if (/8/.test(terrain.nom)) {
      return night ? 110 : 96; // 8v8 - tarif fixe pour 1h30
    }
    // Default foot pricing fallback - tarif fixe pour 1h30
    return night ? 65 : 60;
  }

  // Tennis types based on 'nom' - HOURLY PRICING
  if (terrain.type === 'tennis') {
    if (/green set/i.test(terrain.nom)) {
      // Green Set Tennis: simple (2 personnes) vs double (4 personnes)
      // Assuming simple/double is determined by context - for now using capacity or name
      if (/simple/i.test(terrain.nom) || terrain.capacite === 2) {
        return night ? 25 : 20; // Simple: 20 DT jour, 25 DT nuit
      }
      return night ? 40 : 30; // Double: 30 DT jour, 40 DT nuit
    }
    if (/pelouse/i.test(terrain.nom)) {
      // Pelouse Tennis: simple vs double
      if (/simple/i.test(terrain.nom) || terrain.capacite === 2) {
        return night ? 20 : 15; // Simple: 15 DT jour, 20 DT nuit
      }
      return night ? 30 : 20; // Double: 20 DT jour, 30 DT nuit
    }
    // Fallback default for other tennis courts
    return night ? (terrain.prix_nuit || 30) : terrain.prix;
  }

  // Padel - HOURLY PRICING
  if (terrain.type === 'padel') {
    return night ? 60 : 50; // 50/60 DT per hour for 4 joueurs
  }
  
  // Fallback to generic logic
  if (isNightTime(time, globalNightStartTime) && terrain.prix_nuit) {
    return terrain.prix_nuit;
  }
  return terrain.prix;
};

// Helper function to get day name in French
export const getDayName = (dayNumber: number): string => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[dayNumber] || '';
};

// Helper function to get month name in French
export const getMonthName = (monthNumber: number): string => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[monthNumber - 1] || '';
};

// Re-export the supabase client for backward compatibility
export { supabase };
