// ============================================
// Единый слой доступа к данным (dual-mode)
// Автоопределение: Supabase или mockDb
// Для 'use client' страниц — browser client
// ============================================

import { createClient } from '@/lib/supabase/client'
import * as db from '@/lib/queries'
import * as mock from '@/lib/mockDb'

export const USE_SUPABASE = !!(
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function getClient() {
  return createClient()
}

// ============================================
// PRODUCTS
// ============================================

export async function getAllProducts(onlyPublished = false): Promise<mock.MockProduct[]> {
  if (USE_SUPABASE) return db.getAllProducts(getClient(), onlyPublished)
  return mock.getAllMockProducts(onlyPublished)
}

export async function getProductById(id: string): Promise<mock.MockProduct | null> {
  if (USE_SUPABASE) return db.getProductById(getClient(), id)
  return mock.getProductById(id)
}

export async function getProductsBySupplierId(supplierId: string): Promise<mock.MockProduct[]> {
  if (USE_SUPABASE) return db.getProductsBySupplierId(getClient(), supplierId)
  return mock.getProductsBySupplierId(supplierId)
}

export async function createProduct(product: Partial<mock.MockProduct>): Promise<mock.MockProduct | null> {
  if (USE_SUPABASE) return db.createProduct(getClient(), product)
  return mock.createMockProduct(product as mock.MockProduct)
}

export async function updateProduct(id: string, updates: Partial<mock.MockProduct>): Promise<mock.MockProduct | null> {
  if (USE_SUPABASE) return db.updateProduct(getClient(), id, updates)
  mock.updateMockProduct(id, updates)
  return mock.getProductById(id)
}

export async function deleteProduct(id: string): Promise<void> {
  if (USE_SUPABASE) return db.deleteProduct(getClient(), id)
  mock.deleteMockProduct(id)
}

// ============================================
// REQUESTS
// ============================================

export async function getAllRequests(): Promise<mock.MockRequest[]> {
  if (USE_SUPABASE) return db.getAllRequests(getClient())
  return mock.getAllMockRequests()
}

export async function getRequestById(id: string): Promise<mock.MockRequest | null> {
  if (USE_SUPABASE) return db.getRequestById(getClient(), id)
  return mock.getRequestById(id) ?? null
}

export async function createRequest(req: Partial<mock.MockRequest>): Promise<mock.MockRequest | null> {
  if (USE_SUPABASE) return db.createRequest(getClient(), req)
  return mock.createMockRequest(req as mock.MockRequest)
}

export async function updateRequest(id: string, updates: Partial<mock.MockRequest>): Promise<mock.MockRequest | null> {
  if (USE_SUPABASE) return db.updateRequest(getClient(), id, updates)
  mock.updateMockRequest(id, updates)
  return mock.getRequestById(id) ?? null
}

export async function updateRequestStatus(
  id: string, status: mock.RequestStatus, supplierId?: string, supplierName?: string
): Promise<mock.MockRequest | null> {
  if (USE_SUPABASE) return db.updateRequestStatus(getClient(), id, status, supplierId, supplierName)
  mock.updateRequestStatus(id, status, supplierId, supplierName)
  return mock.getRequestById(id) ?? null
}

export async function getRequestsByAuthor(authorId: string): Promise<mock.MockRequest[]> {
  if (USE_SUPABASE) return db.getRequestsByAuthor(getClient(), authorId)
  return mock.getMockRequestsByAuthor(authorId)
}

export async function getRequestsForSupplier(): Promise<mock.MockRequest[]> {
  if (USE_SUPABASE) return db.getRequestsForSupplier(getClient())
  return mock.getMockRequestsForSupplier()
}

// ============================================
// PROFILES
// ============================================

export async function getAllProfiles(): Promise<mock.MockUser[]> {
  if (USE_SUPABASE) return db.getAllProfiles(getClient())
  return mock.getAllMockUsers()
}

export async function getProfileByPhone(phone: string): Promise<mock.MockUser | null> {
  if (USE_SUPABASE) return db.getProfileByPhone(getClient(), phone)
  return mock.getMockUser(phone) ?? null
}

export async function getProfileById(uid: string): Promise<mock.MockUser | null> {
  if (USE_SUPABASE) return db.getProfile(getClient(), uid)
  return mock.getMockUserById(uid) ?? null
}

export async function updateProfile(uid: string, updates: Partial<mock.MockUser>): Promise<mock.MockUser | null> {
  if (USE_SUPABASE) return db.updateProfile(getClient(), uid, updates)
  mock.updateMockUser(uid, updates)
  return mock.getMockUserById(uid) ?? null
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function getNotifications(userId: string): Promise<mock.MockNotification[]> {
  if (USE_SUPABASE) return db.getNotifications(getClient(), userId)
  return mock.getMockNotifications(userId)
}

export async function markNotificationRead(id: string): Promise<void> {
  if (USE_SUPABASE) return db.markNotificationRead(getClient(), id)
  mock.markNotificationAsRead(id)
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (USE_SUPABASE) return db.markAllNotificationsRead(getClient(), userId)
  mock.markAllNotificationsRead(userId)
}

// ============================================
// CHATS & MESSAGES
// ============================================

export async function getChats(userId: string): Promise<mock.MockChat[]> {
  if (USE_SUPABASE) return db.getChats(getClient(), userId)
  return mock.getMockChats(userId)
}

export async function getChatMessages(chatId: string): Promise<mock.MockChatMessage[]> {
  if (USE_SUPABASE) return db.getChatMessages(getClient(), chatId)
  return mock.getChatMessages(chatId)
}

export async function sendMessage(chatId: string, senderId: string, text: string): Promise<mock.MockChatMessage | null> {
  if (USE_SUPABASE) return db.sendMessage(getClient(), chatId, senderId, text)
  return mock.sendChatMessage(chatId, senderId, text)
}

// ============================================
// NOMENCLATURE
// ============================================

export async function getAllNomenclatureGroups(): Promise<mock.NomenclatureGroup[]> {
  if (USE_SUPABASE) return db.getAllNomenclatureGroups(getClient())
  return mock.nomenclatureGroups
}

export async function createNomenclatureGroup(group: Omit<mock.NomenclatureGroup, 'id'>): Promise<mock.NomenclatureGroup | null> {
  if (USE_SUPABASE) return db.createNomenclatureGroup(getClient(), group)
  const newGroup = { ...group, id: `grp-${Date.now()}` } as mock.NomenclatureGroup
  mock.nomenclatureGroups.push(newGroup)
  return newGroup
}

export async function updateNomenclatureGroup(id: string, updates: Partial<mock.NomenclatureGroup>): Promise<mock.NomenclatureGroup | null> {
  if (USE_SUPABASE) return db.updateNomenclatureGroup(getClient(), id, updates)
  const idx = mock.nomenclatureGroups.findIndex(g => g.id === id)
  if (idx === -1) return null
  Object.assign(mock.nomenclatureGroups[idx], updates)
  return mock.nomenclatureGroups[idx]
}

export async function deleteNomenclatureGroup(id: string): Promise<void> {
  if (USE_SUPABASE) return db.deleteNomenclatureGroup(getClient(), id)
  const idx = mock.nomenclatureGroups.findIndex(g => g.id === id)
  if (idx !== -1) mock.nomenclatureGroups.splice(idx, 1)
}

// ============================================
// DASHBOARD
// ============================================

export async function getSupplierDashboard(supplierId: string) {
  if (USE_SUPABASE) return db.getSupplierDashboard(getClient(), supplierId)
  return mock.getSupplierDashboard(supplierId)
}
