"""User profile management routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import User
from app.schemas import UserOut, UserUpdate, PasswordChange
from app.repositories import users as user_repo
from app.repositories import tokens as token_repo
from app.services import auth as auth_service
from app.dependencies.auth import get_current_active_user


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def get_my_profile(current_user: User = Depends(get_current_active_user)):
    """
    Get current user's profile.
    """
    return current_user


@router.put("/me", response_model=UserOut)
async def update_my_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile.
    
    Can update email and username.
    """
    # Check if email is being changed and already exists
    if user_data.email and user_data.email != current_user.email:
        existing_user = user_repo.get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
    
    # Check if username is being changed and already exists
    if user_data.username and user_data.username != current_user.username:
        existing_user = user_repo.get_user_by_username(db, user_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Update user
    updated_user = user_repo.update_user(db, current_user.id, user_data)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user


@router.post("/me/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Change current user's password.
    
    Requires old password for verification.
    """
    # Verify old password
    if not auth_service.verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Update password
    user_repo.update_user_password(db, current_user.id, password_data.new_password)
    
    # Revoke all refresh tokens for security
    token_repo.revoke_all_user_tokens(db, current_user.id)
    
    return {"message": "Password changed successfully. Please login again."}


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete current user's account.
    
    This action is permanent and cannot be undone.
    """
    # Delete user (this will cascade delete todos and tokens)
    success = user_repo.delete_user(db, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return None
