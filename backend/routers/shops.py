from fastapi import APIRouter, HTTPException
from backend.database import db
from backend.schemas.return_schemas import ShopPolicyUpdateSchema

router = APIRouter(prefix="/shops", tags=["Shops & Policies"])


@router.get("")
def list_shops():
    """List all registered shops and their return policies."""
    return db.list_shops()


@router.get("/{shop_id}")
def get_shop(shop_id: str):
    """Get single shop profile and return policy."""
    shop = db.get_shop(shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail=f"Shop '{shop_id}' not found.")
    return shop


@router.put("/{shop_id}/policy")
def update_policy(shop_id: str, updates: ShopPolicyUpdateSchema):
    """Update store return window, SSIM threshold, or approval rules."""
    update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    shop = db.update_shop_policy(shop_id, update_dict)
    if not shop:
        raise HTTPException(status_code=404, detail=f"Shop '{shop_id}' not found.")
    return shop
