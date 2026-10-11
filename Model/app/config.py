import os
from pathlib import Path

# Base Directory Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
WEIGHTS_DIR = DATA_DIR / "weights"
CONFIGS_DIR = DATA_DIR / "dataset_configs"
STATIC_DIR = BASE_DIR / "app" / "static"

# Ensure directories exist
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
CONFIGS_DIR.mkdir(parents=True, exist_ok=True)
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# Application Metadata
APP_NAME = "Return & Exchange Automation AI System"
APP_VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")

# CLIP Model Configurations
CLIP_MODEL_NAME = os.getenv("CLIP_MODEL_NAME", "openai/clip-vit-base-patch32")
DEFAULT_SIMILARITY_THRESHOLD = float(os.getenv("DEFAULT_SIMILARITY_THRESHOLD", "75.0"))  # Percentage (0-100)

# Product Categories
CATEGORY_SHOES_CLOTHES = "shoes_clothes"
CATEGORY_ELECTRONICS_SMARTPHONES = "electronics_smartphones"

SUPPORTED_CATEGORIES = [
    CATEGORY_SHOES_CLOTHES,
    CATEGORY_ELECTRONICS_SMARTPHONES
]

# YOLO Model Weight Paths
YOLO_LEATHER_WEIGHTS = WEIGHTS_DIR / "yolo26_mvtec_leather.pt"
YOLO_SMARTPHONE_WEIGHTS = WEIGHTS_DIR / "yolo26n_smartphone_screen.pt"

# Base YOLO model for fallback/initialization
BASE_YOLO_MODEL = "yolo11n.pt"  # Ultralytics base model

# Damage Detection Confidence Threshold (Increased to 0.50 to prevent false positives on clean items)
DEFAULT_CONF_THRESHOLD = float(os.getenv("DEFAULT_CONF_THRESHOLD", "0.50"))

# Device configuration (CUDA if available else CPU)
import torch
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
