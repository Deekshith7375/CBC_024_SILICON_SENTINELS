# CBC_024_SILICON_SENTINELS
Here is the complete Project Description, Tech Stack, and Setup/Run Instructions. I have also updated your project's 

README.md
 with this documentation.

🌐 ReturnSphere — Autonomous AI Return & Exchange Management System
Next-Generation Computer Vision Platform for Automated Product Verification, Fraud Prevention, and Retail Return Decisioning

📌 1. Project Description
ReturnSphere is an autonomous return and exchange management system built for modern retail and e-commerce ecosystems. By fusing multimodal OpenAI CLIP Visual Embeddings with Fine-Tuned YOLO Defect Detection models, ReturnSphere automatically verifies customer-uploaded photos against authentic catalog standards, quantifies physical condition and structural integrity, and enforces merchant policies in real time.

Key Capabilities
Zero-Touch Return Decisions: Automatically approves pristine returns or exchanges within seconds, while flagging counterfeits, mismatched items, and customer damage.
Multimodal Visual Match: Computes precise cosine similarity scores (0.0% – 100.0%) comparing customer item photos to original store catalog reference standards using OpenAI CLIP ViT-B/32.
Dual-Category Defect Inspection:
Apparel, Shoes & Leather: Fine-tuned on MVTec AD Leather to detect cuts, abrasions, stains, glue marks, holes, and seam fraying.
Smartphones & Electronics: Fine-tuned on screen damage datasets to detect micro-cracks, screen fractures, shattered glass, and housing dents.
Real-Time Two-Way Merchant Sync: When a store owner approves or declines a claim in their console, customer tracking status, resolution badges, stepper progress, and decision notes update instantly via MongoDB Atlas.
Multi-Store & Role Architecture: Dedicated separation for specialized merchants (Apparel & Bags vs. Mobile & Accessories) with secure role-based access control.
🛠️ 2. Technology Stack
Frontend
Framework: React 18 with Vite
Styling: Tailwind CSS & Vanilla CSS (custom glassmorphic theme, responsive steppers, animated status badges)
Icons: Lucide React
State & Networking: Native React Hooks (useState, useEffect, useMemo), Fetch API with auto-polling & live sync
Backend & API
Framework: FastAPI (High-performance Python 3.10+ async REST framework)
Server: Uvicorn (ASGI web server)
Validation & Schemas: Pydantic v2
Authentication & Security: BCrypt password hashing, role-based access control (Customer vs. Shop Owner)
AI / Computer Vision & Machine Learning
Visual Semantic Matching: OpenAI CLIP (clip-vit-base-patch32) via HuggingFace transformers & torch (CUDA GPU acceleration with CPU fallback)
Defect & Fracture Detection: Ultralytics YOLO26 / YOLOv8 fine-tuned models:
yolo26_mvtec_leather.pt (Leather, textiles, bags & apparel damage)
yolo26n_smartphone_screen.pt (Smartphone screen cracks & hardware damage)
Image Processing: OpenCV (cv2) for contour fracture analysis & edge detection, Pillow (PIL) for format handling
Database & Storage
Primary Database: MongoDB Atlas (Cloud-hosted cluster returnsphere)
ODM / Driver: pymongo
Local Persistence: Resilient local JSON state cache (returnsphere_data.json) for offline development
Asset Storage: Static file uploads serving (/uploads) for customer-uploaded proof photos

💻 3. Setup & Run Instructions
Prerequisites
Python: 3.10 or higher
Node.js: v18 or higher (with npm)
Git: Installed
(Optional): NVIDIA GPU with CUDA for accelerated CLIP & YOLO inference
Step 1: Clone the Repository
bash
git clone https://github.com/your-username/ReturnSphere1.git
cd ReturnSphere1
Step 2: Set Up Backend Environment
Create and activate a Python virtual environment:

Windows (PowerShell):
powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
macOS / Linux:
bash
python3 -m venv venv
source venv/bin/activate
Install Backend Dependencies:

bash
pip install -r backend/requirements.txt
Launch the FastAPI Backend Server:

bash
python backend/run_server.py
API Base URL: http://localhost:8000
Interactive Swagger Documentation: http://localhost:8000/docs
Health & Device Diagnostics: http://localhost:8000/health
Step 3: Set Up and Run the Frontend
Open a second terminal and navigate to the frontend directory:

bash
cd frontend
Install Node Dependencies:

bash
npm install
Start the Vite Development Server:

bash
npm run dev
Open your browser and navigate to: 👉 http://localhost:5173/

🔄 4. End-to-End Walkthrough
Submit a Customer Claim:
Log in as Alex Morgan (or click Customer Demo Login).
Enter Order ID NL20791B and select Everyday Clothes & Bags.
Upload item photos (Front, Back, Detail, Tag) and click Submit Return Claim.
ReturnSphere's AI immediately extracts visual features, performs CLIP similarity scanning, and scores the item.
Shop Owner Evaluation:
Log in as store owner Elena Rostova.
Open the Requests tab to view the live submitted claim, AI visual match score, customer uploaded proof, and defect telemetry.
Click Approve (Accept) or Reject (Decline) with a custom merchant note.
Live Customer Reflection:
Switch back to the Customer dashboard.
Open the Track tab: The status updates in real time to Approved & Accepted (emerald 100% progress) or Request Declined (rose alert banner with merchant explanation).
Open the History tab: View historical audited records and open the claim summary modal.
🧪 5. Running Automated Tests
To run the automated test suite across backend and model endpoints:

bash
python -m pytest backend/tests Model/tests -v
