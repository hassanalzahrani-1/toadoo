"""Email service (placeholder for Phase 2)."""
import logging

logger = logging.getLogger(__name__)


async def send_verification_email(email: str, token: str) -> None:
    """
    Send a verification email (mock implementation for Phase 2).
    
    Phase 2 will implement actual email sending or mock the process.
    For now, this just logs the action.
    """
    logger.info(
        "Mock email sent to %s with verification token: %s",
        email,
        token[:10] + "...",
    )
    # In Phase 2, integrate with email provider or mock service
    raise NotImplementedError("Email verification will be implemented in Phase 2")


async def send_password_reset_email(email: str, token: str) -> None:
    """
    Send a password reset email (mock implementation for Phase 2).
    
    Phase 2 will implement actual email sending or mock the process.
    """
    logger.info(
        "Mock password reset email sent to %s with token: %s",
        email,
        token[:10] + "...",
    )
    raise NotImplementedError("Password reset will be implemented in Phase 2")
