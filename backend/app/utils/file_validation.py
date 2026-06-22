import json
import re
import zipfile
from io import BytesIO

from sqlalchemy.orm import Session

from app.config import settings
from app.crud.office_settings import get_office_settings
from app.utils.upload_policy_constants import (
    CANONICAL_EXTENSION_ORDER,
    SECURE_SYSTEM_ALLOWLIST,
)

EXTENSION_TO_MIME = {
    "pdf": "application/pdf",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

INVALID_FILENAME_MESSAGE = "שם הקובץ אינו תקין."
UNSUPPORTED_EXTENSION_MESSAGE = "סוג קובץ אינו נתמך."
MIME_MISMATCH_MESSAGE = "תוכן הקובץ אינו תואם לסוג הקובץ."
FILE_TOO_LARGE_MESSAGE = "גודל הקובץ חורג מהמותר."

CONTROL_CHAR_PATTERN = re.compile(r"[\x00-\x1f\x7f]")
INVALID_EXTENSION_PATTERN = re.compile(r"[^a-z0-9]")


def parse_office_allowed_extensions(stored_value: str | None) -> list[str]:
    if stored_value is None or not str(stored_value).strip():
        return []

    raw = str(stored_value).strip()
    candidates: list[str] = []

    if raw.startswith("["):
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            return []
        if not isinstance(parsed, list):
            return []
        candidates = [str(item) for item in parsed]
    else:
        candidates = raw.split(",")

    normalized: list[str] = []
    seen: set[str] = set()

    for candidate in candidates:
        value = candidate.strip().lower()
        if value.startswith("."):
            value = value[1:]

        if not value:
            continue
        if CONTROL_CHAR_PATTERN.search(value):
            continue
        if "/" in value or "\\" in value:
            continue
        if INVALID_EXTENSION_PATTERN.search(value):
            continue
        if value not in seen:
            seen.add(value)
            normalized.append(value)

    normalized.sort()
    return normalized


def get_effective_allowed_extensions(db: Session) -> list[str]:
    settings_row = get_office_settings(db)
    office_extensions = parse_office_allowed_extensions(settings_row.allowed_file_extensions)
    effective = sorted(set(office_extensions) & SECURE_SYSTEM_ALLOWLIST)
    return [ext for ext in CANONICAL_EXTENSION_ORDER if ext in effective]


def get_upload_policy(db: Session) -> dict:
    return {
        "allowed_extensions": get_effective_allowed_extensions(db),
        "max_upload_size_mb": settings.max_upload_size_mb,
    }


def extract_final_extension(filename: str) -> str | None:
    if not filename or not filename.strip():
        return None

    name = filename.strip()
    if CONTROL_CHAR_PATTERN.search(name):
        return None
    if "/" in name or "\\" in name or ".." in name:
        return None

    if "." not in name:
        return None

    extension = name.rsplit(".", 1)[-1].strip().lower()
    if extension.startswith("."):
        extension = extension[1:]

    if not extension or CONTROL_CHAR_PATTERN.search(extension):
        return None
    if "/" in extension or "\\" in extension:
        return None
    if INVALID_EXTENSION_PATTERN.search(extension):
        return None

    return extension


def validate_original_filename(filename: str) -> str:
    if not filename or not filename.strip():
        raise ValueError(INVALID_FILENAME_MESSAGE)

    name = filename.strip()
    if CONTROL_CHAR_PATTERN.search(name):
        raise ValueError(INVALID_FILENAME_MESSAGE)
    if "/" in name or "\\" in name or ".." in name:
        raise ValueError(INVALID_FILENAME_MESSAGE)

    return name


def validate_extension_allowed(extension: str, allowed_extensions: list[str]) -> None:
    if extension not in allowed_extensions:
        raise ValueError(UNSUPPORTED_EXTENSION_MESSAGE)


def max_upload_size_bytes() -> int:
    return settings.max_upload_size_mb * 1024 * 1024


def validate_file_content(extension: str, content: bytes) -> str:
    if not content:
        raise ValueError(MIME_MISMATCH_MESSAGE)

    if extension == "pdf":
        if not content.startswith(b"%PDF"):
            raise ValueError(MIME_MISMATCH_MESSAGE)
        return EXTENSION_TO_MIME["pdf"]

    if extension == "png":
        if not content.startswith(b"\x89PNG\r\n\x1a\n"):
            raise ValueError(MIME_MISMATCH_MESSAGE)
        return EXTENSION_TO_MIME["png"]

    if extension in {"jpg", "jpeg"}:
        if not content.startswith(b"\xff\xd8\xff"):
            raise ValueError(MIME_MISMATCH_MESSAGE)
        return EXTENSION_TO_MIME[extension]

    if extension in {"docx", "xlsx"}:
        if not content.startswith(b"PK\x03\x04"):
            raise ValueError(MIME_MISMATCH_MESSAGE)
        try:
            with zipfile.ZipFile(BytesIO(content)) as archive:
                names = archive.namelist()
        except zipfile.BadZipFile as exc:
            raise ValueError(MIME_MISMATCH_MESSAGE) from exc

        if extension == "docx" and not any(
            name.startswith("word/") for name in names
        ):
            raise ValueError(MIME_MISMATCH_MESSAGE)
        if extension == "xlsx" and not any(name.startswith("xl/") for name in names):
            raise ValueError(MIME_MISMATCH_MESSAGE)
        return EXTENSION_TO_MIME[extension]

    raise ValueError(UNSUPPORTED_EXTENSION_MESSAGE)


async def read_upload_bounded(file, max_bytes: int) -> bytes:
    chunks: list[bytes] = []
    total = 0
    chunk_size = 64 * 1024

    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise ValueError(FILE_TOO_LARGE_MESSAGE)
        chunks.append(chunk)

    return b"".join(chunks)
