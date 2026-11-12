from __future__ import annotations
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR / "apps" / "api"))

from ml.harvest_model import generate_synthetic_harvest_df, train_and_save_harvest_models  # noqa: E402


def main() -> None:
    df = generate_synthetic_harvest_df(n_samples=3000, seed=42)
    out_csv = ROOT_DIR / "data" / "seed" / "synthetic_harvest_3000.csv"
    df.to_csv(out_csv, index=False)
    meta = train_and_save_harvest_models(ROOT_DIR / "models")
    print(f"[OK] Generated {len(df)} rows at {out_csv.name} and trained models: MAE={meta['mae_kg_ha']} kg/ha, MAPE={meta['mape_pct']}%")


if __name__ == "__main__":
    main()
