# loadloud (Next.js)

Проект переведен на Next.js App Router и готов для деплоя на Vercel.

## Локальный запуск

```bash
npm install
npm run dev
```

Открыть: `http://localhost:3000`

## Прод

```bash
npm run build
npm run start
```

## Деплой на Vercel

```bash
npx vercel
```

## Где менять видео и подписи

Файл: `app/page.jsx`  
Массив: `VIDEO_ITEMS`

## Форма: заглушка и email boilerplate

- Endpoint формы: `POST /api/contact` (`app/api/contact/route.js`)
- Если env-переменные не заданы, форма работает как заглушка (`mode: "stub"`) и пишет данные в лог сервера.
- Чтобы включить отправку писем через Resend, создай `.env.local` на основе `.env.example` и заполни:
  - `RESEND_API_KEY`
  - `CONTACT_FORM_TO_EMAIL`
  - `CONTACT_FORM_FROM_EMAIL`
