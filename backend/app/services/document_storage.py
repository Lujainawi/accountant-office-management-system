import logging
import uuid
from pathlib import Path

from app.config import settings

logger = logging.getLogger(__name__)


def ensure_upload_dir() -> Path:
    root = settings.upload_dir.resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root


def _resolve_contained_path(relative_key: str) -> Path:
    root = ensure_upload_dir()
    candidate = (root / relative_key).resolve()

    try:
        candidate.relative_to(root)
    except ValueError as exc:
        raise ValueError("Invalid storage path.") from exc

    return candidate


def generate_storage_key(extension: str) -> tuple[str, str]:
    stored_filename = f"{uuid.uuid4().hex}.{extension}"
    return stored_filename, stored_filename


def save_file_content(relative_key: str, content: bytes) -> None:
    target = _resolve_contained_path(relative_key)
    target.write_bytes(content)


def delete_file_safe(relative_key: str) -> bool:
    try:
        target = _resolve_contained_path(relative_key)
    except ValueError:
        logger.warning("Skipped deleting file with invalid storage key.")
        return False

    if not target.exists():
        logger.info("Private file already missing during delete cleanup.")
        return False

    try:
        target.unlink()
        return True
    except OSError:
        logger.exception("Failed to delete private file after document removal.")
        return False


def file_exists(relative_key: str) -> bool:
    try:
        target = _resolve_contained_path(relative_key)
    except ValueError:
        return False
    return target.is_file()


def get_file_path(relative_key: str) -> Path:
    return _resolve_contained_path(relative_key)
