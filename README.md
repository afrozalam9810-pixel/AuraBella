# 🌸 AuraBella — Full-Stack E-Commerce

> Luxury Beauty & Skincare Platform — **React + Vite + Tailwind CSS** (client) · **Node.js + Express + MongoDB** (server)

---

## 📁 Project Structure

```
AuraBella/
├── client/                     # React 18 + Vite 5 + Tailwind CSS 3 SPA
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   └── HomePage.jsx    # Test splash page with live health-check
│   │   ├── store/
│   │   │   └── store.js        # Redux Toolkit store (empty skeleton)
│   │   ├── App.jsx             # Route tree
│   │   ├── main.jsx            # React root (Provider + BrowserRouter)
│   │   └── index.css           # Tailwind directives + global design system
│   ├── index.html
│   ├── tailwind.config.js      # Brand colours, fonts, animations
│   ├── postcss.config.js
│   ├── vite.config.js          # Dev-server proxy for /api
│   ├── .env.example            # Required environment variables
│   └── package.json
│
├── server/                     # Node.js + Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Mongoose connection helper
│   │   ├── middleware/
│   │   │   └── errorHandler.js # Global JSON error handler
│   │   ├── routes/
│   │   │   └── health.route.js # GET /api/health
│   │   └── index.js            # Express entry point
│   ├── .env.example            # Required environment variables
│   └── package.json
│
├── .gitignore                  # Root-level ignores for both sub-projects
└── README.md                   # ← You are here
```

---

## 🛠️ Prerequisites

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | **18.x LTS** or higher | [nodejs.org](https://nodejs.org) |
| npm | **9.x** or higher | bundled with Node.js |
| MongoDB | Cloud (Atlas) or local **6.x** | [mongodb.com](https://www.mongodb.com/cloud/atlas) |
| Git | any | [git-scm.com](https://git-scm.com) |

---

## ⚡ Quick Start

### 1. Clone & navigate

```bash
git clone https://github.com/your-username/aurabella.git
cd aurabella
```

### 2. Set up environment variables

**Server:**
```bash
cp server/.env.example server/.env
# Open server/.env and fill in your values (MongoDB URI, JWT secret, etc.)
```

**Client:**
```bash
cp client/.env.example client/.env
# Open client/.env and set VITE_API_BASE_URL if needed (default: http://localhost:5000/api)
```

### 3. Install dependencies

```bash
# Install server deps
cd server
npm install

# Install client deps
cd ../client
npm install
```

### 4. Run the servers

Open **two terminal tabs/windows**:

**Terminal 1 — Express API (port 5000):**
```bash
cd server
npm run dev
```
You should see:
```
╔══════════════════════════════════════════╗
║  🌸 AuraBella API                        ║
╠══════════════════════════════════════════╣
║  Server  : http://localhost:5000         ║
║  Health  : http://localhost:5000/api/health ║
║  Mode    : development                   ║
╚══════════════════════════════════════════╝
```

**Terminal 2 — React Dev Server (port 5173):**
```bash
cd client
npm run dev
```

### 5. Open the app

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | React frontend (test splash page) |
| `http://localhost:5000/api/health` | Express health-check (raw JSON) |

Click **"Run Health Check"** on the homepage to confirm the full client ↔ API pipeline.

---

## 🧰 Available Scripts

### Server (`/server`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start with **nodemon** (auto-restart on changes) |
| `start` | `npm start` | Start without nodemon (production-style) |

### Client (`/client`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start Vite dev server (HMR enabled) |
| `build` | `npm run build` | Build production bundle to `dist/` |
| `preview` | `npm run preview` | Preview the production build locally |

---

## 🌐 API Endpoints

| Method | Route | Description | Auth Required |
|--------|-------|-------------|--------------|
| `GET` | `/api/health` | Health check — returns server/DB status | No |

> More endpoints will be added as features are built (products, auth, orders, etc.)

---

## 🎨 Tech Stack

### Client
| Library | Version | Purpose |
|---------|---------|---------|
| React | 18 | UI framework |
| Vite | 5 | Build tool & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| react-router-dom | 7 | Client-side routing |
| @reduxjs/toolkit | 2 | State management |
| react-redux | 9 | React bindings for Redux |
| axios | 1 | HTTP client |
| react-icons | 5 | Icon library |

### Server
| Library | Version | Purpose |
|---------|---------|---------|
| Express | 4 | HTTP framework |
| Mongoose | 8 | MongoDB ODM |
| dotenv | 16 | Environment variable loading |
| bcryptjs | 2 | Password hashing |
| jsonwebtoken | 9 | JWT authentication |
| cors | 2 | Cross-Origin Resource Sharing |
| cookie-parser | 1 | Cookie parsing |
| multer | 1 | File upload handling |
| cloudinary | 2 | Cloud image hosting SDK |
| nodemon | 3 | Dev auto-restart |

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable | Example | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Express server port |
| `NODE_ENV` | `development` | Environment mode |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB connection string |
| `JWT_SECRET` | `your-secret-64-chars` | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | JWT token lifespan |
| `JWT_COOKIE_EXPIRES_IN` | `7` | Cookie lifespan in days |
| `CLIENT_URL` | `http://localhost:5173` | CORS allowed origin |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary account |
| `CLOUDINARY_API_KEY` | `123456789` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `abc...` | Cloudinary API secret |

### Client (`client/.env`)

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Backend API base URL |
| `VITE_APP_NAME` | `AuraBella` | App display name |
| `VITE_CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary (browser uploads) |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `your_preset` | Unsigned upload preset |

---

## 🗺️ Planned Features (Future Phases)

- [ ] **Auth** — Register, login, JWT + refresh token, protected routes
- [ ] **Product Catalogue** — Browse, search, filter, sort
- [ ] **Product Detail** — Gallery, variants, reviews, related items
- [ ] **Shopping Cart** — Add/remove, quantity, persisted to Redux
- [ ] **Checkout** — Address, payment integration (Stripe/Razorpay)
- [ ] **Order Management** — History, tracking, cancellation
- [ ] **Admin Dashboard** — Product CRUD, order management, analytics
- [ ] **Image Uploads** — Cloudinary integration via multer
- [ ] **Reviews & Ratings**
- [ ] **Wishlist**

---

## 📝 License

MIT © AuraBella Team
