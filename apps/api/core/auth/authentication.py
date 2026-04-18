"""
JWT Authentication for Django Ninja API
=====================================
Handles JWT token generation, validation, refresh, and MFA.
"""

import jwt
import secrets
import pyotp
from datetime import datetime, timedelta
from typing import Optional
from django.conf import settings
from django.utils import timezone
from ninja import Router, Schema
from pydantic import EmailStr, Field, validator
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed

from core.models import User, UserSession
from core.schemas import MessageSchema, ErrorSchema

router = Router(tags=["Authentication"])

# ============================================================
# SCHEMAS
# ============================================================

class TokenPairSchema(Schema):
    """Schema for access and refresh token pair."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class LoginSchema(Schema):
    """Schema for user login."""
    email: EmailStr
    password: str
    device_info: Optional[dict] = None


class RegisterSchema(Schema):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirm_password: str
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    phone: Optional[str] = None
    
    @validator("confirm_password")
    def passwords_match(cls, v, values):
        if v != values.get("password"):
            raise ValueError("Passwords do not match")
        return v


class MFAVerifySchema(Schema):
    """Schema for MFA verification."""
    code: str = Field(..., min_length=6, max_length=6)
    temp_token: str  # Token from login when MFA required


class MFASetupSchema(Schema):
    """Schema for MFA setup response."""
    secret: str
    qr_code: str
    backup_codes: list[str]


class PasswordResetRequestSchema(Schema):
    """Schema for password reset request."""
    email: EmailStr


class PasswordResetConfirmSchema(Schema):
    """Schema for password reset confirmation."""
    token: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator("confirm_password")
    def passwords_match(cls, v, values):
        if v != values.get("new_password"):
            raise ValueError("Passwords do not match")
        return v


class PasswordChangeSchema(Schema):
    """Schema for password change."""
    current_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator("confirm_password")
    def passwords_match(cls, v, values):
        if v != values.get("new_password"):
            raise ValueError("Passwords do not match")
        return v


class RefreshTokenSchema(Schema):
    """Schema for token refresh."""
    refresh_token: str


# ============================================================
# JWT HELPERS
# ============================================================

def generate_tokens(user: User, session_id: Optional[str] = None) -> dict:
    """Generate access and refresh tokens for a user."""
    now = datetime.utcnow()
    
    # Access token payload
    access_payload = {
        "user_id": str(user.id),
        "email": user.email,
        "user_type": user.user_type,
        "status": user.status,
        "session_id": session_id,
        "type": "access",
        "iat": now,
        "exp": now + settings.JWT_ACCESS_TOKEN_LIFETIME,
    }
    
    # Refresh token payload
    refresh_payload = {
        "user_id": str(user.id),
        "type": "refresh",
        "session_id": session_id,
        "iat": now,
        "exp": now + settings.JWT_REFRESH_TOKEN_LIFETIME,
    }
    
    access_token = jwt.encode(
        access_payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    refresh_token = jwt.encode(
        refresh_payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": int(settings.JWT_ACCESS_TOKEN_LIFETIME.total_seconds()),
    }


def decode_token(token: str, token_type: str = "access") -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        if payload.get("type") != token_type:
            raise AuthenticationFailed("Invalid token type")
        
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed("Token has expired")
    except jwt.InvalidTokenError:
        raise AuthenticationFailed("Invalid token")


def get_user_from_token(token: str) -> User:
    """Get user from token payload."""
    payload = decode_token(token)
    user_id = payload.get("user_id")
    
    try:
        user = User.objects.get(id=user_id, is_active=True)
        return user
    except User.DoesNotExist:
        raise AuthenticationFailed("User not found")


# ============================================================
# AUTHENTICATION ENDPOINTS
# ============================================================

@router.post("/register", response={201: TokenPairSchema, 400: ErrorSchema})
def register(request, data: RegisterSchema):
    """Register a new user account."""
    
    # Check if email already exists
    if User.objects.filter(email=data.email).exists():
        return status.HTTP_400_BAD_REQUEST, {
            "success": False,
            "message": "Email already registered",
            "errors": [{"field": "email", "message": "This email is already in use"}]
        }
    
    # Create user
    user = User.objects.create_user(
        username=data.email.split("@")[0],
        email=data.email,
        password=data.password,
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        status=User.Status.PENDING,
    )
    
    # Generate tokens
    tokens = generate_tokens(user)
    
    return status.HTTP_201_CREATED, tokens


@router.post("/login", response={200: TokenPairSchema, 401: ErrorSchema})
def login(request, data: LoginSchema):
    """Authenticate user and return tokens."""
    
    try:
        user = User.objects.get(email=data.email)
    except User.DoesNotExist:
        raise AuthenticationFailed("Invalid email or password")
    
    # Check if user is locked
    if user.is_locked:
        raise AuthenticationFailed("Account is locked. Please try again later.")
    
    # Verify password
    if not user.check_password(data.password):
        user.record_failed_login()
        raise AuthenticationFailed("Invalid email or password")
    
    # Check user status
    if user.status == User.Status.SUSPENDED:
        raise AuthenticationFailed("Account is suspended")
    
    # Check if MFA is enabled
    if user.is_mfa_enabled:
        # Generate temp token for MFA verification
        temp_payload = {
            "user_id": str(user.id),
            "type": "mfa",
            "exp": datetime.utcnow() + timedelta(minutes=5),
        }
        temp_token = jwt.encode(
            temp_payload,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )
        
        return {
            "success": True,
            "message": "MFA verification required",
            "mfa_required": True,
            "temp_token": temp_token,
        }
    
    # Create session
    session = create_user_session(user, request)
    
    # Generate tokens
    tokens = generate_tokens(user, str(session.id))
    
    # Record successful login
    user.record_successful_login(request.META.get("REMOTE_ADDR"))
    
    return tokens


@router.post("/login/mfa", response={200: TokenPairSchema, 401: ErrorSchema})
def verify_mfa(request, data: MFAVerifySchema):
    """Verify MFA code and complete login."""
    
    # Decode temp token
    try:
        payload = jwt.decode(
            data.temp_token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "mfa":
            raise AuthenticationFailed("Invalid token")
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed("MFA token expired")
    except jwt.InvalidTokenError:
        raise AuthenticationFailed("Invalid token")
    
    # Get user
    try:
        user = User.objects.get(id=payload.get("user_id"))
    except User.DoesNotExist:
        raise AuthenticationFailed("User not found")
    
    # Verify MFA code
    if user.is_mfa_enabled:
        totp = pyotp.TOTP(user.mfa_secret)
        valid_codes = user.backup_codes or []
        
        # Check TOTP or backup code
        if not (totp.verify(data.code) or data.code in valid_codes):
            raise AuthenticationFailed("Invalid MFA code")
        
        # Remove used backup code if used
        if data.code in valid_codes:
            valid_codes.remove(data.code)
            user.backup_codes = valid_codes
            user.save(update_fields=["backup_codes"])
    
    # Create session
    session = create_user_session(user, request)
    
    # Generate tokens
    tokens = generate_tokens(user, str(session.id))
    
    # Record successful login
    user.record_successful_login(request.META.get("REMOTE_ADDR"))
    
    return tokens


@router.post("/refresh", response=TokenPairSchema)
def refresh_token(request, data: RefreshTokenSchema):
    """Refresh access token using refresh token."""
    
    payload = decode_token(data.refresh_token, "refresh")
    
    try:
        user = User.objects.get(id=payload.get("user_id"), is_active=True)
    except User.DoesNotExist:
        raise AuthenticationFailed("User not found")
    
    # Validate session
    session_id = payload.get("session_id")
    if session_id:
        try:
            session = UserSession.objects.get(
                id=session_id,
                user=user,
                is_active=True
            )
            if session.is_expired():
                raise AuthenticationFailed("Session expired")
        except UserSession.DoesNotExist:
            raise AuthenticationFailed("Invalid session")
    
    # Generate new tokens
    tokens = generate_tokens(user, session_id)
    
    return tokens


@router.post("/logout")
def logout(request):
    """Logout current user and invalidate session."""
    # Get token from header
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        
        try:
            payload = decode_token(token)
            session_id = payload.get("session_id")
            
            if session_id:
                UserSession.objects.filter(id=session_id).update(is_active=False)
        except Exception:
            pass
    
    return {"success": True, "message": "Logged out successfully"}


@router.post("/password/reset-request", response=MessageSchema)
def request_password_reset(request, data: PasswordResetRequestSchema):
    """Request password reset email."""
    
    try:
        user = User.objects.get(email=data.email)
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        user.password_reset_token = reset_token
        user.password_reset_expires = timezone.now() + timedelta(hours=24)
        user.save(update_fields=["password_reset_token", "password_reset_expires"])
        
        # TODO: Send reset email
        # send_password_reset_email(user, reset_token)
        
    except User.DoesNotExist:
        # Don't reveal if email exists
        pass
    
    return {
        "success": True,
        "message": "If the email exists, a password reset link has been sent"
    }


@router.post("/password/reset-confirm", response=MessageSchema)
def confirm_password_reset(request, data: PasswordResetConfirmSchema):
    """Confirm password reset with token."""
    
    try:
        user = User.objects.get(
            password_reset_token=data.token,
            password_reset_expires__gt=timezone.now()
        )
    except User.DoesNotExist:
        raise AuthenticationFailed("Invalid or expired reset token")
    
    # Set new password
    user.set_password(data.new_password)
    user.password_reset_token = ""
    user.password_reset_expires = None
    user.failed_login_attempts = 0
    user.save()
    
    # Invalidate all sessions
    UserSession.objects.filter(user=user).update(is_active=False)
    
    return {
        "success": True,
        "message": "Password reset successfully"
    }


@router.post("/password/change", response=MessageSchema)
def change_password(request, data: PasswordChangeSchema, user: User):
    """Change password for authenticated user."""
    
    # Verify current password
    if not user.check_password(data.current_password):
        raise AuthenticationFailed("Current password is incorrect")
    
    # Set new password
    user.set_password(data.new_password)
    user.last_password_change = timezone.now()
    user.save(update_fields=["password", "last_password_change", "failed_login_attempts"])
    
    # Invalidate all other sessions
    current_session_id = getattr(request.auth, "session_id", None)
    UserSession.objects.filter(
        user=user,
        is_active=True
    ).exclude(id=current_session_id).update(is_active=False)
    
    return {
        "success": True,
        "message": "Password changed successfully"
    }


@router.get("/me", response=dict)
def get_current_user(user: User):
    """Get current authenticated user."""
    return {
        "id": str(user.id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "user_type": user.user_type,
        "status": user.status,
        "phone": user.phone,
        "is_mfa_enabled": user.is_mfa_enabled,
        "profile_photo": user.profile_photo.url if user.profile_photo else None,
    }


# ============================================================
# MFA ENDPOINTS
# ============================================================

@router.post("/mfa/setup", response=MFASetupSchema)
def setup_mfa(user: User):
    """Setup MFA for authenticated user."""
    
    if user.is_mfa_enabled:
        raise AuthenticationFailed("MFA is already enabled")
    
    # Generate secret
    secret = pyotp.random_base32()
    
    # Generate backup codes
    backup_codes = [secrets.token_hex(8) for _ in range(10)]
    
    # Save to user
    user.mfa_secret = secret
    user.backup_codes = backup_codes
    user.is_mfa_enabled = True
    user.save(update_fields=["mfa_secret", "backup_codes", "is_mfa_enabled"])
    
    # Generate QR code
    totp = pyotp.TOTP(secret)
    qr_code = totp.provisioning_uri(
        user.email,
        issuer_name=settings.APP_NAME or "University Portal"
    )
    
    return {
        "secret": secret,
        "qr_code": qr_code,
        "backup_codes": backup_codes,
    }


@router.post("/mfa/disable", response=MessageSchema)
def disable_mfa(request, user: User):
    """Disable MFA for authenticated user."""
    
    if not user.is_mfa_enabled:
        raise AuthenticationFailed("MFA is not enabled")
    
    user.mfa_secret = ""
    user.backup_codes = []
    user.is_mfa_enabled = False
    user.save(update_fields=["mfa_secret", "backup_codes", "is_mfa_enabled"])
    
    return {
        "success": True,
        "message": "MFA disabled successfully"
    }


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def create_user_session(user: User, request) -> UserSession:
    """Create a new user session."""
    # Generate session token
    session_token = secrets.token_urlsafe(32)
    
    # Get device info
    device_info = {
        "browser": request.META.get("HTTP_USER_AGENT", "")[:200],
        "ip": request.META.get("REMOTE_ADDR"),
    }
    
    # Create session
    session = UserSession.objects.create(
        user=user,
        token=session_token,
        ip_address=request.META.get("REMOTE_ADDR"),
        user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
        device_info=device_info,
        expires_at=timezone.now() + settings.JWT_REFRESH_TOKEN_LIFETIME,
    )
    
    return session
