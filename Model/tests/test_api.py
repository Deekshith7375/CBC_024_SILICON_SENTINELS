import pytest
import io
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from app.main import app
from app.config import CATEGORY_SHOES_CLOTHES, CATEGORY_ELECTRONICS_SMARTPHONES

client = TestClient(app)

def create_dummy_image_bytes(color=(100, 150, 200), width=300, height=300):
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "shoes_clothes" in data["yolo_models_loaded"]
    assert "electronics_smartphones" in data["yolo_models_loaded"]

def test_similarity_only_endpoint():
    img1 = create_dummy_image_bytes(color=(200, 50, 50))
    img2 = create_dummy_image_bytes(color=(200, 50, 50))  # Identical color image

    files = {
        "image1": ("img1.jpg", img1, "image/jpeg"),
        "image2": ("img2.jpg", img2, "image/jpeg")
    }
    data = {"threshold": "75.0"}
    
    response = client.post("/api/v1/similarity-only", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()
    assert "similarity_score" in res_data
    assert res_data["similarity_score"] >= 75.0
    assert res_data["is_match"] is True

def test_verify_return_shoes_clothes():
    ref_img = create_dummy_image_bytes(color=(139, 69, 19))
    ret_img = create_dummy_image_bytes(color=(139, 69, 19))

    files = {
        "reference_image": ("ref.jpg", ref_img, "image/jpeg"),
        "returned_image": ("ret.jpg", ret_img, "image/jpeg")
    }
    data = {
        "category": CATEGORY_SHOES_CLOTHES,
        "similarity_threshold": "70.0"
    }

    response = client.post("/api/v1/verify-return", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["product_category"] == CATEGORY_SHOES_CLOTHES
    assert "similarity_score" in res
    assert res["is_product_match"] is True
    assert "return_status" in res

def test_verify_return_smartphones():
    ref_img = create_dummy_image_bytes(color=(20, 20, 20))
    ret_img = create_dummy_image_bytes(color=(20, 20, 20))

    files = {
        "reference_image": ("ref_phone.jpg", ref_img, "image/jpeg"),
        "returned_image": ("ret_phone.jpg", ret_img, "image/jpeg")
    }
    data = {
        "category": CATEGORY_ELECTRONICS_SMARTPHONES,
        "similarity_threshold": "70.0"
    }

    response = client.post("/api/v1/verify-return", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["product_category"] == CATEGORY_ELECTRONICS_SMARTPHONES
    assert res["is_product_match"] is True

if __name__ == "__main__":
    pytest.main(["-v", __file__])
