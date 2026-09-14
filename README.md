<div align="center">

# 📱 GoSulawesi — Frontend

### React 19 + TypeScript + Vite + TailwindCSS

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

This is the **frontend** of the GoSulawesi tourism platform.  
For the full project overview, visit the [main repository](https://github.com/Moh-Shafi/Go-sulawesi).

</div>

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Backend running at `http://localhost:8082` (see [backend repo](https://github.com/Moh-Shafi/Go-sulawesi-backend))

### Install & Run

```bash
git clone https://github.com/Moh-Shafi/Go-sulawesi-frontend.git
cd Go-sulawesi-frontend
npm install
npm run dev
```

App runs at: **http://localhost:5173**

### Build for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
src/
├── pages/                  # All application pages
│   ├── LandingPageV3.tsx   # Public landing page
│   ├── LoginPage.tsx
│   ├── SignUpPage.tsx
│   ├── OnboardingQuiz.tsx
│   ├── TouristDashboard.tsx
│   ├── BusinessDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── VideoFeedPage.tsx   # TikTok-style reels
│   ├── ItineraryBuilder.tsx
│   └── ...37 total pages
├── components/             # Reusable UI components
│   ├── TouristLayout.tsx
│   ├── BusinessLayout.tsx
│   ├── AdminLayout.tsx
│   ├── ChatWidget.tsx
│   ├── VideoUploadModal.tsx
│   └── RequireRole.tsx
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities & API helpers
├── assets/                 # Static assets
├── App.tsx                 # Root router
└── main.tsx
```

---

## 🗺️ Pages & Routes

| Route | Page | Role |
|-------|------|------|
| `/` | Landing Page | Public |
| `/login` | Login | Public |
| `/signup` | Sign Up | Public |
| `/quiz` | Onboarding Quiz | Public |
| `/tourist` | Tourist Dashboard | Tourist |
| `/tourist/bookings` | My Bookings | Tourist |
| `/tourist/trips` | My Trips | Tourist |
| `/tourist/saved` | Saved Places | Tourist |
| `/tourist/reviews` | My Reviews | Tourist |
| `/tourist/following` | Following | Tourist |
| `/tourist/messages` | Messages | Tourist |
| `/tourist/settings` | Settings | Tourist |
| `/reels` | Video Feed (Reels) | Tourist |
| `/itinerary` | Itinerary Builder | Tourist |
| `/destination/:id` | Destination Detail | Public |
| `/business` | Business Dashboard | Business |
| `/business/listings` | Manage Listings | Business |
| `/business/bookings` | Manage Bookings | Business |
| `/business/promotions` | Promotions | Business |
| `/business/earnings` | Earnings | Business |
| `/business/reviews` | Reviews | Business |
| `/business/settings` | Settings | Business |
| `/business/:id` | Business Detail | Public |
| `/admin` | Admin Dashboard | Admin |
| `/admin/users` | User Management | Admin |
| `/admin/listings` | Listings | Admin |
| `/admin/businesses` | Businesses | Admin |
| `/admin/promotions` | Promotions | Admin |
| `/admin/local-guides` | Local Guides | Admin |
| `/admin/bookings` | Bookings | Admin |
| `/admin/reports` | Reports | Admin |
| `/admin/settings` | Settings | Admin |

---

## ⚙️ Environment / Proxy

API calls to `/api/*`, `/uploads/*`, and `/sounds/*` are proxied to the backend via `vite.config.ts`:

```ts
proxy: {
  '/api':     { target: 'http://localhost:8082' },
  '/uploads': { target: 'http://localhost:8082' },
  '/sounds':  { target: 'http://localhost:8082' },
}
```

---

## 🔗 Related Repositories

| Repo | Description |
|------|-------------|
| [Go-sulawesi](https://github.com/Moh-Shafi/Go-sulawesi) | Main repo & documentation |
| [Go-sulawesi-backend](https://github.com/Moh-Shafi/Go-sulawesi-backend) | PHP REST API backend |

---

<div align="center">

Made with ❤️ for the people of Sulawesi, Indonesia 🇮🇩

</div>
