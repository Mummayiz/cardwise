from io import BytesIO

from PIL import Image, ImageOps


def compress_card_image(image_bytes: bytes) -> bytes:
    """Normalize orientation and store a readable, space-efficient JPEG copy."""
    with Image.open(BytesIO(image_bytes)) as source:
        image = ImageOps.exif_transpose(source)
        if "A" in image.getbands():
            rgba = image.convert("RGBA")
            background = Image.new("RGB", rgba.size, "white")
            background.paste(rgba, mask=rgba.getchannel("A"))
            image = background
        else:
            image = image.convert("RGB")
        image.thumbnail((1800, 1400), Image.Resampling.LANCZOS)
        output = BytesIO()
        image.save(output, format="JPEG", quality=86, optimize=True)
        return output.getvalue()
