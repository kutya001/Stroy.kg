// Автосгенерированные типы Supabase
// Замените этот файл сгенерированным через: npx supabase gen types typescript --linked > lib/supabase/types.ts
// Документация: https://supabase.com/docs/guides/api/rest/generating-types

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
      profiles: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          role: 'consumer' | 'supplier' | 'developer' | 'admin'
          onboarding_completed: boolean
          created_at: string
          verification_level: number
          phone_verified: boolean
          email_verified: boolean
          inn: string | null
          passport_scan: string | null
          company_name: string | null
          licenses: string[] | null
          certificates: string[] | null
          subscription: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
          page_views: number
          chat_requests: number
          completed_orders: number
          revenue: number
          daily_ad_budget: number
          is_promoted: boolean
          auth_preference: 'password' | 'otp' | 'both' | null
          password: string | null
        }
        Insert: {
          id: string
          name?: string
          phone: string
          email?: string | null
          role?: 'consumer' | 'supplier' | 'developer' | 'admin'
          onboarding_completed?: boolean
          created_at?: string
          verification_level?: number
          phone_verified?: boolean
          email_verified?: boolean
          inn?: string | null
          passport_scan?: string | null
          company_name?: string | null
          licenses?: string[] | null
          certificates?: string[] | null
          subscription?: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
          page_views?: number
          chat_requests?: number
          completed_orders?: number
          revenue?: number
          daily_ad_budget?: number
          is_promoted?: boolean
          auth_preference?: 'password' | 'otp' | 'both' | null
          password?: string | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          role?: 'consumer' | 'supplier' | 'developer' | 'admin'
          onboarding_completed?: boolean
          verification_level?: number
          phone_verified?: boolean
          email_verified?: boolean
          inn?: string | null
          passport_scan?: string | null
          company_name?: string | null
          licenses?: string[] | null
          certificates?: string[] | null
          subscription?: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
          page_views?: number
          chat_requests?: number
          completed_orders?: number
          revenue?: number
          daily_ad_budget?: number
          is_promoted?: boolean
          auth_preference?: 'password' | 'otp' | 'both' | null
          password?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          supplier_id: string
          supplier_name: string
          name: string
          nomenclature_category: 'Товар' | 'Услуга'
          nomenclature_type: string
          group_id: string
          group_name: string
          description: string
          price: number
          unit: string
          region: string
          rating: number
          image: string
          tags: string[]
          characteristics: Json
          is_top: boolean
          is_new: boolean
          is_published: boolean
          is_promoted: boolean
          promotion_budget: number | null
          construction_stage: string | null
          created_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          supplier_name: string
          name: string
          nomenclature_category?: 'Товар' | 'Услуга'
          nomenclature_type?: string
          group_id?: string
          group_name?: string
          description?: string
          price?: number
          unit?: string
          region?: string
          rating?: number
          image?: string
          tags?: string[]
          characteristics?: Json
          is_top?: boolean
          is_new?: boolean
          is_published?: boolean
          is_promoted?: boolean
          promotion_budget?: number | null
          construction_stage?: string | null
          created_at?: string
        }
        Update: {
          supplier_id?: string
          supplier_name?: string
          name?: string
          nomenclature_category?: 'Товар' | 'Услуга'
          nomenclature_type?: string
          group_id?: string
          group_name?: string
          description?: string
          price?: number
          unit?: string
          region?: string
          rating?: number
          image?: string
          tags?: string[]
          characteristics?: Json
          is_top?: boolean
          is_new?: boolean
          is_published?: boolean
          is_promoted?: boolean
          promotion_budget?: number | null
          construction_stage?: string | null
        }
        Relationships: []
      }
      requests: {
        Row: {
          id: string
          author_id: string
          author_name: string
          assigned_supplier_id: string | null
          assigned_supplier_name: string | null
          title: string
          category: 'Товар' | 'Услуга'
          type: string | null
          group_id: string | null
          group_name: string | null
          characteristics: Json | null
          linked_product_id: string | null
          description: string
          budget: number
          quantity: number
          unit: string
          region: string
          status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
          created_at: string
          responses_count: number
        }
        Insert: {
          id?: string
          author_id: string
          author_name: string
          assigned_supplier_id?: string | null
          assigned_supplier_name?: string | null
          title: string
          category?: 'Товар' | 'Услуга'
          type?: string | null
          group_id?: string | null
          group_name?: string | null
          characteristics?: Json | null
          linked_product_id?: string | null
          description?: string
          budget?: number
          quantity?: number
          unit?: string
          region?: string
          status?: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
          created_at?: string
          responses_count?: number
        }
        Update: {
          author_id?: string
          author_name?: string
          assigned_supplier_id?: string | null
          assigned_supplier_name?: string | null
          title?: string
          category?: 'Товар' | 'Услуга'
          type?: string | null
          group_id?: string | null
          group_name?: string | null
          characteristics?: Json | null
          linked_product_id?: string | null
          description?: string
          budget?: number
          quantity?: number
          unit?: string
          region?: string
          status?: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
          responses_count?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          text: string
          date: string
          read: boolean
          type: 'request' | 'response' | 'system' | 'verification' | 'chat'
          link: string | null
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          date?: string
          read?: boolean
          type?: 'request' | 'response' | 'system' | 'verification' | 'chat'
          link?: string | null
        }
        Update: {
          user_id?: string
          text?: string
          read?: boolean
          type?: 'request' | 'response' | 'system' | 'verification' | 'chat'
          link?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          id: string
          participants: string[]
          last_message: string
          updated_at: string
          unread_count: number
        }
        Insert: {
          id?: string
          participants: string[]
          last_message?: string
          updated_at?: string
          unread_count?: number
        }
        Update: {
          participants?: string[]
          last_message?: string
          updated_at?: string
          unread_count?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          text: string
          timestamp: string
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          text: string
          timestamp?: string
        }
        Update: {
          sender_id?: string
          text?: string
        }
        Relationships: []
      }
      nomenclature_groups: {
        Row: {
          id: string
          category: 'Товар' | 'Услуга'
          type: string
          name: string
          characteristics: string[]
        }
        Insert: {
          id?: string
          category: 'Товар' | 'Услуга'
          type: string
          name: string
          characteristics?: string[]
        }
        Update: {
          category?: 'Товар' | 'Услуга'
          type?: string
          name?: string
          characteristics?: string[]
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
      user_role: 'consumer' | 'supplier' | 'developer' | 'admin'
      subscription_tier: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
      request_status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
      nomenclature_category: 'Товар' | 'Услуга'
      notification_type: 'request' | 'response' | 'system' | 'verification' | 'chat'
    }
  }
}
