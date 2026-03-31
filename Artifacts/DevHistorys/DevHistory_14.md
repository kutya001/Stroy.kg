# DevHistory 14 — Миграция на Supabase (v1.8.0.0)

**Дата:** 29 марта 2026  
**Версия:** 1.8.0.0  

## Описание

Миграция проекта с mock-only режима на dual-mode архитектуру: приложение автоматически определяет режим работы (mock или Supabase) по наличию env-переменных `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Без переменных — mock-данные, с переменными — Supabase PostgreSQL + Auth.

## Внесённые изменения

### 1. Установка зависимостей
- `@supabase/supabase-js@^2.100.1` — основной SDK
- `@supabase/ssr@^0.9.0` — интеграция с Next.js (SSR, cookies)

### 2. Инфраструктура Supabase (`lib/supabase/`)
- `client.ts` — browser-клиент (`createBrowserClient<Database>`) для клиентских компонентов
- `server.ts` — server-клиент (`createServerClient<Database>`) для SSR и Server Actions
- `middleware.ts` — обновление сессии через `supabase.auth.getUser()`
- `types.ts` — TypeScript-типы базы данных: 7 таблиц (profiles, products, requests, notifications, chats, messages, nomenclature_groups), 5 enums, Row/Insert/Update типы с Relationships

### 3. Root middleware (`middleware.ts`)
- Next.js middleware для автоматического обновления Supabase Auth сессии
- Matcher исключает статику, изображения, sitemap, robots.txt

### 4. SQL-миграция (`lib/supabase/migration.sql`)
- 5 ENUM типов: `user_role`, `subscription_tier`, `request_status`, `nomenclature_category`, `notification_type`
- 7 таблиц с индексами и constraints
- RLS-политики для всех таблиц
- Trigger `handle_new_user()` — автоматическое создание профиля при регистрации через auth.users
- Seed-данные: 21 номенклатурная группа

### 5. Async data access layer (`lib/queries.ts`)
- Полная замена синхронных mock-функций на async-функции с Supabase-клиентом
- Mapper-функции (`mapProfile`, `mapProduct`, `mapRequest`, `mapNotification`) для конвертации snake_case → camelCase
- CRUD для всех сущностей: profiles, products, requests, notifications, chats, messages, nomenclature_groups
- Dashboard-метрики для поставщиков

### 6. AuthProvider (`components/AuthProvider.tsx`)
- Dual-mode: флаг `USE_SUPABASE` определяет режим
- Supabase-режим: `signInWithOtp`, `onAuthStateChange`, `signOut` через Supabase Auth
- Mock-режим: оригинальная логика с localStorage (без изменений)

### 7. SSR-страницы (dual-mode)
- `app/product/[id]/page.tsx` — wrapper-функции `fetchProduct`/`fetchSupplierProducts`
- `app/sitemap.ts` — async dual-mode генерация карты сайта

### 8. Конфигурация
- `next.config.ts` — добавлен `*.supabase.co/storage/**` в `images.remotePatterns`
- `.env.example` — добавлены `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 9. Обновление документации
- Все упоминания Firebase/Firestore заменены на Supabase PostgreSQL в: `RULES.md`, `SPEC.md`, `SRS.md`, `PRD.md`, `README.md`, `project-conventions.instructions.md`
- Обновлены API-методы в SRS § 8.1 (Firebase SDK → Supabase Auth API)
- Обновлена архитектурная диаграмма в SRS § 3.1

## Затронутые файлы

| Файл | Изменение |
|------|-----------|
| `package.json` | Добавлены `@supabase/supabase-js`, `@supabase/ssr` |
| `lib/supabase/client.ts` | Новый — browser Supabase client |
| `lib/supabase/server.ts` | Новый — server Supabase client |
| `lib/supabase/middleware.ts` | Новый — session update helper |
| `lib/supabase/types.ts` | Новый — Database types (7 таблиц) |
| `lib/supabase/migration.sql` | Новый — SQL-миграция (DDL + RLS + seeds) |
| `lib/queries.ts` | Новый — async data access layer |
| `middleware.ts` | Новый — Next.js root middleware |
| `components/AuthProvider.tsx` | Dual-mode auth (Supabase + mock) |
| `app/product/[id]/page.tsx` | Dual-mode SSR |
| `app/sitemap.ts` | Dual-mode sitemap |
| `next.config.ts` | Supabase Storage images |
| `.env.example` | Supabase env vars |
| `Artifacts/RULES.md` | Firebase → Supabase |
| `Artifacts/SPEC.md` | Firebase → Supabase |
| `Artifacts/SRS.md` | Firebase → Supabase PostgreSQL |
| `Artifacts/PRD.md` | Firebase → Supabase |
| `README.md` | Firebase → Supabase |
| `.github/instructions/project-conventions.instructions.md` | Dual-mode docs |

## Требования к запуску Supabase

1. Создать проект на [supabase.com](https://supabase.com)
2. Создать `.env.local` с `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Выполнить `lib/supabase/migration.sql` в Supabase SQL Editor
4. Включить Phone Auth provider в Supabase Dashboard
