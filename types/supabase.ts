export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      breads: {
        Row: {
          id: string
          name: string
          deleted_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          deleted_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          deleted_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      flours: {
        Row: {
          id: string
          name: string
          company: string | null
          origin: string | null
          protein: number | null
          ash_content: number | null
          display_order: number
          deleted_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company?: string | null
          origin?: string | null
          protein?: number | null
          ash_content?: number | null
          display_order?: number
          deleted_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string | null
          origin?: string | null
          protein?: number | null
          ash_content?: number | null
          display_order?: number
          deleted_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      main_formulas: {
        Row: {
          bread_id: string
          flour1_id: string | null
          flour1_weight: number | null
          flour2_id: string | null
          flour2_weight: number | null
          flour3_id: string | null
          flour3_weight: number | null
          flour4_id: string | null
          flour4_weight: number | null
          flour5_id: string | null
          flour5_weight: number | null
          deleted_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          bread_id: string
          flour1_id?: string | null
          flour1_weight?: number | null
          flour2_id?: string | null
          flour2_weight?: number | null
          flour3_id?: string | null
          flour3_weight?: number | null
          flour4_id?: string | null
          flour4_weight?: number | null
          flour5_id?: string | null
          flour5_weight?: number | null
          deleted_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          bread_id?: string
          flour1_id?: string | null
          flour1_weight?: number | null
          flour2_id?: string | null
          flour2_weight?: number | null
          flour3_id?: string | null
          flour3_weight?: number | null
          flour4_id?: string | null
          flour4_weight?: number | null
          flour5_id?: string | null
          flour5_weight?: number | null
          deleted_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      formula_histories: {
        Row: {
          history_id: string
          bread_id: string
          recorded_at: string
          flour1_id: string | null
          flour1_weight: number | null
          flour2_id: string | null
          flour2_weight: number | null
          flour3_id: string | null
          flour3_weight: number | null
          flour4_id: string | null
          flour4_weight: number | null
          flour5_id: string | null
          flour5_weight: number | null
          deleted_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          history_id?: string
          bread_id: string
          recorded_at?: string
          flour1_id?: string | null
          flour1_weight?: number | null
          flour2_id?: string | null
          flour2_weight?: number | null
          flour3_id?: string | null
          flour3_weight?: number | null
          flour4_id?: string | null
          flour4_weight?: number | null
          flour5_id?: string | null
          flour5_weight?: number | null
          deleted_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          history_id?: string
          bread_id?: string
          recorded_at?: string
          flour1_id?: string | null
          flour1_weight?: number | null
          flour2_id?: string | null
          flour2_weight?: number | null
          flour3_id?: string | null
          flour3_weight?: number | null
          flour4_id?: string | null
          flour4_weight?: number | null
          flour5_id?: string | null
          flour5_weight?: number | null
          deleted_at?: string | null
          notes?: string | null
          created_at?: string
        }
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
  }
}