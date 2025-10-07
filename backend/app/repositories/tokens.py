"""Token repository for database operations."""
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.models import RefreshToken, EmailVerificationToken, PasswordResetToken
from app.config import settings


def create_refresh_token(
    db: Session,
    token: str,
    user_id: int,
    expires_delta: Optional[timedelta] = None
) -> RefreshToken:
    """Store refresh token in database."""
    if expires_delta:
        expires_at = datetime.utcnow() + expires_delta
    else:
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    db_token = RefreshToken(
        token=token,
        user_id=user_id,
        expires_at=expires_at,
        revoked=False
    )
    
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token


def get_refresh_token(db: Session, token: str) -> Optional[RefreshToken]:
    """Get refresh token from database."""
    return db.query(RefreshToken).filter(
        RefreshToken.token == token,
        RefreshToken.revoked == False
    ).first()


def revoke_refresh_token(db: Session, token: str) -> bool:
    """Revoke a refresh token."""
    db_token = db.query(RefreshToken).filter(RefreshToken.token == token).first()
    
    if not db_token:
        return False
    
    db_token.revoked = True
    db.commit()
    return True


def revoke_all_user_tokens(db: Session, user_id: int) -> int:
    """Revoke all refresh tokens for a user."""
    result = db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked == False
    ).update({"revoked": True})
    
    db.commit()
    return result


def cleanup_expired_tokens(db: Session) -> int:
    """Delete expired tokens from database."""
    now = datetime.utcnow()
    
    # Delete expired refresh tokens
    refresh_deleted = db.query(RefreshToken).filter(
        RefreshToken.expires_at < now
    ).delete()
    
    # Delete expired email verification tokens
    email_deleted = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.expires_at < now
    ).delete()
    
    # Delete expired password reset tokens
    reset_deleted = db.query(PasswordResetToken).filter(
        PasswordResetToken.expires_at < now
    ).delete()
    
    db.commit()
    return refresh_deleted + email_deleted + reset_deleted


# Email Verification Tokens
def create_email_verification_token(
    db: Session,
    token: str,
    user_id: int
) -> EmailVerificationToken:
    """Create email verification token."""
    expires_at = datetime.utcnow() + timedelta(hours=settings.EMAIL_VERIFICATION_EXPIRE_HOURS)
    
    db_token = EmailVerificationToken(
        token=token,
        user_id=user_id,
        expires_at=expires_at,
        used=False
    )
    
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token


def get_email_verification_token(db: Session, token: str) -> Optional[EmailVerificationToken]:
    """Get email verification token."""
    return db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token == token,
        EmailVerificationToken.used == False,
        EmailVerificationToken.expires_at > datetime.utcnow()
    ).first()


def mark_email_token_used(db: Session, token: str) -> bool:
    """Mark email verification token as used."""
    db_token = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token == token
    ).first()
    
    if not db_token:
        return False
    
    db_token.used = True
    db.commit()
    return True


# Password Reset Tokens
def create_password_reset_token(
    db: Session,
    token: str,
    user_id: int
) -> PasswordResetToken:
    """Create password reset token."""
    expires_at = datetime.utcnow() + timedelta(hours=settings.PASSWORD_RESET_EXPIRE_HOURS)
    
    db_token = PasswordResetToken(
        token=token,
        user_id=user_id,
        expires_at=expires_at,
        used=False
    )
    
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token


def get_password_reset_token(db: Session, token: str) -> Optional[PasswordResetToken]:
    """Get password reset token."""
    return db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()


def mark_reset_token_used(db: Session, token: str) -> bool:
    """Mark password reset token as used."""
    db_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token
    ).first()
    
    if not db_token:
        return False
    
    db_token.used = True
    db.commit()
    return True
