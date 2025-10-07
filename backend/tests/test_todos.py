"""Tests for todo endpoints."""
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db import Base, get_db
from app.main import app
from app.models import TodoStatus, TodoPriority

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    """Create and drop tables for each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


def test_create_todo(client):
    """Test creating a new todo."""
    response = client.post(
        "/todos",
        json={
            "title": "Test Todo",
            "description": "Test description",
            "status": "pending",
            "priority": "high",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Todo"
    assert data["description"] == "Test description"
    assert data["status"] == "pending"
    assert data["priority"] == "high"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_todo_minimal(client):
    """Test creating a todo with minimal fields."""
    response = client.post(
        "/todos",
        json={"title": "Minimal Todo"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Minimal Todo"
    assert data["status"] == "pending"
    assert data["priority"] == "medium"


def test_create_todo_validation_error(client):
    """Test validation error when creating todo."""
    response = client.post(
        "/todos",
        json={"title": ""},  # Empty title should fail
    )
    assert response.status_code == 422


def test_create_todo_past_due_date(client):
    """Test that past due dates are rejected."""
    past_date = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    response = client.post(
        "/todos",
        json={
            "title": "Past Due Todo",
            "due_date": past_date,
        },
    )
    assert response.status_code == 422


def test_list_todos_empty(client):
    """Test listing todos when none exist."""
    response = client.get("/todos")
    assert response.status_code == 200
    assert response.json() == []


def test_list_todos(client):
    """Test listing todos."""
    # Create some todos
    client.post("/todos", json={"title": "Todo 1", "status": "pending"})
    client.post("/todos", json={"title": "Todo 2", "status": "completed"})
    client.post("/todos", json={"title": "Todo 3", "priority": "high"})
    
    response = client.get("/todos")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3


def test_list_todos_filter_by_status(client):
    """Test filtering todos by status."""
    client.post("/todos", json={"title": "Todo 1", "status": "pending"})
    client.post("/todos", json={"title": "Todo 2", "status": "completed"})
    
    response = client.get("/todos?status=completed")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "completed"


def test_list_todos_filter_by_priority(client):
    """Test filtering todos by priority."""
    client.post("/todos", json={"title": "Todo 1", "priority": "low"})
    client.post("/todos", json={"title": "Todo 2", "priority": "high"})
    
    response = client.get("/todos?priority=high")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["priority"] == "high"


def test_get_todo(client):
    """Test getting a specific todo."""
    create_response = client.post("/todos", json={"title": "Test Todo"})
    todo_id = create_response.json()["id"]
    
    response = client.get(f"/todos/{todo_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == todo_id
    assert data["title"] == "Test Todo"


def test_get_todo_not_found(client):
    """Test getting a non-existent todo."""
    response = client.get("/todos/999")
    assert response.status_code == 404


def test_update_todo(client):
    """Test updating a todo."""
    create_response = client.post("/todos", json={"title": "Original Title"})
    todo_id = create_response.json()["id"]
    
    response = client.put(
        f"/todos/{todo_id}",
        json={
            "title": "Updated Title",
            "status": "completed",
            "priority": "low",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["status"] == "completed"
    assert data["priority"] == "low"


def test_update_todo_partial(client):
    """Test partial update of a todo."""
    create_response = client.post(
        "/todos",
        json={"title": "Original", "priority": "high"},
    )
    todo_id = create_response.json()["id"]
    
    response = client.put(
        f"/todos/{todo_id}",
        json={"title": "Updated"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated"
    assert data["priority"] == "high"  # Should remain unchanged


def test_update_todo_not_found(client):
    """Test updating a non-existent todo."""
    response = client.put("/todos/999", json={"title": "Updated"})
    assert response.status_code == 404


def test_delete_todo(client):
    """Test deleting a todo."""
    create_response = client.post("/todos", json={"title": "To Delete"})
    todo_id = create_response.json()["id"]
    
    response = client.delete(f"/todos/{todo_id}")
    assert response.status_code == 204
    
    # Verify it's deleted
    get_response = client.get(f"/todos/{todo_id}")
    assert get_response.status_code == 404


def test_delete_todo_not_found(client):
    """Test deleting a non-existent todo."""
    response = client.delete("/todos/999")
    assert response.status_code == 404


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_root_endpoint(client):
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "🐸" in data["message"]
