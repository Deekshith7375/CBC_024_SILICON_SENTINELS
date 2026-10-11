from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class DamageDefectSchema(BaseModel):
    class_name: str
    confidence: float
    bbox: List[float]
    severity: str = "MEDIUM"


class VerificationResponseSchema(BaseModel):
    transaction_id: str
    product_category: str
    similarity_score: float
    is_product_match: bool
    damage_detected: bool
    damage_count: int
    damages: List[Dict[str, Any]] = Field(default_factory=list)
    return_status: str
    summary_message: str
    annotated_image_b64: Optional[str] = None


class SimilarityResponseSchema(BaseModel):
    similarity_score: float
    is_match: bool
    threshold_used: float
    verdict: str


class DamageResponseSchema(BaseModel):
    damage_detected: bool
    damage_count: int
    defects: List[Dict[str, Any]] = Field(default_factory=list)
    annotated_image_b64: Optional[str] = None


class MultiAngleResponseSchema(BaseModel):
    transaction_id: str
    product_category: str
    average_similarity_score: float
    is_product_match: bool
    damage_detected: bool
    total_defects_count: int
    all_defects: List[Dict[str, Any]] = Field(default_factory=list)
    return_status: str
    summary_message: str
    angle_breakdown: Dict[str, Any] = Field(default_factory=dict)
    annotated_images: Dict[str, str] = Field(default_factory=dict)


class StatusUpdateSchema(BaseModel):
    status: str
    note: Optional[str] = None


class ShopPolicyUpdateSchema(BaseModel):
    return_window_days: Optional[int] = None
    vision_ssim_threshold: Optional[float] = None
    requires_approval: Optional[bool] = None
    allow_exchanges: Optional[bool] = None
    allowed_reasons: Optional[List[str]] = None


class HealthResponseSchema(BaseModel):
    status: str
    app_name: str
    version: str
    diagnostics: Dict[str, Any]
