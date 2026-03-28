# DevHistory 15 — Упрощение аутентификации и SQL-скрипты (v1.8.1.0)

**Дата:** 30 марта 2026  
**Версия:** 1.8.1.0  

## Описание

Упрощение системы аутентификации: полный отказ от OTP (signInWithOtp/verifyOtp) в пользу email + пароль (signInWithPassword/signUp). Исправление идемпотентности SQL-миграции. Создание SQL-скриптов для seed-данных и очистки. Добавление вкладки «Демо-данные» в админ-панель.

## Внесённые изменения

### 1. Идемпотентность migration.sql
- Все `CREATE TYPE` обёрнуты в `DO $$ ... IF NOT EXISTS`
- `CREATE TABLE` используют `IF NOT EXISTS`
- Индексы создаются через `IF NOT EXISTS`
- `INSERT` с `ON CONFLICT DO NOTHING`
- Устранена ошибка `type user_role already exists` при повторном запуске

### 2. Упрощение аутентификации (AuthModal + AuthProvider)
- Удалён OTP-флоу (ввод телефона → отправка кода → верификация)
- Новый AuthModal: единая форма с полями email + пароль + переключатель на телефон
- Supabase-режим: `signInWithPassword` → при ошибке «Invalid login credentials» → `signUp` с автоматическим входом
- Mock-режим: `getMockUserByEmail(email)` + проверка пароля
- Вход по телефону (Supabase): stub с сообщением «Вход по телефону временно недоступен»
- Вход по телефону (Mock): работает как раньше через `getMockUser(phone)`
- Вход администратора: стандартный email+пароль (admin@stroy.kg / admin123 для Supabase, admin@stroy.kg / admin для Mock)
- Чекбокс «Я новый пользователь» показывает выбор роли (Покупатель / Поставщик)

### 3. Создание seed-data.sql
- 12 пользователей (admin, 5 поставщиков, 5 покупателей, 1 developer)
- 6 товаров, 4 запроса, 3 чата с сообщениями, 2 отзыва
- Привязка к auth.users через `gen_random_uuid()`
- Каталожные данные (категории, единицы измерения) через `ON CONFLICT DO NOTHING`

### 4. Создание cleanup.sql
- `TRUNCATE ... CASCADE` для всех таблиц (reviews, messages, chats, requests, products, profiles)
- `DELETE FROM auth.users` для очистки Supabase Auth

### 5. Вкладка «Демо-данные» в админ-панели
- Новая 4-я вкладка «Демо» рядом с Пользователи / Справочники / Аналитика
- Кнопка «Сбросить mock-данные» вызывает `resetMockData()` из mockDb.ts
- Информационная панель с инструкциями по запуску SQL-скриптов в Supabase Dashboard

### 6. Обновление документации
- SPEC.md — переписаны разделы 1–3 (OTP → email+пароль), добавлены разделы 6–7
- RULES.md — обновлено описание аутентификации, добавлен раздел 7 (SQL-миграции)
- SRS.md — FR-AUTH-01 до FR-AUTH-07, таблица Auth API обновлена
- PRD.md — модуль аутентификации, пользовательские истории, роадмап
- FSD_FRS.md — таблицы поведения AuthModal, верификация уровня 1, диаграмма потока

## Затронутые файлы

| Файл | Изменение |
|------|-----------|
| `lib/supabase/migration.sql` | Идемпотентность (DO $$, IF NOT EXISTS, ON CONFLICT) |
| `components/AuthModal.tsx` | Переписан: email+пароль вместо OTP |
| `components/AuthProvider.tsx` | `loginWithEmail(email, password, role?)`, phone=stub |
| `lib/mockDb.ts` | Добавлена функция `resetMockData()` |
| `lib/supabase/seed-data.sql` | Новый файл: демо-данные |
| `lib/supabase/cleanup.sql` | Новый файл: очистка БД |
| `app/admin/page.tsx` | Вкладка «Демо-данные» |
| `Artifacts/SPEC.md` | Обновлена документация |
| `Artifacts/RULES.md` | Обновлена документация |
| `Artifacts/SRS.md` | Обновлена документация |
| `Artifacts/PRD.md` | Обновлена документация |
| `Artifacts/FSD_FRS.md` | Обновлена документация |
