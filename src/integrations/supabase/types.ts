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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      fundraising_goals: {
        Row: {
          collaborators: string[] | null
          created_at: string
          current_amount: number
          deadline: string | null
          description: string | null
          id: string
          target_amount: number
          title: string
          token: Database["public"]["Enums"]["accepted_token"]
          updated_at: string
          user_id: string
        }
        Insert: {
          collaborators?: string[] | null
          created_at?: string
          current_amount?: number
          deadline?: string | null
          description?: string | null
          id?: string
          target_amount: number
          title: string
          token?: Database["public"]["Enums"]["accepted_token"]
          updated_at?: string
          user_id: string
        }
        Update: {
          collaborators?: string[] | null
          created_at?: string
          current_amount?: number
          deadline?: string | null
          description?: string | null
          id?: string
          target_amount?: number
          title?: string
          token?: Database["public"]["Enums"]["accepted_token"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fundraising_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_pages: {
        Row: {
          accepted_tokens: Database["public"]["Enums"]["accepted_token"][]
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          slug: string
          suggested_amounts: number[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_tokens?: Database["public"]["Enums"]["accepted_token"][]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          slug: string
          suggested_amounts?: number[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_tokens?: Database["public"]["Enums"]["accepted_token"][]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          slug?: string
          suggested_amounts?: number[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_pages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          from_wallet: string
          id: string
          is_anonymous: boolean
          message: string | null
          page_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          to_wallet: string
          token: Database["public"]["Enums"]["accepted_token"]
          transaction_signature: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          from_wallet: string
          id?: string
          is_anonymous?: boolean
          message?: string | null
          page_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          to_wallet: string
          token: Database["public"]["Enums"]["accepted_token"]
          transaction_signature?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          from_wallet?: string
          id?: string
          is_anonymous?: boolean
          message?: string | null
          page_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          to_wallet?: string
          token?: Database["public"]["Enums"]["accepted_token"]
          transaction_signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "payment_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_members: {
        Row: {
          contribution: number
          created_at: string
          id: string
          pool_id: string
          share_percentage: number
          wallet_address: string
        }
        Insert: {
          contribution?: number
          created_at?: string
          id?: string
          pool_id: string
          share_percentage?: number
          wallet_address: string
        }
        Update: {
          contribution?: number
          created_at?: string
          id?: string
          pool_id?: string
          share_percentage?: number
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_members_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pools: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          id: string
          is_active: boolean
          member_count: number
          name: string
          target_tokens: string[] | null
          token: Database["public"]["Enums"]["accepted_token"]
          total_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          is_active?: boolean
          member_count?: number
          name: string
          target_tokens?: string[] | null
          token?: Database["public"]["Enums"]["accepted_token"]
          total_value?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          is_active?: boolean
          member_count?: number
          name?: string
          target_tokens?: string[] | null
          token?: Database["public"]["Enums"]["accepted_token"]
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pools_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          is_paid: boolean
          referred_wallet: string
          referrer_id: string
          reward_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_paid?: boolean
          referred_wallet: string
          referrer_id: string
          reward_amount?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_paid?: boolean
          referred_wallet?: string
          referrer_id?: string
          reward_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          frequency: Database["public"]["Enums"]["subscription_frequency"]
          from_wallet: string
          id: string
          is_active: boolean
          next_payment_date: string | null
          to_wallet: string
          token: Database["public"]["Enums"]["accepted_token"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          frequency?: Database["public"]["Enums"]["subscription_frequency"]
          from_wallet: string
          id?: string
          is_active?: boolean
          next_payment_date?: string | null
          to_wallet: string
          token: Database["public"]["Enums"]["accepted_token"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          frequency?: Database["public"]["Enums"]["subscription_frequency"]
          from_wallet?: string
          id?: string
          is_active?: boolean
          next_payment_date?: string | null
          to_wallet?: string
          token?: Database["public"]["Enums"]["accepted_token"]
          updated_at?: string
        }
        Relationships: []
      }
      token_gates: {
        Row: {
          content: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          id: string
          required_amount: number
          title: string
          token: Database["public"]["Enums"]["accepted_token"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          id?: string
          required_amount?: number
          title: string
          token?: Database["public"]["Enums"]["accepted_token"]
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          id?: string
          required_amount?: number
          title?: string
          token?: Database["public"]["Enums"]["accepted_token"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_gates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          is_anonymous: boolean
          privacy_mode: boolean
          show_earnings: boolean
          show_payment_history: boolean
          show_profile_photo: boolean
          show_supporter_count: boolean
          stackr_score: number
          total_received: number
          total_supporters: number
          twitter_handle: string | null
          updated_at: string
          username: string | null
          wallet_address: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_anonymous?: boolean
          privacy_mode?: boolean
          show_earnings?: boolean
          show_payment_history?: boolean
          show_profile_photo?: boolean
          show_supporter_count?: boolean
          stackr_score?: number
          total_received?: number
          total_supporters?: number
          twitter_handle?: string | null
          updated_at?: string
          username?: string | null
          wallet_address: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_anonymous?: boolean
          privacy_mode?: boolean
          show_earnings?: boolean
          show_payment_history?: boolean
          show_profile_photo?: boolean
          show_supporter_count?: boolean
          stackr_score?: number
          total_received?: number
          total_supporters?: number
          twitter_handle?: string | null
          updated_at?: string
          username?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      vault_deposits: {
        Row: {
          amount: number
          created_at: string
          from_wallet: string
          id: string
          token: Database["public"]["Enums"]["accepted_token"]
          transaction_signature: string | null
          vault_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_wallet: string
          id?: string
          token: Database["public"]["Enums"]["accepted_token"]
          transaction_signature?: string | null
          vault_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_wallet?: string
          id?: string
          token?: Database["public"]["Enums"]["accepted_token"]
          transaction_signature?: string | null
          vault_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_deposits_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      vaults: {
        Row: {
          allow_contributions: boolean
          created_at: string
          current_amount: number
          id: string
          is_completed: boolean
          is_locked: boolean
          unlock_date: string | null
          updated_at: string
          user_id: string
          vault_name: string
          vault_notes: string | null
          vault_progress_percentage: number | null
          vault_purpose: string | null
          vault_target: number
          vault_target_token: Database["public"]["Enums"]["accepted_token"]
        }
        Insert: {
          allow_contributions?: boolean
          created_at?: string
          current_amount?: number
          id?: string
          is_completed?: boolean
          is_locked?: boolean
          unlock_date?: string | null
          updated_at?: string
          user_id: string
          vault_name: string
          vault_notes?: string | null
          vault_progress_percentage?: number | null
          vault_purpose?: string | null
          vault_target?: number
          vault_target_token?: Database["public"]["Enums"]["accepted_token"]
        }
        Update: {
          allow_contributions?: boolean
          created_at?: string
          current_amount?: number
          id?: string
          is_completed?: boolean
          is_locked?: boolean
          unlock_date?: string | null
          updated_at?: string
          user_id?: string
          vault_name?: string
          vault_notes?: string | null
          vault_progress_percentage?: number | null
          vault_purpose?: string | null
          vault_target?: number
          vault_target_token?: Database["public"]["Enums"]["accepted_token"]
        }
        Relationships: [
          {
            foreignKeyName: "vaults_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
      accepted_token: "SOL" | "USDC" | "USDT" | "BAGS"
      content_type: "text" | "file" | "link" | "video"
      payment_status: "pending" | "confirmed" | "failed"
      subscription_frequency: "weekly" | "monthly" | "yearly"
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
      accepted_token: ["SOL", "USDC", "USDT", "BAGS"],
      content_type: ["text", "file", "link", "video"],
      payment_status: ["pending", "confirmed", "failed"],
      subscription_frequency: ["weekly", "monthly", "yearly"],
    },
  },
} as const
