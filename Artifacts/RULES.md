# RULES.md — Технический стек и архитектурные правила Stroy.kg

## 1. Технологический стек
* **Фреймворк:** Next.js 15 (App Router).
* **Язык:** TypeScript 5.9 (режим строгой типизации).
* **Стилизация:** Tailwind CSS 4, `tailwind-merge`, `clsx`, `class-variance-authority`.
* **UI Компоненты и Иконки:** Только библиотека `lucide-react`.
* **Анимации:** `motion` (Framer Motion).
* **Аутентификация:** Supabase Auth (Email + Password). Вход по телефону — заглушка (stub) для будущей реализации.
* **База данных:** Supabase (PostgreSQL) / On-premise PostgreSQL (на этапе MVP допускается использование `lib/mockDb.ts`).
* **ORM / Query Builder:** Supabase Client (`@supabase/supabase-js` + `@supabase/ssr`), async data layer `lib/queries.ts`.

## 2. Архитектурные принципы
* **Server/Client Components:** По умолчанию используются серверные компоненты (SSR/RSC). Директива `'use client'` применяется исключительно в файлах, содержащих хуки состояния (`useState`, `useEffect`), обработчики событий или интеграцию с клиентским SDK (например, `@supabase/ssr`).
* **Функциональная парадигма:** Разрешены только функциональные компоненты и хуки.
* **Dual-mode разработка:** Приложение поддерживает два режима: mock (`lib/mockDb.ts`) и Supabase. Флаг `USE_SUPABASE` автоматически определяется по наличию env-переменных `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Async data access layer: `lib/queries.ts`.
* **Инкапсуляция логики:** Интеграция с базой данных и API аутентификации должна быть абстрагирована на уровне сервисов (Server Actions / Route Handlers) или кастомных хуков.

## 3. UI/UX и Стилизация
* **Mobile-first:** Интерфейс разрабатывается с приоритетом под мобильные устройства (min-width: 375px).
* **Брендинг:** * Primary: `#E87722`.
    * Secondary: `#1E3A5F`.
    * Accent: `#F5C842`.
* **Типографика:** `Unbounded` для заголовков (класс `font-heading`), `Golos Text` для основного текста (класс `font-body`).

## 4. Ролевая модель и доступ (RBAC)
* Поддерживается 4 роли: `consumer` (заказчик), `supplier` (поставщик), `developer` (застройщик), `admin` (администратор).
* Интерфейс рендерится на основе `effectiveRole` из контекста аутентификации (`AuthProvider`), что позволяет администраторам тестировать платформу в режиме "view-as".

## 5. Структура данных (Номенклатура)
* Реляционная модель данных: реализация 4-уровневой иерархии через связанные таблицы (Categories → Types → Groups → Items).
* Использование JSONB (PostgreSQL) для хранения динамических характеристик товаров в рамках 21 группы.

## 6. SEO и индексация
* **Серверный рендеринг для детальных страниц:** Страницы товаров (`/product/[id]`) и другие публичные страницы должны быть серверными компонентами (без `'use client'`). Интерактивность выносить в дочерние клиентские компоненты.
* **Динамические мета-теги:** Каждая публичная страница должна экспортировать `generateMetadata()` с уникальными `title`, `description`, `openGraph` и `canonical`.
* **Шаблон title:** Использовать формат `template: '%s | Stroy.kg'` из корневого `layout.tsx`.
* **`metadataBase`:** Глобально задан `new URL('https://stroy.kg')` в `app/layout.tsx`.
* **Микроразметка Schema.org:** На страницах товаров обязательно размещать JSON-LD разметку (`Product`, `Offer`, `AggregateRating`, `BreadcrumbList`). XSS-экранирование: `JSON.stringify(data).replace(/</g, '\\u003c')`.
* **Sitemap:** `app/sitemap.ts` генерирует XML-карту сайта из всех опубликованных товаров + статических маршрутов.
* **Robots.txt:** `app/robots.ts` закрывает приватные маршруты (`/admin`, `/profile`, `/chats`, `/create`, `/add-product`, `/dashboard`).
* **Изображения:** Главное изображение товара (LCP) должно иметь атрибут `priority`. Атрибут `alt` — название товара, не «Product image».
* **Breadcrumbs:** Навигационные хлебные крошки оборачивать в `<nav aria-label="Breadcrumb">` для доступности.

## 7. SQL миграции и демо-данные
* **Идемпотентность:** Все SQL-скрипты должны быть безопасны для повторного выполнения (`IF NOT EXISTS`, `ON CONFLICT`, `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object`).
* **SQL скрипты** хранятся в `lib/supabase/`: `migration.sql` (схема), `seed-data.sql` (демо-данные), `cleanup.sql` (очистка).
* **Mock-режим:** Функция `resetMockData()` в `lib/mockDb.ts` сбрасывает все in-memory хранилища к исходным демо-данным.
* **Админ-панель:** Вкладка «Демо-данные» в `/admin` для генерации демо-данных (mock) и инфо по SQL-скриптам (Supabase).