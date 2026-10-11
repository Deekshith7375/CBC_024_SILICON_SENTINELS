import os
import shutil
from pathlib import Path
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CONFIG_PATH = DATA_DIR / "dataset_configs" / "mvtec_leather.yaml"
OUTPUT_WEIGHTS = DATA_DIR / "weights" / "yolo26_mvtec_leather.pt"

def train_mvtec_leather(epochs: int = 10, imgsz: int = 640, batch: int = 16):
    """
    Fine-tune YOLO26 model on MVTec AD Leather category for shoes and clothes damage detection.
    """
    print("=" * 70)
    print(f"Fine-tuning YOLO model on MVTec AD Leather Category ({epochs} Epochs, Batch {batch})")
    print("=" * 70)

    # Ensure dataset exists
    if not CONFIG_PATH.exists():
        print("Dataset config not found. Running expanded dataset generation...")
        from scripts.prepare_synthetic_datasets import main as prepare_main
        prepare_main()

    # Initialize base YOLO model
    model = YOLO("yolo11n.pt")

    # Fine-tune model on GPU / CPU
    results = model.train(
        data=str(CONFIG_PATH),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        project=str(BASE_DIR / "runs" / "mvtec_leather"),
        name="yolo26_leather_run",
        exist_ok=True,
        verbose=True
    )

    # Save trained model weights
    best_weights = Path(model.trainer.save_dir) / "weights" / "best.pt"
    if best_weights.exists():
        OUTPUT_WEIGHTS.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(best_weights, OUTPUT_WEIGHTS)
        print(f"[SUCCESS] Saved fine-tuned Leather YOLO model weights to: {OUTPUT_WEIGHTS}")
    else:
        model.save(str(OUTPUT_WEIGHTS))
        print(f"[SUCCESS] Exported fine-tuned model to: {OUTPUT_WEIGHTS}")

if __name__ == "__main__":
    train_mvtec_leather(epochs=10, batch=16)
