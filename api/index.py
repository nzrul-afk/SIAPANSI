import os
import sys
import traceback
from pathlib import Path

# Add api and root directories to sys.path
API_DIR = Path(__file__).resolve().parent
ROOT_DIR = API_DIR.parent

for p in (str(API_DIR), str(ROOT_DIR), str(API_DIR / "app"), str(API_DIR / "engine"), str(API_DIR / "ml"), str(API_DIR / "ai")):
    if p not in sys.path:
        sys.path.insert(0, p)

# Set database path to /tmp for Vercel serverless environment
if os.getenv("VERCEL") or not os.getenv("SIAPANSA_DB_PATH"):
    os.environ["SIAPANSA_DB_PATH"] = "/tmp/siapansa.db"

try:
    from app.main import app
except Exception as e:
    err_msg = str(e)
    err_tb = traceback.format_exc()
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI(title="SIAPANSA Startup Error")

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def debug_error(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "status": "STARTUP_ERROR",
                "pesan": f"Gagal memulai server backend: {err_msg}",
                "detail": err_tb,
            }
        )
