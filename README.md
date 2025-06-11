# Tweeper - Audio Tweeting Application

A monorepo containing a React frontend and Express backend for an audio tweeting application.

## Project Structure

```
├── packages/
│   ├── frontend/          # React + TypeScript + Vite
│   └── backend/           # Express + TypeScript + MongoDB
├── package.json           # Root workspace configuration
└── README.md
```

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm
- MongoDB (local or MongoDB Atlas)

### Environment Variables
Create a `.env` file in `packages/backend/` with:
```
MONGODBURI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Installation
```bash
# Install dependencies for all packages
npm install
```

### Running in Development Mode

#### Option 1: Run both services
```bash
# Terminal 1 - Start backend (http://localhost:3000)
npm run dev:backend

# Terminal 2 - Start frontend (http://localhost:5173)  
npm run dev:frontend
```

#### Option 2: Use the provided scripts
```bash
# Start backend only
npm run dev:backend

# Start frontend only (with API proxy to backend)
npm run dev:frontend
```

The frontend development server automatically proxies API requests to `http://localhost:3000` (backend).

## Production Deployment

### Build and Serve
```bash
# Build frontend and backend, then start production server
npm run start
```

This will:
1. Build the React frontend (`npm run build:frontend`)
2. Build the TypeScript backend (`npm run build:backend`)
3. Start the Express server serving the built frontend

### Manual Build Steps
```bash
# Build frontend only
npm run build:frontend

# Build backend only  
npm run build:backend

# Build both
npm run build:all
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- `POST /api/auth/login` - Login user
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- `GET /api/auth/profile` - Get current user profile (requires auth)
- `PUT /api/auth/change-username` - Change username (requires auth)
  ```json
  {
    "newUsername": "string"
  }
  ```

### Users
- `GET /api/users` - Get all users (public)
- `GET /api/users/:username` - Get user by username (public)

### General
- `GET /hello` - Simple test endpoint
- `GET /api/hello` - JSON API test endpoint
- `GET /*` - Serves React app for all other routes

## Authentication

The app uses JWT (JSON Web Tokens) for authentication:
- Tokens expire after 24 hours
- Include token in Authorization header: `Bearer <token>`
- No persistent sessions - users need to re-login after browser closes

## Database Schema

### User Model
```typescript
{
  username: string;        // unique, 3-20 chars
  password: string;       // hashed with bcrypt
  createdAt: Date;        // auto-generated
}
```

## Username Validation

- **Registration**: Returns error if username already exists
- **Username Change**: Returns error if new username is already taken
- **Uniqueness**: All usernames must be unique across the system
- **Validation**: Username must be 3-20 characters, no special characters

## Development Notes

- Frontend runs on port 5173 (Vite default)
- Backend runs on port 3000
- In development, frontend proxy forwards `/api/*` and `/hello` to backend
- In production, backend serves the built frontend files
- All client-side routes are handled by React Router with fallback to `index.html`
- Passwords are hashed using bcrypt with salt rounds of 12
- MongoDB connection uses Mongoose ODM 