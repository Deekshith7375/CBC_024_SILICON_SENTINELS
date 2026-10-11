from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class DamageDefect(BaseModel):
    class_name: str = Field(..., description="Type of damage defect identified (e.g. cut, scratch, crack, hole)")
    confidence: float = Field(..., description="Confidence score of detection (0.0 to 1.0)")
    bbox: List[float] = Field(..., description="Bounding box coordinates [x1, y1, x2, y2]")
    severity: str = Field(default="MEDIUM", description="Severity level: LOW, MEDIUM, HIGH")

class ProductMatchResult(BaseModel):
    similarity_score: float = Field(..., description="Cosine similarity score scaled to 0-100%")
    is_match: bool = Field(..., description="True if similarity score meets threshold")
    threshold_used: float = Field(..., description="Similarity threshold percentage used for decision")
    verdict: str = Field(..., description="Human-readable verdict: MATCH or MISMATCH")

class DamageDetectionResult(BaseModel):
    damage_detected: bool = Field(..., description="True if any damage defects are found above confidence threshold")
    damage_count: int = Field(..., description="Total number of detected damage regions")
    defects: List[DamageDefect] = Field(default_factory=list, description="List of detected defect details")
    annotated_image_b64: Optional[str] = Field(None, description="Base64 encoded image string with damage bounding boxes drawn")

class ReturnVerificationResponse(BaseModel):
    transaction_id: str = Field(..., description="Unique transaction ID for tracking this return check")
    product_category: str = Field(..., description="Product category evaluated (shoes_clothes or electronics_smartphones)")
    similarity_score: float = Field(..., description="Product similarity percentage (0.0% to 100.0%)")
    is_product_match: bool = Field(..., description="Whether returned product matches the original product image")
    damage_detected: bool = Field(..., description="Whether physical damage or defects were detected")
    damage_count: int = Field(..., description="Count of damage instances found")
    damages: List[DamageDefect] = Field(default_factory=list, description="Detailed list of detected defects")
    return_status: str = Field(
        ..., 
        description="Decision status: APPROVED, REJECTED_MISMATCH, REJECTED_DAMAGED, REJECTED_MISMATCH_AND_DAMAGED, FLAGGED_FOR_MANUAL_REVIEW"
    )
    summary_message: str = Field(..., description="Concise explanation of the automated decision")
    annotated_image_b64: Optional[str] = Field(None, description="Base64 data URI of the returned image with annotated bounding boxes")

class HealthCheckResponse(BaseModel):
    status: str
    app_version: str
    device: str
    clip_model: str
    yolo_models_loaded: Dict[str, bool]
