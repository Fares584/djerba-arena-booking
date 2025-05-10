
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
// Default values for development - replace with your actual Supabase URL and anon key when testing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Check if we're using the default values in a production environment
if (import.meta.env.PROD && 
    (supabaseUrl === 'https://your-supabase-project-url.supabase.co' || 
     supabaseAnonKey === 'your-supabase-anon-key')) {
  console.error('WARNING: Using default Supabase credentials in production. Please set proper environment variables.');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
