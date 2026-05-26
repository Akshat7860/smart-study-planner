# Smart Study Planner 📚

A full-stack study planning app built with React, Node.js, Express, and MongoDB.

---

## Quick Setup (3 steps)

### Step 1 — Backend setup

```bash
cd server
npm install
```

Open `server/.env` and set your MongoDB URI:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-study-planner
# OR MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart-study-planner
JWT_SECRET=smart_study_planner_jwt_secret_key_2024
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ MongoDB connected: localhost
✅ JWT Secret: ✅ Set
```

---

### Step 2 — Frontend setup

Open a **new terminal**:

```bash
cd client
npm install
npm run dev
```

You should see:
```
Local: http://localhost:5173
```

---

### Step 3 — Open the app

Go to **http://localhost:5173** in your browser and sign up!

---

## MongoDB Options

### Option A — Local MongoDB
Install MongoDB Community Edition and it runs on `mongodb://localhost:27017` by default.

### Option B — MongoDB Atlas (Free Cloud)
1. Go to https://www.mongodb.com/atlas
2. Create a free cluster
3. Go to **Connect → Drivers → Node.js** and copy the connection string
4. Paste it as `MONGO_URI` in `server/.env`
5. In Atlas: **Network Access → Add IP Address → Allow from Anywhere** (for development)

---

## Project Structure

```
smart-study-planner/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/          # Register, Login, Dashboard, etc.
│   │   ├── context/        # AuthContext (JWT management)
│   │   ├── services/api.js # Axios instance
│   │   └── components/     # Layout, UI components
│   ├── .env                # VITE_API_URL (blank for dev)
│   └── vite.config.js      # Proxy: /api → localhost:5000
│
└── server/                 # Express + MongoDB backend
    ├── controllers/        # authController, etc.
    ├── models/             # User, Subject, Session, Timetable
    ├── routes/             # auth, subjects, sessions, timetable
    ├── middleware/auth.js  # JWT protect middleware
    ├── config/db.js        # MongoDB connection
    ├── .env                # MONGO_URI, JWT_SECRET (YOU MUST CREATE THIS)
    └── index.js            # Express app entry point
```

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | ❌ | Create account |
| POST | /api/auth/login | ❌ | Login |
| GET | /api/auth/me | ✅ | Get current user |
| PUT | /api/auth/preferences | ✅ | Update preferences |
| GET | /api/subjects | ✅ | Get all subjects |
| POST | /api/subjects | ✅ | Add subject |
| GET | /api/sessions | ✅ | Get study sessions |
| POST | /api/sessions | ✅ | Log study session |
| GET | /api/timetable | ✅ | Get timetable |
| POST | /api/timetable | ✅ | Add timetable entry |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `MONGO_URI is not set` | Check `server/.env` exists and has MONGO_URI |
| `MongoDB connection failed` | Check Atlas IP whitelist or local MongoDB is running |
| `CORS error` in browser | Check CLIENT_URL in `server/.env` matches your frontend URL |
| `Cannot connect to server` | Make sure `npm run dev` is running in `server/` folder |
| `400 All fields required` | Make sure name, email, and password are all filled |
