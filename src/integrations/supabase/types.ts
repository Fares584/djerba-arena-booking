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
      abonnement_types: {
        Row: {
          actif: boolean | null
          created_at: string | null
          description: string | null
          duree_mois: number
          id: number
          nom: string
          prix: number
          reduction_pourcentage: number | null
          reservations_incluses: number | null
        }
        Insert: {
          actif?: boolean | null
          created_at?: string | null
          description?: string | null
          duree_mois: number
          id?: number
          nom: string
          prix: number
          reduction_pourcentage?: number | null
          reservations_incluses?: number | null
        }
        Update: {
          actif?: boolean | null
          created_at?: string | null
          description?: string | null
          duree_mois?: number
          id?: number
          nom?: string
          prix?: number
          reduction_pourcentage?: number | null
          reservations_incluses?: number | null
        }
        Relationships: []
      }
      abonnements: {
        Row: {
          abonnement_type_id: number
          client_email: string
          client_nom: string
          client_tel: string
          created_at: string | null
          date_debut: string
          date_fin: string
          id: number
          reservations_utilisees: number | null
          statut: string
          updated_at: string | null
        }
        Insert: {
          abonnement_type_id: number
          client_email: string
          client_nom: string
          client_tel: string
          created_at?: string | null
          date_debut: string
          date_fin: string
          id?: number
          reservations_utilisees?: number | null
          statut: string
          updated_at?: string | null
        }
        Update: {
          abonnement_type_id?: number
          client_email?: string
          client_nom?: string
          client_tel?: string
          created_at?: string | null
          date_debut?: string
          date_fin?: string
          id?: number
          reservations_utilisees?: number | null
          statut?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abonnements_abonnement_type_id_fkey"
            columns: ["abonnement_type_id"]
            isOneToOne: false
            referencedRelation: "abonnement_types"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          abonnement_id: number | null
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
        }
        Insert: {
          abonnement_id?: number | null
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
        }
        Update: {
          abonnement_id?: number | null
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
        }
        Relationships: [
          {
            foreignKeyName: "reservations_abonnement_id_fkey"
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
          id: number
          image_url: string | null
          nom: string
          prix: number
          type: string
        }
        Insert: {
          actif?: boolean | null
          capacite: number
          id?: number
          image_url?: string | null
          nom: string
          prix: number
          type: string
        }
        Update: {
          actif?: boolean | null
          capacite?: number
          id?: number
          image_url?: string | null
          nom?: string
          prix?: number
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
