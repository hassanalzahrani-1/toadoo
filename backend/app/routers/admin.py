"""Admin endpoints for user and system management."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import User, UserRole, TodoStatus
from app.schemas import UserAdminOut, TodoOut
from app.repositories import users as user_repo
from app.repositories import todos as todo_repo
from app.dependencies.auth import require_admin


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=List[UserAdminOut])
async def list_all_users(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    role: Optional[UserRole] = None,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    List all users (admin only).
    
    Optional filters:
    - **is_active**: Filter by active status
    - **role**: Filter by user role
    """
    users = user_repo.get_users(db, skip=skip, limit=limit, is_active=is_active, role=role)
    return users


@router.get("/users/{user_id}", response_model=UserAdminOut)
async def get_user_details(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get detailed user information (admin only).
    """
    user = user_repo.get_user_by_id(db, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.put("/users/{user_id}/role", response_model=UserAdminOut)
async def update_user_role(
    user_id: int,
    role: UserRole,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update user role (admin only).
    
    Can promote users to admin or demote to regular user.
    """
    # Prevent admin from demoting themselves
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )
    
    user = user_repo.update_user_role(db, user_id, role)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.put("/users/{user_id}/status", response_model=UserAdminOut)
async def update_user_status(
    user_id: int,
    is_active: bool,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Activate or deactivate user account (admin only).
    """
    # Prevent admin from deactivating themselves
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user = user_repo.update_user_status(db, user_id, is_active)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete user account (admin only).
    
    This will also delete all user's todos.
    """
    # Prevent admin from deleting themselves
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    success = user_repo.delete_user(db, user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return None


@router.get("/todos", response_model=List[TodoOut])
async def list_all_todos(
    skip: int = 0,
    limit: int = 100,
    status: Optional[TodoStatus] = None,
    user_id: Optional[int] = None,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    List all todos across all users (admin only).
    
    Optional filters:
    - **status**: Filter by todo status
    - **user_id**: Filter by specific user
    """
    if user_id:
        # Get todos for specific user
        todos = todo_repo.list_todos(
            db,
            user_id=user_id,
            status=status,
            skip=skip,
            limit=limit
        )
    else:
        # Get all todos across all users
        todos = todo_repo.list_all_todos(
            db,
            status=status,
            skip=skip,
            limit=limit
        )
    
    return todos


@router.get("/stats")
async def get_system_stats(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get system statistics (admin only).
    
    Returns counts of users, todos, and other metrics.
    """
    from app.models import Todo
    
    total_users = user_repo.count_users(db)
    active_users = len(user_repo.get_users(db, is_active=True, limit=10000))
    admin_users = len(user_repo.get_users(db, role=UserRole.ADMIN, limit=10000))
    
    total_todos = db.query(Todo).count()
    completed_todos = db.query(Todo).filter(Todo.status == TodoStatus.COMPLETED).count()
    pending_todos = db.query(Todo).filter(Todo.status == TodoStatus.PENDING).count()
    in_progress_todos = db.query(Todo).filter(Todo.status == TodoStatus.IN_PROGRESS).count()
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "admins": admin_users,
            "inactive": total_users - active_users
        },
        "todos": {
            "total": total_todos,
            "completed": completed_todos,
            "pending": pending_todos,
            "in_progress": in_progress_todos
        }
    }
