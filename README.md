# 🌐 ReturnSphere — Autonomous AI Return & Exchange Management System

> **Next-Generation Computer Vision Platform for Automated Product Verification, Fraud Prevention, and Retail Return Decisioning**

---

## 📌 1. Project Description

**ReturnSphere** is an enterprise-grade autonomous return and exchange management system built for modern retail and e-commerce ecosystems. By fusing multimodal **OpenAI CLIP Visual Embeddings** with **Fine-Tuned YOLO Defect Detection** models, ReturnSphere automatically verifies customer-uploaded photos against authentic catalog standards, quantifies physical condition and structural integrity, and enforces merchant policies in real time.

### Why ReturnSphere?
* **Zero-Touch Return Decisions**: Automatically approves pristine returns or exchanges within seconds, while flagging counterfeits, mismatched items, and customer damage.
* **Multimodal Visual Match**: Computes precise cosine similarity scores (0.0% – 100.0%) comparing customer item photos to original store catalog reference standards.
* **Dual-Category Defect Inspection**:
  * **Apparel, Shoes & Leather**: Fine-tuned on MVTec AD Leather to detect cuts, abrasions, stains, glue marks, holes, and seam fraying.
  * **Smartphones & Electronics**: Fine-tuned on screen damage datasets to detect micro-cracks, screen fractures, shattered glass, and housing dents.
* **Real-Time Two-Way Merchant Sync**: When a store owner approves or declines a claim in their console, customer tracking status, resolution badges, stepper progress, and decision notes update instantly via MongoDB Atlas.
* **Multi-Store & Role Architecture**: Dedicated separation for specialized merchants (Apparel & Bags vs. Mobile & Accessories) with secure role-based access control.

---

## 🛠️ 2. Technology Stack

### **Frontend**
* **Framework**: React 18 with Vite (Ultra-fast HMR and bundle optimization)
* **Styling**: Tailwind CSS & Vanilla CSS (Custom dark/light glassmorphic UI, animated status pills, responsive steppers)
* **Icons**: Lucide React
* **State & Networking**: Native React Hooks (`useState`, `useEffect`, `useMemo`), Fetch API with auto-polling & live sync

### **Backend & API**
* **Framework**: FastAPI (High-performance Python 3.10+ async REST framework)
* **Server**: Uvicorn (ASGI web server)
* **Validation & Schemas**: Pydantic v2
* **Authentication & Security**: BCrypt password hashing, role-based access control (Customer vs. Shop Owner)

### **AI / Computer Vision & Machine Learning**
* **Visual Semantic Matching**: OpenAI CLIP (`clip-vit-base-patch32`) via HuggingFace `transformers` & `torch` (CUDA GPU acceleration with CPU fallback)
* **Defect & Fracture Detection**: Ultralytics YOLO26 / YOLOv8 fine-tuned models:
  * `yolo26_mvtec_leather.pt` (Leather, textiles, bags & apparel damage)
  * `yolo26n_smartphone_screen.pt` (Smartphone screen cracks & hardware damage)
* **Image Processing**: OpenCV (`cv2`) for contour fracture analysis & edge detection, Pillow (`PIL`) for format handling

### **Database & Storage**
* **Primary Database**: **MongoDB Atlas** (Cloud-hosted cluster `returnsphere`)
* **ODM / Driver**: `pymongo`
* **Local Persistence**: Resilient local JSON state cache (`returnsphere_data.json`) for offline development
* **Asset Storage**: Static file uploads serving (`/uploads`) for customer-uploaded proof photos

---

## 👥 3. Pre-Configured Store & User Credentials

The system includes pre-seeded production accounts and authentic inventory:

| Role | Store / Context | Name | Email | Password |
|---|---|---|---|---|
| **Shop Owner** | Everyday Clothes & Bags | Elena Rostova | `elena.rostova@clothesbags.com` | `Deekshith2005` |
| **Shop Owner** | Apex Mobile & Accessories | Marcus Vance | `marcus.vance@apexmobile.com` | `Deekshith2005` |
| **Customer** | Bag Return for Refund (Order `NL20791B`) | Alex Morgan | `alex.morgan@gmail.com` | `Deekshith2005` |
| **Customer** | Phone Exchange Request (Order `AP8921PH`) | Jamie Lee | `jamie.lee@gmail.com` | `Deekshith2005` |

> *Tip: The frontend login modal also features 1-Click Demo Login buttons for all profiles.*

---

## 💻 4. Setup & Run Instructions

### Prerequisites
* **Python**: 3.10 or higher
* **Node.js**: v18 or higher (with `npm`)
* **Git**: Installed
* *(Optional)*: NVIDIA GPU with CUDA for accelerated CLIP & YOLO inference

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/ReturnSphere1.git
cd ReturnSphere1
```

---

### Step 2: Set Up Backend Environment

1. **Create and activate a Python virtual environment**:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

2. **Install Backend Dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. *(Optional)* **Configure MongoDB Atlas URI**:
   By default, ReturnSphere connects to the pre-configured Atlas cluster. To provide your own cluster, set the environment variable:
   ```bash
   # Windows PowerShell
   $env:MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority"
   
   # Linux / macOS
   export MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority"
   ```

4. **Launch the FastAPI Backend Server**:
   ```bash
   python backend/run_server.py
   ```
   * The API server starts at: `http://localhost:8000`
   * Interactive Swagger Documentation: `http://localhost:8000/docs`
   * Health & Device Diagnostics: `http://localhost:8000/health`

---

### Step 3: Set Up and Run the Frontend

1. Open a **second terminal** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. **Install Node Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite Development Server**:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   👉 **`http://localhost:5173/`**

---

## 🔄 5. End-to-End Walkthrough

1. **Submit a Customer Claim**:
   * Log in as **Alex Morgan** (or click *Customer Demo Login*).
   * Enter Order ID `NL20791B` and select `Everyday Clothes & Bags`.
   * Upload item photos (Front, Back, Detail, Tag) and click **Submit Return Claim**.
   * ReturnSphere's AI immediately extracts visual features, performs CLIP similarity scanning, and scores the item.
2. **Shop Owner Evaluation**:
   * Log out and log in as store owner **Elena Rostova**.
   * Open the **Requests** tab to view the live submitted claim, AI visual match score, customer uploaded proof, and defect telemetry.
   * Click **Approve (Accept)** or **Reject (Decline)** with a custom merchant note.
3. **Live Customer Reflection**:
   * Switch back to the Customer portal.
   * Open the **Track** tab: The status updates in real time to **Approved & Accepted** (emerald 100% progress) or **Request Declined** (rose alert banner with merchant explanation).
   * Open the **History** tab: View historical audited records and open the claim summary modal.

---

## 📡 6. Core REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate customer or merchant via BCrypt |
| `POST` | `/api/auth/register` | Register new user or merchant in MongoDB Atlas |
| `GET` | `/api/database/status` | Real-time database metrics & collection document counts |
| `POST` | `/api/returns` | Submit return/exchange claim with automatic AI inspection |
| `GET` | `/api/returns` | List return claims (filterable by `customer_email`, `shop_id`, `order_id`) |
| `PATCH`| `/api/returns/{id}/status` | Update claim status (`approved` / `rejected`) with merchant note |
| `POST` | `/api/history` | Append audited resolution record to MongoDB Atlas |
| `GET` | `/api/history` | Retrieve historical claims and analytics |
| `GET` | `/api/inventory` | Retrieve store catalog & live stock levels |
| `POST` | `/api/verify` | Standalone CLIP similarity & YOLO defect detection inspection |
| `GET` | `/api/health` | PyTorch device status (CUDA/CPU) and model readiness |

---

## 🧪 7. Running Automated Tests

To run the automated test suite across backend and model endpoints:
```bash
python -m pytest backend/tests Model/tests -v
```
