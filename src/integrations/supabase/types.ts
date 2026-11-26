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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      job_applications: {
        Row: {
          cover_note: string
          created_at: string
          cv_document_id: string | null
          id: string
          job_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_note?: string
          created_at?: string
          cv_document_id?: string | null
          id?: string
          job_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_note?: string
          created_at?: string
          cv_document_id?: string | null
          id?: string
          job_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_cv_document_id_fkey"
            columns: ["cv_document_id"]
            isOneToOne: false
            referencedRelation: "profile_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_opportunities: {
        Row: {
          created_at: string
          description: string
          employer_id: string | null
          employment_type: string
          id: string
          industry: string
          is_active: boolean
          is_sample: boolean
          location: string
          organization_name: string
          required_skills: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          employer_id?: string | null
          employment_type: string
          id?: string
          industry: string
          is_active?: boolean
          is_sample?: boolean
          location: string
          organization_name: string
          required_skills?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          employer_id?: string | null
          employment_type?: string
          id?: string
          industry?: string
          is_active?: boolean
          is_sample?: boolean
          location?: string
          organization_name?: string
          required_skills?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_opportunities_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      passport_shares: {
        Row: {
          created_at: string
          include_contact: boolean
          is_active: boolean
          share_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          include_contact?: boolean
          is_active?: boolean
          share_token?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          include_contact?: boolean
          is_active?: boolean
          share_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "passport_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_career_interests: {
        Row: {
          created_at: string
          employment_preferences: string[]
          industries: string[]
          preferred_roles: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          employment_preferences?: string[]
          industries?: string[]
          preferred_roles?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          employment_preferences?: string[]
          industries?: string[]
          preferred_roles?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_career_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_documents: {
        Row: {
          created_at: string
          doc_type: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          issuer: string
          mime_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          issuer?: string
          mime_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          issuer?: string
          mime_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_educations: {
        Row: {
          created_at: string
          field_of_study: string
          graduation_year: number
          id: string
          institution: string
          qualification: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          field_of_study: string
          graduation_year: number
          id?: string
          institution: string
          qualification: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          field_of_study?: string
          graduation_year?: number
          id?: string
          institution?: string
          qualification?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_educations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_experiences: {
        Row: {
          achievements: string
          created_at: string
          employer: string
          end_date: string | null
          id: string
          is_current: boolean
          job_title: string
          responsibilities: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements?: string
          created_at?: string
          employer: string
          end_date?: string | null
          id?: string
          is_current?: boolean
          job_title: string
          responsibilities?: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements?: string
          created_at?: string
          employer?: string
          end_date?: string | null
          id?: string
          is_current?: boolean
          job_title?: string
          responsibilities?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_experiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_skills: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          city: string | null
          country_of_residence: string
          created_at: string
          full_name: string
          highest_education: string | null
          id: string
          languages: string | null
          organization_name: string | null
          phone: string | null
          professional_title: string | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          city?: string | null
          country_of_residence?: string
          created_at?: string
          full_name?: string
          highest_education?: string | null
          id: string
          languages?: string | null
          organization_name?: string | null
          phone?: string | null
          professional_title?: string | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          city?: string | null
          country_of_residence?: string
          created_at?: string
          full_name?: string
          highest_education?: string | null
          id?: string
          languages?: string | null
          organization_name?: string | null
          phone?: string | null
          professional_title?: string | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills_assessments: {
        Row: {
          completed_at: string
          digital_score: number
          id: string
          language_score: number
          overall_score: number
          readiness_score: number
          summary: string
          technical_score: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          digital_score: number
          id?: string
          language_score: number
          overall_score: number
          readiness_score: number
          summary?: string
          technical_score: number
          user_id: string
        }
        Update: {
          completed_at?: string
          digital_score?: number
          id?: string
          language_score?: number
          overall_score?: number
          readiness_score?: number
          summary?: string
          technical_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      admin_account_summary: {
        Args: never
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
          total: number
        }[]
      }
      get_shared_passport: { Args: { _token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "refugee" | "employer" | "admin"
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
      app_role: ["refugee", "employer", "admin"],
    },
  },
} as const
