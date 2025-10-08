# 🐸 Toadoo - Full-Stack Todo Application

**Phase 2: Enhanced version with authentication, user management, and admin features**

Built on [Phase 1 (Toado)](https://github.com/hassanalzahrani-1/Toado) foundation.

---

## ✨ Features

### Phase 1 (Completed)
- ✅ Full CRUD operations for todos
- ✅ Input validation with Pydantic
- ✅ SQLAlchemy ORM with SQLite
- ✅ Auto-generated API documentation
- ✅ Request logging middleware
- ✅ Comprehensive test suite

### Phase 2 (In Progress)
- 🔐 User registration and authentication (JWT)
- 👤 User-specific todos
- 🛡️ Role-based access control (USER, ADMIN)
- 👑 Admin endpoints for user/todo management
- ⚡ Rate limiting (slowapi)
- 📧 Email verification (mock)
- 🔑 Password reset functionality
- 🎨 React frontend with TypeScript
- 📊 Admin dashboard

---

## 🏗️ Project Structure

```
toadoo/
├── backend/           # FastAPI REST API
│   ├── app/
│   │   ├── routers/   # API endpoints
│   │   ├── models.py  # SQLAlchemy models
│   │   ├── schemas.py # Pydantic schemas
│   │   └── ...
│   └── tests/
│
└── frontend/          # React + TypeScript UI
    └── src/
```

---

## 🚀 Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

---

## 📚 API Documentation

Interactive API docs available at `/docs` when backend is running.

### Endpoints (Phase 2)

**Authentication**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login (get JWT tokens)
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user profile

**Todos** (Protected)
- `GET /todos` - List user's todos
- `POST /todos` - Create todo
- `GET /todos/{id}` - Get todo
- `PUT /todos/{id}` - Update todo
- `DELETE /todos/{id}` - Delete todo

**Admin** (Admin only)
- `GET /admin/users` - List all users
- `GET /admin/todos` - List all todos
- `GET /admin/stats` - System statistics
- `PUT /admin/users/{id}` - Update user role/status

---

## 🧪 Testing

```bash
cd backend
pytest
pytest --cov=app tests/
```

---

## 📦 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM
- **SQLite** - Database
- **Pydantic** - Data validation
- **python-jose** - JWT tokens
- **passlib** - Password hashing
- **slowapi** - Rate limiting
- **pytest** - Testing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

---

## 🗺️ Roadmap

- [x] Phase 1: Basic CRUD API
- [ ] Phase 2: Authentication + Frontend (In Progress)
  - [x] User management & JWT
  - [x] User-scoped todos
  - [x] RBAC & admin endpoints
  - [x] Rate limiting (setup)
  - [x] Email services (mock)
  - [ ] Database migrations (Alembic)
  - [ ] Testing suite
  - [ ] React frontend
  - [ ] Admin dashboard

---

## 📄 License

MIT License - see LICENSE file

---

## 🔗 Links

- Phase 1 Repository: https://github.com/hassanalzahrani-1/Toado
- API Documentation: http://localhost:8000/docs (when running)
