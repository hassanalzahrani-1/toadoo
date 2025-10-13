# 🐸 Toadoo - Gamified Todo Application

A full-stack todo app with gamification features, leaderboards, and admin dashboard to make task completion fun and competitive.

Built on [Phase 1 (Toado)](https://github.com/hassanalzahrani-1/Toado) foundation.

---

## ✨ Features

### 🎮 Gamification
- **Harvest System** - Complete tasks and harvest them to earn permanent progress
- **Ranking System** - Evolve from 🐸 Young Toad to 🐸✨ Ancient Toad based on lifetime completed tasks
- **Leaderboards** - Compete with others (All-time, Monthly, Weekly)
- **Progress Tracking** - Visual rank-up progress bars

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Password reset functionality
- Email verification system
- Secure password hashing (bcrypt)
- Rate limiting on sensitive endpoints
- Token revocation on password change

### 📋 Todo Management
- **Kanban Board** - Drag-and-drop interface with 3 columns (Pending, In Progress, Completed)
- **Todo Filters** - Filter by status and priority
- **Due Dates** - Calendar picker for deadlines
- **Priority Levels** - Low, Medium, High
- **Real-time Updates** - Instant UI updates

### 👑 Admin Dashboard
- **Statistics Tab** - Beautiful charts showing system metrics
  - Task breakdown (Bar Chart)
  - User engagement (Donut Chart)
  - Lifetime achievement display
- **User Management Tab** - Search, edit roles, manage user status
- **System Stats** - Total users, active tasks, lifetime completed tasks

### 🎨 Modern UI
- Built with **shadcn/ui** components
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- Responsive design
- Dark mode support
- Beautiful animations and transitions

---

## 🏗️ Project Structure

```
toadoo/
├── backend/                    # FastAPI REST API
│   ├── app/
│   │   ├── routers/           # API endpoints
│   │   │   ├── auth.py        # Authentication
│   │   │   ├── users.py       # User management
│   │   │   ├── todos.py       # Tasks & leaderboard
│   │   │   └── admin.py       # Admin operations
│   │   ├── repositories/      # Data access layer
│   │   ├── services/          # Business logic
│   │   ├── dependencies/      # Dependency injection
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   └── config.py          # Configuration
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Test suite
│   └── *.postman_collection.json  # Postman collections
│
└── frontend/                   # React + TypeScript UI
    ├── src/
    │   ├── components/        # Reusable components
    │   │   └── ui/           # shadcn/ui components
    │   ├── contexts/         # React contexts
    │   ├── pages/            # Page components
    │   │   ├── Dashboard.tsx
    │   │   ├── TasksKanban.tsx
    │   │   ├── Leaderboard.tsx
    │   │   ├── Profile.tsx
    │   │   ├── Admin.tsx
    │   │   └── Settings.tsx
    │   └── lib/              # Utilities & API client
    └── public/
```

---

## 🚀 Quick Start (Docker)
```bash
docker compose up
```

**Runtime details**
- **Frontend** Available at `http://localhost:5173` (Vite dev server prints the URL in logs).
- **Backend** Available at `http://localhost:8000` (FastAPI with interactive docs at `/docs`).

**Live reload**
- **Frontend** Edits under `frontend/` trigger Vite hot module reload inside the container.
- **Backend** Edits under `backend/` trigger `uvicorn --reload` restarts automatically.

**Rebuild containers**
- **Dependencies changed** Run `docker compose up --build` after modifying `package.json`, `package-lock.json`, or `requirements.txt`.
- **Reset environment** Run `docker compose down --volumes` followed by `docker compose up --build` if native modules become inconsistent.

**Inspect ports**
- **Command** `docker compose ps` lists running services and published ports.

---

## 🛠️ Manual Setup (Optional)

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

**Backend URLs:**
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend URL:** http://localhost:5173

### Default Admin Account
After first migration, create an admin user:
```bash
# In Python shell or create a script
# Username: admin
# Password: admin123
# Role: admin
```

---

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT tokens)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (revoke refresh token)
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Endpoints
- `GET /api/users/me` - Get my profile
- `PUT /api/users/me` - Update my profile
- `POST /api/users/me/change-password` - Change password
- `DELETE /api/users/me` - Delete my account

### Todo Endpoints
- `GET /api/todos` - List todos (with filters)
- `POST /api/todos` - Create todo
- `GET /api/todos/{id}` - Get todo by ID
- `PUT /api/todos/{id}` - Update todo
- `DELETE /api/todos/{id}` - Delete todo
- `GET /api/todos/leaderboard` - Get leaderboard (all-time/monthly/weekly)
- `POST /api/todos/harvest-completed` - Harvest completed tasks

### Admin Endpoints (Admin Only)
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{id}` - Get user details
- `PUT /api/admin/users/{id}/role` - Update user role
- `PUT /api/admin/users/{id}/status` - Update user status
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/todos` - List all todos
- `GET /api/admin/stats` - Get system statistics

**See `backend/POSTMAN_README.md` for detailed Postman collection usage.**

---

## 🎮 Gamification System

### Rank System
Users earn ranks based on their `total_completed_count` (lifetime harvested tasks):

| Rank | Tasks Required | Name | Emoji |
|------|---------------|------|-------|
| 1 | 0-9 | Young Toad | 🐸 |
| 2 | 10-24 | Pond Hopper | 🐸💚 |
| 3 | 25-49 | Lily Pad Master | 🐸🪷 |
| 4 | 50-99 | Swamp Lord | 👑🐸 |
| 5 | 100-249 | Toad King | 🤴🐸 |
| 6 | 250+ | Ancient Toad | 🐸✨ |

### Harvest System
1. Complete todos (move to "Completed" column)
2. Click "🌾 Harvest Completed" button
3. Completed todos are permanently deleted
4. `total_completed_count` is incremented
5. Rank is updated automatically

### Leaderboards
- **All-Time**: Lifetime completed tasks
- **Monthly**: Tasks harvested in last 30 days
- **Weekly**: Tasks harvested in last 7 days

---

## 🧪 Testing

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_todos.py

# Verbose output
pytest -v
```

---

## 📦 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM with async support
- **Alembic** - Database migrations
- **SQLite** - Database (easily switchable to PostgreSQL)
- **Pydantic** - Data validation
- **python-jose** - JWT token handling
- **passlib[bcrypt]** - Password hashing
- **slowapi** - Rate limiting
- **pytest** - Testing framework

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Beautiful component library
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **date-fns** - Date utilities
- **@dnd-kit** - Drag and drop
- **Sonner** - Toast notifications

---

## 🗄️ Database Schema

### Users Table
- `id`, `email`, `username`, `hashed_password`
- `role` (user/admin), `is_active`, `is_verified`
- `total_completed_count` (for ranking)
- `created_at`

### Todos Table
- `id`, `title`, `description`
- `status` (pending/in_progress/completed)
- `priority` (low/medium/high)
- `due_date`, `user_id`
- `created_at`, `updated_at`

### Harvest History Table
- `id`, `user_id`, `count`, `harvested_at`
- Tracks when users harvest tasks

### Refresh Tokens Table
- `id`, `token`, `user_id`, `expires_at`, `revoked`

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in backend directory:
```env
# Database
DATABASE_URL=sqlite:///./toadoo.db

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Rate Limiting
RATE_LIMIT_LOGIN=5/minute
RATE_LIMIT_REGISTER=3/hour

# Email (Mock)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 📱 Features Showcase

### Dashboard
- Quick stats overview (Total, In Progress, Completed, Rank)
- Rank progress bar with visual feedback
- Recent activity feed
- Quick actions

### Kanban Board
- Drag-and-drop todo management
- Status columns: Pending, In Progress, Completed
- Priority badges (color-coded)
- Due date indicators
- Harvest button for completed todos

### Leaderboard
- Tabbed interface (All-time, Monthly, Weekly)
- User rankings with rank emojis
- Completed task counts
- Current user highlighting

### Profile
- User information display
- Total completed tasks
- Current rank with emoji
- Account creation date

### Admin Dashboard
- **Statistics Tab**: Beautiful charts and metrics
- **User Management Tab**: Search, edit, delete users
- Real-time data refresh
- System-wide analytics

### Settings
- Password change functionality
- Theme selection (Light/Dark/System)
- Account deletion

---

## 🚢 Deployment

### Backend (Example with Render/Railway)
```bash
# Install production dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start with gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend (Example with Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

---

## 📄 License

MIT License - see LICENSE file

---

## 👨‍💻 Author

Hassan Alzahrani

---

## 🔗 Links

- Phase 1 Repository: https://github.com/hassanalzahrani-1/Toado
- API Documentation: http://localhost:8000/docs (when running)
- Postman Collection: See `backend/Toadoo_API_Complete.postman_collection.json`

---

## 🙏 Acknowledgments

- Built with FastAPI and React
- UI components from shadcn/ui
- Icons from Lucide React
- Charts from Recharts
