from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query
from backend.database import db

router = APIRouter(prefix="/history", tags=["Shop Owner History Data (MongoDB)"])


class HistoryRecordCreate(BaseModel):
    order_id: str
    shop_id: Optional[str] = "shop_clothes_bags"
    customer_email: Optional[str] = "customer@example.com"
    request_type: str = "Return"  # "Return" or "Exchange"
    product_name: str = "Product"
    outcome: Optional[str] = "Accepted"  # "Accepted" or "Rejected"
    resolution: Optional[str] = None
    details: Optional[str] = None
    date: Optional[str] = None
    notes: Optional[str] = None
    reason: Optional[str] = None
    vision_score: Optional[float] = None
    request_id: Optional[str] = None



@router.get("")
def list_history(shop_id: Optional[str] = Query(None)):
    """Retrieve historical return & exchange outcomes from MongoDB Atlas."""
    return db.list_history(shop_id=shop_id)


@router.get("/metrics")
def get_metrics():
    """Retrieve computed analytics (acceptance rates, breakdown) for Shop Owner dashboard."""
    return db.get_history_metrics()


@router.post("")
def add_history_entry(payload: HistoryRecordCreate):
    """Add a completed return outcome to historical audit records in MongoDB Atlas."""
    data = payload.model_dump()
    if not data.get("outcome") and data.get("resolution"):
        data["outcome"] = data["resolution"].capitalize()
    if not data.get("details"):
        data["details"] = data.get("notes") or data.get("reason") or f"{data.get('outcome', 'Processed')} by shop owner."
    created = db.add_history_record(data)
    return created

