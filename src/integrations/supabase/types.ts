export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      abonnements: {
        Row: {
          client_email: string
          client_nom: string
          client_tel: string
          created_at: string | null
          date_debut: string
          date_fin: string
          duree_seance: number | null
          heure_fixe: string | null
          id: number
          jour_semaine: number | null
          montant: number | null
          reservations_utilisees: number | null
          statut: string
          terrain_id: number | null
          updated_at: string | null
        }
        Insert: {
          client_email: string
          client_nom: string
          client_tel: string
          created_at?: string | null
          date_debut: string
          date_fin: string
          duree_seance?: number | null
          heure_fixe?: string | null
          id?: number
          jour_semaine?: number | null
          montant?: number | null
          reservations_utilisees?: number | null
          statut: string
          terrain_id?: number | null
          updated_at?: string | null
        }
        Update: {
          client_email?: string
          client_nom?: string
          client_tel?: string
          created_at?: string | null
          date_debut?: string
          date_fin?: string
          duree_seance?: number | null
          heure_fixe?: string | null
          id?: number
          jour_semaine?: number | null
          montant?: number | null
          reservations_utilisees?: number | null
          statut?: string
          terrain_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abonnements_terrain_id_fkey"
            columns: ["terrain_id"]
            isOneToOne: false
            referencedRelation: "terrains"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          setting_name: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          setting_name: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          setting_name?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blacklist: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          reason: string | null
          type: string
          value: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          reason?: string | null
          type: string
          value: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          reason?: string | null
          type?: string
          value?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          abonnement_id: number | null
          confirmation_token: string | null
          confirmed_by_user: boolean | null
          created_at: string | null
          date: string
          duree: number
          email: string
          heure: string
          id: number
          ip_address: string | null
          nom_client: string
          remarque: string | null
          statut: string
          tel: string
          terrain_id: number
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          abonnement_id?: number | null
          confirmation_token?: string | null
          confirmed_by_user?: boolean | null
          created_at?: string | null
          date: string
          duree: number
          email: string
          heure: string
          id?: number
          ip_address?: string | null
          nom_client: string
          remarque?: string | null
          statut: string
          tel: string
          terrain_id: number
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          abonnement_id?: number | null
          confirmation_token?: string | null
          confirmed_by_user?: boolean | null
          created_at?: string | null
          date?: string
          duree?: number
          email?: string
          heure?: string
          id?: number
          ip_address?: string | null
          nom_client?: string
          remarque?: string | null
          statut?: string
          tel?: string
          terrain_id?: number
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_abonnement"
            columns: ["abonnement_id"]
            isOneToOne: false
            referencedRelation: "abonnements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_terrain_id_fkey"
            columns: ["terrain_id"]
            isOneToOne: false
            referencedRelation: "terrains"
            referencedColumns: ["id"]
          },
        ]
      }
      terrains: {
        Row: {
          actif: boolean | null
          capacite: number
          created_at: string | null
          id: number
          image_url: string | null
          nom: string
          prix: number
          prix_nuit: number | null
          type: string
        }
        Insert: {
          actif?: boolean | null
          capacite: number
          created_at?: string | null
          id?: number
          image_url?: string | null
          nom: string
          prix: number
          prix_nuit?: number | null
          type: string
        }
        Update: {
          actif?: boolean | null
          capacite?: number
          created_at?: string | null
          id?: number
          image_url?: string | null
          nom?: string
          prix?: number
          prix_nuit?: number | null
          type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: number
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generer_reservations_abonnement: {
        Args: {
          p_abonnement_id: number
          p_terrain_id: number
          p_date_debut: string
          p_date_fin: string
          p_jour_semaine: number
          p_heure: string
          p_duree: number
          p_client_nom: string
          p_client_tel: string
          p_client_email: string
        }
        Returns: undefined
      }
      has_role: {
        Args: { user_uuid: string; role_name: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
