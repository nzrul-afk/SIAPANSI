import os
import sys
from pathlib import Path

# Add repository root and apps/api to sys.path
CURRENT_DIR = Path(__file__).resolve().parent
ROOT_DIR = CURRENT_DIR.parent
API_DIR = ROOT_DIR / "apps" / "api"

for p in (str(ROOT_DIR), str(API_DIR)):
    if p not in sys.path:
        sys.path.insert(0, p)

# Ensure writable SQLite DB in serverless environment
if os.getenv("VERCEL") or not os.getenv("SIAPANSA_DB_PATH"):
    os.environ["SIAPANSA_DB_PATH"] = "/tmp/siapansa.db"

from app.main import app
