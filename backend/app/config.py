from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_UPLOAD_DIR = BACKEND_DIR / "uploads"
PROJECT_ROOT = BACKEND_DIR.parent
ENV_FILE = PROJECT_ROOT / ".env"

PLACEHOLDER_SECRET_KEY = "replace_with_a_long_random_value_for_local_development"
PLACEHOLDER_DEV_ADMIN_PASSWORD = "set_a_local_dev_password_only"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    secret_key: str
    access_token_expire_minutes: int = 60
    frontend_origin: str = "http://127.0.0.1:5173"
    cookie_secure: bool = False
    database_url: str = "sqlite:///./accountant_app.db"
    max_upload_size_mb: int = 10
    upload_dir: Path = DEFAULT_UPLOAD_DIR
    dev_admin_email: str = "admin@example.test"
    dev_admin_password: str = ""

    @model_validator(mode="after")
    def validate_secret_key(self) -> "Settings":
        if not self.secret_key.strip():
            raise ValueError(
                "SECRET_KEY is required. Set a long non-placeholder value in your local .env file."
            )

        if self.secret_key == PLACEHOLDER_SECRET_KEY:
            raise ValueError(
                "SECRET_KEY is still set to the placeholder value from .env.example. "
                "Set a long non-placeholder value in your local .env file."
            )

        return self


settings = Settings()
