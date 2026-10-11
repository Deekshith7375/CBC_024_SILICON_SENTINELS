import io
import uuid
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def create_dummy_image_bytes(color=(120, 160, 210), width=256, height=256):
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf


def test_health_endpoints():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["diagnostics"]["models_available"] is True

    res_api = client.get("/api/health")
    assert res_api.status_code == 200


def test_database_status_endpoint():
    res = client.get("/api/database/status")
    assert res.status_code == 200
    data = res.json()
    assert "mongodb_connected" in data
    assert "storage_mode" in data
    assert "document_counts" in data
    assert data["document_counts"]["users"] >= 2
    assert data["document_counts"]["inventory"] >= 12


def test_auth_customer_register_and_login():
    test_email = f"test_cust_{uuid.uuid4().hex[:6]}@example.com"
    # 1. Register customer
    reg_res = client.post("/api/auth/register", json={
        "name": "Test Customer",
        "email": test_email,
        "password": "securepassword123",
        "role": "customer"
    })
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert reg_data["success"] is True
    assert reg_data["user"]["email"] == test_email
    assert reg_data["user"]["role"] == "customer"
    assert "password_hash" not in reg_data["user"]

    # 2. Login customer
    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "securepassword123",
        "role": "customer"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["success"] is True
    assert login_data["user"]["email"] == test_email

    # 3. Invalid password check
    bad_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "wrongpassword"
    })
    assert bad_res.status_code == 401


def test_auth_shop_owner_register_and_login():
    test_email = f"owner_{uuid.uuid4().hex[:6]}@store.com"
    # 1. Register shop owner
    reg_res = client.post("/api/auth/register", json={
        "name": "Store Manager",
        "email": test_email,
        "password": "ownerpassword456",
        "role": "shop_owner",
        "store_name": "Apex Sound Hub",
        "shop_id": "shop_apex"
    })
    assert reg_res.status_code == 200
    user = reg_res.json()["user"]
    assert user["role"] == "shop_owner"
    assert user["store_name"] == "Apex Sound Hub"

    # 2. Login shop owner
    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "ownerpassword456",
        "role": "shop_owner"
    })
    assert login_res.status_code == 200
    assert login_res.json()["user"]["role"] == "shop_owner"


def test_auth_google_sync():
    google_email = f"google_{uuid.uuid4().hex[:6]}@gmail.com"
    res = client.post("/api/auth/google", json={
        "name": "Google User",
        "email": google_email,
        "role": "customer"
    })
    assert res.status_code == 200
    assert res.json()["user"]["provider"] == "google"


def test_shop_inventory_crud():
    # 1. Get inventory
    res = client.get("/api/inventory")
    assert res.status_code == 200
    inv = res.json()
    assert len(inv) >= 12

    # 2. Add inventory item
    item_sku = f"TEST-SKU-{uuid.uuid4().hex[:4].upper()}"
    new_res = client.post("/api/inventory", json={
        "name": "Test Linen Shirt",
        "specs": "Navy Blue · Size L",
        "sku": item_sku,
        "price": "$85.00",
        "stock": 15,
        "reserved": 0,
        "status": "Active",
        "image": "/assets/linen-front.jpg",
        "category": "shoes_clothes",
        "shop_id": "shop_everyday"
    })
    assert new_res.status_code == 200
    created = new_res.json()
    item_id = created["id"]
    assert created["sku"] == item_sku

    # 3. Adjust stock (+2)
    adj_res = client.post(f"/api/inventory/{item_id}/adjust-stock", json={"delta": 2})
    assert adj_res.status_code == 200
    assert adj_res.json()["stock"] == 17

    # 4. Patch item
    patch_res = client.patch(f"/api/inventory/{item_id}", json={"price": "$89.00"})
    assert patch_res.status_code == 200
    assert patch_res.json()["price"] == "$89.00"


def test_shop_history_and_metrics():
    # 1. Get history
    res = client.get("/api/history")
    assert res.status_code == 200
    history = res.json()
    assert len(history) >= 4

    # 2. Get metrics
    metrics_res = client.get("/api/history/metrics")
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    assert "total_requests" in metrics
    assert "acceptance_rate" in metrics

    # 3. Add history record
    new_hist = client.post("/api/history", json={
        "order_id": "EV204819",
        "shop_id": "shop_everyday",
        "customer_email": "test@example.com",
        "request_type": "Exchange",
        "product_name": "Everyday Linen Shirt",
        "outcome": "Accepted",
        "details": "Size M -> L",
        "notes": "Seamless exchange processed"
    })
    assert new_hist.status_code == 200
    assert new_hist.json()["outcome"] == "Accepted"


def test_products_endpoints():
    res = client.get("/api/products")
    assert res.status_code == 200
    products = res.json()
    assert len(products) > 0
    
    first_id = products[0]["id"]
    res_one = client.get(f"/api/products/{first_id}")
    assert res_one.status_code == 200
    assert res_one.json()["id"] == first_id


def test_orders_lookup():
    res = client.get("/api/orders/EV204819")
    assert res.status_code == 200
    assert res.json()["order_id"] == "EV204819"

    res_not_found = client.get("/api/orders/NONEXIST")
    assert res_not_found.status_code == 404


def test_shops_and_policy_update():
    res = client.get("/api/shops")
    assert res.status_code == 200
    shops = res.json()
    assert len(shops) > 0

    first_shop_id = shops[0]["id"]
    res_update = client.put(
        f"/api/shops/{first_shop_id}/policy",
        json={"vision_ssim_threshold": 78.5}
    )
    assert res_update.status_code == 200
    assert res_update.json()["policy"]["vision_ssim_threshold"] == 78.5


def test_ai_similarity_only():
    img1 = create_dummy_image_bytes(color=(210, 80, 80))
    img2 = create_dummy_image_bytes(color=(210, 80, 80))

    files = {
        "image1": ("img1.jpg", img1, "image/jpeg"),
        "image2": ("img2.jpg", img2, "image/jpeg")
    }
    data = {"threshold": "75.0"}

    res = client.post("/api/v1/similarity-only", files=files, data=data)
    assert res.status_code == 200
    result = res.json()
    assert result["similarity_score"] >= 80.0
    assert result["is_match"] is True
    assert result["verdict"] == "MATCH"


def test_ai_verify_with_product_reference():
    cust_img = create_dummy_image_bytes(color=(100, 100, 100))
    files = {
        "returned_image": ("cust.jpg", cust_img, "image/jpeg")
    }
    data = {
        "product_id": "prod_linen_shirt",
        "category": "shoes_clothes",
        "similarity_threshold": "60.0"
    }

    res = client.post("/api/verify", files=files, data=data)
    assert res.status_code == 200
    result = res.json()
    assert "similarity_score" in result
    assert "return_status" in result
    assert "summary_message" in result


def test_create_and_manage_return():
    cust_img = create_dummy_image_bytes(color=(150, 120, 90))
    files = {
        "primary_image": ("cust_return.jpg", cust_img, "image/jpeg")
    }
    data = {
        "order_id": "EV204819",
        "request_type": "return",
        "reason": "Defective/Damaged",
        "notes": "Testing return integration"
    }

    res = client.post("/api/returns", files=files, data=data)
    assert res.status_code == 200
    created = res.json()
    assert "id" in created
    assert created["order_id"] == "EV204819"
    assert "similarity_score" in created
    assert "status" in created

    return_id = created["id"]

    res_patch = client.patch(
        f"/api/returns/{return_id}/status",
        json={"status": "approved", "note": "Verified by manager"}
    )
    assert res_patch.status_code == 200
    assert res_patch.json()["status"] == "approved"
