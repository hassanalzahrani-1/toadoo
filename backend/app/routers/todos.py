"""Todo API endpoints with user authentication."""
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

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


@router.get("/leaderboard")
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    period: str = "all-time",
    limit: int = 20,
):
    """Get leaderboard rankings."""
    from app.models import HarvestHistory
    
    if period == "all-time":
        # All-time leaderboard based on total_completed_count (includes all users)
        users = db.query(User).filter(
            User.total_completed_count > 0
        ).order_by(User.total_completed_count.desc()).limit(limit).all()
        
        leaderboard = [
            {
                "rank": idx + 1,
                "user_id": user.id,
                "username": user.username,
                "count": user.total_completed_count,
                "is_current_user": user.id == current_user.id
            }
            for idx, user in enumerate(users)
        ]
    
    elif period == "monthly":
        # Monthly leaderboard - sum harvests from last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        results = db.query(
            User.id,
            User.username,
            func.sum(HarvestHistory.count).label('total_count')
        ).join(
            HarvestHistory, User.id == HarvestHistory.user_id
        ).filter(
            HarvestHistory.harvested_at >= thirty_days_ago
        ).group_by(User.id, User.username).order_by(
            func.sum(HarvestHistory.count).desc()
        ).limit(limit).all()
        
        leaderboard = [
            {
                "rank": idx + 1,
                "user_id": result.id,
                "username": result.username,
                "count": result.total_count or 0,
                "is_current_user": result.id == current_user.id
            }
            for idx, result in enumerate(results)
        ]
    
    elif period == "weekly":
        # Weekly leaderboard - sum harvests from last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        
        results = db.query(
            User.id,
            User.username,
            func.sum(HarvestHistory.count).label('total_count')
        ).join(
            HarvestHistory, User.id == HarvestHistory.user_id
        ).filter(
            HarvestHistory.harvested_at >= seven_days_ago
        ).group_by(User.id, User.username).order_by(
            func.sum(HarvestHistory.count).desc()
        ).limit(limit).all()
        
        leaderboard = [
            {
                "rank": idx + 1,
                "user_id": result.id,
                "username": result.username,
                "count": result.total_count or 0,
                "is_current_user": result.id == current_user.id
            }
            for idx, result in enumerate(results)
        ]
    
    else:
        return {"error": "Invalid period. Use: all-time, monthly, or weekly"}
    
    return {
        "period": period,
        "leaderboard": leaderboard
    }


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


@router.post(
    "/harvest-completed",
    summary="Harvest completed tasks",
    description="Delete all completed tasks and increment user's lifetime completion counter.",
)
def harvest_completed_tasks(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Harvest (delete) all completed tasks and update user's total_completed_count."""
    from app.models import Todo, HarvestHistory
    
    # Get all completed tasks for this user
    completed_tasks = db.query(Todo).filter(
        Todo.owner_id == current_user.id,
        Todo.status == TodoStatus.COMPLETED
    ).all()
    
    count = len(completed_tasks)
    
    if count == 0:
        return {"harvested": 0, "total_completed_count": current_user.total_completed_count}
    
    # Delete all completed tasks
    for task in completed_tasks:
        db.delete(task)
    
    # Increment user's lifetime counter
    current_user.total_completed_count += count
    
    # Log harvest history
    harvest_record = HarvestHistory(
        user_id=current_user.id,
        count=count
    )
    db.add(harvest_record)
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "harvested": count,
        "total_completed_count": current_user.total_completed_count,
        "user_id": current_user.id,
        "username": current_user.username
    }
