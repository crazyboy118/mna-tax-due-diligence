# M&A Tax Due Diligence Platform (MERN)

## 1. Backend
    cd server
    cp .env.example .env     # set MONGO_URI and JWT_SECRET
    npm install
    npm run dev              # http://localhost:5001/api/health


## 2. Frontend
    cd client
    cp .env.example .env     # VITE_API_URL=http://localhost:5001/api
    npm install
    npm run dev              # http://localhost:5173

The first registered user becomes `admin` (can create deals, upload, delete, change roles).
Other users start as `reviewer`; admin can promote them to `lead_analyst` with
PUT /api/auth/users/:id/role. Add a user to a deal's team so they can see it.

## Demo flow
Register -> New deal -> Documents (upload) -> Checklist (update statuses) -> Liabilities (add) -> Dashboard
