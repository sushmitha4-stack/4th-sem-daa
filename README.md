<<<<<<< HEAD
# Aegis Command — AI Emergency Routing Platform

Aegis Command is a React + Express project for simulating emergency dispatch, route optimization, and resource allocation. The repository is split into two main services:

- `frontend/` — React app for the dashboard and user interface
- `backend/` — Express API for dispatch logic and algorithm processing

## ✅ What changed
I reorganized the docs to make the project easier to understand and use.

## 🚀 Quick Start
1. Open a terminal in the project root.
2. Install dependencies for root, backend, and frontend:
   ```bash
   npm run install-all
   ```
3. Start both services:
   ```bash
   npm start
   ```
4. Open the app in the browser:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## 📦 Folder structure
- `backend/` — Express server, route controllers, algorithm utilities
- `frontend/` — Vite + React app, UI components, styles
- `database.json` — local JSON fallback data store
- `start-platform.bat` — Windows shortcut to launch the app
- `package.json` — root scripts for installing and running the project
- `.gitignore` — clean repo ignores node_modules and temp files

## 🛠️ Main commands
- `npm run install-all` — install root, backend, and frontend dependencies
- `npm run dev` — start backend and frontend together
- `npm start` — same as `npm run dev`
- `npm run backend` — run only the backend server
- `npm run frontend` — run only the frontend app

## 🔧 Where to work
- Change API behavior in `backend/src/routes` and `backend/src/controllers`
- Update algorithms in `backend/src/utils`
- Edit UI screens in `frontend/src/components`
- Configure styling in `frontend/src/index.css` and `frontend/tailwind.config.js`

## 💡 Notes
- Root package handles running both services together.
- Backend uses `nodemon` for automatic restarts during development.
- Frontend is powered by Vite for fast refresh.
- Keep the main app entry points in `frontend/src/main.jsx` and `backend/src/server.js`.

