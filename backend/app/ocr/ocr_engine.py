import easyocr
import numpy as np
from PIL import Image
import io
import logging
from typing import Tuple

logger = logging.getLogger(__name__)

# Initialize reader once (expensive operation)
_reader = None


def get_reader() -> easyocr.Reader:
    global _reader
    if _reader is None:
        logger.info("Initializing EasyOCR reader...")
        _reader = easyocr.Reader(["en"], gpu=False)
        logger.info("EasyOCR reader initialized.")
    return _reader


def extract_text_from_image(image_bytes: bytes) -> Tuple[str, float]:
    """
    Run OCR on raw image bytes.
    Returns (raw_text, avg_confidence).
    """
    try:
        reader = get_reader()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(image)

        results = reader.readtext(image_np)

        if not results:
            return "", 0.0

        lines = []
        confidences = []
        for (_, text, confidence) in results:
            lines.append(text.strip())
            confidences.append(confidence)

        raw_text = "\n".join(lines)
        avg_confidence = sum(confidences) / len(confidences)

        return raw_text, avg_confidence

    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")
        raise
