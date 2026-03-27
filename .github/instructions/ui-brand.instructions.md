---
applyTo: "**/*.tsx"
---
# UI и дизайн-система Stroy.kg

## Брендинг
- Primary: `#E87722` (оранжевый)
- Secondary: `#1E3A5F` (тёмно-синий)
- Accent: `#F5C842` (жёлтый)
- Success: зелёный, Danger: красный (через Tailwind-переменные)

## Mobile-First
- Минимальная ширина: 375px
- Сетка: 1 колонка на мобильных → 3 колонки на десктопе
- Нижняя навигация (`Navigation`) для мобильных, верхняя (`Header`) для десктопа
- Sticky-элементы: поисковая строка, боковые панели

## UI-паттерны
- Все надписи, placeholder'ы, описания, ошибки — **на русском языке**
- Валюта: KGS (сом). Формат: `1 500 KGS`
- Телефоны: формат `+996XXXXXXXXX`
- Иконки: только `lucide-react`, импортировать поимённо
- Состояния: Loading (спиннеры), Error (красный текст), Empty state (иконка + текст)

## Role-based рендеринг
```tsx
// Определять режим по effectiveRole из useAuth()
const { effectiveUserData } = useAuth();
const isSupplier = effectiveUserData?.role === 'supplier' || effectiveUserData?.role === 'developer';
// Рендерить разные секции для buyer vs supplier
```

## Карточки товаров
- Бейджи: `РЕКОМЕНДОВАНО`, `ТОП`, `НОВИНКА` — с цветовой кодировкой
- Рейтинг: звёздочки (Star из lucide-react)
- Верификация: зелёная галочка (CheckCircle) для Level 2+
