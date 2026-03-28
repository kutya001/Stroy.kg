// ============================================
// Слой доступа к данным Supabase
// Заменяет синхронные mock-функции из mockDb.ts
// Каждая функция принимает клиент Supabase (server или browser)
// ============================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type {
  MockUser, MockProduct, MockRequest, MockNotification,
  MockChat, MockChatMessage, NomenclatureGroup,
  UserRole, RequestStatus, VerificationLevel,
} from '@/lib/mockDb'

type Client = SupabaseClient<Database>
type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProductRow = Database['public']['Tables']['products']['Row']
type RequestRow = Database['public']['Tables']['requests']['Row']
type NotificationRow = Database['public']['Tables']['notifications']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// ============================================
// Маппинг snake_case → camelCase
// (чтобы компоненты продолжали работать с существующими типами)
// ============================================

function mapProfile(row: ProfileRow): MockUser {
  return {
    uid: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    role: row.role as UserRole,
    onboardingCompleted: row.onboarding_completed,
    createdAt: row.created_at,
    verificationLevel: row.verification_level as VerificationLevel,
    phoneVerified: row.phone_verified,
    emailVerified: row.email_verified,
    inn: row.inn ?? undefined,
    passportScan: row.passport_scan ?? undefined,
    companyName: row.company_name ?? undefined,
    licenses: row.licenses ?? undefined,
    certificates: row.certificates ?? undefined,
    subscription: row.subscription,
    pageViews: row.page_views,
    chatRequests: row.chat_requests,
    completedOrders: row.completed_orders,
    revenue: row.revenue,
    dailyAdBudget: row.daily_ad_budget,
    isPromoted: row.is_promoted,
  }
}

function mapProduct(row: ProductRow): MockProduct {
  return {
    id: row.id,
    supplierId: row.supplier_id,
    supplierName: row.supplier_name,
    name: row.name,
    nomenclatureCategory: row.nomenclature_category as MockProduct['nomenclatureCategory'],
    nomenclatureType: row.nomenclature_type as MockProduct['nomenclatureType'],
    groupId: row.group_id,
    groupName: row.group_name,
    description: row.description,
    price: row.price,
    unit: row.unit,
    region: row.region,
    rating: Number(row.rating),
    image: row.image,
    tags: row.tags,
    characteristics: (row.characteristics as Record<string, string>) ?? {},
    isTop: row.is_top,
    isNew: row.is_new,
    isPublished: row.is_published,
    isPromoted: row.is_promoted,
    promotionBudget: row.promotion_budget ?? undefined,
    constructionStage: row.construction_stage ?? undefined,
    createdAt: row.created_at,
  }
}

function mapRequest(row: RequestRow): MockRequest {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    assignedSupplierId: row.assigned_supplier_id ?? undefined,
    assignedSupplierName: row.assigned_supplier_name ?? undefined,
    title: row.title,
    category: row.category as MockRequest['category'],
    type: (row.type as MockRequest['type']) ?? undefined,
    groupId: row.group_id ?? undefined,
    groupName: row.group_name ?? undefined,
    characteristics: (row.characteristics as Record<string, string>) ?? undefined,
    linkedProductId: row.linked_product_id ?? undefined,
    description: row.description,
    budget: row.budget,
    quantity: row.quantity,
    unit: row.unit,
    region: row.region,
    status: row.status as RequestStatus,
    createdAt: row.created_at,
    responsesCount: row.responses_count,
  }
}

function mapNotification(row: NotificationRow): MockNotification {
  return {
    id: row.id,
    userId: row.user_id,
    text: row.text,
    date: row.date,
    read: row.read,
    type: row.type as MockNotification['type'],
    link: row.link ?? undefined,
  }
}

// ============================================
// PROFILES (Users)
// ============================================

export async function getProfile(supabase: Client, uid: string): Promise<MockUser | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
  return data ? mapProfile(data) : null
}

export async function getProfileByPhone(supabase: Client, phone: string): Promise<MockUser | null> {
  const { data } = await supabase.from('profiles').select('*').eq('phone', phone).single()
  return data ? mapProfile(data) : null
}

export async function getProfileByEmail(supabase: Client, email: string): Promise<MockUser | null> {
  const { data } = await supabase.from('profiles').select('*').eq('email', email).single()
  return data ? mapProfile(data) : null
}

export async function getAllProfiles(supabase: Client): Promise<MockUser[]> {
  const { data } = await supabase.from('profiles').select('*')
  return (data ?? []).map(mapProfile)
}

export async function updateProfile(supabase: Client, uid: string, updates: Partial<MockUser>): Promise<MockUser | null> {
  const dbUpdates: ProfileUpdate = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone
  if (updates.email !== undefined) dbUpdates.email = updates.email
  if (updates.role !== undefined) dbUpdates.role = updates.role as ProfileUpdate['role']
  if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted
  if (updates.verificationLevel !== undefined) dbUpdates.verification_level = updates.verificationLevel
  if (updates.phoneVerified !== undefined) dbUpdates.phone_verified = updates.phoneVerified
  if (updates.emailVerified !== undefined) dbUpdates.email_verified = updates.emailVerified
  if (updates.inn !== undefined) dbUpdates.inn = updates.inn
  if (updates.passportScan !== undefined) dbUpdates.passport_scan = updates.passportScan
  if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName
  if (updates.licenses !== undefined) dbUpdates.licenses = updates.licenses
  if (updates.certificates !== undefined) dbUpdates.certificates = updates.certificates
  if (updates.subscription !== undefined) dbUpdates.subscription = updates.subscription as ProfileUpdate['subscription']
  if (updates.dailyAdBudget !== undefined) dbUpdates.daily_ad_budget = updates.dailyAdBudget
  if (updates.isPromoted !== undefined) dbUpdates.is_promoted = updates.isPromoted

  const { data } = await supabase.from('profiles').update(dbUpdates).eq('id', uid).select().single()
  return data ? mapProfile(data) : null
}

// ============================================
// PRODUCTS
// ============================================

export async function getAllProducts(supabase: Client, onlyPublished = false): Promise<MockProduct[]> {
  let query = supabase.from('products').select('*').order('created_at', { ascending: false })
  if (onlyPublished) {
    query = query.eq('is_published', true)
  }
  const { data } = await query
  return (data ?? []).map(mapProduct)
}

export async function getProductById(supabase: Client, id: string): Promise<MockProduct | null> {
  const { data } = await supabase.from('products').select('*').eq('id', id).single()
  return data ? mapProduct(data) : null
}

export async function getProductsBySupplierId(supabase: Client, supplierId: string): Promise<MockProduct[]> {
  const { data } = await supabase.from('products').select('*').eq('supplier_id', supplierId).order('created_at', { ascending: false })
  return (data ?? []).map(mapProduct)
}

export async function createProduct(supabase: Client, product: Partial<MockProduct>): Promise<MockProduct | null> {
  const { data } = await supabase.from('products').insert({
    supplier_id: product.supplierId!,
    supplier_name: product.supplierName ?? '',
    name: product.name ?? '',
    nomenclature_category: product.nomenclatureCategory ?? 'Товар',
    nomenclature_type: product.nomenclatureType ?? 'Материалы',
    group_id: product.groupId ?? '',
    group_name: product.groupName ?? '',
    description: product.description ?? '',
    price: product.price ?? 0,
    unit: product.unit ?? 'шт',
    region: product.region ?? 'Бишкек',
    image: product.image ?? '',
    tags: product.tags ?? [],
    characteristics: product.characteristics ?? {},
    is_published: product.isPublished ?? true,
    is_promoted: product.isPromoted ?? false,
    promotion_budget: product.promotionBudget,
    construction_stage: product.constructionStage,
  }).select().single()
  return data ? mapProduct(data) : null
}

export async function updateProduct(supabase: Client, id: string, updates: Partial<MockProduct>): Promise<MockProduct | null> {
  const dbUpdates: Record<string, unknown> = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.price !== undefined) dbUpdates.price = updates.price
  if (updates.unit !== undefined) dbUpdates.unit = updates.unit
  if (updates.region !== undefined) dbUpdates.region = updates.region
  if (updates.image !== undefined) dbUpdates.image = updates.image
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags
  if (updates.characteristics !== undefined) dbUpdates.characteristics = updates.characteristics
  if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished
  if (updates.isPromoted !== undefined) dbUpdates.is_promoted = updates.isPromoted
  if (updates.promotionBudget !== undefined) dbUpdates.promotion_budget = updates.promotionBudget
  if (updates.nomenclatureCategory !== undefined) dbUpdates.nomenclature_category = updates.nomenclatureCategory
  if (updates.nomenclatureType !== undefined) dbUpdates.nomenclature_type = updates.nomenclatureType
  if (updates.groupId !== undefined) dbUpdates.group_id = updates.groupId
  if (updates.groupName !== undefined) dbUpdates.group_name = updates.groupName
  if (updates.constructionStage !== undefined) dbUpdates.construction_stage = updates.constructionStage

  const { data } = await supabase.from('products').update(dbUpdates).eq('id', id).select().single()
  return data ? mapProduct(data) : null
}

export async function deleteProduct(supabase: Client, id: string): Promise<void> {
  await supabase.from('products').delete().eq('id', id)
}

// ============================================
// REQUESTS
// ============================================

export async function getAllRequests(supabase: Client): Promise<MockRequest[]> {
  const { data } = await supabase.from('requests').select('*').order('created_at', { ascending: false })
  return (data ?? []).map(mapRequest)
}

export async function getRequestById(supabase: Client, id: string): Promise<MockRequest | null> {
  const { data } = await supabase.from('requests').select('*').eq('id', id).single()
  return data ? mapRequest(data) : null
}

export async function createRequest(supabase: Client, req: Partial<MockRequest>): Promise<MockRequest | null> {
  const { data } = await supabase.from('requests').insert({
    author_id: req.authorId!,
    author_name: req.authorName ?? '',
    title: req.title ?? '',
    category: req.category ?? 'Товар',
    type: req.type,
    group_id: req.groupId,
    group_name: req.groupName,
    characteristics: req.characteristics,
    linked_product_id: req.linkedProductId,
    description: req.description ?? '',
    budget: req.budget ?? 0,
    quantity: req.quantity ?? 0,
    unit: req.unit ?? 'шт',
    region: req.region ?? 'Бишкек',
  }).select().single()
  return data ? mapRequest(data) : null
}

export async function updateRequest(supabase: Client, id: string, updates: Partial<MockRequest>): Promise<MockRequest | null> {
  const dbUpdates: Record<string, unknown> = {}
  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.category !== undefined) dbUpdates.category = updates.category
  if (updates.type !== undefined) dbUpdates.type = updates.type
  if (updates.groupId !== undefined) dbUpdates.group_id = updates.groupId
  if (updates.groupName !== undefined) dbUpdates.group_name = updates.groupName
  if (updates.characteristics !== undefined) dbUpdates.characteristics = updates.characteristics
  if (updates.linkedProductId !== undefined) dbUpdates.linked_product_id = updates.linkedProductId
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.budget !== undefined) dbUpdates.budget = updates.budget
  if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity
  if (updates.unit !== undefined) dbUpdates.unit = updates.unit
  if (updates.region !== undefined) dbUpdates.region = updates.region

  const { data } = await supabase.from('requests').update(dbUpdates).eq('id', id).select().single()
  return data ? mapRequest(data) : null
}

export async function updateRequestStatus(
  supabase: Client, id: string, status: RequestStatus,
  supplierId?: string, supplierName?: string
): Promise<MockRequest | null> {
  const updates: Record<string, unknown> = { status }
  if (supplierId) updates.assigned_supplier_id = supplierId
  if (supplierName) updates.assigned_supplier_name = supplierName

  const { data } = await supabase.from('requests').update(updates).eq('id', id).select().single()
  return data ? mapRequest(data) : null
}

export async function getRequestsByAuthor(supabase: Client, authorId: string): Promise<MockRequest[]> {
  const { data } = await supabase.from('requests').select('*').eq('author_id', authorId).order('created_at', { ascending: false })
  return (data ?? []).map(mapRequest)
}

export async function getRequestsForSupplier(supabase: Client): Promise<MockRequest[]> {
  const { data } = await supabase.from('requests').select('*')
    .in('status', ['OPEN', 'ASSIGNED', 'IN_PROGRESS'])
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapRequest)
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function getNotifications(supabase: Client, userId: string): Promise<MockNotification[]> {
  const { data } = await supabase.from('notifications').select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  return (data ?? []).map(mapNotification)
}

export async function createNotification(
  supabase: Client, notif: { userId: string; text: string; type: MockNotification['type']; link?: string }
): Promise<void> {
  await supabase.from('notifications').insert({
    user_id: notif.userId,
    text: notif.text,
    type: notif.type,
    link: notif.link,
  })
}

export async function markNotificationRead(supabase: Client, id: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('id', id)
}

export async function markAllNotificationsRead(supabase: Client, userId: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
}

// ============================================
// CHATS & MESSAGES
// ============================================

export async function getChats(supabase: Client, userId: string): Promise<MockChat[]> {
  const { data } = await supabase.from('chats').select('*')
    .contains('participants', [userId])
    .order('updated_at', { ascending: false })

  if (!data) return []

  const chats: MockChat[] = []
  for (const row of data) {
    const otherParticipantId = (row.participants as string[]).find(p => p !== userId)
    let otherUser = { name: 'Пользователь', role: 'consumer', avatar: '' }
    if (otherParticipantId) {
      const profile = await getProfile(supabase, otherParticipantId)
      if (profile) {
        otherUser = {
          name: profile.name,
          role: profile.role,
          avatar: `https://picsum.photos/seed/${profile.uid}/100/100`,
        }
      }
    }

    const { data: msgs } = await supabase.from('messages').select('*')
      .eq('chat_id', row.id)
      .order('timestamp', { ascending: true })

    const messages: MockChatMessage[] = (msgs ?? []).map(m => ({
      id: m.id,
      senderId: m.sender_id,
      text: m.text,
      timestamp: m.timestamp,
    }))

    chats.push({
      id: row.id,
      participants: row.participants as string[],
      messages,
      lastMessage: row.last_message,
      updatedAt: row.updated_at,
      unreadCount: row.unread_count,
      otherUser,
    })
  }
  return chats
}

export async function getChatMessages(supabase: Client, chatId: string): Promise<MockChatMessage[]> {
  const { data } = await supabase.from('messages').select('*')
    .eq('chat_id', chatId)
    .order('timestamp', { ascending: true })
  return (data ?? []).map(m => ({
    id: m.id,
    senderId: m.sender_id,
    text: m.text,
    timestamp: m.timestamp,
  }))
}

export async function sendMessage(supabase: Client, chatId: string, senderId: string, text: string): Promise<MockChatMessage | null> {
  const { data } = await supabase.from('messages').insert({
    chat_id: chatId,
    sender_id: senderId,
    text,
  }).select().single()

  if (data) {
    await supabase.from('chats').update({
      last_message: text,
      updated_at: new Date().toISOString(),
    }).eq('id', chatId)
  }

  return data ? { id: data.id, senderId: data.sender_id, text: data.text, timestamp: data.timestamp } : null
}

// ============================================
// NOMENCLATURE GROUPS
// ============================================

export async function getAllNomenclatureGroups(supabase: Client): Promise<NomenclatureGroup[]> {
  const { data } = await supabase.from('nomenclature_groups').select('*')
  return (data ?? []).map(row => ({
    id: row.id,
    category: row.category as NomenclatureGroup['category'],
    type: row.type as NomenclatureGroup['type'],
    name: row.name,
    characteristics: row.characteristics,
  }))
}

export async function createNomenclatureGroup(
  supabase: Client, group: Omit<NomenclatureGroup, 'id'>
): Promise<NomenclatureGroup | null> {
  const { data } = await supabase.from('nomenclature_groups').insert({
    category: group.category,
    type: group.type,
    name: group.name,
    characteristics: group.characteristics,
  }).select().single()
  return data ? { id: data.id, category: data.category as NomenclatureGroup['category'], type: data.type as NomenclatureGroup['type'], name: data.name, characteristics: data.characteristics } : null
}

export async function updateNomenclatureGroup(
  supabase: Client, id: string, updates: Partial<NomenclatureGroup>
): Promise<NomenclatureGroup | null> {
  const dbUpdates: Record<string, unknown> = {}
  if (updates.category !== undefined) dbUpdates.category = updates.category
  if (updates.type !== undefined) dbUpdates.type = updates.type
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.characteristics !== undefined) dbUpdates.characteristics = updates.characteristics

  const { data } = await supabase.from('nomenclature_groups').update(dbUpdates).eq('id', id).select().single()
  return data ? { id: data.id, category: data.category as NomenclatureGroup['category'], type: data.type as NomenclatureGroup['type'], name: data.name, characteristics: data.characteristics } : null
}

export async function deleteNomenclatureGroup(supabase: Client, id: string): Promise<void> {
  await supabase.from('nomenclature_groups').delete().eq('id', id)
}

// ============================================
// DASHBOARD METRICS
// ============================================

export async function getSupplierDashboard(supabase: Client, supplierId: string) {
  const profile = await getProfile(supabase, supplierId)
  return {
    pageViews: profile?.pageViews ?? 0,
    chatRequests: profile?.chatRequests ?? 0,
    completedOrders: profile?.completedOrders ?? 0,
    revenue: profile?.revenue ?? 0,
    weeklyOrders: [
      { day: 'Пн', orders: 0, revenue: 0 },
      { day: 'Вт', orders: 0, revenue: 0 },
      { day: 'Ср', orders: 0, revenue: 0 },
      { day: 'Чт', orders: 0, revenue: 0 },
      { day: 'Пт', orders: 0, revenue: 0 },
      { day: 'Сб', orders: 0, revenue: 0 },
      { day: 'Вс', orders: 0, revenue: 0 },
    ],
  }
}
