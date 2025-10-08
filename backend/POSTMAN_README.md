# Toadoo API - Postman Collection

This directory contains the complete Postman collection and environment for testing the Toadoo API.

## Files

- **`Toadoo_API_Complete.postman_collection.json`** - Complete API collection with all endpoints
- **`Toado_API.postman_environment.json`** - Environment variables for local development

## Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Toadoo_API_Complete.postman_collection.json`
4. The collection will appear in your Collections sidebar

### 2. Import Environment
1. Click the **Environments** icon (gear icon)
2. Click **Import**
3. Select `Toado_API.postman_environment.json`
4. Select "Toadoo API - Local" from the environment dropdown

### 3. Start the Backend Server
```bash
cd backend
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## Usage Flow

### Authentication Flow
1. **Register** - Create a new user account
2. **Login** - Get access and refresh tokens (automatically saved to environment)
3. Use authenticated endpoints with the saved tokens

### Testing Todos
1. **Create Todo** - Add a new task
2. **List Todos** - View all your tasks
3. **Update Todo** - Modify task details or status
4. **Delete Todo** - Remove a task
5. **Harvest Completed** - Archive completed tasks and update lifetime count

### Leaderboard
- **All-Time** - View lifetime completion rankings
- **Monthly** - View last 30 days rankings
- **Weekly** - View last 7 days rankings

### Admin Operations (Requires admin role)
- Manage users (list, view, update role/status, delete)
- View all todos across users
- Get system statistics

## API Endpoints Overview

### Auth (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login and get tokens
- `GET /me` - Get current user profile
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout and revoke tokens
- `POST /verify-email` - Verify email with token
- `POST /resend-verification` - Resend verification email
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

### Users (`/api/users`)
- `GET /me` - Get my profile
- `PUT /me` - Update my profile
- `POST /me/change-password` - Change password
- `DELETE /me` - Delete my account

### Todos (`/api/todos`)
- `GET /` - List todos (with optional filters)
- `POST /` - Create todo
- `GET /{id}` - Get todo by ID
- `PUT /{id}` - Update todo
- `DELETE /{id}` - Delete todo
- `GET /leaderboard` - Get leaderboard (all-time/monthly/weekly)
- `POST /harvest-completed` - Harvest completed tasks

### Admin (`/api/admin`)
- `GET /users` - List all users
- `GET /users/{id}` - Get user details
- `PUT /users/{id}/role` - Update user role
- `PUT /users/{id}/status` - Update user status
- `DELETE /users/{id}` - Delete user
- `GET /todos` - List all todos
- `GET /stats` - Get system statistics

## Environment Variables

The environment includes:
- `base_url` - API base URL (default: http://localhost:8000)
- `access_token` - JWT access token (auto-populated on login)
- `refresh_token` - JWT refresh token (auto-populated on login)
- `user_id` - Current user ID
- `todo_id` - Todo ID for testing

## Auto-Save Tokens

The Login and Refresh Token requests have test scripts that automatically save tokens to the environment:

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.access_token);
    pm.environment.set("refresh_token", jsonData.refresh_token);
}
```

## Query Parameters

Many endpoints support optional query parameters:

**List Todos:**
- `status` - Filter by status (pending, in_progress, completed)
- `priority` - Filter by priority (low, medium, high)

**Leaderboard:**
- `period` - Time period (all-time, monthly, weekly)
- `limit` - Number of results (default: 20)

**Admin List Users:**
- `skip` - Pagination offset
- `limit` - Number of results
- `is_active` - Filter by active status

## Response Examples

### Successful Login
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### User Profile
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "testuser",
  "role": "user",
  "is_active": true,
  "is_verified": true,
  "total_completed_count": 42,
  "created_at": "2025-10-01T12:00:00Z"
}
```

### Todo Item
```json
{
  "id": 1,
  "title": "Complete project",
  "description": "Finish the Toadoo API",
  "status": "in_progress",
  "priority": "high",
  "due_date": "2025-10-15T00:00:00Z",
  "created_at": "2025-10-08T10:00:00Z",
  "updated_at": "2025-10-08T14:30:00Z"
}
```

### Harvest Response
```json
{
  "harvested": 5,
  "total_completed_count": 47,
  "user_id": 1,
  "username": "testuser"
}
```

## Tips

1. **Always login first** - Most endpoints require authentication
2. **Check environment** - Make sure "Toadoo API - Local" is selected
3. **Token expiry** - If you get 401 errors, use the Refresh Token endpoint
4. **Admin endpoints** - Require admin role (update via Admin panel or database)
5. **Rate limiting** - Some endpoints have rate limits (login, register, forgot password)

## Troubleshooting

### 401 Unauthorized
- Token expired - use Refresh Token endpoint
- Not logged in - use Login endpoint
- Wrong environment selected

### 403 Forbidden
- Insufficient permissions (admin role required)
- Account not active

### 404 Not Found
- Resource doesn't exist
- Wrong ID in URL
- Check base_url in environment

### 422 Validation Error
- Invalid request body
- Missing required fields
- Check request examples in collection

## Support

For issues or questions:
- Check the API documentation at `http://localhost:8000/docs`
- Review the backend logs
- Verify database migrations are up to date
