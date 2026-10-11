import sys
from pathlib import Path

# Add project root to sys.path so 'backend' can be resolved
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import uvicorn
from backend.config import APP_NAME, APP_VERSION, HOST, PORT

if __name__ == "__main__":
    print("=" * 70)
    print(f"Starting {APP_NAME} v{APP_VERSION}")
    print(f"-> API Server Running at: http://localhost:{PORT}")
    print(f"-> Interactive API Docs at: http://localhost:{PORT}/docs")
    print("=" * 70)
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=False)
