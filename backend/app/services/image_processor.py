"""Image validation and pseudo-embedding helpers."""

from __future__ import annotations

import io
from typing import List, Optional

import torch
from PIL import Image, UnidentifiedImageError
from transformers import CLIPModel, CLIPProcessor

from app.config import get_settings


class ImageProcessor:
    """Validate uploaded files and generate CLIP embeddings."""

    _clip_model: Optional[CLIPModel] = None
    _clip_processor: Optional[CLIPProcessor] = None

    def __init__(self, target_size: int = 224) -> None:
        self.settings = get_settings()
        self.target_size = target_size
        self._ensure_model_loaded()

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
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        inputs = self._clip_processor(images=image, return_tensors="pt")
        with torch.no_grad():
            embeddings = self._clip_model.get_image_features(**inputs)
        normalized = torch.nn.functional.normalize(embeddings, p=2, dim=-1)
        return normalized.squeeze(0).tolist()

    def process(self, image_data: bytes, mime_type: str | None) -> List[float]:
        self.validate_image(image_data, mime_type)
        resized = self.resize_image(image_data)
        return self.extract_embedding(resized)

    def _ensure_model_loaded(self) -> None:
        if ImageProcessor._clip_model is None or ImageProcessor._clip_processor is None:
            ImageProcessor._clip_processor = CLIPProcessor.from_pretrained(self.settings.clip_model_name)
            ImageProcessor._clip_model = CLIPModel.from_pretrained(self.settings.clip_model_name)
