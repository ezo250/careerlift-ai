# Kepler CareerLift - Deployment Guide

## Backend Deployment (Render)

### Setup Instructions:

1. **Create a new Web Service on Render**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: https://github.com/ezo250/careerlift-ai.git

2. **Configure the service:**
   - **Name**: careerlift-api
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Add Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://humbertjames17_db_user:rFgWwCGDycHbcFaD@cluster0.zd1yx51.mongodb.net/careerlift?retryWrites=true&w=majority
   JWT_SECRET=kepler_careerlift_secret_key_2025_secure
   NODE_ENV=production
   FRONTEND_URL=https://careerlift-ai.vercel.app
   ```

4. **Deploy**: Click "Create Web Service"

5. **Seed the Database**:
   After deployment, run the seed script once:
   - Go to your Render dashboard
   - Open the Shell tab
   - Run: `node src/seed.js`

## Frontend Deployment (Vercel)

### Setup Instructions:

1. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository: https://github.com/ezo250/careerlift-ai.git

2. **Configure the project:**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Add Environment Variable:**
   ```
   VITE_API_URL=https://careerlift-ai.onrender.com/api
   ```

4. **Deploy**: Click "Deploy"

## Local Development

### Backend:
```bash
cd server
npm install
npm run dev
```

### Frontend:
```bash
npm install
npm run dev
```

## Initial Superadmin Credentials

After seeding the database:
- **Email**: amanialaindrin7@gmail.com
- **Password**: 123

## Features

- ✅ Real MongoDB database
- ✅ JWT authentication
- ✅ Puter AI integration for document grading
- ✅ Role-based access (Superadmin, Teacher, Student)
- ✅ Teacher invite system
- ✅ Section management
- ✅ Job submissions with AI grading
- ✅ Real-time statistics
- ✅ Top candidates selection

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - Student signup
- `POST /api/auth/signup/teacher` - Teacher signup with invite code
- `GET /api/sections` - Get all sections
- `POST /api/sections` - Create section (superadmin)
- `GET /api/jobs` - Get jobs
- `POST /api/jobs` - Create job (superadmin)
- `GET /api/submissions` - Get submissions
- `POST /api/submissions` - Create submission (student)
- `GET /api/stats` - Get dashboard statistics
- `POST /api/invites` - Create teacher invites (superadmin)

## Tech Stack

### Frontend
- React + TypeScript
- Vite
- shadcn/ui
- Tailwind CSS
- TanStack Query
- Puter AI

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

## Support

For issues or questions, contact: amanialaindrin7@gmail.com
