---
applyTo: "**/*.{ts,tsx}"
---
# Стандарты кода Stroy.kg

## Технологический стек
- Next.js 15 (App Router), TypeScript (строгая типизация), Tailwind CSS 4
- Supabase: PostgreSQL (БД) + Supabase Auth (аутентификация)
- Иконки: только `lucide-react`
- Шрифты: `Unbounded` (заголовки, `font-heading`), `Golos Text` (основной, `font-body`)

## Архитектура компонентов
- Только функциональные компоненты и хуки — никаких классов
- `'use client'` только при наличии хуков состояния, обработчиков событий или Supabase SDK
- Контексты и провайдеры → `components/` или `lib/`
- TypeScript-интерфейсы рядом с логикой или в файлах типов
- Supabase инкапсулировать в провайдерах (`AuthProvider`) или кастомных хуках

## Ролевая модель (4 роли)
- `consumer` (заказчик), `supplier` (поставщик), `developer` (застройщик), `admin`
- UI рендерится по `effectiveRole` из `AuthProvider` (учитывает admin view-as)
- Гейты доступа: `canAccessChat` и `canAccessRequests` → `verificationLevel >= 2`

## Dual-mode разработка (Mock / Supabase)
- Dual-mode: `USE_SUPABASE` флаг проверяет наличие env-переменных `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Без env-переменных → mock-режим (`lib/mockDb.ts`, in-memory)
- С env-переменными → Supabase (PostgreSQL + Auth)
- Async data access layer: `lib/queries.ts` (маппинг snake_case → camelCase)
- Supabase клиенты: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (SSR)

## Номенклатура (иерархия товаров)
- 4 уровня: Категория (`Товар`/`Услуга`) → Вид → Группа → Наименование
- 21 группа с динамическими характеристиками
- 8 этапов строительства для фильтрации

## Перед написанием кода
- Проверить `SPEC.md` на требования модуля аутентификации
- Проверить `RULES.md` на архитектурные правила

## После написания кода
- Убедись, что код соответствует стандартам и не содержит `console.log` или закомментированного кода
- Обновлай файлы:
  - `SPEC.md` — если изменился функционал аутентификации
  - `RULES.md` — если добавились новые архитектурные правила
  - `Artifacts/` — SRS, FSD/FRS, PRD и другие спецификации
  - `DevHistorys/` — история изменений по версиям