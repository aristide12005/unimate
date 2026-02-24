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
      channels: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      listings: {
        Row: {
          author_id: string
          created_at: string
          description: string | null
          distance: string | null
          id: number
          image: string
          latitude: number | null
          location: string
          longitude: number | null
          posted_at: string | null
          price: string
          title: string
          type: string
        }
        Insert: {
          author_id: string
          created_at?: string
          description?: string | null
          distance?: string | null
          id?: number
          image: string
          latitude?: number | null
          location: string
          longitude?: number | null
          posted_at?: string | null
          price: string
          title: string
          type: string
        }
        Update: {
          author_id?: string
          created_at?: string
          description?: string | null
          distance?: string | null
          id?: number
          image?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          posted_at?: string | null
          price?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          id: string
          title: string
          date: string
          agenda: Json | null
          action_items: Json | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          agenda?: Json | null
          action_items?: Json | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          agenda?: Json | null
          action_items?: Json | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: number
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          background_image: string | null
          bio: string | null
          birthday: string | null
          campus: string | null
          custom_conditions: string | null
          created_at: string
          department: string | null
          job_title: string | null
          first_name: string | null
          gender: string | null
          housing_status: string | null
          id: string
          interests: string[] | null
          last_name: string | null
          level_role: string | null
          location_city: string | null
          location_country: string | null
          occupation: string | null
          onboarding_complete: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          school_company: string | null
          supervisor_id: string | null
          updated_at: string
          user_id: string | null
          username: string | null
          work_status: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          background_image?: string | null
          bio?: string | null
          birthday?: string | null
          campus?: string | null
          custom_conditions?: string | null
          created_at?: string
          department?: string | null
          job_title?: string | null
          first_name?: string | null
          gender?: string | null
          housing_status?: string | null
          id: string
          interests?: string[] | null
          last_name?: string | null
          level_role?: string | null
          location_city?: string | null
          location_country?: string | null
          occupation?: string | null
          onboarding_complete?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          school_company?: string | null
          supervisor_id?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
          work_status?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          background_image?: string | null
          bio?: string | null
          birthday?: string | null
          campus?: string | null
          custom_conditions?: string | null
          created_at?: string
          department?: string | null
          job_title?: string | null
          first_name?: string | null
          gender?: string | null
          housing_status?: string | null
          id?: string
          interests?: string[] | null
          last_name?: string | null
          level_role?: string | null
          location_city?: string | null
          location_country?: string | null
          occupation?: string | null
          onboarding_complete?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          school_company?: string | null
          supervisor_id?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
          work_status?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          employee_id: string
          date: string
          done_today: string
          planned_tomorrow: string
          blockers: string | null
          sentiment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          date?: string
          done_today: string
          planned_tomorrow: string
          blockers?: string | null
          sentiment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          date?: string
          done_today?: string
          planned_tomorrow?: string
          blockers?: string | null
          sentiment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never
