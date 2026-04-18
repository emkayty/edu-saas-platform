# University Portal - Complete Setup Guide

## Prerequisites

Ensure you have the following installed:
- **Node.js** 20.x or higher
- **pnpm** 8.x or higher
- **Python** 3.11 or higher
- **PostgreSQL** 16 with pgvector extension
- **Redis** 7
- **Docker** and **Docker Compose**

## Quick Start

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd university-portal

# Install Node.js dependencies
pnpm install

# Install Python dependencies
cd apps/api
pip install -r requirements.txt
cd ../..
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 3. Start Infrastructure (Docker)

```bash
# Start database, redis, rabbitmq, centrifugo
docker-compose up -d postgres_primary redis rabbitmq centrifugo
```

### 4. Start Backend

```bash
cd apps/api

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### 5. Start Frontend

```bash
cd apps/web

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
pnpm dev
```

## Project Structure

```
university-portal/
├── apps/
│   ├── api/           # Django Ninja backend
│   ├── web/           # Next.js frontend
│   └── mobile/        # Expo mobile app (future)
├── packages/
│   ├── ui/           # Shared UI components
│   └── api-client/   # Auto-generated API client
├── tooling/          # Shared tooling configs
├── docker/           # Docker configurations
└── docker-compose.yml
```

## Phase Implementation Order

### Phase 1: Foundation (Complete ✅)
- [x] Turborepo setup
- [x] Docker Compose
- [x] Django settings
- [x] Core models (User, Session, Audit)
- [x] JWT Authentication with MFA
- [x] Next.js setup

### Phase 2: Authentication (Next)
- SSO integration
- Social login
- Session management

### Phase 3: Student Module
- Student registration
- Profile management
- JAMB/NIN verification

### Phase 4: Academic Module
- Course management
- Enrollment
- Grades
- LMS

### Phase 5: Finance Module
- Payment processing
- Remita, Paystack, Flutterwave
- Fee management

### Phase 6: Notifications
- Email, SMS, Push
- Real-time with Centrifugo

### Phase 7: Admin Dashboard
- Analytics
- Reporting

### Phase 8: AI/ML Integration
- Predictions
- Chatbot

### Phase 9: Mobile App
- Expo app

### Phase 10: Preset System
- University branding
- Theme customization

### Phase 11: Testing & Deployment

## Key Features

### Authentication
- JWT-based authentication
- Multi-factor authentication (TOTP)
- Session management
- Password policies

### Nigerian Integration
- JAMB CAPS API
- NIMC NIN verification
- Remita payments
- Paystack integration
- Flutterwave integration
- SMS (Termii)

### Academic Features
- Course registration
- Grade management
- Attendance tracking
- Degree audit
- Transcript generation

### Financial Features
- Tuition payment
- Payment plans
- Financial aid
- Refund processing

## Running Tests

```bash
# Backend tests
cd apps/api
pytest

# Frontend tests
cd apps/web
pnpm test
```

## Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps

# Check connection
docker-compose exec postgres_primary psql -U postgres -c "SELECT 1;"
```

### Redis Connection Issues
```bash
# Check Redis
docker-compose exec redis redis-cli ping
```

### Port Conflicts
```bash
# Check port usage
lsof -i :8000
lsof -i :3000
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

MIT License