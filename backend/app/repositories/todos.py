"""Todo repository for database operations."""
from datetime import datetime
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Todo, TodoStatus, TodoPriority
from app.schemas import TodoCreate, TodoUpdate


def create_todo(db: Session, todo_data: TodoCreate) -> Todo:
    """Create a new todo in the database."""
    todo = Todo(**todo_data.model_dump())
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


def get_todo(db: Session, todo_id: int) -> Todo:
    """Get a single todo by ID."""
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


def list_todos(
    db: Session,
    status: Optional[TodoStatus] = None,
    priority: Optional[TodoPriority] = None,
    due_before: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Todo]:
    """List todos with optional filters."""
    query = db.query(Todo)
    
    if status:
        query = query.filter(Todo.status == status)
    if priority:
        query = query.filter(Todo.priority == priority)
    if due_before:
        query = query.filter(Todo.due_date <= due_before)
    
    return query.offset(skip).limit(limit).all()


def update_todo(db: Session, todo_id: int, todo_data: TodoUpdate) -> Todo:
    """Update an existing todo."""
    todo = get_todo(db, todo_id)
    
    # Update only provided fields
    update_data = todo_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(todo, field, value)
    
    db.commit()
    db.refresh(todo)
    return todo


def delete_todo(db: Session, todo_id: int) -> None:
    """Delete a todo from the database."""
    todo = get_todo(db, todo_id)
    db.delete(todo)
    db.commit()
