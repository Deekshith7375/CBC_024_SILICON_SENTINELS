from fastapi import APIRouter, HTTPException
from backend.database import db

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("")
def list_orders():
    """List sample orders."""
    return db.list_orders()


@router.get("/{order_id}")
def get_order(order_id: str):
    """Lookup order by 8-character ID."""
    clean_id = order_id.strip().upper()
    order = db.get_order(clean_id)
    if not order:
        raise HTTPException(
            status_code=404,
            detail=f"Order '{clean_id}' not found. Please verify your 8-character Order ID."
        )
    return order
