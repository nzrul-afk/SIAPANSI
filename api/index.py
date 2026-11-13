import os
import sys
from pathlib import Path

# Add api directory to sys.path
API_DIR = Path(__file__).resolve().parent
ROOT_DIR = API_DIR.parent

for p in (str(API_DIR), str(ROOT_DIR)):
    if p not in sys.path:
        sys.path.insert(0, p)

# Set database path to /tmp for Vercel serverless environment
if os.getenv("VERCEL") or not os.getenv("SIAPANSA_DB_PATH"):
    os.environ["SIAPANSA_DB_PATH"] = "/tmp/siapansa.db"

from app.main import app
