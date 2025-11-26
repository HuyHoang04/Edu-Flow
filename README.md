# Teacher Automation System

Hệ thống tự động hóa các tác vụ của giáo viên với giao diện kéo thả workflow.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (Port 3000)
- **Main Backend**: NestJS (Port 4000) - Workflow, Class Management, Communication, Exams
- **AI Content Service**: FastAPI (Port 8000) - AI-powered content generation

## 📋 Features

- ✅ Drag-and-drop workflow builder
- ✅ Class & student management
- ✅ Attendance tracking
- ✅ Email automation (Gmail API)
- ✅ Question bank & exam management with auto-grading
- ✅ AI content generation (PPTX, DOC, Video) powered by Google Gemini
- ✅ Forms & surveys
- ✅ Reports & analytics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Redis 7+
- Google Cloud account (OAuth, Gemini API, Gmail API)
- Cloudinary account

### Environment Setup

1. Copy `.env.example` files to `.env` in each service
2. Fill in your API keys and credentials

### Development

```bash
# Start all services with Docker
docker-compose up -d

# Or run individually:

# Frontend
cd frontend
npm install
npm run dev

# Main Backend
cd services/main-backend
npm install
npm run start:dev

# AI Content Service
cd services/ai-content
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 📚 Documentation

- [Implementation Plan](./implementation_plan.md)
- [Project Context](./PROJECT_CONTEXT.md)
- [Task Breakdown](./task.md)

## 🔑 API Keys Required

From Google Cloud Console:
- Google OAuth 2.0 Client ID & Secret
- Gemini API Key
- Gmail API Credentials

From Cloudinary:
- Cloud Name
- API Key
- API Secret

## 🛠️ Tech Stack

### Frontend
- Next.js 14, React Flow, Tailwind CSS, shadcn/ui, NextAuth.js, Zustand

### Backend
- NestJS, TypeORM, PostgreSQL, BullMQ, Redis, Passport.js

### AI Service
- FastAPI, SQLAlchemy, Google Gemini API, Celery, python-pptx

## 📝 License

Private project for educational purposes.
