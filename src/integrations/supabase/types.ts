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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      client_accounts: {
        Row: {
          country: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_contacts: {
        Row: {
          account_id: string | null
          client_id: string
          created_at: string
          email: string | null
          id: string
          is_primary: boolean
          name: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          client_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          client_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          account_id: string | null
          billing_cycle: string | null
          country: string | null
          created_at: string
          created_by: string | null
          favicon_url: string | null
          github_url: string | null
          id: string
          last_paid_on: string | null
          live_url: string | null
          lovable_project_url: string | null
          monthly_fee: number | null
          monthly_fee_currency: string | null
          name: string
          next_payment_on: string | null
          notes: string | null
          onboarding_fee: number | null
          onboarding_fee_currency: string | null
          sector: string | null
          slug: string
          status: string
          thumbnail_captured_at: string | null
          thumbnail_path: string | null
          thumbnail_source: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          billing_cycle?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          favicon_url?: string | null
          github_url?: string | null
          id?: string
          last_paid_on?: string | null
          live_url?: string | null
          lovable_project_url?: string | null
          monthly_fee?: number | null
          monthly_fee_currency?: string | null
          name: string
          next_payment_on?: string | null
          notes?: string | null
          onboarding_fee?: number | null
          onboarding_fee_currency?: string | null
          sector?: string | null
          slug: string
          status?: string
          thumbnail_captured_at?: string | null
          thumbnail_path?: string | null
          thumbnail_source?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          billing_cycle?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          favicon_url?: string | null
          github_url?: string | null
          id?: string
          last_paid_on?: string | null
          live_url?: string | null
          lovable_project_url?: string | null
          monthly_fee?: number | null
          monthly_fee_currency?: string | null
          name?: string
          next_payment_on?: string | null
          notes?: string | null
          onboarding_fee?: number | null
          onboarding_fee_currency?: string | null
          sector?: string | null
          slug?: string
          status?: string
          thumbnail_captured_at?: string | null
          thumbnail_path?: string | null
          thumbnail_source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_emails: {
        Row: {
          contact_id: string
          created_at: string
          email: string
          id: string
          is_primary: boolean
          status: string | null
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          email: string
          id?: string
          is_primary?: boolean
          status?: string | null
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          email?: string
          id?: string
          is_primary?: boolean
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_emails_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "client_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_phones: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          is_primary: boolean
          label: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          label?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          label?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_phones_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "client_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          category: string
          client_id: string | null
          created_at: string
          description: string | null
          fx_rate: number | null
          gross_amount: number | null
          gross_currency: string
          id: string
          net_eur: number
          spent_on: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          category?: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          fx_rate?: number | null
          gross_amount?: number | null
          gross_currency?: string
          id?: string
          net_eur?: number
          spent_on: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          category?: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          fx_rate?: number | null
          gross_amount?: number | null
          gross_currency?: string
          id?: string
          net_eur?: number
          spent_on?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          country_code: string
          created_at: string
          device: string
          duration_ms: number
          engaged: boolean
          id: string
          is_bot: boolean
          path: string
          referrer: string
          referrer_host: string
          session_id: string
          user_agent: string
          utm_campaign: string
          utm_medium: string
          utm_source: string
        }
        Insert: {
          country_code?: string
          created_at?: string
          device?: string
          duration_ms?: number
          engaged?: boolean
          id?: string
          is_bot?: boolean
          path: string
          referrer?: string
          referrer_host?: string
          session_id: string
          user_agent?: string
          utm_campaign?: string
          utm_medium?: string
          utm_source?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          device?: string
          duration_ms?: number
          engaged?: boolean
          id?: string
          is_bot?: boolean
          path?: string
          referrer?: string
          referrer_host?: string
          session_id?: string
          user_agent?: string
          utm_campaign?: string
          utm_medium?: string
          utm_source?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_holder: string | null
          account_number: string | null
          account_type: string | null
          bank_address: string | null
          bank_name: string | null
          beneficiary_address: string | null
          created_at: string
          currency: string
          iban: string | null
          id: string
          intermediary_bank: string | null
          is_active: boolean
          kind: string
          name: string
          notes: string | null
          routing_number: string | null
          swift: string | null
          transfer_instructions: string | null
          updated_at: string
        }
        Insert: {
          account_holder?: string | null
          account_number?: string | null
          account_type?: string | null
          bank_address?: string | null
          bank_name?: string | null
          beneficiary_address?: string | null
          created_at?: string
          currency?: string
          iban?: string | null
          id?: string
          intermediary_bank?: string | null
          is_active?: boolean
          kind?: string
          name: string
          notes?: string | null
          routing_number?: string | null
          swift?: string | null
          transfer_instructions?: string | null
          updated_at?: string
        }
        Update: {
          account_holder?: string | null
          account_number?: string | null
          account_type?: string | null
          bank_address?: string | null
          bank_name?: string | null
          beneficiary_address?: string | null
          created_at?: string
          currency?: string
          iban?: string | null
          id?: string
          intermediary_bank?: string | null
          is_active?: boolean
          kind?: string
          name?: string
          notes?: string | null
          routing_number?: string | null
          swift?: string | null
          transfer_instructions?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          client_id: string
          contact_id: string | null
          created_at: string
          description: string | null
          fx_rate: number | null
          gross_amount: number | null
          gross_currency: string
          id: string
          invoice_no: string | null
          kind: string
          net_eur: number
          paid_on: string
          payment_method: string | null
          payment_type: string | null
          services: string[]
          updated_at: string
        }
        Insert: {
          client_id: string
          contact_id?: string | null
          created_at?: string
          description?: string | null
          fx_rate?: number | null
          gross_amount?: number | null
          gross_currency?: string
          id?: string
          invoice_no?: string | null
          kind?: string
          net_eur?: number
          paid_on: string
          payment_method?: string | null
          payment_type?: string | null
          services?: string[]
          updated_at?: string
        }
        Update: {
          client_id?: string
          contact_id?: string | null
          created_at?: string
          description?: string | null
          fx_rate?: number | null
          gross_amount?: number | null
          gross_currency?: string
          id?: string
          invoice_no?: string | null
          kind?: string
          net_eur?: number
          paid_on?: string
          payment_method?: string | null
          payment_type?: string | null
          services?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "client_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_standard_assignments: {
        Row: {
          applied_revision: string
          client_id: string
          created_at: string
          id: string
          notes: string
          reviewed_at: string | null
          reviewed_by: string | null
          standard_slug: string
          status: string
          updated_at: string
        }
        Insert: {
          applied_revision?: string
          client_id: string
          created_at?: string
          id?: string
          notes?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          standard_slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          applied_revision?: string
          client_id?: string
          created_at?: string
          id?: string
          notes?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          standard_slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_standard_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          address_city: string
          address_country: string
          address_street: string
          business_name: string
          contact_email: string
          contact_phone: string
          created_at: string
          id: boolean
          primary_domain: string
          social_links: Json
          tagline: string
          updated_at: string
        }
        Insert: {
          address_city?: string
          address_country?: string
          address_street?: string
          business_name?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string
          id?: boolean
          primary_domain?: string
          social_links?: Json
          tagline?: string
          updated_at?: string
        }
        Update: {
          address_city?: string
          address_country?: string
          address_street?: string
          business_name?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string
          id?: boolean
          primary_domain?: string
          social_links?: Json
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      standard_drafts: {
        Row: {
          base_revision: string
          content: string
          created_at: string
          created_by: string
          id: string
          reason: string
          status: string
          target_kind: string
          target_slug: string
          title: string
          updated_at: string
        }
        Insert: {
          base_revision?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          reason?: string
          status?: string
          target_kind: string
          target_slug: string
          title: string
          updated_at?: string
        }
        Update: {
          base_revision?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          reason?: string
          status?: string
          target_kind?: string
          target_slug?: string
          title?: string
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
      analytics_summary: {
        Args: { _from: string; _include_short?: boolean; _to: string }
        Returns: Json
      }
      developer_email: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_staff: { Args: { _user_id: string }; Returns: boolean }
      is_developer: { Args: { _user_id?: string }; Returns: boolean }
      is_manager: { Args: { _user_id: string }; Returns: boolean }
      prune_page_views: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "developer" | "owner" | "editor"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["developer", "owner", "editor"],
    },
  },
} as const
