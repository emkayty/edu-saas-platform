# EduSaaS Platform - Testing Guide

## Prerequisites

Before testing, ensure you have installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v15) - for local development
- **Redis** (v7) - for caching
- **Git** - to clone the repository

---

## Quick Start (Docker)

The fastest way to test the entire platform:

```bash
# 1. Clone and navigate to project
cd /workspace/edu-saas-platform

# 2. Start all services with Docker
cd docker
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Swagger Docs: http://localhost:3001/api/docs
```

---

## Manual Setup (Without Docker)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev

# Backend runs on: http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

### 2. Frontend Setup (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend runs on: http://localhost:3000
```

### 3. Mobile App Setup

```bash
# Navigate to mobile
cd mobile

# Install dependencies
npm install

# Run on iOS (macOS)
npm run ios

# Run on Android
npm run android

# Or start Metro bundler
npm start
```

---

## Environment Variables

Create a `.env` file in `backend/` directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=edusaas
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=3001
NODE_ENV=development

# JAMB (Optional)
JAMB_CAPS_BASE_URL=https://caps.jamb.gov.ng/api/v1
JAMB_INSTITUTION_CODE=your_code
JAMB_API_KEY=your_key

# Remita (Optional)
REMITA_MERCHANT_ID=your_merchant_id
REMITA_API_KEY=your_api_key
REMITA_SERVICE_TYPE_ID=your_service_type
```

---

## Testing the API

### Using Swagger (Recommended)

1. Start the backend: `npm run start:dev`
2. Open: http://localhost:3001/api/docs
3. Use the interactive API explorer

### Using curl

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@edusaas.com","password":"password"}'
```

### Using Postman

Import the OpenAPI spec:
1. Start backend
2. Go to http://localhost:3001/api/docs-json
3. Import into Postman

---

## Testing Credentials

After seeding the database, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@edusaas.com | admin123 |
| Admin | admin@edusaas.com | admin123 |
| Lecturer | lecturer@edusaas.com | lecturer123 |
| Student | student@edusaas.com | student123 |
| Parent | parent@edusaas.com | parent123 |

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific module tests
npm test -- users
npm test -- auth
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Common Issues & Solutions

### Database Connection Failed

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Create database manually
createdb edusaas
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Node Modules Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps After Testing

1. **Configure integrations**: Add JAMB, Remita API keys
2. **Customize branding**: Update logo, colors in settings
3. **Seed data**: Run database seeds for sample data
4. **Deploy**: Use Kubernetes manifests in `/k8s`

---

## Need Help?

- Documentation: `/docs/README.md`
- API Docs: http://localhost:3001/api/docs (when running)
- Issues: https://github.com/emkayty/edu-saas-platform/issues