from __future__ import annotations
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR / "apps" / "api"))

from app.store import store  # noqa: E402


def main() -> None:
    res = store.reset_to_seed()
    ov = store.compute_full_stock_and_status()
    print(
        f"[OK] Seed loaded ({res['jam_virtual']}): "
        f"Pokok={ov['pool_pokok']['hari_bertahan']}d, "
        f"Protein={ov['pool_protein']['hari_bertahan']}d, "
        f"Terlemah={ov['titik_terlemah']['nama']} ({ov['titik_terlemah']['hari_bertahan']}d), "
        f"Skor={ov['skor_ketahanan']['skor_total']}"
    )


if __name__ == "__main__":
    main()
