export interface MockUser {
  uid: string;
  name: string;
  phone: string;
  password?: string;
  role: string;
  onboardingCompleted: boolean;
  createdAt: string;
  verificationStatus?: string;
}

export const mockUsers: MockUser[] = [
  {
    uid: 'admin-123',
    name: 'Администратор',
    phone: '+996555000000',
    password: 'admin', // Default password for admin
    role: 'admin',
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'supplier-123',
    name: 'ОсОО СтройМастер',
    phone: '+996555111111',
    role: 'supplier',
    verificationStatus: 'VERIFIED',
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'consumer-123',
    name: 'Иван Иванов',
    phone: '+996555222222',
    role: 'consumer',
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
  }
];

// In-memory store
let users = [...mockUsers];

export const getMockUser = (phone: string) => {
  return users.find(u => u.phone === phone) || null;
};

export const createMockUser = (phone: string, role: string = 'consumer') => {
  const newUser = {
    uid: `user-${Date.now()}`,
    name: 'Новый Пользователь',
    phone,
    role,
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
    verificationStatus: role === 'supplier' ? 'PENDING' : undefined,
  };
  users.push(newUser);
  return newUser;
};

export const updateMockUser = (uid: string, data: any) => {
  const index = users.findIndex(u => u.uid === uid);
  if (index !== -1) {
    users[index] = { ...users[index], ...data };
    return users[index];
  }
  return null;
};

export const getAllMockUsers = () => {
  return [...users];
};

export const mockProducts = [
  {
    id: 'prod-1',
    supplierId: 'supplier-123',
    supplierName: 'БетонПромСтрой',
    name: 'Бетон М300',
    category: 'Материалы',
    description: 'Высококачественный бетон М300 для фундаментов и перекрытий.',
    price: 4500,
    unit: 'м³',
    region: 'Бишкек',
    rating: 4.9,
    image: 'https://picsum.photos/seed/concrete/600/400',
    tags: ['Бетон', 'Фундамент'],
    isTop: true,
  },
  {
    id: 'prod-2',
    supplierId: 'supplier-124',
    supplierName: 'СеверЛес Экспорт',
    name: 'Брус хвойный 150x150',
    category: 'Материалы',
    description: 'Пиломатериалы хвойных пород, первый сорт. Доставка по всему Кыргызстану.',
    price: 22000,
    unit: 'м³',
    region: 'Ош',
    rating: 4.7,
    image: 'https://picsum.photos/seed/wood/600/400',
    tags: ['Пиломатериалы', 'Брус', 'Дерево'],
    isTop: false,
  },
  {
    id: 'prod-3',
    supplierId: 'supplier-125',
    supplierName: 'КерамоБлок Центр',
    name: 'Кирпич жженый М150',
    category: 'Материалы',
    description: 'Красный жженый кирпич высокой прочности от прямого производителя.',
    price: 12,
    unit: 'шт',
    region: 'Джалал-Абад',
    rating: 5.0,
    image: 'https://picsum.photos/seed/bricks/600/400',
    tags: ['Кирпич', 'Стеновой материал'],
    isTop: false,
    isNew: true,
  },
  {
    id: 'prod-4',
    supplierId: 'supplier-126',
    supplierName: 'СпецТехАренда',
    name: 'Аренда экскаватора JCB',
    category: 'Техника',
    description: 'Услуги экскаватора-погрузчика с опытным оператором.',
    price: 2500,
    unit: 'час',
    region: 'Бишкек',
    rating: 4.8,
    image: 'https://picsum.photos/seed/excavator/600/400',
    tags: ['Спецтехника', 'Земляные работы'],
    isTop: true,
  }
];

export const mockRequests = [
  {
    id: 'req-1',
    authorId: 'consumer-123',
    authorName: 'ООО "Монолит-М"',
    title: 'Требуется поставка бетона М400 для ЖК "Северный Ветер"',
    category: 'Материалы',
    description: 'Объем 450 м³. График заливки с 15 по 20 число месяца. Рассматриваем поставщиков с собственным автопарком миксеров.',
    budget: 2000000,
    quantity: 450,
    unit: 'м³',
    region: 'Бишкек',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
    responsesCount: 6,
  },
  {
    id: 'req-2',
    authorId: 'consumer-124',
    authorName: 'ИП Смаилов',
    title: 'Бригада каменщиков на черновую кладку',
    category: 'Услуги',
    description: 'Требуется бригада из 5-6 человек для кладки жженого кирпича. Объем работы большой, оплата сдельная каждые 2 недели.',
    budget: 500000,
    quantity: 1,
    unit: 'объект',
    region: 'Ош',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
    responsesCount: 2,
  },
  {
    id: 'req-3',
    authorId: 'consumer-123',
    authorName: 'Иван Иванов',
    title: 'Арматура А500С 12мм',
    category: 'Материалы',
    description: 'Нужна арматура для фундамента частного дома. Желательно с доставкой.',
    budget: 850000,
    quantity: 12,
    unit: 'тонн',
    region: 'Бишкек',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(), // 2 days ago
    responsesCount: 6,
  }
];

let products = [...mockProducts];
let requests = [...mockRequests];

export const getAllMockProducts = () => [...products];
export const getAllMockRequests = () => [...requests];

export const createMockRequest = (data: any) => {
  const newReq = {
    id: `req-${Date.now()}`,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    responsesCount: 0,
    ...data
  };
  requests.unshift(newReq);
  return newReq;
};

export const getMockRequestsByAuthor = (authorId: string) => {
  return requests.filter(r => r.authorId === authorId);
};
