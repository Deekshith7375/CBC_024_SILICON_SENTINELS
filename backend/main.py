from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from backend.config import (
    APP_NAME,
    APP_VERSION,
    UPLOADS_DIR,
    FRONTEND_ASSETS_DIR,
    MONGODB_URI,
    MONGODB_DB_NAME
)
from backend.models.ai_integration import (
    get_clip_matcher,
    get_yolo_detector,
    get_model_diagnostics
)
from backend.database import db
from backend.routers import (
    verification,
    returns,
    products,
    orders,
    shops,
    health,
    auth,
    inventory,
    history,
    database_status
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 70)
    print(f"[*] Initializing {APP_NAME} v{APP_VERSION}...")
    print("[*] Warming up CLIP similarity and YOLO damage detection models...")
    try:
        get_clip_matcher()
        get_yolo_detector()
        print("[OK] AI Models successfully loaded and ready for return inspections!")
    except Exception as e:
        print(f"[!] Error during model warm-up: {e}")

    # Database status
    db_status = db.get_database_status()
    if db_status["mongodb_connected"]:
        print(f"[OK] Database Connected: MongoDB Atlas (DB: '{MONGODB_DB_NAME}')")
    else:
        print(f"[*] Database Mode: {db_status['storage_mode']}")
        if MONGODB_URI:
            print(f"    (Notice: {db_status.get('connection_error')})")
        else:
            print("    (To connect MongoDB Atlas, set MONGODB_URI in .env)")
    print("=" * 70)
    yield


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Autonomous Return & Exchange Management Backend with MongoDB Atlas, CLIP Image Comparison & YOLO Defect Inspection.",
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

# Static files mounts
if UPLOADS_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

if FRONTEND_ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_ASSETS_DIR)), name="assets")

# Mount API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(verification.router, prefix="/api")
app.include_router(returns.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(shops.router, prefix="/api")
app.include_router(database_status.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(health.router)  # Also expose /health at root


@app.get("/")
def root():
    db_status = db.get_database_status()
    return JSONResponse({
        "name": APP_NAME,
        "version": APP_VERSION,
        "status": "running",
        "database": db_status["storage_mode"],
        "mongodb_connected": db_status["mongodb_connected"],
        "docs_url": "/docs",
        "endpoints": {
            "auth_register": "POST /api/auth/register",
            "auth_login": "POST /api/auth/login",
            "auth_google": "POST /api/auth/google",
            "customer_returns": "GET/POST /api/returns",
            "shop_inventory": "GET/POST/PATCH/DELETE /api/inventory",
            "shop_history": "GET/POST /api/history",
            "verify_single": "POST /api/verify",
            "verify_multi_angle": "POST /api/verify-angles",
            "database_status": "GET /api/database/status",
            "health": "GET /health"
        }
    })
