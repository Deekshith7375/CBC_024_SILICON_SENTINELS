# Return & Exchange Automation System 🔄

An AI-powered automated **Return & Exchange Verification System** built with **FastAPI**, **CLIP (Image Embeddings + Cosine Similarity)**, and **Fine-Tuned YOLO Models** (MVTec AD Leather & Smartphone Screen Damage).

---

## 🌟 Key Features

1. **Product Verification (CLIP Embeddings + Cosine Similarity)**
   - Extracts 512-dimensional visual feature vectors using OpenAI CLIP.
   - Calculates **Cosine Similarity** scaled to a **0.0% – 100.0%** visual match score between the catalog reference photo and customer upload.
   - Validates if the returned item matches the original product image.

2. **Damage & Defect Detection (Category-Specific Fine-Tuned YOLO)**
   - **Shoes & Clothes**: Uses YOLO fine-tuned on the **MVTec AD Leather** dataset (detecting cuts, scratches, color stains, glue marks, holes, and folds).
   - **Electronics & Smartphones**: Uses **YOLO26n** fine-tuned on the **Smartphone Screen Damage Dataset** (detecting screen cracks, shattered glass, screen scratches, discoloration bleed, and dents).

3. **Automated Return Decision Engine**
   - Returns structured decision statuses:
     - `APPROVED`: Product matches original image & no damage defects found.
     - `REJECTED_MISMATCH`: Product image does not match original catalog item (< similarity threshold).
     - `REJECTED_DAMAGED`: Product image matches original item, but physical damage/defects are detected.
     - `REJECTED_MISMATCH_AND_DAMAGED`: Item does not match original item AND contains physical damage.

4. **Interactive Web Dashboard & REST API**
   - Built-in Web UI with drag-and-drop file upload, side-by-side visual image inspection with drawn bounding boxes, similarity score gauges, and defect details table.
   - OpenAPI Swagger documentation at `/docs`.

---

## 📁 Project Architecture

```
c:\CBC2.0\Model\
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI app routes & lifespan configuration
│   ├── config.py                 # Central app settings & default thresholds
│   ├── models/
│   │   ├── clip_matcher.py       # CLIP Embeddings + Cosine Similarity (0-100%)
│   │   ├── yolo_detector.py      # Damage detection model manager using YOLO
│   ├── schemas/
│   │   ├── request_response.py   # Pydantic schemas for verification API
│   ├── utils/
│   │   ├── image_utils.py        # Base64, PIL conversion, bounding box drawing
│   ├── static/
│   │   ├── index.html            # Web Dashboard UI
│   │   ├── style.css             # UI styling
│   │   ├── app.js                # Frontend JS logic & sample loader
├── scripts/
│   ├── prepare_synthetic_datasets.py # Dataset setup utility for MVTec & Screen datasets
│   ├── train_mvtec_leather.py        # Fine-tune YOLO on MVTec AD Leather category
│   ├── train_smartphone_screen.py    # Fine-tune YOLO26n on Smartphone Screen Damage
├── data/
│   ├── weights/
│   │   ├── yolo26_mvtec_leather.pt    # Fine-tuned leather damage weights
│   │   ├── yolo26n_smartphone_screen.pt # Fine-tuned screen damage weights
│   ├── dataset_configs/
│   │   ├── mvtec_leather.yaml
│   │   ├── smartphone_screen.yaml
│   ├── generate_sample_images.py     # Sample image generator
├── tests/
│   ├── test_api.py               # Automated pytest suite
├── requirements.txt
├── run_server.py                 # Server startup script
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Generate Sample Test Data (Optional)

```bash
python data/generate_sample_images.py
```

### 3. Fine-Tune Damage Detection YOLO Models

To prepare datasets and train/fine-tune the category models:

```bash
# 1. Prepare datasets & YAML configs
python scripts/prepare_synthetic_datasets.py

# 2. Fine-tune YOLO model on MVTec AD Leather (Shoes & Clothes)
python scripts/train_mvtec_leather.py

# 3. Fine-tune YOLO26n model on Smartphone Screen Damage (Electronics & Smartphones)
python scripts/train_smartphone_screen.py
```

*Note: Fine-tuned model checkpoints will be automatically saved to `data/weights/yolo26_mvtec_leather.pt` and `data/weights/yolo26n_smartphone_screen.pt`.*

### 4. Start the FastAPI Application Server

```bash
python run_server.py
```
Or using Uvicorn directly:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Access Web Dashboard & API Docs

- **Interactive Web Dashboard**: [http://localhost:8000/](http://localhost:8000/)
- **Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📡 API Endpoint Reference

### `POST /api/v1/verify-return`

Performs end-to-end product similarity check and damage detection.

#### Multipart Form Parameters:
- `reference_image`: (File) Original product catalog photo.
- `returned_image`: (File) Customer uploaded photo of returned item.
- `category`: (String) `shoes_clothes` or `electronics_smartphones`.
- `similarity_threshold`: (Float, Optional) Similarity threshold percentage (default `75.0%`).
- `conf_threshold`: (Float, Optional) YOLO confidence threshold (default `0.25`).

#### Example Response:

```json
{
  "transaction_id": "RET-8A3F1B2C",
  "product_category": "shoes_clothes",
  "similarity_score": 92.45,
  "is_product_match": true,
  "damage_detected": true,
  "damage_count": 1,
  "damages": [
    {
      "class_name": "cut",
      "confidence": 0.88,
      "bbox": [260.0, 300.0, 320.0, 340.0],
      "severity": "HIGH"
    }
  ],
  "return_status": "REJECTED_DAMAGED",
  "summary_message": "Return REJECTED: Item matches original product catalog (92.45%), but physical damage/defects were detected (1 defect(s) found).",
  "annotated_image_b64": "data:image/jpeg;base64,..."
}
```

---

## 🧪 Running Automated Tests

Run the test suite:

```bash
python -m pytest tests/test_api.py -v
```
