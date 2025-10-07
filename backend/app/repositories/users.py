"""User repository for database operations."""
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models import User, UserRole
from app.schemas import UserCreate, UserUpdate
from app.services.auth import hash_password


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username."""
    return db.query(User).filter(User.username == username).first()


def get_user_by_username_or_email(db: Session, identifier: str) -> Optional[User]:
    """Get user by username or email."""
    return db.query(User).filter(
        or_(User.username == identifier, User.email == identifier)
    ).first()


def get_users(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    role: Optional[UserRole] = None
) -> list[User]:
    """Get list of users with optional filters."""
    query = db.query(User)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    if role is not None:
        query = query.filter(User.role == role)
    
    return query.offset(skip).limit(limit).all()


def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user."""
    hashed_password = hash_password(user_data.password)
    
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        role=UserRole.USER,
        is_active=True,
        is_verified=False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_data: UserUpdate) -> Optional[User]:
    """Update user information."""
    db_user = get_user_by_id(db, user_id)
    
    if not db_user:
        return None
    
    update_data = user_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_password(db: Session, user_id: int, new_password: str) -> Optional[User]:
    """Update user password."""
    db_user = get_user_by_id(db, user_id)
    
    if not db_user:
        return None
    
    db_user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_role(db: Session, user_id: int, role: UserRole) -> Optional[User]:
    """Update user role (admin operation)."""
    db_user = get_user_by_id(db, user_id)
    
    if not db_user:
        return None
    
    db_user.role = role
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_status(db: Session, user_id: int, is_active: bool) -> Optional[User]:
    """Activate or deactivate user (admin operation)."""
    db_user = get_user_by_id(db, user_id)
    
    if not db_user:
        return None
    
    db_user.is_active = is_active
    db.commit()
    db.refresh(db_user)
    return db_user


def verify_user_email(db: Session, user_id: int) -> Optional[User]:
    """Mark user email as verified."""
    db_user = get_user_by_id(db, user_id)
    
    if not db_user:
        return None
    
    db_user.is_verified = True
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    """Delete user (hard delete)."""
    db_user = get_user_by_id(db, user_id)
    
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True


def count_users(db: Session) -> int:
    """Count total users."""
    return db.query(User).count()
