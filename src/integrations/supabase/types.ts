export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      device_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_exposures: {
        Row: {
          age_at_exposure_months: number | null
          confirmed_safe: boolean
          created_at: string
          date_introduced: string
          exposure_count: number
          food_id: string
          id: string
          photo_url: string | null
          reaction: Database["public"]["Enums"]["reaction_severity"]
          reaction_notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_at_exposure_months?: number | null
          confirmed_safe?: boolean
          created_at?: string
          date_introduced?: string
          exposure_count?: number
          food_id: string
          id?: string
          photo_url?: string | null
          reaction?: Database["public"]["Enums"]["reaction_severity"]
          reaction_notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_at_exposure_months?: number | null
          confirmed_safe?: boolean
          created_at?: string
          date_introduced?: string
          exposure_count?: number
          food_id?: string
          id?: string
          photo_url?: string | null
          reaction?: Database["public"]["Enums"]["reaction_severity"]
          reaction_notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_exposures_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      food_logs: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          photo_url: string | null
          reaction_severity: number
          user_food_state_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          reaction_severity?: number
          user_food_state_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          reaction_severity?: number
          user_food_state_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_user_food_state_id_fkey"
            columns: ["user_food_state_id"]
            isOneToOne: false
            referencedRelation: "user_food_states"
            referencedColumns: ["id"]
          },
        ]
      }
      food_serving_guidelines: {
        Row: {
          age_range: Database["public"]["Enums"]["age_range"]
          choking_warning: boolean
          created_at: string
          food_id: string
          id: string
          serving_notes: string
          texture: Database["public"]["Enums"]["texture_type"]
        }
        Insert: {
          age_range: Database["public"]["Enums"]["age_range"]
          choking_warning?: boolean
          created_at?: string
          food_id: string
          id?: string
          serving_notes: string
          texture: Database["public"]["Enums"]["texture_type"]
        }
        Update: {
          age_range?: Database["public"]["Enums"]["age_range"]
          choking_warning?: boolean
          created_at?: string
          food_id?: string
          id?: string
          serving_notes?: string
          texture?: Database["public"]["Enums"]["texture_type"]
        }
        Relationships: [
          {
            foreignKeyName: "food_serving_guidelines_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          active: boolean
          allergen_type: Database["public"]["Enums"]["allergen_type"] | null
          category: Database["public"]["Enums"]["food_category"]
          choking_risk: boolean
          created_at: string
          emoji: string
          excluded_under_12m: boolean
          food_name: string
          id: string
          image_url: string | null
          is_allergen: boolean
          min_age_months: number
          prep_notes: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          allergen_type?: Database["public"]["Enums"]["allergen_type"] | null
          category: Database["public"]["Enums"]["food_category"]
          choking_risk?: boolean
          created_at?: string
          emoji?: string
          excluded_under_12m?: boolean
          food_name: string
          id?: string
          image_url?: string | null
          is_allergen?: boolean
          min_age_months?: number
          prep_notes: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          allergen_type?: Database["public"]["Enums"]["allergen_type"] | null
          category?: Database["public"]["Enums"]["food_category"]
          choking_risk?: boolean
          created_at?: string
          emoji?: string
          excluded_under_12m?: boolean
          food_name?: string
          id?: string
          image_url?: string | null
          is_allergen?: boolean
          min_age_months?: number
          prep_notes?: string
          updated_at?: string
        }
        Relationships: []
      }
      general_tips: {
        Row: {
          category: string
          created_at: string
          id: string
          text: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          text: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          text?: string
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          id: string
          notification_type: string
          reference_id: string | null
          sent_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_type: string
          reference_id?: string | null
          sent_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notification_type?: string
          reference_id?: string | null
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          allergen_maintenance: boolean
          allergen_progress: boolean
          allergen_reminder: boolean
          allergen_reminder_time: string
          created_at: string
          daily_reminder: boolean
          daily_reminder_time: string
          id: string
          milestones: boolean
          reaction_followup: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allergen_maintenance?: boolean
          allergen_progress?: boolean
          allergen_reminder?: boolean
          allergen_reminder_time?: string
          created_at?: string
          daily_reminder?: boolean
          daily_reminder_time?: string
          id?: string
          milestones?: boolean
          reaction_followup?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allergen_maintenance?: boolean
          allergen_progress?: boolean
          allergen_reminder?: boolean
          allergen_reminder_time?: string
          created_at?: string
          daily_reminder?: boolean
          daily_reminder_time?: string
          id?: string
          milestones?: boolean
          reaction_followup?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          baby_name: string
          birth_date: string | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          baby_name?: string
          birth_date?: string | null
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          baby_name?: string
          birth_date?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ref_foods: {
        Row: {
          allergen_family: string | null
          category: string
          choking_hazard_level: string | null
          created_at: string
          emoji: string
          id: number
          image_url: string | null
          is_allergen: boolean
          name: string
          serving_guide: Json | null
        }
        Insert: {
          allergen_family?: string | null
          category: string
          choking_hazard_level?: string | null
          created_at?: string
          emoji?: string
          id?: number
          image_url?: string | null
          is_allergen?: boolean
          name: string
          serving_guide?: Json | null
        }
        Update: {
          allergen_family?: string | null
          category?: string
          choking_hazard_level?: string | null
          created_at?: string
          emoji?: string
          id?: number
          image_url?: string | null
          is_allergen?: boolean
          name?: string
          serving_guide?: Json | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          entitlement_active: boolean
          expires_at: string | null
          id: string
          product_id: string | null
          revenuecat_customer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entitlement_active?: boolean
          expires_at?: string | null
          id?: string
          product_id?: string | null
          revenuecat_customer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entitlement_active?: boolean
          expires_at?: string | null
          id?: string
          product_id?: string | null
          revenuecat_customer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tip_rules: {
        Row: {
          action_food_id: number | null
          action_label: string | null
          created_at: string
          id: string
          tip_text: string
          trigger_category: string
        }
        Insert: {
          action_food_id?: number | null
          action_label?: string | null
          created_at?: string
          id?: string
          tip_text: string
          trigger_category: string
        }
        Update: {
          action_food_id?: number | null
          action_label?: string | null
          created_at?: string
          id?: string
          tip_text?: string
          trigger_category?: string
        }
        Relationships: [
          {
            foreignKeyName: "tip_rules_action_food_id_fkey"
            columns: ["action_food_id"]
            isOneToOne: false
            referencedRelation: "ref_foods"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_food_states: {
        Row: {
          created_at: string
          exposure_count: number
          food_id: number
          id: string
          last_eaten: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exposure_count?: number
          food_id: number
          id?: string
          last_eaten?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exposure_count?: number
          food_id?: number
          id?: string
          last_eaten?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_food_states_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "ref_foods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_account: { Args: never; Returns: undefined }
    }
    Enums: {
      age_range: "6_9_months" | "9_12_months" | "12_24_months"
      allergen_type:
        | "egg"
        | "dairy"
        | "peanut"
        | "tree_nut"
        | "sesame"
        | "soy"
        | "wheat"
        | "fish"
        | "shellfish"
      food_category:
        | "Dairy"
        | "Fruit"
        | "Vegetable"
        | "Grain"
        | "Legume"
        | "Protein"
      reaction_severity: "none" | "mild" | "moderate" | "severe"
      texture_type:
        | "puree"
        | "mashed"
        | "finely_chopped"
        | "minced"
        | "shredded"
        | "soft_strips"
        | "bite_sized"
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
    Enums: {
      age_range: ["6_9_months", "9_12_months", "12_24_months"],
      allergen_type: [
        "egg",
        "dairy",
        "peanut",
        "tree_nut",
        "sesame",
        "soy",
        "wheat",
        "fish",
        "shellfish",
      ],
      food_category: [
        "Dairy",
        "Fruit",
        "Vegetable",
        "Grain",
        "Legume",
        "Protein",
      ],
      reaction_severity: ["none", "mild", "moderate", "severe"],
      texture_type: [
        "puree",
        "mashed",
        "finely_chopped",
        "minced",
        "shredded",
        "soft_strips",
        "bite_sized",
      ],
    },
  },
} as const
