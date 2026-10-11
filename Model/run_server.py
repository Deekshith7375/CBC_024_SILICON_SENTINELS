import socket
import uvicorn
from app.config import APP_NAME, APP_VERSION

def find_free_port(default_port=8001):
    """Check if default port is free, otherwise find next available port."""
    for port in [8001, 8080, 8000, 8002, 8050]:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            res = sock.connect_ex(('127.0.0.1', port))
            if res != 0:
                return port
    return default_port

if __name__ == "__main__":
    port = find_free_port(8001)
    print("=" * 70)
    print(f"Launching {APP_NAME} v{APP_VERSION}")
    print(f"👉 WEB DASHBOARD UI AVAILABLE AT: http://localhost:{port}")
    print(f"👉 SWAGGER API DOCS AVAILABLE AT: http://localhost:{port}/docs")
    print("=" * 70)
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
