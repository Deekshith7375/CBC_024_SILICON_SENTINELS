from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query
from backend.database import db

router = APIRouter(prefix="/inventory", tags=["Shop Owner Inventory (MongoDB)"])


class InventoryItemCreate(BaseModel):
    name: str
    specs: str
    sku: str
    price: str
    stock: int = 10
    reserved: int = 0
    status: str = "Active"
    image: str = "/assets/linen-front.jpg"
    category: str = "shoes_clothes"
    shop_id: str = "shop_everyday"


class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    specs: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[str] = None
    stock: Optional[int] = None
    reserved: Optional[int] = None
    status: Optional[str] = None
    image: Optional[str] = None


class AdjustStockRequest(BaseModel):
    delta: int  # e.g. +1 or -1


@router.get("")
def get_inventory(shop_id: Optional[str] = Query(None)):
    """Retrieve full inventory list for shop owner from MongoDB Atlas."""
    return db.list_inventory(shop_id=shop_id)


@router.get("/{item_id}")
def get_inventory_item(item_id: str):
    """Retrieve a single inventory product by ID."""
    item = db.get_inventory_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Inventory item '{item_id}' not found.")
    return item


@router.post("")
def add_inventory_item(payload: InventoryItemCreate):
    """Add a new product to shop owner inventory in MongoDB Atlas."""
    created = db.add_inventory_item(payload.model_dump())
    return created


@router.patch("/{item_id}")
def update_inventory_item(item_id: str, payload: InventoryItemUpdate):
    """Update stock, pricing, or status for an inventory item in MongoDB Atlas."""
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = db.update_inventory_item(item_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Inventory item '{item_id}' not found.")
    return updated


@router.post("/{item_id}/adjust-stock")
def adjust_stock(item_id: str, payload: AdjustStockRequest):
    """Increment or decrement product stock count (+1 / -1) in MongoDB Atlas."""
    updated = db.adjust_inventory_stock(item_id, payload.delta)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Inventory item '{item_id}' not found.")
    return updated


@router.delete("/{item_id}")
def delete_inventory_item(item_id: str):
    """Delete an item from inventory in MongoDB Atlas."""
    success = db.delete_inventory_item(item_id)
    return {"success": success, "message": f"Inventory item '{item_id}' deleted."}
