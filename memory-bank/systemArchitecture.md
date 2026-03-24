# Системная архитектура

## Структура директорий
```text
/app          # Next.js App Router (страницы, layout, globals.css)
/components   # Переиспользуемые UI-компоненты (Tailwind, AuthProvider, Header)
/lib          # Настройка Firebase (firebase.ts, utils)
/hooks        # Кастомные React-хуки (use-mobile)
/DevHistorys  # История разработки и итераций
```

## Инфраструктура
* **База данных:** Firebase Firestore (коллекции: `users`, `requests`, `chats`, `messages`).
* **Аутентификация:** Firebase Auth (Google, Phone).
* **Стилизация:** Tailwind CSS.
* **Шрифты:** Golos Text (основной), Unbounded (заголовки).
