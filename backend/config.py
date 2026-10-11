import os
from pathlib import Path
from dotenv import load_dotenv

# Paths
BACKEND_DIR = Path(__file__).resolve().parent
ROOT_DIR = BACKEND_DIR.parent
MODEL_DIR = ROOT_DIR / "Model"
FRONTEND_ASSETS_DIR = ROOT_DIR / "frontend" / "public" / "assets"
UPLOADS_DIR = BACKEND_DIR / "uploads"
DATA_FILE = BACKEND_DIR / "data_store.json"

# Load .env file (check root first, then backend)
if (ROOT_DIR / ".env").exists():
    load_dotenv(ROOT_DIR / ".env")
elif (BACKEND_DIR / ".env").exists():
    load_dotenv(BACKEND_DIR / ".env")

# Ensure directories exist
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# App Configuration
APP_NAME = "ReturnSphere Backend API"
APP_VERSION = "1.0.0"
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# MongoDB Atlas Configuration
# Example: mongodb+srv://<username>:<password>@cluster0.mongodb.net/returnsphere?retryWrites=true&w=majority
MONGODB_URI = os.getenv("MONGODB_URI", "")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "returnsphere")
MONGODB_TIMEOUT_MS = int(os.getenv("MONGODB_TIMEOUT_MS", "4000"))

# Model Configuration
DEFAULT_SIMILARITY_THRESHOLD = float(os.getenv("DEFAULT_SIMILARITY_THRESHOLD", "75.0"))
DEFAULT_CONF_THRESHOLD = float(os.getenv("DEFAULT_CONF_THRESHOLD", "0.50"))

# Default Categories
CATEGORY_SHOES_CLOTHES = "shoes_clothes"
CATEGORY_ELECTRONICS_SMARTPHONES = "electronics_smartphones"
SUPPORTED_CATEGORIES = [CATEGORY_SHOES_CLOTHES, CATEGORY_ELECTRONICS_SMARTPHONES]
