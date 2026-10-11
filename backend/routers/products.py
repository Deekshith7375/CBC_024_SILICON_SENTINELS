from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.database import db

router = APIRouter(prefix="/products", tags=["Products & Catalog"])


@router.get("")
def list_products(shop_id: Optional[str] = Query(None)):
    """List all catalog products, optionally filtered by shop."""
    return db.list_products(shop_id=shop_id)


@router.get("/{product_id}")
def get_product(product_id: str):
    """Get single product details by ID."""
    prod = db.get_product(product_id)
    if not prod:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    return prod
