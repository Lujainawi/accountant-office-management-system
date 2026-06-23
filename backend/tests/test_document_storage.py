from pathlib import Path

import pytest

from app.config import settings
from app.services.document_storage import _resolve_contained_path, file_exists


@pytest.fixture()
def isolated_upload_root(tmp_path, monkeypatch):
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()
    monkeypatch.setattr(settings, "upload_dir", upload_dir)
    return upload_dir.resolve()


def test_valid_storage_key_resolves_under_upload_root(isolated_upload_root):
    resolved = _resolve_contained_path("demo.pdf")
    assert resolved.relative_to(isolated_upload_root)
    assert resolved == isolated_upload_root / "demo.pdf"


def test_traversal_key_is_rejected(isolated_upload_root):
    with pytest.raises(ValueError, match="Invalid storage path"):
        _resolve_contained_path("../outside.pdf")


def test_absolute_style_key_is_rejected(isolated_upload_root):
    outside = isolated_upload_root.parent / "outside.pdf"
    with pytest.raises(ValueError, match="Invalid storage path"):
        _resolve_contained_path(str(outside))


def test_file_exists_returns_false_for_invalid_key(isolated_upload_root):
    assert file_exists("../outside.pdf") is False
    assert file_exists(str(isolated_upload_root.parent / "outside.pdf")) is False
