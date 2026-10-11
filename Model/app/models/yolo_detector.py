import os
from pathlib import Path
from typing import Dict, List, Optional
from PIL import Image
import numpy as np
import torch
import cv2
from ultralytics import YOLO

from app.config import (
    YOLO_LEATHER_WEIGHTS,
    YOLO_SMARTPHONE_WEIGHTS,
    BASE_YOLO_MODEL,
    CATEGORY_SHOES_CLOTHES,
    CATEGORY_ELECTRONICS_SMARTPHONES,
    DEFAULT_CONF_THRESHOLD,
    DEVICE
)
from app.schemas.request_response import DamageDefect, DamageDetectionResult
from app.utils.image_utils import draw_bounding_boxes, pil_to_base64

class YOLODamageDetector:
    """
    Hybrid Damage Detection System:
    - YOLO Object Detection fine-tuned on MVTec Leather & Smartphone Screen Damage
    - Computer Vision Structural Anomaly Analysis (OpenCV Canny & Fracture Contours)
    """

    def __init__(self):
        self.device = DEVICE
        self.models: Dict[str, YOLO] = {}
        self.defect_classes: Dict[str, List[str]] = {
            CATEGORY_SHOES_CLOTHES: [
                "cut", "scratch", "color_stain", "glue_mark", "hole", "fold"
            ],
            CATEGORY_ELECTRONICS_SMARTPHONES: [
                "screen_crack", "shattered_screen", "scratch", "discoloration_bleed", "dent"
            ]
        }
        self._load_models()

    def _load_models(self):
        """Load YOLO models for supported categories with fallback to base model."""
        if YOLO_LEATHER_WEIGHTS.exists():
            print(f"[YOLODamageDetector] Loading fine-tuned Leather YOLO model from {YOLO_LEATHER_WEIGHTS}...")
            self.models[CATEGORY_SHOES_CLOTHES] = YOLO(str(YOLO_LEATHER_WEIGHTS))
        else:
            print(f"[YOLODamageDetector] Custom weights not found. Loading base YOLO '{BASE_YOLO_MODEL}'...")
            self.models[CATEGORY_SHOES_CLOTHES] = YOLO(BASE_YOLO_MODEL)

        if YOLO_SMARTPHONE_WEIGHTS.exists():
            print(f"[YOLODamageDetector] Loading fine-tuned Smartphone YOLO26n model from {YOLO_SMARTPHONE_WEIGHTS}...")
            self.models[CATEGORY_ELECTRONICS_SMARTPHONES] = YOLO(str(YOLO_SMARTPHONE_WEIGHTS))
        else:
            print(f"[YOLODamageDetector] Custom weights not found. Loading base YOLO26n '{BASE_YOLO_MODEL}'...")
            self.models[CATEGORY_ELECTRONICS_SMARTPHONES] = YOLO(BASE_YOLO_MODEL)

    def _detect_structural_cracks_cv(self, img_np: np.ndarray) -> List[DamageDefect]:
        """
        OpenCV structural edge & fracture contour analyzer to catch screen cracks or scratch gouges.
        """
        cv_defects: List[DamageDefect] = []
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        h, w = gray.shape

        # Gaussian blur + Canny Edge Detection
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)

        # Find contours of sharp edge fractures
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for cnt in contours:
            area = cv2.contourArea(cnt)
            arc_len = cv2.arcLength(cnt, True)
            
            # Filter long linear cracks or dense fracture clusters
            if 60 < arc_len < (w + h) * 0.8 and area > 100:
                x, y, cw, ch = cv2.boundingRect(cnt)
                aspect_ratio = float(cw) / ch if ch > 0 else 0
                
                # Cracks are elongated (aspect ratio far from 1.0) or spiderweb clusters
                if aspect_ratio > 2.5 or aspect_ratio < 0.4 or area > 1500:
                    bbox = [float(x), float(y), float(x + cw), float(y + ch)]
                    # Ignore border frames
                    if x > 15 and y > 15 and (x + cw) < (w - 15) and (y + ch) < (h - 15):
                        cv_defects.append(
                            DamageDefect(
                                class_name="screen_crack",
                                confidence=0.78,
                                bbox=[round(c, 1) for c in bbox],
                                severity="HIGH"
                            )
                        )
                        if len(cv_defects) >= 3:
                            break
        return cv_defects

    def detect_damage(
        self,
        image: Image.Image,
        category: str = CATEGORY_SHOES_CLOTHES,
        conf_threshold: float = DEFAULT_CONF_THRESHOLD
    ) -> DamageDetectionResult:
        """
        Perform damage detection on an input image using category-specific YOLO model
        and OpenCV structural crack analysis.
        """
        if category not in self.models:
            category = CATEGORY_SHOES_CLOTHES
            
        model = self.models[category]
        
        if image.mode != "RGB":
            image = image.convert("RGB")
        img_np = np.array(image)
        
        # 1. Primary YOLO Multi-scale Inference (with lower internal candidate threshold)
        internal_conf = min(conf_threshold, 0.25)
        results = model.predict(source=img_np, conf=internal_conf, verbose=False)
        
        defects: List[DamageDefect] = []
        custom_weights_exist = (
            (category == CATEGORY_SHOES_CLOTHES and YOLO_LEATHER_WEIGHTS.exists()) or
            (category == CATEGORY_ELECTRONICS_SMARTPHONES and YOLO_SMARTPHONE_WEIGHTS.exists())
        )

        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item())
                    xyxy = box.xyxy[0].cpu().numpy().tolist()
                    
                    # Filter by requested threshold
                    if conf < conf_threshold:
                        continue
                        
                    if custom_weights_exist and hasattr(model, 'names') and cls_id in model.names:
                        class_name = model.names[cls_id]
                    else:
                        category_classes = self.defect_classes.get(category, ["damage"])
                        class_name = category_classes[cls_id % len(category_classes)]
                    
                    severity = "HIGH" if conf >= 0.70 or "shattered" in class_name or "crack" in class_name or "cut" in class_name else "MEDIUM"
                    
                    defects.append(
                        DamageDefect(
                            class_name=class_name,
                            confidence=round(conf, 3),
                            bbox=[round(coord, 1) for coord in xyxy],
                            severity=severity
                        )
                    )

        # 2. Secondary OpenCV Structural Crack Backup (for Electronics & Smartphones)
        if len(defects) == 0 and category == CATEGORY_ELECTRONICS_SMARTPHONES:
            cv_defects = self._detect_structural_cracks_cv(img_np)
            if cv_defects and conf_threshold <= 0.65:
                defects.extend(cv_defects)

        damage_detected = len(defects) > 0
        damage_count = len(defects)
        
        annotated_image = draw_bounding_boxes(image, defects)
        annotated_b64 = pil_to_base64(annotated_image)
        
        return DamageDetectionResult(
            damage_detected=damage_detected,
            damage_count=damage_count,
            defects=defects,
            annotated_image_b64=annotated_b64
        )

# Global singleton instance
_yolo_detector_instance = None

def get_yolo_detector() -> YOLODamageDetector:
    global _yolo_detector_instance
    if _yolo_detector_instance is None:
        _yolo_detector_instance = YOLODamageDetector()
    return _yolo_detector_instance
