from fastapi import APIRouter
from backend.models.ai_integration import get_model_diagnostics
from backend.schemas.return_schemas import HealthResponseSchema
from backend.config import APP_NAME, APP_VERSION

router = APIRouter(tags=["Health & Status"])


@router.get("/health", response_model=HealthResponseSchema)
def health_check():
    """System health check and loaded AI model status."""
    diagnostics = get_model_diagnostics()
    return HealthResponseSchema(
        status="healthy",
        app_name=APP_NAME,
        version=APP_VERSION,
        diagnostics=diagnostics
    )
