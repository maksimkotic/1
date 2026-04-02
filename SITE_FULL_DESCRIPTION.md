# Полное описание сайта «Геоэкология • Водные ресурсы»

## 1) Что это за проект

Это многостраничный образовательный сайт по геоэкологии водных ресурсов (реки, пресная вода, океан, промышленная нагрузка, решения), реализованный как **MPA (multi-page application)** без фронтенд‑фреймворка: страницы — это отдельные `.html`, стили — набор `.css`, клиентская логика — небольшие vanilla JS-модули. На сервере — Node.js + Express API с авторизацией и PostgreSQL.

---

## 2) Общая архитектура

- **Клиент (frontend)**:
  - Набор HTML-страниц в корне (`index.html`, `about.html`, `freshwater.html`, `ocean.html`, `impact.html`, `solutions.html`, `contacts.html`).
  - Общие стили и страничные стили в `src/styles/`.
  - JS-модули в `src/scripts/` (навигация, auth UI, parallax, слайдер, аккордеон, формы).
- **Сервер (backend)**:
  - Отдельный Node/Express-проект в `server/`.
  - REST API для health-check, регистрации, логина, получения текущего пользователя и постов.
  - Подключение к PostgreSQL через `pg`.
- **База данных**:
  - Таблицы `app_user` и `post`.
  - Инициализация схемы и сид-данных скриптом `server/scripts/init-db.js`.

---

## 3) Технологический стек

### Frontend
- HTML5 (семантическая структура страниц).
- CSS3 (кастомные стили без CSS-фреймворков).
- Vanilla JavaScript (без React/Vue/Angular).
- Google Fonts (`Inter`, `Playfair Display`).

### Backend
- Node.js (ESM-модули, `"type": "module"`).
- Express 4.
- CORS middleware.
- JWT (`jsonwebtoken`) для токенов.
- `bcryptjs` для хеширования паролей.
- PostgreSQL + `pg`.

---

## 4) Библиотеки и зависимости

Из `server/package.json`:

- `express` — HTTP API и статика.
- `cors` — CORS-политика.
- `jsonwebtoken` — подпись и проверка JWT.
- `bcryptjs` — хеширование/сравнение паролей.
- `pg` — доступ к PostgreSQL.

Скрипты:
- `npm run dev` — запуск сервера в watch-режиме.
- `npm start` — обычный запуск сервера.
- `npm run db:init` — инициализация БД.

---

## 5) Клиентская часть: страницы и их назначение

## `index.html` (главная)
- Hero-блок, вводное описание проекта.
- Сетка разделов (навигация на остальные страницы).
- Ключевые факты/статистика по воде.
- Подключение общих скриптов: `core.js`, `parallax.js`, `auth-ui.js`.
- На странице встроено модальное окно авторизации.

## `about.html` (основы дисциплины)
- Теоретическая часть: ключевые понятия и цепочка анализа.
- Подключает `core.js` и `auth-ui.js`.

## `freshwater.html` (кризис пресных вод)
- Визуальные признаки кризиса.
- Слайдер изображений (`data-carousel`).
- Анимируемые числовые счётчики (`data-counters`).
- Подключает `freshwater.js`.

## `ocean.html` (загрязнение океанов)
- Факторы загрязнения.
- Блок «до/после» со шторкой (`data-before-after`).
- Широкий параллакс-фон (`data-wide-parallax`).
- Подключает `wide-parallax.js` и `ocean.js`.

## `impact.html` (влияние промышленности)
- Антропогенные источники нагрузки.
- Схема «нагрузка → перенос → эффект».
- Использует `core.js` + `auth-ui.js`.

## `solutions.html` (технологии спасения)
- Схема очистки воды.
- Аккордеон по методам очистки (`data-accordion`).
- Подключает `solutions.js`.

## `contacts.html` (обратная связь)
- Форма обратной связи (`data-contact-form`) с клиентской валидацией.
- Подключает `contacts.js`.

---

## 6) Клиентская логика (JS-модули)

## Базовый слой: `src/scripts/core.js`
- Проставляет текущий год в футере.
- Проставляет текущую дату (формат `ru-RU`) в элементы с `data-today`.
- Создаёт глобальный объект `window.__app` с:
  - `prefersReducedMotion`;
  - утилитой `clamp`.
- Управляет мобильной навигацией:
  - открытие/закрытие меню;
  - backdrop;
  - закрытие по `Escape`;
  - авто-закрытие при ширине >= 821px.

## Авторизация UI: `src/scripts/auth-ui.js`
- Управляет модалкой входа/регистрации.
- Переключает вкладки login/register.
- Вызывает API:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `GET /api/auth/me`
- Отображает состояние пользователя в шапке.
- Важно: токен хранится **в памяти вкладки** (`memToken`), не в `localStorage`.
- При старте очищает старые токены из `localStorage` (`jwt`, `JWT`, `geoeco_token`).

## Эффекты и виджеты
- `parallax.js` — параллакс для элементов с `data-parallax`.
- `wide-parallax.js` — широкий фон-параллакс для `data-wide-parallax`.
- `freshwater.js`:
  - карусель слайдов;
  - анимированные счётчики по `IntersectionObserver`.
- `ocean.js`:
  - интерактив «до/после» (меняет `clip-path` и позицию ручки).
- `solutions.js`:
  - аккордеон карточек методов очистки.
- `contacts.js`:
  - валидация формы (имя, email по regex, сообщение) и сообщение «Данные отправлены».

---

## 7) Серверная часть

## Точка входа: `server/src/index.js`

Сервер выполняет:
- настройку CORS (`origin` берётся из конфига);
- `express.json({ limit: "1mb" })`;
- раздачу статики из корня проекта;
- REST API;
- запуск с fallback по порту (если порт занят, пробует следующий).

### API endpoints
- `GET /api/health` — проверка API и доступности БД (`select 1`).
- `POST /api/auth/register` — регистрация пользователя.
- `POST /api/auth/login` — логин.
- `GET /api/auth/me` — получение текущего пользователя (Bearer JWT).
- `GET /api/posts` — список последних постов (до 20).

### Обработка ошибок и валидация
- `BAD_REQUEST` — неполные входные данные.
- `PASSWORD_TOO_SHORT` — пароль < 6.
- `EMAIL_TAKEN` — конфликт уникального email.
- `INVALID_CREDENTIALS` — неверный логин/пароль.
- `UNAUTHORIZED` — отсутствует/невалиден токен.
- `NOT_FOUND` — пользователь не найден.
- `SERVER_ERROR` — прочие ошибки.

---

## 8) Аутентификация и безопасность

## `server/src/auth.js`
- При регистрации:
  - пароль хешируется `bcrypt.hash(password, 10)`;
  - в БД хранится `password_hash`.
- При логине:
  - берётся пользователь по email;
  - пароль проверяется через `bcrypt.compare`.
- JWT:
  - payload: `sub`, `email`, `name`;
  - подпись `config.jwtSecret`;
  - срок жизни `7d`.
- Middleware `requireAuth`:
  - ожидает `Authorization: Bearer <token>`;
  - в случае успеха кладёт payload в `req.user`.

---

## 9) Конфигурация

## `server/src/config.js`
- Обязателен файл `server/config.local.json`.
- Если файла нет — сервер падает с ошибкой и подсказкой.
- Из конфига читаются минимум:
  - `databaseUrl`
  - `jwtSecret`
  - (опционально) `port`, `corsOrigin`.

---

## 10) База данных

## Подключение: `server/src/db.js`
- PostgreSQL Pool (`pg.Pool`) по `connectionString`.
- SSL включён (`rejectUnauthorized: false`).
- Экспорт утилиты `query(text, params)`.

## Миграция/инициализация: `server/scripts/init-db.js`
Создаёт:
- `app_user`:
  - `id`, `name`, `email unique`, `password_hash`, `created_at`.
- `post`:
  - `id`, `title`, `body`, `created_at`.

Сидирует 2 стартовые записи в `post` (если таблица пуста).

---

## 11) Стилизация и UI-структура

- Общие файлы:
  - `src/styles/base.css`
  - `src/styles/layout.css`
  - `src/styles/components.css`
  - `src/styles/auth.css`
  - `src/styles/main.css` (точка подключения)
- Страничные стили:
  - `src/styles/pages/home.css`
  - `src/styles/pages/about.css`
  - `src/styles/pages/freshwater.css`
  - `src/styles/pages/ocean.css`
  - `src/styles/pages/impact.css`
  - `src/styles/pages/solutions.css`
  - `src/styles/pages/contacts.css`

Подход: общая дизайн-система + точечные стили под конкретную страницу.

---

## 12) Медиа и ассеты

- Локальные изображения в `src/assets/` по тематическим папкам (`freshwater`, `ocean`, `misc`).
- Иконка сайта — `src/assets/favicon.svg`.
- Часть медиа на главной может использовать внешний URL (Wikimedia texture в hero).

---

## 13) UX и доступность

- Есть `skip-link` (переход к содержимому).
- Используются `aria-label`, `aria-expanded`, `aria-selected`.
- Учитывается `prefers-reduced-motion` для отключения анимаций.
- Закрытие меню и модалки по Escape.
- Формы снабжены пользовательской валидацией и человекочитаемыми сообщениями.

---

## 14) Как запускать проект

### Backend
1. Перейти в `server/`.
2. Настроить `config.local.json` (БД, JWT, CORS, порт).
3. Установить зависимости (`npm install`, если нужно).
4. Выполнить `npm run db:init`.
5. Запустить `npm run dev` или `npm start`.

### Frontend
- Раздаётся этим же Express-сервером как статика (из корня проекта).
- Доступен по `http://localhost:<port>/index.html`.

---

## 15) Сильные стороны текущей реализации

- Простой, понятный стек (минимум магии).
- Чёткое разделение по страницам и модульным скриптам.
- Лёгкий вход для обучения и доработок.
- Уже есть базовая auth-схема + БД + API.
- Хорошая демонстрация интерактивов без тяжёлых фреймворков.

---

## 16) Ограничения и что можно улучшить

- Нет централизованной сборки/бандлинга frontend-кода.
- Нет полноценной серверной валидации схемами (например, zod/joi).
- Нет refresh-token/blacklist механики.
- Токен только в памяти вкладки — безопаснее от XSS-персистенции, но не сохраняет сессию после перезагрузки.
- Нет CI/CD, автотестов и линтинга в явном виде.
- API очень базовый (пока только auth + posts read).

---

## 17) Краткая карта файлов

- **Страницы:** `/*.html`
- **Скрипты клиента:** `src/scripts/*.js`
- **Стили:** `src/styles/**/*.css`
- **Сервер API:** `server/src/*.js`
- **Инициализация БД:** `server/scripts/init-db.js`
- **Конфиг сервера:** `server/config.local.json`

