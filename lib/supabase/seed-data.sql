-- ============================================
-- Stroy.kg — Демонстративные данные (seed)
-- Выполняйте ПОСЛЕ migration.sql
-- Пароль для всех тестовых аккаунтов: 123456
-- Пароль администратора: admin123
-- ============================================

-- ВАЖНО: Пользователи в Supabase создаются через auth.users,
-- после чего триггер автоматически создаёт профиль в profiles.
-- Здесь мы вставляем данные напрямую для демо-целей.

-- ============================================
-- 1. Демо пользователи (auth.users + profiles)
-- ============================================
-- Примечание: В реальном Supabase пользователей создают через
-- supabase.auth.admin.createUser() или Dashboard.
-- Ниже — прямая вставка для seed-режима.

-- Генерируем фиксированные UUID для пользователей
DO $$
DECLARE
  uid_admin     UUID := '00000000-0000-0000-0000-000000000001';
  uid_sup1      UUID := '00000000-0000-0000-0000-000000000002';
  uid_sup2      UUID := '00000000-0000-0000-0000-000000000003';
  uid_con1      UUID := '00000000-0000-0000-0000-000000000004';
  uid_dev1      UUID := '00000000-0000-0000-0000-000000000005';
  uid_sup_t1    UUID := '00000000-0000-0000-0000-000000000010';
  uid_sup_t2    UUID := '00000000-0000-0000-0000-000000000011';
  uid_sup_t3    UUID := '00000000-0000-0000-0000-000000000012';
  uid_con_t1    UUID := '00000000-0000-0000-0000-000000000020';
  uid_con_t2    UUID := '00000000-0000-0000-0000-000000000021';
  uid_con_t3    UUID := '00000000-0000-0000-0000-000000000022';
  uid_dev_t1    UUID := '00000000-0000-0000-0000-000000000030';
BEGIN

-- Вставляем пользователей в auth.users (если ещё нет)
-- ВАЖНО: GoTrue требует чтобы строковые поля НЕ были NULL (email_change, recovery_token и т.д.)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token, email_change, email_change_token_new, email_change_token_current, email_change_confirm_status, recovery_token, reauthentication_token, phone_change, phone_change_token)
VALUES
  (uid_admin,  '00000000-0000-0000-0000-000000000000', 'admin@stroy.kg',      crypt('admin123', gen_salt('bf')),  NOW(), '{"role":"admin"}'::jsonb,    'authenticated', 'authenticated', NOW(), NOW(), '', '', '', '', 0, '', '', '', ''),
  (uid_sup1,   '00000000-0000-0000-0000-000000000000', 'stroymaster@mail.kg', crypt('123456', gen_salt('bf')),   NOW(), '{"role":"supplier"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW(), '', '', '', '', 0, '', '', '', ''),
  (uid_sup2,   '00000000-0000-0000-0000-000000000000', 'severles@mail.kg',    crypt('123456', gen_salt('bf')),   NOW(), '{"role":"supplier"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW(), '', '', '', '', 0, '', '', '', ''),
  (uid_con1,   '00000000-0000-0000-0000-000000000000', 'ivan@mail.kg',        crypt('123456', gen_salt('bf')),   NOW(), '{"role":"consumer"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW(), '', '', '', '', 0, '', '', '', ''),
  (uid_dev1,   '00000000-0000-0000-0000-000000000000', 'smailov@mail.kg',     crypt('123456', gen_salt('bf')),   NOW(), '{"role":"developer"}'::jsonb,'authenticated', 'authenticated', NOW(), NOW(), '', '', '', '', 0, '', '', '', ''),
  (uid_sup_t1, '00000000-0000-0000-0000-000000000000', 'sup1@stroy.kg',       crypt('123456', gen_salt('bf')),   NOW(), '{"role":"supplier"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW(), '', '', '', '', 0, '', '', '', ''),
  (uid_sup_t2, '00000000-0000-0000-0000-000000000000', 'sup2@stroy.kg',       crypt('123456', gen_salt('bf')),   NOW(), '{"role":"supplier"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW(), '', '', '', '', 0, '', '', '', ''),
  (uid_sup_t3, '00000000-0000-0000-0000-000000000000', 'sup3@stroy.kg',       crypt('123456', gen_salt('bf')),   NOW(), '{"role":"supplier"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW(), '', '', '', '', 0, '', '', '', ''),
  (uid_con_t1, '00000000-0000-0000-0000-000000000000', 'con1@stroy.kg',       crypt('123456', gen_salt('bf')),   NOW(), '{"role":"consumer"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW(), '', '', '', '', 0, '', '', '', ''),
  (uid_con_t2, '00000000-0000-0000-0000-000000000000', 'con2@stroy.kg',       crypt('123456', gen_salt('bf')),   NOW(), '{"role":"consumer"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW(), '', '', '', '', 0, '', '', '', ''),
  (uid_con_t3, '00000000-0000-0000-0000-000000000000', 'con3@stroy.kg',       crypt('123456', gen_salt('bf')),   NOW(), '{"role":"consumer"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW(), '', '', '', '', 0, '', '', '', ''),
  (uid_dev_t1, '00000000-0000-0000-0000-000000000000', 'dev1@stroy.kg',       crypt('123456', gen_salt('bf')),   NOW(), '{"role":"developer"}'::jsonb,'authenticated', 'authenticated', NOW(), NOW(), '', '', '', '', 0, '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Добавляем identities (требуется для Supabase auth)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
  (uid_admin,  uid_admin,  jsonb_build_object('sub', uid_admin::text,  'email', 'admin@stroy.kg'),      'email', uid_admin::text,  NOW(), NOW(), NOW()),
  (uid_sup1,   uid_sup1,   jsonb_build_object('sub', uid_sup1::text,   'email', 'stroymaster@mail.kg'), 'email', uid_sup1::text,   NOW(), NOW(), NOW()),
  (uid_sup2,   uid_sup2,   jsonb_build_object('sub', uid_sup2::text,   'email', 'severles@mail.kg'),    'email', uid_sup2::text,   NOW(), NOW(), NOW()),
  (uid_con1,   uid_con1,   jsonb_build_object('sub', uid_con1::text,   'email', 'ivan@mail.kg'),        'email', uid_con1::text,   NOW(), NOW(), NOW()),
  (uid_dev1,   uid_dev1,   jsonb_build_object('sub', uid_dev1::text,   'email', 'smailov@mail.kg'),     'email', uid_dev1::text,   NOW(), NOW(), NOW()),
  (uid_sup_t1, uid_sup_t1, jsonb_build_object('sub', uid_sup_t1::text, 'email', 'sup1@stroy.kg'),       'email', uid_sup_t1::text, NOW(), NOW(), NOW()),
  (uid_sup_t2, uid_sup_t2, jsonb_build_object('sub', uid_sup_t2::text, 'email', 'sup2@stroy.kg'),       'email', uid_sup_t2::text, NOW(), NOW(), NOW()),
  (uid_sup_t3, uid_sup_t3, jsonb_build_object('sub', uid_sup_t3::text, 'email', 'sup3@stroy.kg'),       'email', uid_sup_t3::text, NOW(), NOW(), NOW()),
  (uid_con_t1, uid_con_t1, jsonb_build_object('sub', uid_con_t1::text, 'email', 'con1@stroy.kg'),       'email', uid_con_t1::text, NOW(), NOW(), NOW()),
  (uid_con_t2, uid_con_t2, jsonb_build_object('sub', uid_con_t2::text, 'email', 'con2@stroy.kg'),       'email', uid_con_t2::text, NOW(), NOW(), NOW()),
  (uid_con_t3, uid_con_t3, jsonb_build_object('sub', uid_con_t3::text, 'email', 'con3@stroy.kg'),       'email', uid_con_t3::text, NOW(), NOW(), NOW()),
  (uid_dev_t1, uid_dev_t1, jsonb_build_object('sub', uid_dev_t1::text, 'email', 'dev1@stroy.kg'),       'email', uid_dev_t1::text, NOW(), NOW(), NOW())
ON CONFLICT (provider_id, provider) DO NOTHING;

-- ============================================
-- 2. Профили (триггер может уже создать пустые)
-- ============================================
INSERT INTO profiles (id, name, phone, email, role, onboarding_completed, verification_level, phone_verified, email_verified, inn, company_name, licenses, subscription, page_views, chat_requests, completed_orders, revenue, daily_ad_budget, is_promoted)
VALUES
  (uid_admin,  'Администратор',        '+996555000000', 'admin@stroy.kg',      'admin',     TRUE, 3, TRUE, TRUE,  NULL,             NULL,                  '{}',             'ENTERPRISE', 0, 0, 0, 0, 0, FALSE),
  (uid_sup1,   'ОсОО СтройМастер',     '+996555111111', 'stroymaster@mail.kg', 'supplier',  TRUE, 3, TRUE, TRUE,  '12345678901234', 'ОсОО СтройМастер',   '{СРО-1234}',     'PRO',        1247, 38, 24, 3450000, 10, TRUE),
  (uid_sup2,   'СеверЛес Экспорт',     '+996555111222', 'severles@mail.kg',    'supplier',  TRUE, 2, TRUE, TRUE,  '98765432101234', 'СеверЛес Экспорт',   '{}',             'BASIC',      540, 12, 8, 1200000, 0, FALSE),
  (uid_con1,   'Иван Иванов',          '+996555222222', 'ivan@mail.kg',        'consumer',  TRUE, 2, TRUE, TRUE,  '11223344556677', NULL,                  '{}',             'FREE',       0, 0, 0, 0, 0, FALSE),
  (uid_dev1,   'ИП Смаилов',           '+996555222333', 'smailov@mail.kg',     'developer', TRUE, 2, TRUE, FALSE, '55667788990011', 'ИП Смаилов',         '{}',             'BASIC',      0, 0, 0, 0, 0, FALSE),
  (uid_sup_t1, 'Тест Поставщик 1',     '+996555100001', 'sup1@stroy.kg',       'supplier',  TRUE, 2, TRUE, TRUE,  '10000000000001', 'ТестПоставщик-1',    '{}',             'BASIC',      0, 0, 0, 0, 0, FALSE),
  (uid_sup_t2, 'Тест Поставщик 2',     '+996555100002', 'sup2@stroy.kg',       'supplier',  TRUE, 2, TRUE, TRUE,  '10000000000002', 'ТестПоставщик-2',    '{}',             'FREE',       0, 0, 0, 0, 0, FALSE),
  (uid_sup_t3, 'Тест Поставщик 3',     '+996555100003', 'sup3@stroy.kg',       'supplier',  TRUE, 1, TRUE, TRUE,  NULL,             'ТестПоставщик-3',    '{}',             'FREE',       0, 0, 0, 0, 0, FALSE),
  (uid_con_t1, 'Тест Покупатель 1',    '+996555200001', 'con1@stroy.kg',       'consumer',  TRUE, 2, TRUE, TRUE,  '20000000000001', NULL,                  '{}',             'FREE',       0, 0, 0, 0, 0, FALSE),
  (uid_con_t2, 'Тест Покупатель 2',    '+996555200002', 'con2@stroy.kg',       'consumer',  TRUE, 1, TRUE, TRUE,  NULL,             NULL,                  '{}',             'FREE',       0, 0, 0, 0, 0, FALSE),
  (uid_con_t3, 'Тест Покупатель 3',    '+996555200003', 'con3@stroy.kg',       'consumer',  TRUE, 0, TRUE, FALSE, NULL,             NULL,                  '{}',             'FREE',       0, 0, 0, 0, 0, FALSE),
  (uid_dev_t1, 'Тест Застройщик 1',    '+996555300001', 'dev1@stroy.kg',       'developer', TRUE, 2, TRUE, TRUE,  '30000000000001', 'ТестЗастройщик-1',   '{}',             'BASIC',      0, 0, 0, 0, 0, FALSE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  onboarding_completed = EXCLUDED.onboarding_completed,
  verification_level = EXCLUDED.verification_level,
  phone_verified = EXCLUDED.phone_verified,
  email_verified = EXCLUDED.email_verified,
  inn = EXCLUDED.inn,
  company_name = EXCLUDED.company_name,
  licenses = EXCLUDED.licenses,
  subscription = EXCLUDED.subscription,
  page_views = EXCLUDED.page_views,
  chat_requests = EXCLUDED.chat_requests,
  completed_orders = EXCLUDED.completed_orders,
  revenue = EXCLUDED.revenue,
  daily_ad_budget = EXCLUDED.daily_ad_budget,
  is_promoted = EXCLUDED.is_promoted;

-- ============================================
-- 3. Товары / Услуги
-- ============================================
INSERT INTO products (id, supplier_id, supplier_name, name, nomenclature_category, nomenclature_type, group_id, group_name, description, price, unit, region, rating, image, tags, characteristics, is_top, is_new, is_published, is_promoted, promotion_budget, construction_stage, created_at)
VALUES
  ('prod-1', uid_sup1, 'ОсОО СтройМастер', 'Бетон М300',
   'Товар', 'Материалы', 'grp-1', 'Бетон',
   'Высококачественный бетон М300 для фундаментов и перекрытий.',
   4500, 'м³', 'Бишкек', 4.9,
   'https://picsum.photos/seed/concrete/600/400',
   ARRAY['Бетон', 'Фундамент'],
   '{"Марка": "М300", "Класс прочности": "B22.5", "Морозостойкость": "F200"}'::jsonb,
   TRUE, FALSE, TRUE, TRUE, 15, 'Фундамент', NOW() - INTERVAL '7 days'),

  ('prod-2', uid_sup2, 'СеверЛес Экспорт', 'Брус хвойный 150x150',
   'Товар', 'Материалы', 'grp-3', 'Пиломатериалы',
   'Пиломатериалы хвойных пород, первый сорт. Доставка по всему Кыргызстану.',
   22000, 'м³', 'Ош', 4.7,
   'https://picsum.photos/seed/wood/600/400',
   ARRAY['Пиломатериалы', 'Брус', 'Дерево'],
   '{"Порода дерева": "Ель", "Сечение (мм)": "150x150", "Сорт": "1-й сорт"}'::jsonb,
   FALSE, FALSE, TRUE, FALSE, NULL, 'Каркас и стены', NOW() - INTERVAL '14 days'),

  ('prod-3', uid_sup1, 'ОсОО СтройМастер', 'Кирпич жженый М150',
   'Товар', 'Материалы', 'grp-4', 'Кирпич',
   'Красный жженый кирпич высокой прочности от прямого производителя.',
   12, 'шт', 'Бишкек', 5.0,
   'https://picsum.photos/seed/bricks/600/400',
   ARRAY['Кирпич', 'Стеновой материал'],
   '{"Тип": "Жженый", "Марка прочности": "М150", "Размер": "250x120x65"}'::jsonb,
   FALSE, TRUE, TRUE, FALSE, NULL, 'Каркас и стены', NOW() - INTERVAL '2 days'),

  ('prod-4', uid_sup1, 'ОсОО СтройМастер', 'Аренда экскаватора JCB',
   'Услуга', 'Аренда', 'grp-20', 'Аренда спецтехники',
   'Услуги экскаватора-погрузчика с опытным оператором.',
   2500, 'час', 'Бишкек', 4.8,
   'https://picsum.photos/seed/excavator/600/400',
   ARRAY['Спецтехника', 'Земляные работы'],
   '{"Тип техники": "Экскаватор-погрузчик", "Мощность": "95 л.с.", "С оператором": "Да"}'::jsonb,
   TRUE, FALSE, TRUE, TRUE, 20, 'Фундамент', NOW() - INTERVAL '5 days'),

  ('prod-5', uid_sup2, 'СеверЛес Экспорт', 'Утеплитель минплита 100мм',
   'Товар', 'Материалы', 'grp-8', 'Утеплители',
   'Минеральная плита для утепления стен и кровли. Плотность 50 кг/м³.',
   450, 'м²', 'Бишкек', 4.6,
   'https://picsum.photos/seed/insulation/600/400',
   ARRAY['Утеплитель', 'Теплоизоляция'],
   '{"Тип": "Минеральная вата", "Толщина (мм)": "100", "Плотность (кг/м³)": "50"}'::jsonb,
   FALSE, TRUE, TRUE, FALSE, NULL, 'Кровля', NOW() - INTERVAL '1 day'),

  ('prod-6', uid_sup1, 'ОсОО СтройМастер', 'Проектирование жилого дома',
   'Услуга', 'Архитектурные', 'grp-13', 'Проектирование',
   'Полный архитектурный проект жилого дома до 300 м². Включает чертежи, 3D визуализацию и СМР.',
   150000, 'проект', 'Бишкек', 4.9,
   'https://picsum.photos/seed/architecture/600/400',
   ARRAY['Проект', 'Архитектура', 'Чертежи'],
   '{"Тип проекта": "Жилой дом", "Площадь (м²)": "до 300", "Этажность": "1-3"}'::jsonb,
   TRUE, FALSE, TRUE, TRUE, 10, 'Проектирование', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO UPDATE SET
  supplier_id = EXCLUDED.supplier_id,
  supplier_name = EXCLUDED.supplier_name,
  name = EXCLUDED.name,
  nomenclature_category = EXCLUDED.nomenclature_category,
  nomenclature_type = EXCLUDED.nomenclature_type,
  group_id = EXCLUDED.group_id,
  group_name = EXCLUDED.group_name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  unit = EXCLUDED.unit,
  region = EXCLUDED.region,
  rating = EXCLUDED.rating,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  characteristics = EXCLUDED.characteristics,
  is_top = EXCLUDED.is_top,
  is_new = EXCLUDED.is_new,
  is_published = EXCLUDED.is_published,
  is_promoted = EXCLUDED.is_promoted,
  promotion_budget = EXCLUDED.promotion_budget,
  construction_stage = EXCLUDED.construction_stage;

-- ============================================
-- 4. Заявки
-- ============================================
INSERT INTO requests (id, author_id, author_name, assigned_supplier_id, assigned_supplier_name, title, category, type, description, budget, quantity, unit, region, status, created_at, responses_count)
VALUES
  ('req-1', uid_con1, 'Иван Иванов', NULL, NULL,
   'Требуется поставка бетона М400 для ЖК "Северный Ветер"',
   'Товар', 'Материалы',
   'Объем 450 м³. График заливки с 15 по 20 число месяца. Рассматриваем поставщиков с собственным автопарком миксеров.',
   2000000, 450, 'м³', 'Бишкек', 'OPEN', NOW() - INTERVAL '2 hours', 6),

  ('req-2', uid_dev1, 'ИП Смаилов', uid_sup1, 'ОсОО СтройМастер',
   'Бригада каменщиков на черновую кладку',
   'Услуга', 'Строительные',
   'Требуется бригада из 5-6 человек для кладки жженого кирпича. Объем работы большой, оплата сдельная каждые 2 недели.',
   500000, 1, 'объект', 'Ош', 'ASSIGNED', NOW() - INTERVAL '24 hours', 2),

  ('req-3', uid_con1, 'Иван Иванов', uid_sup2, 'СеверЛес Экспорт',
   'Арматура А500С 12мм',
   'Товар', 'Материалы',
   'Нужна арматура для фундамента частного дома. Желательно с доставкой.',
   850000, 12, 'тонн', 'Бишкек', 'IN_PROGRESS', NOW() - INTERVAL '48 hours', 6),

  ('req-4', uid_con1, 'Иван Иванов', uid_sup1, 'ОсОО СтройМастер',
   'Проект жилого дома 200м²',
   'Услуга', 'Архитектурные',
   'Нужен полный архитектурный проект 2-этажного дома. Общая площадь около 200м².',
   180000, 1, 'проект', 'Бишкек', 'COMPLETED', NOW() - INTERVAL '7 days', 4)
ON CONFLICT (id) DO UPDATE SET
  author_id = EXCLUDED.author_id,
  author_name = EXCLUDED.author_name,
  assigned_supplier_id = EXCLUDED.assigned_supplier_id,
  assigned_supplier_name = EXCLUDED.assigned_supplier_name,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  budget = EXCLUDED.budget,
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit,
  region = EXCLUDED.region,
  status = EXCLUDED.status,
  responses_count = EXCLUDED.responses_count;

-- ============================================
-- 5. Уведомления
-- ============================================
INSERT INTO notifications (id, user_id, text, date, read, type, link)
VALUES
  ('notif-1', uid_sup1, 'Новая заявка на бетон в вашем регионе!',                                         NOW(), FALSE, 'request',      '/create'),
  ('notif-2', uid_con1, 'Поставщик ОсОО СтройМастер откликнулся на вашу заявку.',                         NOW(), FALSE, 'response',     '/create'),
  ('notif-3', uid_con1, 'Ваша заявка "Арматура А500С 12мм" переведена в статус "В обработке".',           NOW() - INTERVAL '1 hour',  TRUE,  'system',       NULL),
  ('notif-4', uid_con1, 'Подтвердите вашу почту для повышения уровня верификации.',                        NOW() - INTERVAL '1 day',   FALSE, 'verification', '/profile'),
  ('notif-5', uid_sup1, 'Ваш товар "Бетон М300" набрал 100 просмотров!',                                  NOW() - INTERVAL '12 hours', TRUE,  'system',       NULL),
  ('notif-6', uid_sup1, 'Новое сообщение от Иван Иванов',                                                  NOW() - INTERVAL '30 minutes', FALSE, 'chat',     '/chats')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  text = EXCLUDED.text,
  date = EXCLUDED.date,
  read = EXCLUDED.read,
  type = EXCLUDED.type,
  link = EXCLUDED.link;

-- ============================================
-- 6. Чаты
-- ============================================
INSERT INTO chats (id, participants, last_message, updated_at, unread_count)
VALUES
  ('chat-1', ARRAY[uid_con1, uid_sup1], 'Готов поставить бетон. Какая марка нужна?', NOW(), 1),
  ('chat-2', ARRAY[uid_con1, uid_sup2], 'Да, доставка включена в стоимость.',         NOW() - INTERVAL '1 hour', 0),
  ('chat-3', ARRAY[uid_sup1, uid_dev1], 'Спасибо, ждем счет на оплату.',              NOW() - INTERVAL '1 day', 0)
ON CONFLICT (id) DO UPDATE SET
  participants = EXCLUDED.participants,
  last_message = EXCLUDED.last_message,
  updated_at = EXCLUDED.updated_at,
  unread_count = EXCLUDED.unread_count;

-- ============================================
-- 7. Сообщения
-- ============================================
INSERT INTO messages (id, chat_id, sender_id, text, timestamp)
VALUES
  ('msg-1', 'chat-1', uid_con1, 'Здравствуйте! Меня интересует бетон М300. Какие условия доставки?', NOW() - INTERVAL '2 hours'),
  ('msg-2', 'chat-1', uid_sup1, 'Здравствуйте! Доставка миксером по Бишкеку — бесплатно от 10 м³.',  NOW() - INTERVAL '1 hour'),
  ('msg-3', 'chat-1', uid_sup1, 'Готов поставить бетон. Какая марка нужна?',                          NOW()),
  ('msg-4', 'chat-2', uid_con1, 'Добрый день, доставка бруса входит в стоимость?',                    NOW() - INTERVAL '2 hours'),
  ('msg-5', 'chat-2', uid_sup2, 'Да, доставка включена в стоимость.',                                 NOW() - INTERVAL '1 hour'),
  ('msg-6', 'chat-3', uid_dev1, 'Здравствуйте, нам нужна бригада каменщиков.',                        NOW() - INTERVAL '2 days'),
  ('msg-7', 'chat-3', uid_sup1, 'Можем предложить бригаду из 6 человек.',                             NOW() - INTERVAL '1 day 1 hour'),
  ('msg-8', 'chat-3', uid_dev1, 'Спасибо, ждем счет на оплату.',                                     NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO UPDATE SET
  chat_id = EXCLUDED.chat_id,
  sender_id = EXCLUDED.sender_id,
  text = EXCLUDED.text,
  timestamp = EXCLUDED.timestamp;

END $$;

-- Готово! Демо-данные загружены.
-- Логины: admin@stroy.kg / admin123, все остальные / 123456
