import uuid
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status
from backend.models.ai_integration import (
    compare_images,
    detect_damage,
    verify_return_item,
    verify_multi_angle_return,
    load_pil_image
)
from backend.schemas.return_schemas import (
    VerificationResponseSchema,
    SimilarityResponseSchema,
    DamageResponseSchema,
    MultiAngleResponseSchema
)
from backend.database import db
from backend.config import (
    CATEGORY_SHOES_CLOTHES,
    CATEGORY_ELECTRONICS_SMARTPHONES,
    DEFAULT_SIMILARITY_THRESHOLD,
    DEFAULT_CONF_THRESHOLD,
    SUPPORTED_CATEGORIES
)

router = APIRouter(tags=["AI Verification & Model"])


@router.post("/verify", response_model=VerificationResponseSchema)
async def verify_return_flexible(
    returned_image: UploadFile = File(..., description="Customer-uploaded image of item"),
    reference_image: Optional[UploadFile] = File(None, description="Optional catalog reference image"),
    product_id: Optional[str] = Form(None, description="Optional catalog product ID to use standard reference image"),
    category: str = Form(CATEGORY_SHOES_CLOTHES, description="Category: shoes_clothes or electronics_smartphones"),
    similarity_threshold: Optional[float] = Form(None, description="Custom similarity threshold % (e.g. 75.0)"),
    conf_threshold: Optional[float] = Form(None, description="Custom defect confidence threshold (e.g. 0.50)")
):
    """
    Main Return & Exchange Visual Verification:
    - Compares customer photo against original catalog reference using CLIP.
    - Inspects physical damages/defects using YOLO and OpenCV fracture contours.
    - Yields visual similarity score (0.0% - 100.0%) and automated return verdict.
    """
    # Resolve reference image input
    ref_input = None
    if reference_image is not None:
        ref_input = await reference_image.read()
    elif product_id is not None:
        prod = db.get_product(product_id)
        if not prod:
            raise HTTPException(status_code=404, detail=f"Product with id '{product_id}' not found.")
        ref_input = prod.get("ref_image") or prod.get("image")
    else:
        raise HTTPException(
            status_code=400,
            detail="Either reference_image file or product_id must be provided."
        )

    ret_bytes = await returned_image.read()
    thresh = similarity_threshold if similarity_threshold is not None else DEFAULT_SIMILARITY_THRESHOLD
    conf = conf_threshold if conf_threshold is not None else DEFAULT_CONF_THRESHOLD

    try:
        result = verify_return_item(
            reference_image_input=ref_input,
            returned_image_input=ret_bytes,
            category=category,
            similarity_threshold=thresh,
            conf_threshold=conf
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Verification model processing failed: {str(e)}"
        )

    tx_id = f"RET-{uuid.uuid4().hex[:8].upper()}"
    return VerificationResponseSchema(
        transaction_id=tx_id,
        product_category=result["product_category"],
        similarity_score=result["similarity_score"],
        is_product_match=result["is_product_match"],
        damage_detected=result["damage_detected"],
        damage_count=result["damage_count"],
        damages=result["damages"],
        return_status=result["return_status"],
        summary_message=result["summary_message"],
        annotated_image_b64=result.get("annotated_image_b64")
    )


@router.post("/verify-angles", response_model=MultiAngleResponseSchema)
async def verify_multi_angle(
    front_image: UploadFile = File(..., description="Angle 1 · Front View"),
    back_image: Optional[UploadFile] = File(None, description="Angle 2 · Back View"),
    detail_image: Optional[UploadFile] = File(None, description="Angle 3 · Detail/Defect View"),
    tag_image: Optional[UploadFile] = File(None, description="Angle 4 · Tag/Label View"),
    reference_image: Optional[UploadFile] = File(None, description="Catalog reference image"),
    product_id: Optional[str] = Form(None, description="Catalog product ID"),
    category: str = Form(CATEGORY_SHOES_CLOTHES),
    similarity_threshold: Optional[float] = Form(None),
    conf_threshold: Optional[float] = Form(None)
):
    """
    Verify customer item from 4 separate angles against catalog master reference.
    Calculates average similarity match and detects flaws across all perspectives.
    """
    ref_input = None
    if reference_image is not None:
        ref_input = await reference_image.read()
    elif product_id is not None:
        prod = db.get_product(product_id)
        if not prod:
            raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
        ref_input = prod.get("ref_image")
    else:
        # Fallback to linen shirt reference
        ref_input = "/assets/linen-front.jpg"

    angles = {"front": await front_image.read()}
    if back_image:
        angles["back"] = await back_image.read()
    if detail_image:
        angles["detail"] = await detail_image.read()
    if tag_image:
        angles["label"] = await tag_image.read()

    thresh = similarity_threshold if similarity_threshold is not None else DEFAULT_SIMILARITY_THRESHOLD
    conf = conf_threshold if conf_threshold is not None else DEFAULT_CONF_THRESHOLD

    try:
        result = verify_multi_angle_return(
            reference_image_input=ref_input,
            angle_images=angles,
            category=category,
            similarity_threshold=thresh,
            conf_threshold=conf
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multi-angle verification failed: {str(e)}")

    tx_id = f"RET-ANGLES-{uuid.uuid4().hex[:8].upper()}"
    return MultiAngleResponseSchema(
        transaction_id=tx_id,
        product_category=category,
        average_similarity_score=result["average_similarity_score"],
        is_product_match=result["is_product_match"],
        damage_detected=result["damage_detected"],
        total_defects_count=result["total_defects_count"],
        all_defects=result["all_defects"],
        return_status=result["return_status"],
        summary_message=result["summary_message"],
        angle_breakdown=result["angle_breakdown"],
        annotated_images=result.get("annotated_images", {})
    )


# --- Backward-compatible endpoints matching Model/app/main.py ---

@router.post("/v1/verify-return", response_model=VerificationResponseSchema)
async def verify_return_v1(
    reference_image: UploadFile = File(..., description="Original product image"),
    returned_image: UploadFile = File(..., description="Customer returned image"),
    category: str = Form(CATEGORY_SHOES_CLOTHES),
    similarity_threshold: Optional[float] = Form(None),
    conf_threshold: Optional[float] = Form(None)
):
    """Direct compatibility with Model v1 verify-return API."""
    ref_bytes = await reference_image.read()
    ret_bytes = await returned_image.read()
    thresh = similarity_threshold if similarity_threshold is not None else DEFAULT_SIMILARITY_THRESHOLD
    conf = conf_threshold if conf_threshold is not None else DEFAULT_CONF_THRESHOLD

    result = verify_return_item(
        reference_image_input=ref_bytes,
        returned_image_input=ret_bytes,
        category=category,
        similarity_threshold=thresh,
        conf_threshold=conf
    )

    return VerificationResponseSchema(
        transaction_id=f"RET-{uuid.uuid4().hex[:8].upper()}",
        product_category=category,
        similarity_score=result["similarity_score"],
        is_product_match=result["is_product_match"],
        damage_detected=result["damage_detected"],
        damage_count=result["damage_count"],
        damages=result["damages"],
        return_status=result["return_status"],
        summary_message=result["summary_message"],
        annotated_image_b64=result.get("annotated_image_b64")
    )


@router.post("/v1/similarity-only", response_model=SimilarityResponseSchema)
async def similarity_only(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...),
    threshold: float = Form(DEFAULT_SIMILARITY_THRESHOLD)
):
    """Direct compatibility with Model v1 similarity-only API."""
    img1_bytes = await image1.read()
    img2_bytes = await image2.read()
    res = compare_images(img1_bytes, img2_bytes, threshold=threshold)
    return SimilarityResponseSchema(**res)


@router.post("/v1/damage-only", response_model=DamageResponseSchema)
async def damage_only(
    image: UploadFile = File(...),
    category: str = Form(CATEGORY_SHOES_CLOTHES),
    conf_threshold: float = Form(DEFAULT_CONF_THRESHOLD)
):
    """Direct compatibility with Model v1 damage-only API."""
    img_bytes = await image.read()
    res = detect_damage(img_bytes, category=category, conf_threshold=conf_threshold)
    return DamageResponseSchema(**res)
