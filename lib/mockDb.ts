// ==========================================
// VERIFICATION CONFIG
// ==========================================
// Set to `true` to enable real verification (SMS/email APIs, etc.)
// When `false`, all verification steps are instantly approved (mock mode)
export const VERIFICATION_CONFIG = {
  useMock: true, // false = real verification (connect real APIs)
  mockOtpCode: '1234', // OTP code accepted in mock mode
  mockDelay: 800, // simulated network delay (ms)
};

// ==========================================
// NOMENCLATURE STRUCTURE
// ==========================================

// Категория → Вид → Группа → Наименование
export type NomenclatureCategory = 'Товар' | 'Услуга';

export type NomenclatureType = 
  | 'Инструменты' | 'Материалы' | 'Оборудование'
  | 'Архитектурные' | 'Строительные' | 'Отделочные' | 'Аренда';

export interface NomenclatureGroup {
  id: string;
  category: NomenclatureCategory;
  type: NomenclatureType;
  name: string;
  characteristics: string[]; // field names specific to this group
}

export const nomenclatureGroups: NomenclatureGroup[] = [
  // Товар → Материалы
  { id: 'grp-1', category: 'Товар', type: 'Материалы', name: 'Бетон', characteristics: ['Марка', 'Класс прочности', 'Морозостойкость'] },
  { id: 'grp-2', category: 'Товар', type: 'Материалы', name: 'Арматура', characteristics: ['Класс стали', 'Диаметр (мм)', 'Длина (м)'] },
  { id: 'grp-3', category: 'Товар', type: 'Материалы', name: 'Пиломатериалы', characteristics: ['Порода дерева', 'Сечение (мм)', 'Сорт'] },
  { id: 'grp-4', category: 'Товар', type: 'Материалы', name: 'Кирпич', characteristics: ['Тип', 'Марка прочности', 'Размер'] },
  { id: 'grp-5', category: 'Товар', type: 'Материалы', name: 'Цемент', characteristics: ['Марка', 'Фасовка (кг)', 'Тип'] },
  { id: 'grp-6', category: 'Товар', type: 'Материалы', name: 'Песок и щебень', characteristics: ['Фракция (мм)', 'Тип', 'Происхождение'] },
  { id: 'grp-7', category: 'Товар', type: 'Материалы', name: 'Кровельные материалы', characteristics: ['Тип', 'Толщина (мм)', 'Цвет'] },
  { id: 'grp-8', category: 'Товар', type: 'Материалы', name: 'Утеплители', characteristics: ['Тип', 'Толщина (мм)', 'Плотность (кг/м³)'] },
  // Товар → Инструменты
  { id: 'grp-9', category: 'Товар', type: 'Инструменты', name: 'Ручной инструмент', characteristics: ['Тип', 'Материал', 'Размер'] },
  { id: 'grp-10', category: 'Товар', type: 'Инструменты', name: 'Электроинструмент', characteristics: ['Мощность (Вт)', 'Тип питания', 'Бренд'] },
  // Товар → Оборудование
  { id: 'grp-11', category: 'Товар', type: 'Оборудование', name: 'Бетонное оборудование', characteristics: ['Тип', 'Производительность', 'Мощность'] },
  { id: 'grp-12', category: 'Товар', type: 'Оборудование', name: 'Строительные леса', characteristics: ['Тип', 'Высота (м)', 'Материал'] },
  // Услуга → Архитектурные
  { id: 'grp-13', category: 'Услуга', type: 'Архитектурные', name: 'Проектирование', characteristics: ['Тип проекта', 'Площадь (м²)', 'Этажность'] },
  { id: 'grp-14', category: 'Услуга', type: 'Архитектурные', name: 'Геодезия', characteristics: ['Тип работ', 'Площадь участка'] },
  // Услуга → Строительные
  { id: 'grp-15', category: 'Услуга', type: 'Строительные', name: 'Фундаментные работы', characteristics: ['Тип фундамента', 'Объем (м³)'] },
  { id: 'grp-16', category: 'Услуга', type: 'Строительные', name: 'Кладочные работы', characteristics: ['Тип кладки', 'Объем (м²)'] },
  { id: 'grp-17', category: 'Услуга', type: 'Строительные', name: 'Монтажные работы', characteristics: ['Тип конструкции', 'Объем'] },
  // Услуга → Отделочные
  { id: 'grp-18', category: 'Услуга', type: 'Отделочные', name: 'Штукатурные работы', characteristics: ['Тип штукатурки', 'Площадь (м²)'] },
  { id: 'grp-19', category: 'Услуга', type: 'Отделочные', name: 'Малярные работы', characteristics: ['Тип покрытия', 'Площадь (м²)'] },
  // Услуга → Аренда
  { id: 'grp-20', category: 'Услуга', type: 'Аренда', name: 'Аренда спецтехники', characteristics: ['Тип техники', 'Мощность', 'С оператором'] },
  { id: 'grp-21', category: 'Услуга', type: 'Аренда', name: 'Аренда инструментов', characteristics: ['Тип инструмента', 'Срок аренды'] },
];

// Этапы строительства — для фильтрации
export const constructionStages = [
  'Проектирование',
  'Геодезия',
  'Фундамент',
  'Каркас и стены',
  'Кровля',
  'Инженерные сети',
  'Отделка',
  'Благоустройство',
];

// ==========================================
// USER MODEL
// ==========================================

export type UserRole = 'consumer' | 'supplier' | 'developer' | 'admin';
export type SubscriptionTier = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

// Verification levels:
// 0 — ничего не подтверждено
// 1 — подтвержден телефон И почта
// 2 — паспортные данные (ИНН, скан)
// 3 — лицензии и сертификаты (для supplier/developer)
export type VerificationLevel = 0 | 1 | 2 | 3;

export interface MockUser {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role: UserRole;
  onboardingCompleted: boolean;
  createdAt: string;
  verificationLevel: VerificationLevel;
  phoneVerified: boolean;
  emailVerified: boolean;
  inn?: string;
  passportScan?: string;
  companyName?: string;
  licenses?: string[];
  certificates?: string[];
  subscription: SubscriptionTier;
  // dashboard stats (supplier)
  pageViews?: number;
  chatRequests?: number;
  completedOrders?: number;
  revenue?: number;
  // promotion
  dailyAdBudget?: number; // сом/день
  isPromoted?: boolean;
}

export const mockUsers: MockUser[] = [
  {
    uid: 'admin-123',
    name: 'Администратор',
    phone: '+996555000000',
    email: 'admin@stroy.kg',
    password: 'admin',
    role: 'admin',
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    verificationLevel: 3,
    phoneVerified: true,
    emailVerified: true,
    subscription: 'ENTERPRISE',
  },
  {
    uid: 'supplier-123',
    name: 'ОсОО СтройМастер',
    phone: '+996555111111',
    email: 'stroymaster@mail.kg',
    role: 'supplier',
    companyName: 'ОсОО СтройМастер',
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    verificationLevel: 3,
    phoneVerified: true,
    emailVerified: true,
    inn: '12345678901234',
    licenses: ['СРО-1234'],
    subscription: 'PRO',
    pageViews: 1247,
    chatRequests: 38,
    completedOrders: 24,
    revenue: 3450000,
    dailyAdBudget: 10,
    isPromoted: true,
  },
  {
    uid: 'supplier-124',
    name: 'СеверЛес Экспорт',
    phone: '+996555111222',
    email: 'severles@mail.kg',
    role: 'supplier',
    companyName: 'СеверЛес Экспорт',
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    verificationLevel: 2,
    phoneVerified: true,
    emailVerified: true,
    inn: '98765432101234',
    subscription: 'BASIC',
    pageViews: 540,
    chatRequests: 12,
    completedOrders: 8,
    revenue: 1200000,
  },
  {
    uid: 'consumer-123',
    name: 'Иван Иванов',
    phone: '+996555222222',
    email: 'ivan@mail.kg',
    role: 'consumer',
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    verificationLevel: 2,
    phoneVerified: true,
    emailVerified: true,
    inn: '11223344556677',
    subscription: 'FREE',
  },
  {
    uid: 'consumer-124',
    name: 'ИП Смаилов',
    phone: '+996555222333',
    role: 'developer',
    companyName: 'ИП Смаилов',
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    verificationLevel: 2,
    phoneVerified: true,
    emailVerified: false,
    inn: '55667788990011',
    subscription: 'BASIC',
  },
];

// In-memory store
let users = [...mockUsers];

export const getMockUser = (phone: string) => {
  return users.find(u => u.phone === phone) || null;
};

export const getMockUserByEmail = (email: string) => {
  return users.find(u => u.email === email) || null;
};

export const createMockUser = (phone: string, role: UserRole = 'consumer') => {
  const newUser: MockUser = {
    uid: `user-${Date.now()}`,
    name: '',
    phone,
    role,
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
    verificationLevel: 0,
    phoneVerified: true, // phone is verified via OTP during registration
    emailVerified: false,
    subscription: 'FREE',
  };
  users.push(newUser);
  return newUser;
};

export const updateMockUser = (uid: string, data: Partial<MockUser>) => {
  const index = users.findIndex(u => u.uid === uid);
  if (index !== -1) {
    users[index] = { ...users[index], ...data };
    // Recalculate verification level
    users[index].verificationLevel = calcVerificationLevel(users[index]);
    return users[index];
  }
  return null;
};

export function calcVerificationLevel(u: MockUser): VerificationLevel {
  // Level 3: licenses/certificates (supplier/developer only)
  if ((u.role === 'supplier' || u.role === 'developer') && u.licenses && u.licenses.length > 0) return 3;
  // Level 2: passport/INN data
  if (u.inn) return 2;
  // Level 1: phone AND email verified
  if (u.phoneVerified && u.emailVerified) return 1;
  return 0;
}

export const getAllMockUsers = () => {
  return [...users];
};

// ==========================================
// PRODUCTS (Nomenclature-based)
// ==========================================

export interface MockProduct {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string; // наименование — задается поставщиком
  nomenclatureCategory: NomenclatureCategory; // Товар / Услуга
  nomenclatureType: NomenclatureType;
  groupId: string;
  groupName: string;
  description: string;
  price: number;
  unit: string;
  region: string;
  rating: number;
  image: string;
  tags: string[];
  characteristics: Record<string, string>;
  isTop: boolean;
  isNew?: boolean;
  isPublished: boolean; // галочка "опубликовано на доску"
  isPromoted: boolean; // продвигать (реклама)
  promotionBudget?: number; // бюджет в день (1-20 сом)
  constructionStage?: string; // этап строительства
  createdAt: string;
}

export const mockProducts: MockProduct[] = [
  {
    id: 'prod-1',
    supplierId: 'supplier-123',
    supplierName: 'ОсОО СтройМастер',
    name: 'Бетон М300',
    nomenclatureCategory: 'Товар',
    nomenclatureType: 'Материалы',
    groupId: 'grp-1',
    groupName: 'Бетон',
    description: 'Высококачественный бетон М300 для фундаментов и перекрытий.',
    price: 4500,
    unit: 'м³',
    region: 'Бишкек',
    rating: 4.9,
    image: 'https://picsum.photos/seed/concrete/600/400',
    tags: ['Бетон', 'Фундамент'],
    characteristics: { 'Марка': 'М300', 'Класс прочности': 'B22.5', 'Морозостойкость': 'F200' },
    isTop: true,
    isPublished: true,
    isPromoted: true,
    promotionBudget: 15,
    constructionStage: 'Фундамент',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'prod-2',
    supplierId: 'supplier-124',
    supplierName: 'СеверЛес Экспорт',
    name: 'Брус хвойный 150x150',
    nomenclatureCategory: 'Товар',
    nomenclatureType: 'Материалы',
    groupId: 'grp-3',
    groupName: 'Пиломатериалы',
    description: 'Пиломатериалы хвойных пород, первый сорт. Доставка по всему Кыргызстану.',
    price: 22000,
    unit: 'м³',
    region: 'Ош',
    rating: 4.7,
    image: 'https://picsum.photos/seed/wood/600/400',
    tags: ['Пиломатериалы', 'Брус', 'Дерево'],
    characteristics: { 'Порода дерева': 'Ель', 'Сечение (мм)': '150x150', 'Сорт': '1-й сорт' },
    isTop: false,
    isPublished: true,
    isPromoted: false,
    constructionStage: 'Каркас и стены',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'prod-3',
    supplierId: 'supplier-123',
    supplierName: 'ОсОО СтройМастер',
    name: 'Кирпич жженый М150',
    nomenclatureCategory: 'Товар',
    nomenclatureType: 'Материалы',
    groupId: 'grp-4',
    groupName: 'Кирпич',
    description: 'Красный жженый кирпич высокой прочности от прямого производителя.',
    price: 12,
    unit: 'шт',
    region: 'Бишкек',
    rating: 5.0,
    image: 'https://picsum.photos/seed/bricks/600/400',
    tags: ['Кирпич', 'Стеновой материал'],
    characteristics: { 'Тип': 'Жженый', 'Марка прочности': 'М150', 'Размер': '250x120x65' },
    isTop: false,
    isNew: true,
    isPublished: true,
    isPromoted: false,
    constructionStage: 'Каркас и стены',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'prod-4',
    supplierId: 'supplier-123',
    supplierName: 'ОсОО СтройМастер',
    name: 'Аренда экскаватора JCB',
    nomenclatureCategory: 'Услуга',
    nomenclatureType: 'Аренда',
    groupId: 'grp-20',
    groupName: 'Аренда спецтехники',
    description: 'Услуги экскаватора-погрузчика с опытным оператором.',
    price: 2500,
    unit: 'час',
    region: 'Бишкек',
    rating: 4.8,
    image: 'https://picsum.photos/seed/excavator/600/400',
    tags: ['Спецтехника', 'Земляные работы'],
    characteristics: { 'Тип техники': 'Экскаватор-погрузчик', 'Мощность': '95 л.с.', 'С оператором': 'Да' },
    isTop: true,
    isPublished: true,
    isPromoted: true,
    promotionBudget: 20,
    constructionStage: 'Фундамент',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'prod-5',
    supplierId: 'supplier-124',
    supplierName: 'СеверЛес Экспорт',
    name: 'Утеплитель минплита 100мм',
    nomenclatureCategory: 'Товар',
    nomenclatureType: 'Материалы',
    groupId: 'grp-8',
    groupName: 'Утеплители',
    description: 'Минеральная плита для утепления стен и кровли. Плотность 50 кг/м³.',
    price: 450,
    unit: 'м²',
    region: 'Бишкек',
    rating: 4.6,
    image: 'https://picsum.photos/seed/insulation/600/400',
    tags: ['Утеплитель', 'Теплоизоляция'],
    characteristics: { 'Тип': 'Минеральная вата', 'Толщина (мм)': '100', 'Плотность (кг/м³)': '50' },
    isTop: false,
    isNew: true,
    isPublished: true,
    isPromoted: false,
    constructionStage: 'Кровля',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'prod-6',
    supplierId: 'supplier-123',
    supplierName: 'ОсОО СтройМастер',
    name: 'Проектирование жилого дома',
    nomenclatureCategory: 'Услуга',
    nomenclatureType: 'Архитектурные',
    groupId: 'grp-13',
    groupName: 'Проектирование',
    description: 'Полный архитектурный проект жилого дома до 300 м². Включает чертежи, 3D визуализацию и СМР.',
    price: 150000,
    unit: 'проект',
    region: 'Бишкек',
    rating: 4.9,
    image: 'https://picsum.photos/seed/architecture/600/400',
    tags: ['Проект', 'Архитектура', 'Чертежи'],
    characteristics: { 'Тип проекта': 'Жилой дом', 'Площадь (м²)': 'до 300', 'Этажность': '1-3' },
    isTop: true,
    isPublished: true,
    isPromoted: true,
    promotionBudget: 10,
    constructionStage: 'Проектирование',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

// ==========================================
// REQUESTS / ЗАЯВКИ
// ==========================================

export type RequestStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface MockRequest {
  id: string;
  authorId: string;
  authorName: string;
  assignedSupplierId?: string;
  assignedSupplierName?: string;
  title: string;
  category: NomenclatureCategory;
  type?: NomenclatureType;
  description: string;
  budget: number;
  quantity: number;
  unit: string;
  region: string;
  status: RequestStatus;
  createdAt: string;
  responsesCount: number;
}

export const mockRequests: MockRequest[] = [
  {
    id: 'req-1',
    authorId: 'consumer-123',
    authorName: 'Иван Иванов',
    title: 'Требуется поставка бетона М400 для ЖК "Северный Ветер"',
    category: 'Товар',
    type: 'Материалы',
    description: 'Объем 450 м³. График заливки с 15 по 20 число месяца. Рассматриваем поставщиков с собственным автопарком миксеров.',
    budget: 2000000,
    quantity: 450,
    unit: 'м³',
    region: 'Бишкек',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    responsesCount: 6,
  },
  {
    id: 'req-2',
    authorId: 'consumer-124',
    authorName: 'ИП Смаилов',
    title: 'Бригада каменщиков на черновую кладку',
    category: 'Услуга',
    type: 'Строительные',
    description: 'Требуется бригада из 5-6 человек для кладки жженого кирпича. Объем работы большой, оплата сдельная каждые 2 недели.',
    budget: 500000,
    quantity: 1,
    unit: 'объект',
    region: 'Ош',
    status: 'ASSIGNED',
    assignedSupplierId: 'supplier-123',
    assignedSupplierName: 'ОсОО СтройМастер',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    responsesCount: 2,
  },
  {
    id: 'req-3',
    authorId: 'consumer-123',
    authorName: 'Иван Иванов',
    title: 'Арматура А500С 12мм',
    category: 'Товар',
    type: 'Материалы',
    description: 'Нужна арматура для фундамента частного дома. Желательно с доставкой.',
    budget: 850000,
    quantity: 12,
    unit: 'тонн',
    region: 'Бишкек',
    status: 'IN_PROGRESS',
    assignedSupplierId: 'supplier-124',
    assignedSupplierName: 'СеверЛес Экспорт',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    responsesCount: 6,
  },
  {
    id: 'req-4',
    authorId: 'consumer-123',
    authorName: 'Иван Иванов',
    title: 'Проект жилого дома 200м²',
    category: 'Услуга',
    type: 'Архитектурные',
    description: 'Нужен полный архитектурный проект 2-этажного дома. Общая площадь около 200м².',
    budget: 180000,
    quantity: 1,
    unit: 'проект',
    region: 'Бишкек',
    status: 'COMPLETED',
    assignedSupplierId: 'supplier-123',
    assignedSupplierName: 'ОсОО СтройМастер',
    createdAt: new Date(Date.now() - 168 * 3600000).toISOString(),
    responsesCount: 4,
  },
];

// ==========================================
// NOTIFICATIONS
// ==========================================

export interface MockNotification {
  id: string;
  userId: string;
  text: string;
  date: string;
  read: boolean;
  type: 'request' | 'response' | 'system' | 'verification' | 'chat';
  link?: string;
}

export const mockNotifications: MockNotification[] = [
  { id: 'notif-1', userId: 'supplier-123', text: 'Новая заявка на бетон в вашем регионе!', date: new Date().toISOString(), read: false, type: 'request', link: '/create' },
  { id: 'notif-2', userId: 'consumer-123', text: 'Поставщик ОсОО СтройМастер откликнулся на вашу заявку.', date: new Date().toISOString(), read: false, type: 'response', link: '/create' },
  { id: 'notif-3', userId: 'consumer-123', text: 'Ваша заявка "Арматура А500С 12мм" переведена в статус "В обработке".', date: new Date(Date.now() - 3600000).toISOString(), read: true, type: 'system' },
  { id: 'notif-4', userId: 'consumer-123', text: 'Подтвердите вашу почту для повышения уровня верификации.', date: new Date(Date.now() - 86400000).toISOString(), read: false, type: 'verification', link: '/profile' },
  { id: 'notif-5', userId: 'supplier-123', text: 'Ваш товар "Бетон М300" набрал 100 просмотров!', date: new Date(Date.now() - 43200000).toISOString(), read: true, type: 'system' },
  { id: 'notif-6', userId: 'supplier-123', text: 'Новое сообщение от Иван Иванов', date: new Date(Date.now() - 1800000).toISOString(), read: false, type: 'chat', link: '/chats' },
];

// ==========================================
// CHATS
// ==========================================

export interface MockChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface MockChat {
  id: string;
  participants: string[];
  messages: MockChatMessage[];
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
  otherUser: { name: string; role: string; avatar: string };
}

export const mockChats: MockChat[] = [
  { 
    id: 'chat-1', 
    participants: ['consumer-123', 'supplier-123'], 
    messages: [
      { id: 'msg-1', senderId: 'consumer-123', text: 'Здравствуйте! Меня интересует бетон М300. Какие условия доставки?', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: 'msg-2', senderId: 'supplier-123', text: 'Здравствуйте! Доставка миксером по Бишкеку — бесплатно от 10 м³.', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'msg-3', senderId: 'supplier-123', text: 'Готов поставить бетон. Какая марка нужна?', timestamp: new Date().toISOString() },
    ],
    lastMessage: 'Готов поставить бетон. Какая марка нужна?', 
    updatedAt: new Date().toISOString(), 
    unreadCount: 1, 
    otherUser: { name: 'ОсОО СтройМастер', role: 'supplier', avatar: 'https://picsum.photos/seed/supplier1/100/100' } 
  },
  { 
    id: 'chat-2', 
    participants: ['consumer-123', 'supplier-124'], 
    messages: [
      { id: 'msg-4', senderId: 'consumer-123', text: 'Добрый день, доставка бруса входит в стоимость?', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: 'msg-5', senderId: 'supplier-124', text: 'Да, доставка включена в стоимость.', timestamp: new Date(Date.now() - 3600000).toISOString() },
    ],
    lastMessage: 'Да, доставка включена в стоимость.', 
    updatedAt: new Date(Date.now() - 3600000).toISOString(), 
    unreadCount: 0, 
    otherUser: { name: 'СеверЛес Экспорт', role: 'supplier', avatar: 'https://picsum.photos/seed/supplier2/100/100' } 
  },
  { 
    id: 'chat-3', 
    participants: ['supplier-123', 'consumer-124'], 
    messages: [
      { id: 'msg-6', senderId: 'consumer-124', text: 'Здравствуйте, нам нужна бригада каменщиков.', timestamp: new Date(Date.now() - 172800000).toISOString() },
      { id: 'msg-7', senderId: 'supplier-123', text: 'Можем предложить бригаду из 6 человек.', timestamp: new Date(Date.now() - 90000000).toISOString() },
      { id: 'msg-8', senderId: 'consumer-124', text: 'Спасибо, ждем счет на оплату.', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ],
    lastMessage: 'Спасибо, ждем счет на оплату.', 
    updatedAt: new Date(Date.now() - 86400000).toISOString(), 
    unreadCount: 0, 
    otherUser: { name: 'ИП Смаилов', role: 'consumer', avatar: 'https://picsum.photos/seed/consumer1/100/100' } 
  }
];

// ==========================================
// DASHBOARD METRICS (for suppliers)
// ==========================================

export interface DashboardMetrics {
  pageViews: number;
  chatRequests: number;
  completedOrders: number;
  revenue: number;
  // Weekly histogram data
  weeklyOrders: { day: string; orders: number; revenue: number }[];
}

export function getSupplierDashboard(supplierId: string): DashboardMetrics {
  const supplier = users.find(u => u.uid === supplierId);
  return {
    pageViews: supplier?.pageViews ?? 0,
    chatRequests: supplier?.chatRequests ?? 0,
    completedOrders: supplier?.completedOrders ?? 0,
    revenue: supplier?.revenue ?? 0,
    weeklyOrders: [
      { day: 'Пн', orders: 3, revenue: 450000 },
      { day: 'Вт', orders: 5, revenue: 720000 },
      { day: 'Ср', orders: 2, revenue: 280000 },
      { day: 'Чт', orders: 7, revenue: 950000 },
      { day: 'Пт', orders: 4, revenue: 510000 },
      { day: 'Сб', orders: 1, revenue: 180000 },
      { day: 'Вс', orders: 2, revenue: 360000 },
    ],
  };
}

// ==========================================
// SUBSCRIPTION TIERS
// ==========================================

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number; // сом/мес
  features: string[];
  maxProducts: number;
  maxPromotionBudget: number;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  { tier: 'FREE', name: 'Бесплатный', price: 0, features: ['До 5 товаров', 'Базовый профиль', 'Чат с покупателями'], maxProducts: 5, maxPromotionBudget: 0 },
  { tier: 'BASIC', name: 'Базовый', price: 990, features: ['До 20 товаров', 'Расширенный профиль', 'Аналитика просмотров', 'Продвижение до 5 сом/день'], maxProducts: 20, maxPromotionBudget: 5 },
  { tier: 'PRO', name: 'Профессионал', price: 2990, features: ['До 100 товаров', 'Полная аналитика', 'Приоритет в каталоге', 'Продвижение до 15 сом/день', 'Значок TOP'], maxProducts: 100, maxPromotionBudget: 15 },
  { tier: 'ENTERPRISE', name: 'Корпоративный', price: 9990, features: ['Безлимит товаров', 'Персональный менеджер', 'API интеграция', 'Продвижение до 20 сом/день', 'Баннерная реклама'], maxProducts: Infinity, maxPromotionBudget: 20 },
];

// ==========================================
// IN-MEMORY STORES
// ==========================================

let products = [...mockProducts];
let requests = [...mockRequests];
let notifications = [...mockNotifications];
let chats = [...mockChats];

// ==========================================
// Product CRUD
// ==========================================

export const getAllMockProducts = (onlyPublished = false) => {
  if (onlyPublished) return products.filter(p => p.isPublished);
  return [...products];
};

export const getProductById = (id: string): MockProduct | null => {
  return products.find(p => p.id === id) || null;
};

export const getProductsBySupplierId = (supplierId: string) => {
  return products.filter(p => p.supplierId === supplierId);
};

export const createMockProduct = (data: Partial<MockProduct>): MockProduct => {
  const newProd: MockProduct = {
    id: `prod-${Date.now()}`,
    supplierId: '',
    supplierName: '',
    name: '',
    nomenclatureCategory: 'Товар',
    nomenclatureType: 'Материалы',
    groupId: '',
    groupName: '',
    description: '',
    price: 0,
    unit: 'шт',
    region: 'Бишкек',
    rating: 0,
    image: `https://picsum.photos/seed/${Date.now()}/600/400`,
    tags: [],
    characteristics: {},
    isTop: false,
    isNew: true,
    isPublished: true,
    isPromoted: false,
    createdAt: new Date().toISOString(),
    ...data,
  };
  products.unshift(newProd);
  return newProd;
};

export const updateMockProduct = (id: string, data: Partial<MockProduct>) => {
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...data };
    return products[index];
  }
  return null;
};

export const deleteMockProduct = (id: string) => {
  products = products.filter(p => p.id !== id);
};

// ==========================================
// Request CRUD
// ==========================================

export const getAllMockRequests = () => [...requests];

export const createMockRequest = (data: Partial<MockRequest>): MockRequest => {
  const newReq: MockRequest = {
    id: `req-${Date.now()}`,
    authorId: '',
    authorName: '',
    title: '',
    category: 'Товар',
    description: '',
    budget: 0,
    quantity: 0,
    unit: 'шт',
    region: 'Бишкек',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    responsesCount: 0,
    ...data,
  };
  requests.unshift(newReq);

  // Create notification for suppliers
  createMockNotification({
    userId: 'supplier-123',
    text: `Новая заявка: "${newReq.title}"`,
    type: 'request',
    link: '/create',
  });

  return newReq;
};

export const updateRequestStatus = (id: string, status: RequestStatus, supplierId?: string, supplierName?: string) => {
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index] = { 
      ...requests[index], 
      status,
      ...(supplierId && { assignedSupplierId: supplierId }),
      ...(supplierName && { assignedSupplierName: supplierName }),
    };

    // Notify author
    const statusLabels: Record<RequestStatus, string> = {
      'OPEN': 'Открыта',
      'ASSIGNED': 'Назначен продавец',
      'IN_PROGRESS': 'В обработке',
      'COMPLETED': 'Выполнена',
      'REJECTED': 'Отказано',
    };
    createMockNotification({
      userId: requests[index].authorId,
      text: `Заявка "${requests[index].title}" — ${statusLabels[status]}`,
      type: 'system',
      link: '/create',
    });

    return requests[index];
  }
  return null;
};

export const getMockRequestsByAuthor = (authorId: string) => {
  return requests.filter(r => r.authorId === authorId);
};

export const getMockRequestsForSupplier = () => {
  // Suppliers see requests they can process
  return requests.filter(r => r.status === 'OPEN' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS');
};

// ==========================================
// Notifications
// ==========================================

export const getMockNotifications = (userId: string) => {
  return notifications.filter(n => n.userId === userId).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const createMockNotification = (data: Partial<MockNotification>) => {
  const notif: MockNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: '',
    text: '',
    date: new Date().toISOString(),
    read: false,
    type: 'system',
    ...data,
  };
  notifications.push(notif);
  return notif;
};

export const markNotificationAsRead = (id: string) => {
  const notif = notifications.find(n => n.id === id);
  if (notif) notif.read = true;
};

export const markAllNotificationsRead = (userId: string) => {
  notifications.forEach(n => { if (n.userId === userId) n.read = true; });
};

// ==========================================
// Chats
// ==========================================

export const getMockChats = (userId: string) => {
  return chats.filter(c => c.participants.includes(userId)).map(chat => {
    const otherParticipantId = chat.participants.find(p => p !== userId);
    const otherUserDb = users.find(u => u.uid === otherParticipantId);
    return {
      ...chat,
      otherUser: otherUserDb ? { name: otherUserDb.name, role: otherUserDb.role, avatar: `https://picsum.photos/seed/${otherUserDb.uid}/100/100` } : chat.otherUser
    };
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const getChatMessages = (chatId: string): MockChatMessage[] => {
  const chat = chats.find(c => c.id === chatId);
  return chat?.messages ?? [];
};

export const sendChatMessage = (chatId: string, senderId: string, text: string) => {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return null;
  const msg: MockChatMessage = {
    id: `msg-${Date.now()}`,
    senderId,
    text,
    timestamp: new Date().toISOString(),
  };
  chat.messages.push(msg);
  chat.lastMessage = text;
  chat.updatedAt = msg.timestamp;

  // Notify other participant
  const otherId = chat.participants.find(p => p !== senderId);
  const sender = users.find(u => u.uid === senderId);
  if (otherId) {
    createMockNotification({
      userId: otherId,
      text: `Новое сообщение от ${sender?.name || 'Пользователь'}`,
      type: 'chat',
      link: '/chats',
    });
  }
  return msg;
};

// ==========================================
// Helpers
// ==========================================

export const getStatusLabel = (status: RequestStatus): string => {
  const labels: Record<RequestStatus, string> = {
    'OPEN': 'Открыта',
    'ASSIGNED': 'Назначен продавец',
    'IN_PROGRESS': 'В обработке',
    'COMPLETED': 'Выполнена',
    'REJECTED': 'Отказано',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: RequestStatus): string => {
  const colors: Record<RequestStatus, string> = {
    'OPEN': 'bg-blue-100 text-blue-700',
    'ASSIGNED': 'bg-amber-100 text-amber-700',
    'IN_PROGRESS': 'bg-primary/10 text-primary',
    'COMPLETED': 'bg-success/10 text-success',
    'REJECTED': 'bg-danger/10 text-danger',
  };
  return colors[status] || 'bg-slate-100 text-slate-600';
};

export const getVerificationLabel = (level: VerificationLevel): string => {
  const labels: Record<VerificationLevel, string> = {
    0: 'Не верифицирован',
    1: 'Базовая верификация',
    2: 'Паспортные данные',
    3: 'Полная верификация',
  };
  return labels[level];
};

export const getVerificationColor = (level: VerificationLevel): string => {
  const colors: Record<VerificationLevel, string> = {
    0: 'bg-slate-100 text-slate-500',
    1: 'bg-blue-100 text-blue-600',
    2: 'bg-amber-100 text-amber-700',
    3: 'bg-success/10 text-success',
  };
  return colors[level];
};

// ==========================================
// MOCK VERIFICATION FUNCTIONS
// ==========================================
// These simulate verification steps. When VERIFICATION_CONFIG.useMock is false,
// replace the implementations with real API calls.

export async function sendPhoneOtp(phone: string): Promise<boolean> {
  if (VERIFICATION_CONFIG.useMock) {
    await new Promise(r => setTimeout(r, VERIFICATION_CONFIG.mockDelay));
    return true; // always succeeds in mock mode
  }
  // TODO: Replace with real SMS API (e.g., Nikita SMS, Twilio)
  throw new Error('Real phone verification not configured');
}

export async function verifyPhoneOtp(phone: string, code: string): Promise<boolean> {
  if (VERIFICATION_CONFIG.useMock) {
    await new Promise(r => setTimeout(r, VERIFICATION_CONFIG.mockDelay));
    return code === VERIFICATION_CONFIG.mockOtpCode;
  }
  // TODO: Replace with real OTP verification API
  throw new Error('Real phone verification not configured');
}

export async function sendEmailVerification(email: string): Promise<boolean> {
  if (VERIFICATION_CONFIG.useMock) {
    await new Promise(r => setTimeout(r, VERIFICATION_CONFIG.mockDelay));
    return true;
  }
  // TODO: Replace with real email verification (e.g., SendGrid, Mailgun)
  throw new Error('Real email verification not configured');
}

export async function verifyEmail(email: string, code: string): Promise<boolean> {
  if (VERIFICATION_CONFIG.useMock) {
    await new Promise(r => setTimeout(r, VERIFICATION_CONFIG.mockDelay));
    return code === VERIFICATION_CONFIG.mockOtpCode;
  }
  // TODO: Replace with real email verification API
  throw new Error('Real email verification not configured');
}

export async function submitInnVerification(uid: string, inn: string): Promise<boolean> {
  if (VERIFICATION_CONFIG.useMock) {
    await new Promise(r => setTimeout(r, VERIFICATION_CONFIG.mockDelay));
    // In mock mode: auto-approve INN
    updateMockUser(uid, { inn, passportScan: 'mock-scan.pdf' });
    return true;
  }
  // TODO: Replace with real INN/passport verification service
  throw new Error('Real INN verification not configured');
}

export async function submitLicenseVerification(uid: string, license: string): Promise<boolean> {
  if (VERIFICATION_CONFIG.useMock) {
    await new Promise(r => setTimeout(r, VERIFICATION_CONFIG.mockDelay));
    const user = users.find(u => u.uid === uid);
    const currentLicenses = user?.licenses || [];
    updateMockUser(uid, { licenses: [...currentLicenses, license] });
    return true;
  }
  // TODO: Replace with real license verification
  throw new Error('Real license verification not configured');
}
