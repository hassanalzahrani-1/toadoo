"""Todo repository for database operations with user-scoping."""
from datetime import datetime
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import Todo, TodoStatus, TodoPriority
from app.schemas import TodoCreate, TodoUpdate


def create_todo(db: Session, todo_data: TodoCreate, user_id: int) -> Todo:
    """Create a new todo for a specific user."""
    todo = Todo(**todo_data.model_dump(), owner_id=user_id)
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


def get_todo(db: Session, todo_id: int, user_id: int) -> Todo:
    """Get a single todo by ID (user-scoped)."""
    todo = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.owner_id == user_id
    ).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return todo


def list_todos(
    db: Session,
    user_id: int,
    status: Optional[TodoStatus] = None,
    priority: Optional[TodoPriority] = None,
    due_before: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Todo]:
    """List todos for a specific user with optional filters."""
    query = db.query(Todo).filter(Todo.owner_id == user_id)
    
    if status:
        query = query.filter(Todo.status == status)
    if priority:
        query = query.filter(Todo.priority == priority)
    if due_before:
        query = query.filter(Todo.due_date <= due_before)
    
    return query.offset(skip).limit(limit).all()


def update_todo(db: Session, todo_id: int, todo_data: TodoUpdate, user_id: int) -> Todo:
    """Update an existing todo (user-scoped)."""
    todo = get_todo(db, todo_id, user_id)
    
    # Update only provided fields
    update_data = todo_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(todo, field, value)
    
    db.commit()
    db.refresh(todo)
    return todo


def delete_todo(db: Session, todo_id: int, user_id: int) -> None:
    """Delete a todo (user-scoped)."""
    todo = get_todo(db, todo_id, user_id)
    db.delete(todo)
    db.commit()


def count_user_todos(db: Session, user_id: int) -> int:
    """Count total todos for a user."""
    return db.query(Todo).filter(Todo.owner_id == user_id).count()


def count_user_todos_by_status(db: Session, user_id: int, status: TodoStatus) -> int:
    """Count todos by status for a user."""
    return db.query(Todo).filter(
        Todo.owner_id == user_id,
        Todo.status == status
    ).count()


# Admin functions
def list_all_todos(
    db: Session,
    status: Optional[TodoStatus] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Todo]:
    """List all todos across all users (admin only)."""
    query = db.query(Todo)
    
    if status:
        query = query.filter(Todo.status == status)
    
    return query.offset(skip).limit(limit).all()


def count_all_todos(db: Session) -> int:
    """Count total todos in system (admin only)."""
    return db.query(Todo).count()
