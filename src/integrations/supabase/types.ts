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
      appointments: {
        Row: {
          client_name: string
          client_phone: string
          created_at: string
          ends_at: string
          id: string
          notes: string | null
          service_id: string | null
          starts_at: string
          status: string | null
          therapist_id: string | null
          updated_at: string
        }
        Insert: {
          client_name: string
          client_phone: string
          created_at?: string
          ends_at: string
          id?: string
          notes?: string | null
          service_id?: string | null
          starts_at: string
          status?: string | null
          therapist_id?: string | null
          updated_at?: string
        }
        Update: {
          client_name?: string
          client_phone?: string
          created_at?: string
          ends_at?: string
          id?: string
          notes?: string | null
          service_id?: string | null
          starts_at?: string
          status?: string | null
          therapist_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_therapist_id_fkey"
            columns: ["therapist_id"]
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          }
        ]
      }
      availability_exceptions: {
        Row: {
          created_at: string
          date: string
          end_time: string | null
          id: string
          is_available: boolean | null
          reason: string | null
          start_time: string | null
          therapist_id: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          reason?: string | null
          start_time?: string | null
          therapist_id: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          reason?: string | null
          start_time?: string | null
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_exceptions_therapist_id_fkey"
            columns: ["therapist_id"]
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          }
        ]
      }
      availability_rules: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          therapist_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          therapist_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_therapist_id_fkey"
            columns: ["therapist_id"]
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          body: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          is_published: boolean
          location: string | null
          slug: string
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          slug: string
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          slug?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
          slug: string | null
          price_text: string | null
          duration_min: number | null
          cover_image_url: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
          slug?: string | null
          price_text?: string | null
          duration_min?: number | null
          cover_image_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
          slug?: string | null
          price_text?: string | null
          duration_min?: number | null
          cover_image_url?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          quote: string
          role_label: string
          sort_order: number
          updated_at: string
          client_name: string | null
          rating: number | null
          photo_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          quote: string
          role_label?: string
          sort_order?: number
          updated_at?: string
          client_name?: string | null
          rating?: number | null
          photo_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          quote?: string
          role_label?: string
          sort_order?: number
          updated_at?: string
          client_name?: string | null
          rating?: number | null
          photo_url?: string | null
        }
        Relationships: []
      }
      therapists: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          contact_whatsapp: string | null
          name: string
          photo_url: string | null
          slug: string
          specialties: string[] | null
          social_url: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          contact_whatsapp?: string | null
          name: string
          photo_url?: string | null
          slug: string
          specialties?: string[] | null
          social_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          contact_whatsapp?: string | null
          name?: string
          photo_url?: string | null
          slug?: string
          specialties?: string[] | null
          social_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor"
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
      app_role: ["admin", "editor"],
    },
  },
} as const
