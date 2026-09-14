<div align="center">

# 🌴 GoSulawesi — Frontend Web Application
### Next-Generation Tourism & Experience Platform for Sulawesi, Indonesia

[![React Version](https://img.shields.io/badge/React-19.2.6-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite Build](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

*A dynamic, accessible, and high-performance Single Page Application (SPA) designed to empower tourists, local businesses, and regional tour operators across the provinces of Sulawesi.*

[🌐 Monorepo Root](https://github.com/Moh-Shafi/Go-sulawesi) · [⚙️ Backend API Repo](https://github.com/Moh-Shafi/Go-sulawesi-backend)

</div>

---

## 📖 Executive Summary & Scope

**GoSulawesi Frontend** is the user interface and client experience layer of the GoSulawesi ecosystem. Built using the latest **React 19 concurrent architecture**, **Vite 8 build engine**, and **TailwindCSS v4**, it provides an app-like web experience with instant page loads, reactive state management, video streaming feeds (Reels), real-time messaging, and multi-role dashboards tailored for three distinct user types: **Tourists**, **Local Businesses**, and **System Administrators**.

Sulawesi features unique cultural events (e.g., Toraja funeral ceremonies, Mappaccing weddings) and world-renowned diving and eco-tourism paradises (Bunaken, Togean Islands, Wakatobi, Rammang-Rammang). This client application bridges international visitors and local Indonesian entrepreneurs through interactive interfaces and localized tools.

---

## 🌟 Core Features & Modules

### 1. 🧭 Exploration & Smart Discovery
- **High-Converting Landing Experiences**: Modular showcase highlighting natural wonders, cultural traditions, testimonials, and verified local packages.
- **Interactive Onboarding Quiz (`/quiz`)**: A personality-based preference quiz that gathers traveler interests (e.g., adventure, cultural heritage, scuba diving, relaxation) and instantly recommends customized Sulawesi itineraries.
- **Dynamic Destination Details (`/destination/:id`)**: Comprehensive breakdown of regional spots, photos, location coordinates, climate insights, and direct booking triggers.
- **AI-Powered Itinerary Builder (`/itinerary`)**: Drag-and-drop / algorithmic travel plan creation assisting travelers in building day-by-day itineraries across North, Central, and South Sulawesi.

### 2. 📱 Reels Video Feed (`/reels`)
- **Immersive Full-Screen Reels Feed**: Vertical, TikTok-style short-form video feed enabling guides and tourists to share authentic clips of culinary hotspots, boat trips, and cultural dances.
- **Integrated Audio & Interactions**: Sound synchronization, like/save counters, creator attribution, and overlay modals for bookings.
- **Direct Video Upload System**: Multi-step modal for uploading MP4/WebM videos with title, hashtags, description, and thumbnail configuration.

### 3. 👤 Tourist Portal (`/tourist/*`)
- **Interactive Dashboard**: Quick statistics on upcoming trips, saved locations, recent bookings, and guide messages.
- **Booking Management (`/tourist/bookings`)**: Detailed booking tracker with status indicators (`pending`, `confirmed`, `completed`, `cancelled`), cancellation policy summaries, and receipt downloads.
- **Trip Organizer (`/tourist/trips`) & Bookmarks (`/tourist/saved`)**: Custom folders and bookmark collections to plan upcoming visits.
- **Verified Review Publisher (`/tourist/reviews`)**: Honest feedback submission form with 5-star ratings, photo attachments, and comment submission.

### 4. 🏢 Local Business & Provider Suite (`/business/*`)
- **Comprehensive Business Dashboard**: Live metrics on daily reservations, monthly earnings, pending customer inquiries, and rating distributions.
- **Catalog Management (`/business/listings`)**: Full CRUD interface for experience packages, accommodations, transport rentals, and guided tours with custom image uploads.
- **Order & Reservation Pipeline (`/business/bookings`)**: Real-time management to accept, reschedule, or cancel client reservations with automated status updates.
- **Promotions & Campaign Engine (`/business/promotions`)**: Create seasonal discounts, promo codes, flash deals, and holiday offers.
- **Financial Overview (`/business/earnings`)**: Income graphs, settlement breakdowns, and transaction history.
- **Business Operational Settings (`/business/settings`)**: Operating hours editor, emergency contacts, and cancellation policy rules configuration.

### 5. 🛡️ Platform Administration Panel (`/admin/*`)
- **System Overview**: High-level platform metrics covering total registered accounts, transaction volume, active listings, and platform health.
- **Account Moderation (`/admin/users`)**: Search, filter, activate, ban, or modify permissions for users across all roles.
- **Listing & Guide Verification (`/admin/businesses`, `/admin/local-guides`)**: Review business licenses, identity documentation, and guide credentials before approving them for public search.
- **System Reports & Audits (`/admin/reports`)**: Downloadable analytical logs, user issue reports, and compliance tracking.

### 6. 💬 Communication & Live Chat
- **Floating Chat Widget & Dedicated Messaging Hub**: Contextual chat between tourists and hosts with automatic room creation, unread indicators, and instant synchronization.

---


---

## 📸 Visual Showcase & Application Screenshots

Here is a visual tour of the **GoSulawesi Web Experience**, comparing desktop views and mobile app layouts side-by-side:

### 1. 🌟 Landing Page & Hero Showcase
| Desktop View (`1-pc.png`) | Mobile App Experience (`1-app.png`) |
| :---: | :---: |
| <img src="https://raw.githubusercontent.com/Moh-Shafi/Go-sulawesi/main/Foto/1-pc.png" width="540" alt="Landing Desktop" /> | <img src="https://raw.githubusercontent.com/Moh-Shafi/Go-sulawesi/main/Foto/1-app.png" width="260" alt="Landing Mobile" /> |

---

### 2. 🗺️ Destination Exploration & Cultural Discovery
| Desktop Search & Filter (`2-pc.png`) | Mobile Destination View (`2-app.png`) |
| :---: | :---: |
| <img src="https://raw.githubusercontent.com/Moh-Shafi/Go-sulawesi/main/Foto/2-pc.png" width="540" alt="Discovery Desktop" /> | <img src="https://raw.githubusercontent.com/Moh-Shafi/Go-sulawesi/main/Foto/2-app.png" width="260" alt="Discovery Mobile" /> |

---

### 3. 🛶 Tour Packages, Guides & Booking Detail
| Tour & Guide Package Info (`3-pc.png`) | Mobile Checkout & Reservation (`3-app.png`) |
| :---: | :---: |
| <img src="https://raw.githubusercontent.com/Moh-Shafi/Go-sulawesi/main/Foto/3-pc.png" width="540" alt="Tour Detail Desktop" /> | <img src="https://raw.githubusercontent.com/Moh-Shafi/Go-sulawesi/main/Foto/3-app.png" width="260" alt="Tour Detail Mobile" /> |

---

### 4. 🏢 Local Provider & Business Dashboard
| Business Revenue & Operations (`4-pc.png`) | Mobile Provider Management (`4-app.png`) |
| :---: | :---: |
| <img src="https://raw.githubusercontent.com/Moh-Shafi/Go-sulawesi/main/Foto/4-pc.png" width="540" alt="Business Dashboard Desktop" /> | <img src="https://raw.githubusercontent.com/Moh-Shafi/Go-sulawesi/main/Foto/4-app.png" width="260" alt="Business Mobile" /> |

---

### 5. 🧳 Tourist Itinerary & Trips Organizer
| Tourist Hub & My Trips (`5-pc.png`) | Mobile Tourist Profile (`5-app.png`) |
| :---: | :---: |
| <img src="https://raw.githubusercontent.com/Moh-Shafi/Go-sulawesi/main/Foto/5-pc.png" width="540" alt="Tourist Dashboard Desktop" /> | <img src="https://raw.githubusercontent.com/Moh-Shafi/Go-sulawesi/main/Foto/5-app.png" width="260" alt="Tourist Mobile" /> |

---

### 6. 📱 Reels Video Feed & Interactive Mobile UI
| Admin Operations Suite (`6-pc.png`) | TikTok-Style Reels Stream (`6-app.png`) |
| :---: | :---: |
| <img src="https://raw.githubusercontent.com/Moh-Shafi/Go-sulawesi/main/Foto/6-pc.png" width="540" alt="Admin Suite Desktop" /> | <img src="https://raw.githubusercontent.com/Moh-Shafi/Go-sulawesi/main/Foto/6-app.png" width="260" alt="Reels Feed Mobile" /> |

<div align="center">
  <p><b>Mobile Onboarding & Guide Engagement:</b></p>
  <img src="https://raw.githubusercontent.com/Moh-Shafi/Go-sulawesi/main/Foto/10-app.png" width="240" alt="App Screen 10" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/Moh-Shafi/Go-sulawesi/main/Foto/11-app.png" width="240" alt="App Screen 11" />
</div>


## 🏛️ Application Architecture & Folder Hierarchy

```
Go-sulawesi-frontend/
├── public/                     # Static production assets
│   ├── avatar/                 # Sample & default user avatars
│   ├── img/                    # High-res tourism destinations photography
│   ├── img-local/              # Local business & experience previews
│   ├── logo/                   # Brand assets (favicons, PNGs, SVG)
│   └── icons.svg               # Optimized SVG icon sprite system
├── src/
│   ├── assets/                 # SVGs and bundled brand graphics
│   ├── components/             # Reusable UI component library
│   │   ├── AdminLayout.tsx     # Admin sidebar, header, and route wrapper
│   │   ├── BusinessLayout.tsx  # Business portal layout wrapper
│   │   ├── TouristLayout.tsx   # Tourist workspace container
│   │   ├── BottomNav.tsx       # Universal mobile navigation bar
│   │   ├── TouristBottomNav.tsx# Tourist mobile dock
│   │   ├── BusinessBottomNav.tsx # Business mobile dock
│   │   ├── ChatWidget.tsx      # Real-time reactive messaging widget
│   │   ├── RequireRole.tsx     # Higher-Order Route Guard for RBAC protection
│   │   ├── BusinessHoursEditor.tsx # Weekly opening hours builder
│   │   ├── CancellationPolicyEditor.tsx # Cancellation terms selector
│   │   └── VideoUploadModal.tsx# Multi-part video submission modal
│   ├── hooks/                  # Custom React hooks
│   │   └── useLang.ts          # Localization and language switching hook
│   ├── lib/                    # Foundation libraries & API services
│   │   ├── api.ts              # Fetch wrappers, credential injection, error handling
│   │   └── saved.ts            # Local cache, offline sync, and storage helpers
│   ├── pages/                  # 37 Route-level page components
│   │   ├── LandingPageV3.tsx   # Current primary production landing page
│   │   ├── LoginPage.tsx       # Auth authentication screen
│   │   ├── SignUpPage.tsx      # Role-based onboarding registration
│   │   ├── OnboardingQuiz.tsx  # Interactive personalization quiz
│   │   ├── TouristDashboard.tsx# Tourist control center
│   │   ├── BusinessDashboard.tsx # Provider analytics and control
│   │   ├── AdminDashboard.tsx  # Superadmin control suite
│   │   ├── VideoFeedPage.tsx   # Reels short-video player interface
│   │   └── ...                 # Additional specialized subpages
│   ├── App.tsx                 # Central routing registry and route guards
│   ├── main.tsx                # React DOM 19 bootstrap root
│   ├── index.css               # Global design tokens and Tailwind imports
│   └── style.css               # Custom animations, keyframes, scrollbar styling
├── index.html                  # HTML entry point with meta viewport & SEO tags
├── package.json                # Project dependencies and script declarations
├── postcss.config.mjs          # PostCSS processing pipeline for Tailwind v4
├── tsconfig.json               # Strict TypeScript compiler definitions
└── vite.config.ts              # Vite bundler options, local HMR & proxy routing
```

---

## 🔒 Security Implementation (Frontend)

GoSulawesi implements defense-in-depth security principles on the client side:

1. **XSS Protection via HttpOnly Cookie Authentication**:
   - Authentication tokens are **never stored in `localStorage` or `sessionStorage`**, eliminating token theft via Cross-Site Scripting (XSS).
   - All session credentials rely on browser-level `httpOnly`, `SameSite=Lax`, and `Secure` cookies managed automatically by the browser and API.

2. **Client-Side Role-Based Route Guards (`RequireRole.tsx`)**:
   - Every sensitive route (`/tourist/*`, `/business/*`, `/admin/*`) is encapsulated within `RequireRole`.
   - Unauthorized attempts immediately redirect the user to `/login` with status preservation.
   - Even if the client state is manipulated, all actual data access is strictly enforced by the backend API.

3. **CORS & Reverse Proxy Sanitization**:
   - In local development, `vite.config.ts` proxies `/api`, `/uploads`, and `/sounds` directly to the backend (`http://localhost:8082`), removing cross-origin vulnerabilities and avoiding insecure wildcard headers.

4. **Input Sanitization & Injection Prevention**:
   - React 19 JSX standard data escaping is applied across all dynamic input renderings to prevent HTML injection.
   - Text inputs across search bars, chats, and review fields are strictly trimmed and validated before transmission.

---

## ⚡ Getting Started & Development Setup

### System Prerequisites
- **Node.js**: v20.x or v22.x LTS
- **Package Manager**: npm (v10+), yarn, or pnpm
- **GoSulawesi Backend API**: Running on port `8082` (see [Backend Setup](https://github.com/Moh-Shafi/Go-sulawesi-backend))

### 1. Installation
```bash
git clone https://github.com/Moh-Shafi/Go-sulawesi-frontend.git
cd Go-sulawesi-frontend
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
The application will launch with Hot Module Replacement (HMR) at:
👉 **`http://localhost:5173`** (or `http://127.0.0.1:5173`)

### 3. Production Build & Static Analysis
```bash
# Type check and build optimized bundle into /dist
npm run build

# Preview production build locally
npm run preview
```

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Core UI Library** | React 19.2.6 | UI component lifecycle, concurrent transitions |
| **Language** | TypeScript 6.0 | Strict static typing, interfaces, autocompletion |
| **Build Tooling** | Vite 8.0.12 | Lightning-fast ESM dev server and Rollup bundling |
| **Styling** | TailwindCSS v4.3.0 | Modern CSS engine, utility-first responsive design |
| **Routing** | React Router v7.15.0 | Client-side routing, nested routes, role guards |

---

## 🤝 Contribution & Workflow

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes with clear messages: `git commit -m "feat: implement booking filter"`
3. Push to your branch: `git push origin feature/amazing-feature`
4. Open a Pull Request targeting `main`.

---

<div align="center">

Made with pride for **Sulawesi, Indonesia** 🇮🇩 · Managed by [Moh-Shafi](https://github.com/Moh-Shafi)

</div>