"""
Django models for the core application.
This includes the base user model and system-wide configurations.
"""

import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django_lifecycle import LifecycleModelMixin, hook, BEFORE_UPDATE, BEFORE_CREATE


class User(AbstractUser, LifecycleModelMixin):
    """
    Custom user model extending Django's AbstractUser.
    This is the base user model for all user types in the system.
    """
    
    class UserType(models.TextChoices):
        STUDENT = "student", _("Student")
        FACULTY = "faculty", _("Faculty")
        STAFF = "staff", _("Staff")
        ADMIN = "admin", _("Administrator")
        SUPERADMIN = "superadmin", _("Super Administrator")
    
    class Status(models.TextChoices):
        ACTIVE = "active", _("Active")
        INACTIVE = "inactive", _("Inactive")
        SUSPENDED = "suspended", _("Suspended")
        PENDING = "pending", _("Pending Verification")
        GRADUATED = "graduated", _("Graduated")
    
    # Override fields
    email = models.EmailField(_("email address"), unique=True)
    
    # Custom fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_type = models.CharField(
        max_length=20,
        choices=UserType.choices,
        default=UserType.STUDENT
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    phone = models.CharField(max_length=20, blank=True)
    alternative_phone = models.CharField(max_length=20, blank=True)
    profile_photo = models.ImageField(upload_to="users/photos/", blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    
    # Address
    address = models.TextField(blank=True)
    state = models.CharField(max_length=50, blank=True)
    lga = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=50, default="Nigeria")
    
    # Authentication
    is_mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=32, blank=True)
    last_password_change = models.DateTimeField(auto_now_add=True)
    password_reset_token = models.CharField(max_length=128, blank=True)
    password_reset_expires = models.DateTimeField(null=True, blank=True)
    failed_login_attempts = models.PositiveIntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    # Two-factor
    backup_codes = models.JSONField(default=list, blank=True)
    
    # Tracking
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_users"
    )
    
    # Metadata
    notes = models.TextField(blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = "users"
        verbose_name = _("user")
        verbose_name_plural = _("users")
        ordering = ["-date_joined"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["user_type", "status"]),
            models.Index(fields=["phone"]),
        ]
    
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_user_type_display()})"
    
    @property
    def is_active_user(self):
        return self.status == self.Status.ACTIVE
    
    @property
    def is_locked(self):
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False
    
    def unlock(self):
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save(update_fields=["failed_login_attempts", "locked_until"])
    
    def lock(self, duration_minutes=30):
        from django.utils import timezone as tz
        self.locked_until = tz.now() + timezone.timedelta(minutes=duration_minutes)
        self.save(update_fields=["locked_until"])
    
    def record_failed_login(self):
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.lock()
        self.save(update_fields=["failed_login_attempts"])
    
    def record_successful_login(self, ip_address=None):
        self.failed_login_attempts = 0
        self.locked_until = None
        self.last_login = timezone.now()
        self.last_login_ip = ip_address
        self.last_activity = timezone.now()
        self.save()


class UserSession(models.Model):
    """Track user sessions for security."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sessions"
    )
    token = models.CharField(max_length=500, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    device_info = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    last_activity = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "user_sessions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_active"]),
            models.Index(fields=["token"]),
        ]
    
    def __str__(self):
        return f"Session {self.id} - {self.user.username}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def deactivate(self):
        self.is_active = False
        self.save(update_fields=["is_active"])


class AuditLog(models.Model):
    """Central audit log for all system actions."""
    
    class ActionType(models.TextChoices):
        CREATE = "create", _("Create")
        READ = "read", _("Read")
        UPDATE = "update", _("Update")
        DELETE = "delete", _("Delete")
        LOGIN = "login", _("Login")
        LOGOUT = "logout", _("Logout")
        PASSWORD_CHANGE = "password_change", _("Password Change")
        MFA_ENABLE = "mfa_enable", _("MFA Enabled")
        MFA_DISABLE = "mfa_disable", _("MFA Disabled")
        PAYMENT = "payment", _("Payment")
        APPROVE = "approve", _("Approve")
        REJECT = "reject", _("Reject")
        EXPORT = "export", _("Export")
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="audit_logs"
    )
    action = models.CharField(max_length=30, choices=ActionType.choices)
    entity_type = models.CharField(max_length=50)  # e.g., "Student", "Course", "Payment"
    entity_id = models.UUIDField(null=True, blank=True)
    old_value = models.JSONField(default=dict, blank=True)
    new_value = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "audit_logs"
        verbose_name = _("audit log")
        verbose_name_plural = _("audit logs")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "action"]),
            models.Index(fields=["entity_type", "entity_id"]),
            models.Index(fields=["created_at"]),
        ]
    
    def __str__(self):
        return f"{self.action} on {self.entity_type} at {self.created_at}"


class SystemConfiguration(models.Model):
    """System-wide configuration settings."""
    
    class ConfigType(models.TextChoices):
        STRING = "string", _("String")
        INTEGER = "integer", _("Integer")
        BOOLEAN = "boolean", _("Boolean")
        JSON = "json", _("JSON")
    
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    value_type = models.CharField(
        max_length=20,
        choices=ConfigType.choices,
        default=ConfigType.STRING
    )
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)
    is_editable = models.BooleanField(default=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="config_updates"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "system_configurations"
        verbose_name = _("system configuration")
        verbose_name_plural = _("system configurations")
    
    def __str__(self):
        return f"{self.key} = {self.value[:50]}"
    
    @property
    def typed_value(self):
        """Return value in its correct type."""
        if self.value_type == self.ConfigType.BOOLEAN:
            return self.value.lower() in ("true", "1", "yes")
        elif self.value_type == self.ConfigType.INTEGER:
            return int(self.value)
        elif self.value_type == self.ConfigType.JSON:
            import json
            return json.loads(self.value)
        return self.value


class AcademicSession(models.Model):
    """Academic session configuration."""
    
    name = models.CharField(max_length=20)  # e.g., "2024/2025"
    is_current = models.BooleanField(default=False)
    start_date = models.DateField()
    end_date = models.DateField()
    registration_start = models.DateTimeField()
    registration_end = models.DateTimeField()
    late_registration_end = models.DateTimeField(null=True, blank=True)
    result_upload_deadline = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "academic_sessions"
        verbose_name = _("academic session")
        verbose_name_plural = _("academic sessions")
        ordering = ["-start_date"]
    
    def __str__(self):
        return self.name


class Semester(models.Model):
    """Semester within an academic session."""
    
    class SemesterNumber(models.IntegerChoices):
        FIRST = 1, _("First Semester")
        SECOND = 2, _("Second Semester")
        THIRD = 3, _("Third Semester")
    
    session = models.ForeignKey(
        AcademicSession,
        on_delete=models.CASCADE,
        related_name="semesters"
    )
    number = models.IntegerField(choices=SemesterNumber.choices)
    name = models.CharField(max_length=50)  # e.g., "First Semester 2024/2025"
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    result_entry_start = models.DateTimeField()
    result_entry_end = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "semesters"
        verbose_name = _("semester")
        verbose_name_plural = _("semesters")
        unique_together = ["session", "number"]
        ordering = ["session", "number"]
    
    def __str__(self):
        return self.name
    
    @property
    def is_registration_open(self):
        from django.utils import timezone
        now = timezone.now()
        return self.is_active and self.registration_start <= now <= self.registration_end
    
    @property
    def is_result_entry_open(self):
        from django.utils import timezone
        now = timezone.now()
        return self.is_active and self.result_entry_start <= now <= self.result_entry_end
