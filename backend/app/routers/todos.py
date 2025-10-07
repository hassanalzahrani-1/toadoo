"""Todo API endpoints with user authentication."""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_active_user
from app.models import TodoStatus, TodoPriority, User
from app.repositories import todos as todo_repo
from app.schemas import TodoCreate, TodoUpdate, TodoOut

router = APIRouter(prefix="/todos", tags=["todos"])


@router.post(
    "",
    response_model=TodoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new todo",
    description="Create a new todo item with title, description, status, priority, and optional due date.",
)
def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> TodoOut:
    """Create a new todo for the current user."""
    todo = todo_repo.create_todo(db, todo_data, current_user.id)
    return TodoOut.model_validate(todo)


@router.get(
    "",
    response_model=List[TodoOut],
    summary="List todos",
    description="Retrieve a list of todos for the current user with optional filters.",
)
def list_todos(
    current_user: User = Depends(get_current_active_user),
    status: Optional[TodoStatus] = None,
    priority: Optional[TodoPriority] = None,
    due_before: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> List[TodoOut]:
    """List all todos for the current user with optional filters."""
    todos = todo_repo.list_todos(
        db,
        user_id=current_user.id,
        status=status,
        priority=priority,
        due_before=due_before,
        skip=skip,
        limit=limit,
    )
    return [TodoOut.model_validate(todo) for todo in todos]


@router.get(
    "/{todo_id}",
    response_model=TodoOut,
    summary="Get a todo",
    description="Retrieve a specific todo by its ID (must be owned by current user).",
)
def get_todo(
    todo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> TodoOut:
    """Get a single todo by ID (user-scoped)."""
    todo = todo_repo.get_todo(db, todo_id, current_user.id)
    return TodoOut.model_validate(todo)


@router.put(
    "/{todo_id}",
    response_model=TodoOut,
    summary="Update a todo",
    description="Update an existing todo (must be owned by current user).",
)
def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> TodoOut:
    """Update an existing todo (user-scoped)."""
    todo = todo_repo.update_todo(db, todo_id, todo_data, current_user.id)
    return TodoOut.model_validate(todo)


@router.delete(
    "/{todo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a todo",
    description="Delete a todo by its ID (must be owned by current user).",
)
def delete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete a todo (user-scoped)."""
    todo_repo.delete_todo(db, todo_id, current_user.id)
