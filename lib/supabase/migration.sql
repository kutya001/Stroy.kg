-- ============================================
-- Stroy.kg — Миграция схемы БД в Supabase
-- Выполняйте в SQL Editor: https://supabase.com/dashboard → SQL Editor
-- Безопасная для повторного выполнения (IF NOT EXISTS / OR REPLACE)
-- ============================================

-- 1. Перечисления (ENUM)
-- ============================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('consumer', 'supplier', 'developer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE nomenclature_category AS ENUM ('Товар', 'Услуга');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('request', 'response', 'system', 'verification', 'chat');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Таблица профилей (связана с auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  role user_role NOT NULL DEFAULT 'consumer',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_level SMALLINT NOT NULL DEFAULT 0 CHECK (verification_level BETWEEN 0 AND 3),
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  inn TEXT,
  passport_scan TEXT,
  company_name TEXT,
  licenses TEXT[] DEFAULT '{}',
  certificates TEXT[] DEFAULT '{}',
  subscription subscription_tier NOT NULL DEFAULT 'FREE',
  -- Статистика поставщика
  page_views INTEGER NOT NULL DEFAULT 0,
  chat_requests INTEGER NOT NULL DEFAULT 0,
  completed_orders INTEGER NOT NULL DEFAULT 0,
  revenue INTEGER NOT NULL DEFAULT 0,
  daily_ad_budget INTEGER NOT NULL DEFAULT 0,
  is_promoted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Индексы для профилей
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Триггер: автоматическое создание профиля при регистрации
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Номенклатурные группы
-- ============================================

CREATE TABLE IF NOT EXISTS nomenclature_groups (
  id TEXT PRIMARY KEY DEFAULT 'grp-' || gen_random_uuid()::text,
  category nomenclature_category NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  characteristics TEXT[] NOT NULL DEFAULT '{}'
);

-- 4. Товары / Услуги
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT 'prod-' || gen_random_uuid()::text,
  supplier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  nomenclature_category nomenclature_category NOT NULL DEFAULT 'Товар',
  nomenclature_type TEXT NOT NULL DEFAULT 'Материалы',
  group_id TEXT REFERENCES nomenclature_groups(id) ON DELETE SET NULL,
  group_name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'шт',
  region TEXT NOT NULL DEFAULT 'Бишкек',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  image TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  characteristics JSONB NOT NULL DEFAULT '{}',
  is_top BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT TRUE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_promoted BOOLEAN NOT NULL DEFAULT FALSE,
  promotion_budget INTEGER,
  construction_stage TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(nomenclature_category);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_region ON products(region);

-- 5. Заявки
-- ============================================

CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY DEFAULT 'req-' || gen_random_uuid()::text,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT '',
  assigned_supplier_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_supplier_name TEXT,
  title TEXT NOT NULL,
  category nomenclature_category NOT NULL DEFAULT 'Товар',
  type TEXT,
  group_id TEXT,
  group_name TEXT,
  characteristics JSONB,
  linked_product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '',
  budget INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'шт',
  region TEXT NOT NULL DEFAULT 'Бишкек',
  status request_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responses_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_requests_author ON requests(author_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_assigned ON requests(assigned_supplier_id);

-- 6. Уведомления
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT 'notif-' || gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  type notification_type NOT NULL DEFAULT 'system',
  link TEXT
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;

-- 7. Чаты
-- ============================================

CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY DEFAULT 'chat-' || gen_random_uuid()::text,
  participants UUID[] NOT NULL,
  last_message TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unread_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_chats_participants ON chats USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_chats_updated ON chats(updated_at DESC);

-- 8. Сообщения
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT 'msg-' || gen_random_uuid()::text,
  chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id, timestamp);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE nomenclature_groups ENABLE ROW LEVEL SECURITY;

-- Удалить все существующие политики (идемпотентность)
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);

-- products
CREATE POLICY "products_select_published" ON products FOR SELECT USING (is_published = true);
CREATE POLICY "products_select_own" ON products FOR SELECT USING (auth.uid() = supplier_id);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (auth.uid() = supplier_id);
CREATE POLICY "products_update" ON products FOR UPDATE USING (auth.uid() = supplier_id);
CREATE POLICY "products_delete" ON products FOR DELETE USING (auth.uid() = supplier_id);

-- requests
CREATE POLICY "requests_select_own" ON requests FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "requests_select_open" ON requests FOR SELECT USING (status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS'));
CREATE POLICY "requests_insert" ON requests FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "requests_update_author" ON requests FOR UPDATE USING (auth.uid() = author_id AND status = 'OPEN');
CREATE POLICY "requests_update_supplier" ON requests FOR UPDATE USING (auth.uid() = assigned_supplier_id);

-- notifications
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);

-- chats
CREATE POLICY "chats_select" ON chats FOR SELECT USING (auth.uid() = ANY(participants));
CREATE POLICY "chats_insert" ON chats FOR INSERT WITH CHECK (auth.uid() = ANY(participants));
CREATE POLICY "chats_update" ON chats FOR UPDATE USING (auth.uid() = ANY(participants));

-- messages
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND auth.uid() = ANY(chats.participants))
);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND auth.uid() = ANY(chats.participants))
);

-- nomenclature_groups
CREATE POLICY "nomenclature_select" ON nomenclature_groups FOR SELECT USING (true);
CREATE POLICY "nomenclature_insert" ON nomenclature_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "nomenclature_update" ON nomenclature_groups FOR UPDATE USING (true);
CREATE POLICY "nomenclature_delete" ON nomenclature_groups FOR DELETE USING (true);

-- ============================================
-- Seed: Номенклатурные группы (upsert)
-- ============================================

INSERT INTO nomenclature_groups (id, category, type, name, characteristics) VALUES
  ('grp-1',  'Товар',  'Материалы',      'Бетон',                  ARRAY['Марка', 'Класс прочности', 'Морозостойкость']),
  ('grp-2',  'Товар',  'Материалы',      'Арматура',               ARRAY['Класс стали', 'Диаметр (мм)', 'Длина (м)']),
  ('grp-3',  'Товар',  'Материалы',      'Пиломатериалы',          ARRAY['Порода дерева', 'Сечение (мм)', 'Сорт']),
  ('grp-4',  'Товар',  'Материалы',      'Кирпич',                 ARRAY['Тип', 'Марка прочности', 'Размер']),
  ('grp-5',  'Товар',  'Материалы',      'Цемент',                 ARRAY['Марка', 'Фасовка (кг)', 'Тип']),
  ('grp-6',  'Товар',  'Материалы',      'Песок и щебень',         ARRAY['Фракция (мм)', 'Тип', 'Происхождение']),
  ('grp-7',  'Товар',  'Материалы',      'Кровельные материалы',   ARRAY['Тип', 'Толщина (мм)', 'Цвет']),
  ('grp-8',  'Товар',  'Материалы',      'Утеплители',             ARRAY['Тип', 'Толщина (мм)', 'Плотность (кг/м³)']),
  ('grp-9',  'Товар',  'Инструменты',    'Ручной инструмент',      ARRAY['Тип', 'Материал', 'Размер']),
  ('grp-10', 'Товар',  'Инструменты',    'Электроинструмент',      ARRAY['Мощность (Вт)', 'Тип питания', 'Бренд']),
  ('grp-11', 'Товар',  'Оборудование',   'Бетонное оборудование',  ARRAY['Тип', 'Производительность', 'Мощность']),
  ('grp-12', 'Товар',  'Оборудование',   'Строительные леса',      ARRAY['Тип', 'Высота (м)', 'Материал']),
  ('grp-13', 'Услуга', 'Архитектурные',  'Проектирование',         ARRAY['Тип проекта', 'Площадь (м²)', 'Этажность']),
  ('grp-14', 'Услуга', 'Архитектурные',  'Геодезия',               ARRAY['Тип работ', 'Площадь участка']),
  ('grp-15', 'Услуга', 'Строительные',   'Фундаментные работы',    ARRAY['Тип фундамента', 'Объем (м³)']),
  ('grp-16', 'Услуга', 'Строительные',   'Кладочные работы',       ARRAY['Тип кладки', 'Объем (м²)']),
  ('grp-17', 'Услуга', 'Строительные',   'Монтажные работы',       ARRAY['Тип конструкции', 'Объем']),
  ('grp-18', 'Услуга', 'Отделочные',     'Штукатурные работы',     ARRAY['Тип штукатурки', 'Площадь (м²)']),
  ('grp-19', 'Услуга', 'Отделочные',     'Малярные работы',        ARRAY['Тип покрытия', 'Площадь (м²)']),
  ('grp-20', 'Услуга', 'Аренда',         'Аренда спецтехники',     ARRAY['Тип техники', 'Мощность', 'С оператором']),
  ('grp-21', 'Услуга', 'Аренда',         'Аренда инструментов',    ARRAY['Тип инструмента', 'Срок аренды'])
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  type = EXCLUDED.type,
  name = EXCLUDED.name,
  characteristics = EXCLUDED.characteristics;
