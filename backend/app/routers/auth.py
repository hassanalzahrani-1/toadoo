"""Authentication routes for user registration, login, and token management."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError

from app.db import get_db
from app.models import User
from app.schemas import (
    UserCreate, UserOut, UserLogin, Token, TokenRefresh,
    EmailVerification, PasswordResetRequest, PasswordReset
)
from app.services import auth as auth_service
from app.repositories import users as user_repo
from app.repositories import tokens as token_repo
from app.services.email import send_verification_email, send_password_reset_email
from app.dependencies.auth import get_current_user, get_current_active_user


router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    
    - **email**: Valid email address
    - **username**: Unique username (3-50 characters)
    - **password**: Strong password (min 8 chars, uppercase, lowercase, digit)
    """
    # Check if email already exists
    if user_repo.get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if user_repo.get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    user = user_repo.create_user(db, user_data)
    
    # Generate email verification token
    verification_token = auth_service.generate_verification_token()
    token_repo.create_email_verification_token(db, verification_token, user.id)
    
    # Send verification email (mock)
    send_verification_email(user.email, verification_token)
    
    return user


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with username/email and password.
    
    Returns access token and refresh token.
    """
    # Get user by username or email
    user = user_repo.get_user_by_username_or_email(db, credentials.username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not auth_service.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create tokens
    access_token = auth_service.create_access_token(data={"sub": user.id})
    refresh_token = auth_service.create_refresh_token(data={"sub": user.id})
    
    # Store refresh token in database
    token_repo.create_refresh_token(db, refresh_token, user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token.
    
    Returns new access token and refresh token.
    """
    # Verify refresh token exists in database and is not revoked
    db_token = token_repo.get_refresh_token(db, token_data.refresh_token)
    
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked refresh token"
        )
    
    try:
        # Verify and decode refresh token
        payload = auth_service.verify_token(token_data.refresh_token, token_type="refresh")
        user_id: int = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Get user
        user = user_repo.get_user_by_id(db, user_id)
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Revoke old refresh token
        token_repo.revoke_refresh_token(db, token_data.refresh_token)
        
        # Create new tokens
        new_access_token = auth_service.create_access_token(data={"sub": user.id})
        new_refresh_token = auth_service.create_refresh_token(data={"sub": user.id})
        
        # Store new refresh token
        token_repo.create_refresh_token(db, new_refresh_token, user.id)
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    token_data: TokenRefresh,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Logout by revoking refresh token.
    """
    token_repo.revoke_refresh_token(db, token_data.refresh_token)
    return None


@router.get("/me", response_model=UserOut)
async def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """
    Get current authenticated user's profile.
    """
    return current_user


@router.post("/verify-email", response_model=UserOut)
async def verify_email(verification: EmailVerification, db: Session = Depends(get_db)):
    """
    Verify user email with token sent to email.
    """
    # Get verification token from database
    db_token = token_repo.get_email_verification_token(db, verification.token)
    
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    # Mark user as verified
    user = user_repo.verify_user_email(db, db_token.user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Mark token as used
    token_repo.mark_email_token_used(db, verification.token)
    
    return user


@router.post("/resend-verification", status_code=status.HTTP_200_OK)
async def resend_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Resend email verification token.
    """
    if current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Generate new verification token
    verification_token = auth_service.generate_verification_token()
    token_repo.create_email_verification_token(db, verification_token, current_user.id)
    
    # Send verification email
    send_verification_email(current_user.email, verification_token)
    
    return {"message": "Verification email sent"}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Request password reset token.
    
    Sends reset token to user's email.
    """
    # Get user by email
    user = user_repo.get_user_by_email(db, request.email)
    
    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If email exists, password reset link has been sent"}
    
    # Generate reset token
    reset_token = auth_service.generate_reset_token()
    token_repo.create_password_reset_token(db, reset_token, user.id)
    
    # Send reset email
    send_password_reset_email(user.email, reset_token)
    
    return {"message": "If email exists, password reset link has been sent"}


@router.post("/reset-password", response_model=UserOut)
async def reset_password(reset_data: PasswordReset, db: Session = Depends(get_db)):
    """
    Reset password using reset token.
    """
    # Get reset token from database
    db_token = token_repo.get_password_reset_token(db, reset_data.token)
    
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update user password
    user = user_repo.update_user_password(db, db_token.user_id, reset_data.new_password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Mark token as used
    token_repo.mark_reset_token_used(db, reset_data.token)
    
    # Revoke all refresh tokens for security
    token_repo.revoke_all_user_tokens(db, user.id)
    
    return user
