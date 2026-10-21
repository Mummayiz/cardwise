export interface User {
  id: number
  email: string
  full_name: string
  is_active: boolean
}
export interface BusinessCard {
  id: number
  owner_id: number
  full_name?: string
  job_title?: string
  company?: string
  email?: string
  phone?: string
  website?: string
  address?: string
  linkedin?: string
  twitter?: string
  notes?: string
  image_path?: string
  raw_ocr_text?: string
  ocr_confidence?: string
  extra_fields?: Record<string, unknown>
  created_at: string
  updated_at?: string
}
export interface Group {
  id: number
  owner_id: number
  name: string
  description?: string
  created_at: string
  cards: BusinessCard[]
}
export interface OCRResult {
  raw_text: string
  full_name?: string
  job_title?: string
  company?: string
  email?: string
  phone?: string
  website?: string
  address?: string
  linkedin?: string
  twitter?: string
  confidence?: string
}
export interface AuthTokens {
  access_token: string
  token_type: string
}
