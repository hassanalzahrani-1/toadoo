"""Pydantic schemas for request/response validation."""
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.models import TodoStatus, TodoPriority


class TodoBase(BaseModel):
    """Base schema for Todo with shared fields."""
    title: str = Field(..., min_length=1, max_length=200, description="Todo title")
    description: Optional[str] = Field(None, max_length=2000, description="Todo description")
    status: TodoStatus = Field(default=TodoStatus.PENDING, description="Todo status")
    priority: TodoPriority = Field(default=TodoPriority.MEDIUM, description="Todo priority")
    due_date: Optional[datetime] = Field(None, description="Due date for the todo")
    
    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Validate due_date format."""
        # Allow past dates - users may want to track overdue tasks
        return v


class TodoCreate(TodoBase):
    """Schema for creating a new todo."""
    pass


class TodoUpdate(TodoBase):
    """Schema for updating an existing todo."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    status: Optional[TodoStatus] = None
    priority: Optional[TodoPriority] = None


class TodoOut(TodoBase):
    """Schema for todo responses."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# User schemas
class UserBase(BaseModel):
    """Base user schema with shared fields."""
    email: str = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50, description="Username")


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, max_length=100, description="User password")
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Ensure password meets requirements."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="User password")


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    email: Optional[str] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)


class PasswordChange(BaseModel):
    """Schema for changing password."""
    old_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password")


class UserOut(UserBase):
    """Schema for user responses."""
    id: int
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserAdminOut(UserOut):
    """Schema for admin user responses with additional fields."""
    updated_at: datetime


# Token schemas
class Token(BaseModel):
    """JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    """Schema for token refresh request."""
    refresh_token: str


class TokenData(BaseModel):
    """Schema for decoded token data."""
    user_id: Optional[int] = None
    username: Optional[str] = None


# Email verification schemas
class EmailVerification(BaseModel):
    """Schema for email verification."""
    token: str


class PasswordResetRequest(BaseModel):
    """Schema for password reset request."""
    email: str


class PasswordReset(BaseModel):
    """Schema for password reset."""
    token: str
    new_password: str = Field(..., min_length=8, description="New password")
