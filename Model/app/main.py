import uuid
import time
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse

from app.config import (
    APP_NAME,
    APP_VERSION,
    SUPPORTED_CATEGORIES,
    CATEGORY_SHOES_CLOTHES,
    CATEGORY_ELECTRONICS_SMARTPHONES,
    DEFAULT_SIMILARITY_THRESHOLD,
    DEFAULT_CONF_THRESHOLD,
    STATIC_DIR,
    DEVICE,
    CLIP_MODEL_NAME,
    YOLO_LEATHER_WEIGHTS,
    YOLO_SMARTPHONE_WEIGHTS
)
from app.models.clip_matcher import get_clip_matcher
from app.models.yolo_detector import get_yolo_detector
from app.schemas.request_response import (
    ReturnVerificationResponse,
    ProductMatchResult,
    DamageDetectionResult,
    HealthCheckResponse
)
from app.utils.image_utils import bytes_to_pil

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 70)
    print(f"Starting {APP_NAME} v{APP_VERSION}...")
    print(f"Loading CLIP model '{CLIP_MODEL_NAME}' and YOLO models on device: {DEVICE}")
    get_clip_matcher()
    get_yolo_detector()
    print("All AI Models Loaded & Ready for Verification Requests!")
    print("=" * 70)
    yield

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Automated Return & Exchange Verification System using Python, CLIP (Image Embeddings + Cosine Similarity), and Fine-tuned YOLO (MVTec Leather & Smartphone Screen Damage).",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory if present
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/", response_class=HTMLResponse)
def index():
    """Serve the Web Dashboard UI."""
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return HTMLResponse("<h1>Return & Exchange Automation System API</h1><p>Visit <a href='/docs'>/docs</a> for API Documentation or upload static/index.html dashboard.</p>")

@app.get("/dashboard", response_class=HTMLResponse)
def dashboard():
    """Redirect or serve Web Dashboard."""
    return index()

@app.get("/health", response_model=HealthCheckResponse)
def health_check():
    """System health check and loaded model diagnostics."""
    return HealthCheckResponse(
        status="healthy",
        app_version=APP_VERSION,
        device=DEVICE,
        clip_model=CLIP_MODEL_NAME,
        yolo_models_loaded={
            CATEGORY_SHOES_CLOTHES: True,
            CATEGORY_ELECTRONICS_SMARTPHONES: True,
            "custom_leather_weights": YOLO_LEATHER_WEIGHTS.exists(),
            "custom_smartphone_weights": YOLO_SMARTPHONE_WEIGHTS.exists()
        }
    )

@app.post("/api/v1/verify-return", response_model=ReturnVerificationResponse)
async def verify_return(
    reference_image: UploadFile = File(..., description="Original product image from store catalog"),
    returned_image: UploadFile = File(..., description="Customer uploaded image of returned item"),
    category: str = Form(
        CATEGORY_SHOES_CLOTHES,
        description="Product category: 'shoes_clothes' or 'electronics_smartphones'"
    ),
    similarity_threshold: Optional[float] = Form(
        None,
        description="Custom similarity threshold percentage (0-100). Default is 75.0%"
    ),
    conf_threshold: Optional[float] = Form(
        None,
        description="Custom YOLO damage detection confidence threshold (0.0 - 1.0). Default is 0.25"
    )
):
    """
    Full Return & Exchange Verification Endpoint:
    1. Checks if customer image matches original product using CLIP Embeddings + Cosine Similarity (0-100%).
    2. Checks for physical damage defects using Category-Specific YOLO (MVTec AD Leather or Smartphone Screen Damage).
    3. Evaluates overall Return Decision (APPROVED, REJECTED_MISMATCH, REJECTED_DAMAGED, etc.).
    """
    transaction_id = f"RET-{uuid.uuid4().hex[:8].upper()}"

    # Validate category
    if category not in SUPPORTED_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category '{category}'. Supported categories: {SUPPORTED_CATEGORIES}"
        )

    # Read image contents
    try:
        ref_bytes = await reference_image.read()
        ret_bytes = await returned_image.read()
        ref_pil = bytes_to_pil(ref_bytes)
        ret_pil = bytes_to_pil(ret_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process uploaded image files: {str(e)}"
        )

    threshold = similarity_threshold if similarity_threshold is not None else DEFAULT_SIMILARITY_THRESHOLD
    conf = conf_threshold if conf_threshold is not None else DEFAULT_CONF_THRESHOLD

    # 1. Product Image Matching via CLIP Embeddings & Cosine Similarity
    clip_matcher = get_clip_matcher()
    match_result: ProductMatchResult = clip_matcher.calculate_similarity(
        reference_image=ref_pil,
        returned_image=ret_pil,
        threshold=threshold
    )

    # 2. Damage Detection via Fine-Tuned YOLO Model
    yolo_detector = get_yolo_detector()
    damage_result: DamageDetectionResult = yolo_detector.detect_damage(
        image=ret_pil,
        category=category,
        conf_threshold=conf
    )

    # 3. Automated Decision Logic
    is_product_match = match_result.is_match
    damage_detected = damage_result.damage_detected
    sim_score = match_result.similarity_score
    defects_cnt = damage_result.damage_count

    if not is_product_match and damage_detected:
        return_status = "REJECTED_MISMATCH_AND_DAMAGED"
        summary = (
            f"Return REJECTED: Product mismatch (Similarity {sim_score}% < threshold {threshold}%) "
            f"AND {defects_cnt} physical defect(s) detected on item."
        )
    elif not is_product_match:
        return_status = "REJECTED_MISMATCH"
        summary = (
            f"Return REJECTED: Customer uploaded image does not match the original product "
            f"(Similarity {sim_score}% < required {threshold}%)."
        )
    elif damage_detected:
        return_status = "REJECTED_DAMAGED"
        summary = (
            f"Return REJECTED: Item matches original product catalog ({sim_score}%), "
            f"but physical damage/defects were detected ({defects_cnt} defect(s) found)."
        )
    else:
        return_status = "APPROVED"
        summary = (
            f"Return APPROVED: Item matches original product image ({sim_score}%) "
            f"and no physical damage/defects were detected."
        )

    return ReturnVerificationResponse(
        transaction_id=transaction_id,
        product_category=category,
        similarity_score=sim_score,
        is_product_match=is_product_match,
        damage_detected=damage_detected,
        damage_count=defects_cnt,
        damages=damage_result.defects,
        return_status=return_status,
        summary_message=summary,
        annotated_image_b64=damage_result.annotated_image_b64
    )

@app.post("/api/v1/similarity-only", response_model=ProductMatchResult)
async def check_similarity_only(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...),
    threshold: float = Form(DEFAULT_SIMILARITY_THRESHOLD)
):
    """Utility endpoint: Calculate CLIP Image Similarity score (0-100%) between two images."""
    try:
        img1_bytes = await image1.read()
        img2_bytes = await image2.read()
        img1_pil = bytes_to_pil(img1_bytes)
        img2_pil = bytes_to_pil(img2_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image content: {str(e)}")

    matcher = get_clip_matcher()
    return matcher.calculate_similarity(img1_pil, img2_pil, threshold=threshold)

@app.post("/api/v1/damage-only", response_model=DamageDetectionResult)
async def check_damage_only(
    image: UploadFile = File(...),
    category: str = Form(CATEGORY_SHOES_CLOTHES),
    conf_threshold: float = Form(DEFAULT_CONF_THRESHOLD)
):
    """Utility endpoint: Run YOLO damage detection on a single image."""
    try:
        img_bytes = await image.read()
        img_pil = bytes_to_pil(img_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image content: {str(e)}")

    detector = get_yolo_detector()
    return detector.detect_damage(img_pil, category=category, conf_threshold=conf_threshold)
