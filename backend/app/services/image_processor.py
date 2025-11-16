"""Image validation and pseudo-embedding helpers."""

from __future__ import annotations

import hashlib
import io
from typing import List

from PIL import Image, UnidentifiedImageError

from app.config import get_settings


class ImageProcessor:
    """Validate uploaded files and generate deterministic embeddings for them."""

    def __init__(self, target_size: int = 224) -> None:
        self.settings = get_settings()
        self.target_size = target_size

    def validate_image(self, image_data: bytes, mime_type: str | None) -> None:
        if not image_data:
            raise ValueError("Uploaded image is empty")
        if mime_type is None or mime_type.lower() not in self.settings.allowed_mime_types:
            raise ValueError("Invalid image format. Supported: JPEG, PNG, WebP")
        if len(image_data) > self.settings.max_upload_bytes:
            raise ValueError("Image exceeds the 10MB upload limit")

    def resize_image(self, image_data: bytes) -> bytes:
        try:
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
        except UnidentifiedImageError as exc:  # pragma: no cover - Pillow raises this internally
            raise ValueError("Uploaded file is not a valid image") from exc

        image = image.resize((self.target_size, self.target_size))
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        return buffer.getvalue()

    def extract_embedding(self, image_data: bytes) -> List[float]:
        """Create a repeatable pseudo-embedding until CLIP is wired up."""

        digest = hashlib.sha256(image_data).digest()
        values: List[float] = []
        seed = digest
        while len(values) < 512:
            seed = hashlib.sha256(seed).digest()
            values.extend(byte / 255 for byte in seed)
        trimmed = values[:512]
        norm = sum(v * v for v in trimmed) ** 0.5 or 1.0
        return [v / norm for v in trimmed]

    def process(self, image_data: bytes, mime_type: str | None) -> List[float]:
        self.validate_image(image_data, mime_type)
        resized = self.resize_image(image_data)
        return self.extract_embedding(resized)
