from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter
from backend.database import db

router = APIRouter(prefix="/database", tags=["Database & MongoDB Atlas Diagnostics"])


class ReconnectRequest(BaseModel):
    mongodb_uri: Optional[str] = None


@router.get("/status")
def get_status():
    """
    Get real-time database connection metrics and collection document counts in MongoDB Atlas.
    """
    return db.get_database_status()


@router.post("/reconnect")
def reconnect(payload: Optional[ReconnectRequest] = None):
    """
    Attempt to connect or reconnect to MongoDB Atlas with an updated URI.
    """
    custom_uri = payload.mongodb_uri if payload else None
    success = db.connect_mongodb(custom_uri=custom_uri)
    status_info = db.get_database_status()
    return {
        "connected": success,
        "message": "Connected to MongoDB Atlas!" if success else f"Connection failed: {status_info.get('connection_error')}",
        "status": status_info
    }
