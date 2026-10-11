import io
import sys
from pathlib import Path
from typing import Union, Dict, Any, List, Optional
from PIL import Image

from backend.config import (
    MODEL_DIR,
    FRONTEND_ASSETS_DIR,
    CATEGORY_SHOES_CLOTHES,
    CATEGORY_ELECTRONICS_SMARTPHONES,
    DEFAULT_SIMILARITY_THRESHOLD,
    DEFAULT_CONF_THRESHOLD,
)

# Ensure Model directory is in sys.path
if str(MODEL_DIR) not in sys.path:
    sys.path.insert(0, str(MODEL_DIR))

# Import core AI models from Model package
try:
    from app.models.clip_matcher import get_clip_matcher, CLIPProductMatcher
    from app.models.yolo_detector import get_yolo_detector, YOLODamageDetector
    from app.utils.image_utils import bytes_to_pil, pil_to_base64
    from app.config import (
        DEVICE,
        CLIP_MODEL_NAME,
        YOLO_LEATHER_WEIGHTS,
        YOLO_SMARTPHONE_WEIGHTS,
    )
    MODELS_AVAILABLE = True
except Exception as e:
    print(f"[Warning] Failed to import AI models from {MODEL_DIR}: {e}")
    MODELS_AVAILABLE = False
    DEVICE = "cpu"
    CLIP_MODEL_NAME = "unavailable"
    YOLO_LEATHER_WEIGHTS = Path("")
    YOLO_SMARTPHONE_WEIGHTS = Path("")


def load_pil_image(image_input: Union[bytes, str, Path, Image.Image]) -> Image.Image:
    """
    Robust image loader: accepts bytes, local file path, frontend asset path, or PIL Image.
    """
    if isinstance(image_input, Image.Image):
        return image_input.convert("RGB")
    
    if isinstance(image_input, bytes):
        return Image.open(io.BytesIO(image_input)).convert("RGB")
    
    if isinstance(image_input, (str, Path)):
        p_str = str(image_input).replace("\\", "/")
        # If it's a frontend asset path like "/assets/headphones-ref.jpg"
        if p_str.startswith("/assets/") or p_str.startswith("assets/"):
            filename = p_str.split("/")[-1]
            local_path = FRONTEND_ASSETS_DIR / filename
            if local_path.exists():
                return Image.open(local_path).convert("RGB")

        p = Path(image_input)
        if p.exists():
            return Image.open(p).convert("RGB")
            
        # Try relative to FRONTEND_ASSETS_DIR
        alt_path = FRONTEND_ASSETS_DIR / p.name
        if alt_path.exists():
            return Image.open(alt_path).convert("RGB")

    raise ValueError(f"Could not load image from input: {image_input}")


def get_model_diagnostics() -> Dict[str, Any]:
    """Return status and diagnostics of loaded AI models."""
    return {
        "models_available": MODELS_AVAILABLE,
        "device": str(DEVICE),
        "clip_model": CLIP_MODEL_NAME,
        "leather_weights_exist": YOLO_LEATHER_WEIGHTS.exists() if hasattr(YOLO_LEATHER_WEIGHTS, "exists") else False,
        "smartphone_weights_exist": YOLO_SMARTPHONE_WEIGHTS.exists() if hasattr(YOLO_SMARTPHONE_WEIGHTS, "exists") else False,
    }


def compare_images(
    ref_image_input: Union[bytes, str, Path, Image.Image],
    customer_image_input: Union[bytes, str, Path, Image.Image],
    threshold: float = DEFAULT_SIMILARITY_THRESHOLD,
) -> Dict[str, Any]:
    """
    Compares reference product catalog image with customer uploaded image
    using CLIP embeddings & cosine similarity.
    Returns 0.0% to 100.0% visual match score and match verdict.
    """
    matcher = get_clip_matcher()
    cust_pil = load_pil_image(customer_image_input)

    # Check if there are multiple candidate references (e.g. smartphone front & back)
    ref_candidates = [ref_image_input]
    p_str = str(ref_image_input).replace("\\", "/") if isinstance(ref_image_input, (str, Path)) else ""
    if "mobile-smartphone" in p_str or "inv-mt-1" in p_str or "smartphone" in p_str:
        front_ref = FRONTEND_ASSETS_DIR / "mobile-smartphone-front.jpg"
        back_ref = FRONTEND_ASSETS_DIR / "mobile-smartphone-back.jpg"
        if front_ref.exists():
            ref_candidates.append(front_ref)
        if back_ref.exists():
            ref_candidates.append(back_ref)

    best_result = None
    best_score = -1.0

    for cand in ref_candidates:
        try:
            cand_pil = load_pil_image(cand)
            res = matcher.calculate_similarity(
                reference_image=cand_pil,
                returned_image=cust_pil,
                threshold=threshold,
            )
            if res.similarity_score > best_score:
                best_score = res.similarity_score
                best_result = res
        except Exception:
            continue

    if best_result is None:
        ref_pil = load_pil_image(ref_image_input)
        best_result = matcher.calculate_similarity(
            reference_image=ref_pil,
            returned_image=cust_pil,
            threshold=threshold,
        )

    return {
        "similarity_score": best_result.similarity_score,
        "is_match": best_result.is_match,
        "threshold_used": best_result.threshold_used,
        "verdict": best_result.verdict,
    }


def detect_damage(
    customer_image_input: Union[bytes, str, Path, Image.Image],
    category: str = CATEGORY_SHOES_CLOTHES,
    conf_threshold: float = DEFAULT_CONF_THRESHOLD,
) -> Dict[str, Any]:
    """
    Runs damage & defect detection on customer-uploaded image using fine-tuned
    YOLO models and OpenCV structural edge/crack analysis.
    """
    cust_pil = load_pil_image(customer_image_input)

    detector = get_yolo_detector()
    result = detector.detect_damage(
        image=cust_pil,
        category=category,
        conf_threshold=conf_threshold,
    )

    defects_data = [
        {
            "class_name": d.class_name,
            "confidence": round(d.confidence, 3),
            "bbox": d.bbox,
            "severity": d.severity,
        }
        for d in result.defects
    ]

    return {
        "damage_detected": result.damage_detected,
        "damage_count": result.damage_count,
        "defects": defects_data,
        "annotated_image_b64": result.annotated_image_b64,
    }


def verify_return_item(
    reference_image_input: Union[bytes, str, Path, Image.Image],
    returned_image_input: Union[bytes, str, Path, Image.Image],
    category: str = CATEGORY_SHOES_CLOTHES,
    similarity_threshold: float = DEFAULT_SIMILARITY_THRESHOLD,
    conf_threshold: float = DEFAULT_CONF_THRESHOLD,
) -> Dict[str, Any]:
    """
    Full automated verification pipeline:
    1. Visual similarity comparison via CLIP
    2. Physical defect & damage detection via YOLO + OpenCV
    3. Automated return decision engine
    """
    match_result = compare_images(
        ref_image_input=reference_image_input,
        customer_image_input=returned_image_input,
        threshold=similarity_threshold,
    )

    damage_result = detect_damage(
        customer_image_input=returned_image_input,
        category=category,
        conf_threshold=conf_threshold,
    )

    sim_score = match_result["similarity_score"]
    is_product_match = match_result["is_match"]
    damage_detected = damage_result["damage_detected"]
    defects_count = damage_result["damage_count"]

    if not is_product_match and damage_detected:
        return_status = "REJECTED_MISMATCH_AND_DAMAGED"
        summary = (
            f"Return REJECTED: Product mismatch (Similarity {sim_score}% < threshold {similarity_threshold}%) "
            f"AND {defects_count} physical defect(s) detected on item."
        )
    elif not is_product_match:
        return_status = "REJECTED_MISMATCH"
        summary = (
            f"Return REJECTED: Customer uploaded image does not match the catalog product "
            f"(Similarity {sim_score}% < required {similarity_threshold}%)."
        )
    elif damage_detected:
        severe_defects = [d for d in damage_result.get("defects", []) if d.get("severity") == "HIGH" and d.get("confidence", 0) >= 0.85]
        if severe_defects:
            return_status = "NEEDS_INSPECTION"
            summary = (
                f"Product profile verified ({sim_score}% match). Surface condition flagged for merchant assessment "
                f"({len(severe_defects)} area(s))."
            )
        else:
            return_status = "APPROVED"
            summary = (
                f"Return APPROVED: Item matches catalog reference ({sim_score}%) with genuine condition."
            )
    else:
        return_status = "APPROVED"
        summary = (
            f"Return APPROVED: Item matches catalog reference ({sim_score}%) "
            f"with zero physical damage or defects detected."
        )

    return {
        "product_category": category,
        "similarity_score": sim_score,
        "is_product_match": is_product_match,
        "damage_detected": damage_detected,
        "damage_count": defects_count,
        "damages": damage_result["defects"],
        "return_status": return_status,
        "summary_message": summary,
        "annotated_image_b64": damage_result["annotated_image_b64"],
    }


def verify_multi_angle_return(
    reference_image_input: Union[bytes, str, Path, Image.Image],
    angle_images: Dict[str, Union[bytes, str, Path, Image.Image]],
    category: str = CATEGORY_SHOES_CLOTHES,
    similarity_threshold: float = DEFAULT_SIMILARITY_THRESHOLD,
    conf_threshold: float = DEFAULT_CONF_THRESHOLD,
) -> Dict[str, Any]:
    """
    Comprehensive verification for multiple customer angles (e.g. Front, Back, Detail, Tag).
    - Compares each angle with reference catalog image
    - Checks for damage defects across all angles
    - Aggregates similarity scores and defect counts
    """
    angle_results = {}
    total_score = 0.0
    all_defects = []
    annotated_images = {}
    valid_angles_count = 0

    for angle_key, img_input in angle_images.items():
        try:
            # Check similarity
            sim = compare_images(
                ref_image_input=reference_image_input,
                customer_image_input=img_input,
                threshold=similarity_threshold,
            )
            # Check damage
            dmg = detect_damage(
                customer_image_input=img_input,
                category=category,
                conf_threshold=conf_threshold,
            )
            
            angle_results[angle_key] = {
                "similarity_score": sim["similarity_score"],
                "is_match": sim["is_match"],
                "damage_detected": dmg["damage_detected"],
                "defects": dmg["defects"],
            }
            if dmg.get("annotated_image_b64"):
                annotated_images[angle_key] = dmg["annotated_image_b64"]

            total_score += sim["similarity_score"]
            all_defects.extend(dmg["defects"])
            valid_angles_count += 1
        except Exception as e:
            angle_results[angle_key] = {"error": str(e)}

    avg_score = round(total_score / max(1, valid_angles_count), 2)
    is_match = avg_score >= similarity_threshold
    damage_detected = len(all_defects) > 0

    if not is_match and damage_detected:
        return_status = "REJECTED_MISMATCH_AND_DAMAGED"
        summary = f"Multi-angle check REJECTED: Low similarity match ({avg_score}%) and {len(all_defects)} defect(s) detected across photos."
    elif not is_match:
        return_status = "REJECTED_MISMATCH"
        summary = f"Multi-angle check REJECTED: Average similarity score ({avg_score}%) below required threshold ({similarity_threshold}%)."
    elif damage_detected:
        return_status = "REJECTED_DAMAGED"
        summary = f"Multi-angle check REJECTED: Visual similarity passed ({avg_score}%), but physical defect(s) found in {len(all_defects)} region(s)."
    else:
        return_status = "APPROVED"
        summary = f"Multi-angle check APPROVED: Verified {valid_angles_count} angle photos ({avg_score}% match) with flawless condition."

    return {
        "product_category": category,
        "average_similarity_score": avg_score,
        "is_product_match": is_match,
        "damage_detected": damage_detected,
        "total_defects_count": len(all_defects),
        "all_defects": all_defects,
        "return_status": return_status,
        "summary_message": summary,
        "angle_breakdown": angle_results,
        "annotated_images": annotated_images,
    }
