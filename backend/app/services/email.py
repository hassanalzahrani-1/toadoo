"""Email service with mock implementation for development."""
import logging
from app.config import settings

logger = logging.getLogger(__name__)


def send_verification_email(email: str, token: str) -> None:
    """
    Send email verification link (mock implementation).
    
    In production, integrate with email provider (SendGrid, AWS SES, etc.).
    For now, logs the verification link to console.
    """
    verification_link = f"http://localhost:3000/verify-email?token={token}"
    
    logger.info("=" * 80)
    logger.info("📧 EMAIL VERIFICATION")
    logger.info(f"To: {email}")
    logger.info(f"Subject: Verify your Toadoo account")
    logger.info(f"Verification Link: {verification_link}")
    logger.info("=" * 80)
    
    if settings.EMAIL_ENABLED:
        # TODO: Integrate with actual email service
        pass


def send_password_reset_email(email: str, token: str) -> None:
    """
    Send password reset link (mock implementation).
    
    In production, integrate with email provider.
    For now, logs the reset link to console.
    """
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    
    logger.info("=" * 80)
    logger.info("🔑 PASSWORD RESET")
    logger.info(f"To: {email}")
    logger.info(f"Subject: Reset your Toadoo password")
    logger.info(f"Reset Link: {reset_link}")
    logger.info("=" * 80)
    
    if settings.EMAIL_ENABLED:
        # TODO: Integrate with actual email service
        pass


def send_welcome_email(email: str, username: str) -> None:
    """
    Send welcome email to new users (mock implementation).
    """
    logger.info("=" * 80)
    logger.info("👋 WELCOME EMAIL")
    logger.info(f"To: {email}")
    logger.info(f"Subject: Welcome to Toadoo, {username}!")
    logger.info("=" * 80)
    
    if settings.EMAIL_ENABLED:
        # TODO: Integrate with actual email service
        pass
