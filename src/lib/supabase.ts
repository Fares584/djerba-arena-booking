
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Define types for our database
export type Terrain = {
  id: number;
  nom: string;
  type: 'foot' | 'tennis' | 'padel';
  capacite: number;
  prix: number;
  image_url: string;
  actif: boolean;
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
  remarque?: string;
  created_at?: string;
};

export type AdminUser = {
  id: string;
  email: string;
  // Note: password_hash is handled by Supabase Auth and not directly accessible
};
