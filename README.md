# Tapform - NFC & Dynamic QR Stand Platform

Full-Stack Smart NFC Stand & Dynamic QR Touchpoint Platform designed for Google Reviews, Instagram, Wi-Fi, and custom business destinations.

---

## 🚀 Quick Deployment Guide (Deploying to Production)

### Option 1: All-in-One Full-Stack Deployment on Render.com (Recommended)
You can deploy both the React frontend and Node.js backend together as a single Web Service on **Render**:

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```
2. Log in to [Render.com](https://dashboard.render.com/) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Fill in the deployment settings:
   - **Environment:** `Node`
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `MONGO_DB_URI`: Your MongoDB Atlas URI
   - `NODE_ENV`: `production`
   - `ADMIN_PASSWORD`: Your secret admin passcode (default: `admin1234`)
   - `BASE_URL`: (Optional - Render automatically detects domain, or enter `https://your-app.onrender.com`)
6. Click **Deploy Web Service**!
   Render will build the Vite React frontend into `/dist` and launch Express, which serves:
   - Frontend pages (`/`, `/admin`, `/activate`, `/qr-generator`)
   - Instant dynamic NFC/QR redirections (`/c/:cardId`)
   - REST API endpoints (`/api/*`)

---

### Option 2: Separate Deployments (Frontend on Vercel + Backend on Render/Railway)
If you prefer hosting the React frontend on **Vercel** and the backend on **Render**:

1. **Backend (Render):**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: `MONGO_DB_URI`, `ADMIN_PASSWORD`, `CLIENT_ORIGIN=https://your-frontend.vercel.app`
2. **Frontend (Vercel):**
   - Root Directory: `./` (root)
   - Framework Preset: `Vite`
   - Environment Variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`

---

## 🛠 Features & Verification Summary

- **Instant NFC & QR Redirects (`/c/:cardId`):** In-memory scan cache provides sub-millisecond instant 302 redirections with zero database lag.
- **Dynamic Stand Editing (`/activate`):** Customers or business owners can scan or visit `/activate?cardId=TF-XXXXX` to change their destination URL anytime without replacing the physical stand.
- **Admin Dashboard (`/admin`):**
  - Secured with master passcode.
  - Live analytics (total cards, active cards, total customer taps/scans, activation rates).
  - Bulk Card Generator (e.g., generate 100 to 2,000 cards at once).
  - Print & Export Tools: 1024x1024 PNG, scalable SVG, and CSV manifest ZIP export for acrylic manufacturers.
- **Stand Self-Checker:** Customers on the homepage can look up their stand ID to view live scan counts and edit their link.

---

## 🧪 Testing Locally

- Run Backend Tests:
  ```bash
  node backend/src/testRunner.js
  node backend/src/testAdminBulk.js
  node backend/src/testE2E.js
  ```
- Run Frontend Build:
  ```bash
  npm run build
  ```
- Run Code Linting:
  ```bash
  npm run lint
  ```
- Run Full-Stack Local Server:
  ```bash
  npm start
  ```
