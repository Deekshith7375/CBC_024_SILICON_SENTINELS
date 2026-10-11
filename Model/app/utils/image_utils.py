import io
import base64
from PIL import Image, ImageDraw, ImageFont
import numpy as np

def bytes_to_pil(image_bytes: bytes) -> Image.Image:
    """Convert raw image bytes to RGB PIL Image."""
    image = Image.open(io.BytesIO(image_bytes))
    return image.convert("RGB")

def pil_to_base64(image: Image.Image, format: str = "JPEG") -> str:
    """Convert PIL Image to base64 encoded string data URI."""
    buffer = io.BytesIO()
    image.save(buffer, format=format)
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/{format.lower()};base64,{b64_str}"

def draw_bounding_boxes(image: Image.Image, defects: list) -> Image.Image:
    """
    Draw colored bounding boxes and labels for detected defects on PIL Image.
    """
    annotated = image.copy()
    draw = ImageDraw.Draw(annotated)
    width, height = annotated.size
    
    # Try to load a font, fallback to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", max(14, int(height * 0.025)))
    except IOError:
        font = ImageFont.load_default()

    colors = {
        "HIGH": "#E53E3E",     # Red
        "MEDIUM": "#DD6B20",   # Orange
        "LOW": "#D69E2E"       # Yellow
    }

    for defect in defects:
        bbox = defect.get("bbox") if isinstance(defect, dict) else defect.bbox
        label = defect.get("class_name") if isinstance(defect, dict) else defect.class_name
        conf = defect.get("confidence") if isinstance(defect, dict) else defect.confidence
        severity = defect.get("severity", "MEDIUM") if isinstance(defect, dict) else getattr(defect, "severity", "MEDIUM")
        
        if not bbox or len(bbox) != 4:
            continue
            
        x1, y1, x2, y2 = bbox
        color = colors.get(severity, "#E53E3E")
        
        # Line width based on image size
        line_width = max(3, int(min(width, height) * 0.006))
        
        # Draw rectangle
        draw.rectangle([x1, y1, x2, y2], outline=color, width=line_width)
        
        # Draw text label background pill
        text = f"{label.upper()} {conf * 100:.1f}%"
        
        # Calculate text bbox
        text_bbox = draw.textbbox((x1, y1), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        # Position label above bounding box if room, otherwise inside top
        label_y1 = max(0, y1 - text_height - 6)
        label_y2 = label_y1 + text_height + 6
        
        draw.rectangle([x1, label_y1, x1 + text_width + 8, label_y2], fill=color)
        draw.text((x1 + 4, label_y1 + 2), text, fill="#FFFFFF", font=font)

    return annotated
