"""Quick script to promote a user to admin role."""
from app.db import SessionLocal
from app.models import User

db = SessionLocal()

# Get user by username
username = input("Enter username to make admin: ")
user = db.query(User).filter(User.username == username).first()

if user:
    user.role = "admin"
    db.commit()
    print(f"✅ {username} is now an admin!")
else:
    print(f"❌ User '{username}' not found")

db.close()
