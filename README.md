# 🏠 Spilno — Платформа управління ОСББ

**Spilno** (MyDim) — сучасна веб-платформа для ефективного управління ОСББ (об'єднання співвласників багатоквартирного будинку). Створена з використанням Angular 21 та Firebase.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://mydim-osbb.web.app)
[![Angular](https://img.shields.io/badge/Angular-21-red)](https://angular.io/)
[![Firebase](https://img.shields.io/badge/Firebase-12-orange)](https://firebase.google.com/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-18-blue)](https://primeng.org/)

---

## 🌟 Основні можливості

### Для мешканців
- 📝 **Створення заявок** — подати заявку на ремонт (сантехніка, електрика, інше)
- 👁️ **Відстеження статусу** — моніторинг виконання заявок у реальному часі
- 📢 **Перегляд оголошень** — отримання важливих повідомлень від управління
- 🏠 **Особистий дашборд** — зручний огляд всіх заявок і оголошень

### Для адміністраторів
- ✅ **Модерація користувачів** — підтвердження/відхилення реєстрацій
- 🔧 **Управління заявками** — зміна статусів, призначення виконавців
- 📣 **Публікація оголошень** — інформування мешканців про важливі події
- 📊 **Аналітика** — статистика заявок і активності мешканців
- 👥 **Управління мешканцями** — перегляд та зміна статусів користувачів

---

## 🚀 Технології

### Frontend
- **Angular 21** — фреймворк для побудови SPA
- **TypeScript** — строго типізована мова програмування
- **RxJS** — реактивне програмування з Observable
- **Signals** — новий API для реактивного стану (Angular 16+)
- **Standalone Components** — модульна архітектура без NgModules

### UI & Styling
- **PrimeNG 18** — бібліотека UI компонентів
- **PrimeUI Themes (Aura)** — темізація з підтримкою dark mode
- **SCSS** — препроцесор для стилів
- **CSS Grid & Flexbox** — сучасна верстка

### Backend & Database
- **Firebase Authentication** — авторизація через email/password
- **Cloud Firestore** — NoSQL база даних реального часу
- **Firebase Hosting** — хостинг для статичних файлів
- **Firestore Security Rules** — захист даних на рівні бази

### DevOps
- **Firebase CLI** — деплоймент і управління проектом
- **Angular CLI** — генерація компонентів і build
- **Git** — контроль версій з gitflow стратегією

---

## 📁 Структура проекту
```
src/app/
├── core/                      # Основна логіка додатку
│   ├── guards/               # Route guards (auth, role, status)
│   └── services/             # Бізнес-логіка (auth, requests, users)
│
├── features/                  # Функціональні модулі
│   ├── auth/                 # Авторізація (login, register, pending)
│   ├── dashboard/            # Дашборди (admin, resident)
│   ├── requests/             # Управління заявками
│   ├── announcements/        # Оголошення
│   ├── users/                # Управління користувачами (admin)
│   └── not-found/            # Сторінки помилок (404)
│
├── layout/                    # Layout компоненти
│   ├── auth-layout/          # Layout для auth сторінок
│   └── main-layout/          # Основний layout з sidebar
│
├── models/                    # TypeScript моделі даних
│   ├── user.model.ts
│   ├── request.model.ts
│   └── announcement.model.ts
│
├── shared/                    # Переіспользовані компоненти
│   ├── components/           # EmptyState, PageHeader, UserAvatar
│   └── pipes/                # statusLabel, statusSeverity
│
└── styles/                    # Глобальні стилі
    ├── _variables.scss
    ├── _mixins.scss
    ├── _components.scss
    ├── _buttons.scss
    ├── _forms.scss
    ├── _pages.scss
    └── _reset.scss
```

---

## 🗄️ Структура бази даних (Firestore)

### Collection: `users`
```typescript
{
  id: string;              // Auto-generated document ID
  name: string;            // "Іван Петренко"
  email: string;           // "ivan@example.com"
  phone: string;           // "+380501234567"
  apartmentNumber: string; // "12"
  role: 'admin' | 'resident';
  status: 'pending' | 'active' | 'rejected';
  createdAt: Timestamp;
}
```

### Collection: `requests`
```typescript
{
  id: string;
  userId: string;          // Reference to user
  userName: string;
  apartmentNumber: string;
  type: 'plumbing' | 'electrical' | 'other';
  status: 'new' | 'in_progress' | 'done' | 'rejected';
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `announcements`
```typescript
{
  id: string;
  title: string;
  content: string;
  important: boolean;      // Pinned to top if true
  authorId: string;        // Reference to admin user
  createdAt: Timestamp;
}
```

---

## 🛠️ Встановлення і запуск

### Передумови
- Node.js >= 20.x
- npm >= 10.x
- Angular CLI >= 18.x
- Firebase CLI

### Крок 1: Клонування репозиторію
```bash
git clone https://github.com/DmytroLavrov/Spilno.git
cd Spilno
```

### Крок 2: Встановлення залежностей
```bash
npm install
```

### Крок 3: Налаштування Firebase
1. Створіть проект у [Firebase Console](https://console.firebase.google.com/)
2. Увімкніть **Authentication** (Email/Password)
3. Створіть **Firestore Database**
4. Скопіюйте конфігурацію Firebase

### Крок 4: Налаштування environment
Створіть файл `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

### Крок 5: Firestore Security Rules
Скопіюйте правила з `firestore.rules` та опублікуйте:
```bash
firebase deploy --only firestore:rules
```

### Крок 6: Запуск dev сервера
```bash
npm start
```

Відкрийте [http://localhost:4200](http://localhost:4200)

---

## 🚢 Деплоймент

### Production Build
```bash
npm run build:prod
```

### Deploy на Firebase Hosting
```bash
# Всє разом
npm run deploy

# Або окремо
npm run deploy:hosting  # Тільки hosting
npm run deploy:rules    # Тільки Firestore rules
```

Ваш додаток буде доступний за адресою: `https://YOUR_PROJECT_ID.web.app`

---

## 👤 Створення першого адміна

1. Зареєструйтесь через форму реєстрації
2. Відкрийте **Firebase Console → Firestore → users**
3. Знайдіть свій документ і змініть:
   - `status: 'pending'` → `'active'`
   - `role: 'resident'` → `'admin'`
4. Перезавантажте сторінку

Тепер у вас є доступ адміністратора! 🎉

---

## 🧪 Тестові облікові записи

Для швидкого тестування функціоналу доступні наступні тестові акаунти:

### 👨‍💼 Адміністратор
```
Email: admin@spilno.com
Password: Admin123!
Роль: Адміністратор
Квартира: №1
```

**Доступні функції:**
- Перегляд всіх заявок мешканців
- Зміна статусів заявок (нова → в роботі → виконано)
- Підтвердження/відхилення нових реєстрацій
- Публікація оголошень
- Управління користувачами

---

### 👥 Мешканці

#### Активний мешканець #1
```
Email: ivan.petrenko@example.com
Password: Test123!
Статус: Активний
Квартира: №24
```

#### Активний мешканець #2
```
Email: andriy.bondarenko@example.com
Password: Test123!
Статус: Активний
Квартира: №5
```

#### Очікує підтвердження
```
Email: maria.shevchenko@example.com
Password: Test123!
Статус: Очікує підтвердження
Квартира: №18
```
*Цей користувач бачить екран "Очікує підтвердження" після логіну*

#### Відхилений користувач
```
Email: sergiy.melnyk@example.com
Password: Test123!
Статус: Відхилено
Квартира: №18
```
*Цей користувач бачить екран "Реєстрацію відхилено" після логіну*

**Доступні функції для мешканців:**
- Створення заявок на ремонт
- Перегляд власних заявок
- Перегляд оголошень
- Редагування/видалення власних заявок зі статусом "Нова"

---

### 📝 Тестові дані

У базі даних вже створені:

**Заявки:**
- 2 нові заявки (потребують уваги адміна)
- 3 заявки в роботі
- 5 виконаних заявок
- 1 відхилена заявка

**Оголошення:**
- 2 важливі оголошення (закріплені зверху)
- 3 звичайні оголошення

---

### ⚠️ Важливо

**Не використовуйте тестові акаунти в production!**

Для production середовища:
1. Видаліть всі тестові акаунти з Firebase Authentication
2. Видаліть тестові дані з Firestore
3. Створіть нового адміна через форму реєстрації
4. Налаштуйте Firestore Security Rules

---

## 🔐 Firestore Security Rules

Приклад правил для production (файл `firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuth() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuth() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuth() && (request.auth.uid == userId || isAdmin());
      allow create: if isAuth() && request.auth.uid == userId;
      allow update, delete: if isAdmin();
    }
    
    // Requests collection
    match /requests/{requestId} {
      allow read: if isAuth() && 
        (isAdmin() || resource.data.userId == request.auth.uid);
      allow create: if isAuth();
      allow update: if isAdmin() || 
        (isAuth() && resource.data.userId == request.auth.uid);
      allow delete: if isAdmin();
    }
    
    // Announcements collection
    match /announcements/{announcementId} {
      allow read: if isAuth();
      allow write: if isAdmin();
    }
  }
}
```

---

## 📝 Доступні скрипти
```bash
npm start             # Dev server (localhost:4200)
npm run build         # Development build
npm run build:prod    # Production build
npm run deploy        # Build + Deploy (hosting + rules)
npm run deploy:hosting # Deploy тільки hosting
npm run deploy:rules   # Deploy тільки Firestore rules
```

---

## 🎨 Кастомізація теми

Тема налаштовується через PrimeNG Aura preset. Для зміни кольорів:

1. Відкрийте `src/app/app.config.ts`
2. Змініть конфігурацію теми:
```typescript
providePrimeNG({
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark-mode',
      cssLayer: {
        name: 'primeng',
        order: 'tailwind-base, primeng, tailwind-utilities'
      }
    }
  }
})
```

---

## 📚 Документація та ресурси

- [Angular Documentation](https://angular.io/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [PrimeNG Components](https://primeng.org/)
- [RxJS Documentation](https://rxjs.dev/)

---

### Git Commit Convention
```
feat: нова функціональність
fix: виправлення бага
docs: зміни в документації
style: форматування коду
refactor: рефакторинг без зміни логіки
test: додавання тестів
chore: оновлення конфігурації
```

---
