export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          nom_client: string
          remarque: string | null
          statut: string
          tel: string
          terrain_id: number
          updated_at: string | null
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
          nom_client: string
          remarque?: string | null
          statut: string
          tel: string
          terrain_id: number
          updated_at?: string | null
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
          nom_client?: string
          remarque?: string | null
          statut?: string
          tel?: string
          terrain_id?: number
          updated_at?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      annuler_reservations_non_confirmees: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
