# Amrita Event Tracker (AET)

**Amrita Event Tracker** is a college academic event and coordination platform for Amrita School of Engineering, Coimbatore.

## Applications

| App | Tech | Users |
|---|---|---|
| **Admin Web** | React + TypeScript + Vite + Tailwind CSS v4 | Admin |
| **Android App** | Kotlin + Jetpack Compose + Material 3 | Faculty / CR / Student |

Both apps share a Firebase backend.

---

## Admin Web — Quick Start

```bash
cd admin-web
npm install
npm run dev
```

Open **http://localhost:5173**

### Demo credentials (Mock Mode)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@cb.amrita.edu` | `admin123` |

> Mock mode is enabled by default (`VITE_USE_MOCK=true`). No Firebase config needed.
> New faculty & student accounts can be added directly via the Admin panel with custom passwords.

### Features
- 📊 Dashboard with stats and recent activity
- 🏫 Departments, Semesters, Sections, Subjects management
- 👨‍🏫 Faculty & Student management (with CSV bulk import)
- 🎓 Class Representative (CR) assignment
- 📅 Academic Calendar
- 📋 Audit Logs
- 🎨 Light Green & Dark Blue themes
- 🔒 Role-based access control

---

## Firebase Setup (Production)

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Authentication** (Email/Password)
3. Enable **Firestore Database**
4. Copy `admin-web/.env.example` → `admin-web/.env`
5. Fill in your Firebase config values
6. Set `VITE_USE_MOCK=false`

---

## Live Demo

🌐 **https://arun-17-0.github.io/amrita-event-tracker/**

---

## License

MIT — Amrita School of Engineering, Bengaluru
