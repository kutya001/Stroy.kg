# DevHistory 12 — SEO-оптимизация (v1.6.0.0)

**Дата:** 28 марта 2026  
**Версия:** 1.6.0.0  

## Описание

Комплексная SEO-оптимизация маркетплейса Stroy.kg для улучшения индексации в Google и привлечения органического трафика.

## Внесённые изменения

### 1. Серверный рендеринг страницы товара
- Файл `app/product/[id]/page.tsx` переведён с `'use client'` на серверный компонент (SSR)
- Данные товара загружаются на сервере — поисковые роботы получают готовый HTML
- Интерактивные кнопки (заявка, чат, звонок) вынесены в клиентский компонент `app/product/[id]/ProductActions.tsx`

### 2. Динамические мета-теги (`generateMetadata`)
- На странице товара добавлена функция `generateMetadata()` с:
  - Уникальным `title` в формате `{название} купить в Бишкеке | Stroy.kg`
  - Динамическим `description` с ценой и поставщиком
  - OpenGraph тегами (title, description, image)
  - Каноническим URL (`alternates.canonical`)

### 3. Микроразметка Schema.org (JSON-LD)
- На странице товара добавлены два блока `<script type="application/ld+json">`:
  - **Product** — название, описание, изображение, цена (KGS), продавец, рейтинг
  - **BreadcrumbList** — хлебные крошки: Каталог → Категория → Вид → Товар
- XSS-экранирование через `.replace(/</g, '\\u003c')`

### 4. Sitemap и Robots.txt
- `app/sitemap.ts` — генерация XML-карты сайта из всех опубликованных товаров + главная + каталог
- `app/robots.ts` — закрыты приватные маршруты (`/admin`, `/profile`, `/chats`, `/create`, `/add-product`, `/dashboard`)

### 5. Глобальные мета-теги (`app/layout.tsx`)
- Добавлен `metadataBase: new URL('https://stroy.kg')`
- `title` с шаблоном `template: '%s | Stroy.kg'`
- Расширенный `openGraph` (locale: `ru_RU`, siteName: `Stroy.kg`)

### 6. Оптимизация изображений
- Главное изображение товара получило атрибут `priority` (LCP)
- Breadcrumb обёрнут в `<nav aria-label="Breadcrumb">` для доступности

### 7. Исправление конфигурации сборки (`next.config.ts`)
- Удалён deprecated ключ `eslint.ignoreDuringBuilds` (не поддерживается в Next.js 16)
- Добавлен `turbopack: { root: '.' }` для совместимости Turbopack с webpack-конфигом

## Затронутые файлы

| Файл | Действие |
|------|----------|
| `app/product/[id]/page.tsx` | Переписан (SSR + generateMetadata + JSON-LD) |
| `app/product/[id]/ProductActions.tsx` | Создан (клиентский компонент кнопок) |
| `app/sitemap.ts` | Создан |
| `app/robots.ts` | Создан |
| `app/layout.tsx` | Изменён (metadataBase, title template, openGraph) |
| `next.config.ts` | Изменён (удалён eslint, добавлен turbopack) |
| `Artifacts/RULES.md` | Обновлён (добавлен раздел 6 — SEO) |

## Результат сборки
- `npx next build --no-lint` — ✅ успешно
- `npx tsc --noEmit` — ✅ 0 ошибок
- `/product/[id]` — Dynamic (server-rendered)
- `/robots.txt`, `/sitemap.xml` — Static (prerendered)
