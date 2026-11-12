from __future__ import annotations
import csv
import json
import sqlite3
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from engine.alerts import evaluate_alerts
from engine.core import (
    BatchInput,
    CommodityInput,
    HarvestScheduleInput,
    ThresholdConfig,
    classify_status,
    compute_daily_demand,
    compute_effective_stock,
    compute_expiring_soon_stock,
    compute_pools_and_weakest,
    compute_resilience_score,
    simulate_fefo_doc,
)
from engine.distribution_opt import optimize_village_distribution
from engine.menu_optimizer import FoodItemSpec, optimize_menu_plan
from engine.scenario import run_shock_scenario
from ml.harvest_model import predict_harvest_yield
from ml.price_forecasting import forecast_price_4_weeks, generate_104w_price_series
from ai.validator import sanitize_untrusted_note

ROOT_DIR = Path(__file__).resolve().parents[3]
SEED_DIR = ROOT_DIR / "data" / "seed"
DB_PATH = ROOT_DIR / "apps" / "api" / "siapansa.db"


class DataProvider:
    """11.3 Adapter interface for data access (SeedProvider implemented, RealProvider stub)."""

    def get_village(self) -> Dict[str, Any]:
        raise NotImplementedError


class RealProvider(DataProvider):
    """11.3 Stub for future integration with real government/BMKG/panel-harga APIs."""

    def get_village(self) -> Dict[str, Any]:
        raise NotImplementedError("RealProvider belum diimplementasikan pada prototipe.")


class SeedStore(DataProvider):
    """SQLite-backed state store initialized from deterministic seed files in data/seed/."""

    def __init__(self, db_path: Optional[Path] = None) -> None:
        self.db_path = db_path or DB_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_schema()
        if not self._is_seeded():
            self.reset_to_seed()

    def _conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_schema(self) -> None:
        with self._conn() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS kv_state (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS commodities (
                    id TEXT PRIMARY KEY,
                    kode TEXT NOT NULL,
                    nama TEXT NOT NULL,
                    satuan TEXT NOT NULL,
                    kelompok TEXT NOT NULL,
                    norma_per_kapita_hari REAL NOT NULL,
                    stok_awal REAL NOT NULL,
                    eksposur_impor REAL NOT NULL,
                    ketergantungan_pupuk REAL NOT NULL,
                    porsi_pasokan_rutin REAL NOT NULL,
                    umur_simpan_hari INTEGER NOT NULL,
                    harga_acuan REAL NOT NULL,
                    kkal_per_unit REAL NOT NULL,
                    protein_g_per_unit REAL NOT NULL
                );
                CREATE TABLE IF NOT EXISTS stock_transactions (
                    id TEXT PRIMARY KEY,
                    village_id TEXT NOT NULL,
                    commodity_id TEXT NOT NULL,
                    warehouse_id TEXT NOT NULL,
                    jenis TEXT NOT NULL,
                    jumlah REAL NOT NULL,
                    tanggal TEXT NOT NULL,
                    expiry_date TEXT,
                    catatan TEXT,
                    reverses_id TEXT,
                    client_created_at TEXT NOT NULL,
                    synced_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS stock_batches (
                    id TEXT PRIMARY KEY,
                    commodity_id TEXT NOT NULL,
                    warehouse_id TEXT NOT NULL,
                    jumlah_awal REAL NOT NULL,
                    jumlah_sisa REAL NOT NULL,
                    tanggal_masuk TEXT NOT NULL,
                    expiry_date TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS harvest_plans (
                    id TEXT PRIMARY KEY,
                    village_id TEXT NOT NULL,
                    commodity_id TEXT NOT NULL,
                    komoditas_tanam TEXT NOT NULL,
                    luas_ha REAL NOT NULL,
                    tanggal_tanam TEXT NOT NULL,
                    varietas TEXT NOT NULL,
                    kondisi_pupuk TEXT NOT NULL,
                    sumber_air TEXT NOT NULL,
                    aktif_di_proyeksi INTEGER NOT NULL DEFAULT 0,
                    prediksi_json TEXT
                );
                CREATE TABLE IF NOT EXISTS alert_states (
                    alert_key TEXT PRIMARY KEY,
                    status TEXT NOT NULL,
                    snoozed_until TEXT,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS scenarios (
                    id TEXT PRIMARY KEY,
                    nama TEXT NOT NULL,
                    parameter_json TEXT NOT NULL,
                    hasil_json TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS menus (
                    id TEXT PRIMARY KEY,
                    sasaran TEXT NOT NULL,
                    jumlah_penerima INTEGER NOT NULL,
                    durasi INTEGER NOT NULL,
                    prioritas TEXT NOT NULL,
                    rencana_json TEXT NOT NULL,
                    biaya_total REAL NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS transfers (
                    id TEXT PRIMARY KEY,
                    dari_village_id TEXT NOT NULL,
                    dari_village_nama TEXT NOT NULL,
                    ke_village_id TEXT NOT NULL,
                    ke_village_nama TEXT NOT NULL,
                    commodity_id TEXT NOT NULL,
                    commodity_nama TEXT NOT NULL,
                    satuan TEXT NOT NULL,
                    jumlah REAL NOT NULL,
                    jarak_km REAL NOT NULL,
                    biaya_angkut REAL NOT NULL,
                    status TEXT NOT NULL,
                    draf_pesan TEXT NOT NULL,
                    arah TEXT NOT NULL,
                    status_log_json TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS report_shares (
                    token TEXT PRIMARY KEY,
                    periode INTEGER NOT NULL,
                    snapshot_json TEXT NOT NULL,
                    expires_at TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                """
            )

    def _is_seeded(self) -> bool:
        with self._conn() as conn:
            row = conn.execute("SELECT COUNT(*) AS cnt FROM commodities").fetchone()
            return bool(row and row["cnt"] > 0)

    def _set_kv(self, conn: sqlite3.Connection, key: str, val: Any) -> None:
        conn.execute(
            "INSERT OR REPLACE INTO kv_state (key, value, updated_at) VALUES (?, ?, ?)",
            (key, json.dumps(val, ensure_ascii=False), datetime.utcnow().isoformat()),
        )

    def _get_kv(self, key: str, default: Any = None) -> Any:
        with self._conn() as conn:
            row = conn.execute("SELECT value FROM kv_state WHERE key = ?", (key,)).fetchone()
            if not row:
                return default
            return json.loads(row["value"])

    def reset_to_seed(self) -> Dict[str, Any]:
        """14.0 Reset entire database back to initial seed state in < 100ms."""
        with open(SEED_DIR / "village.json", "r", encoding="utf-8") as f:
            v_seed = json.load(f)
        with open(SEED_DIR / "commodities.json", "r", encoding="utf-8") as f:
            c_seed = json.load(f)
        with open(SEED_DIR / "cluster_and_events.json", "r", encoding="utf-8") as f:
            ce_seed = json.load(f)

        foods: List[Dict[str, Any]] = []
        with open(SEED_DIR / "food_composition.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for r in reader:
                foods.append({
                    "id": r["id"],
                    "nama": r["nama"],
                    "kategori": r["kategori"],
                    "energi_kkal_100g": float(r["energi_kkal_100g"]),
                    "protein_g_100g": float(r["protein_g_100g"]),
                    "serat_g_100g": float(r["serat_g_100g"]),
                    "harga_per_kg": float(r["harga_per_kg"]),
                    "eksposur_impor": float(r["eksposur_impor"]),
                    "commodity_id": r["commodity_id"] if r["commodity_id"] else None,
                    "min_g": float(r["min_g"]),
                    "max_g": float(r["max_g"]),
                    "sumber": r["sumber"],
                })

        base_date = date(2026, 11, 12)
        now_iso = "2026-11-12T08:00:00"

        with self._conn() as conn:
            for tbl in (
                "kv_state",
                "commodities",
                "stock_transactions",
                "stock_batches",
                "harvest_plans",
                "alert_states",
                "scenarios",
                "menus",
                "transfers",
                "report_shares",
            ):
                conn.execute(f"DELETE FROM {tbl}")

            self._set_kv(conn, "village", v_seed["village"])
            self._set_kv(conn, "user", v_seed["user"])
            self._set_kv(conn, "population", v_seed["population"])
            self._set_kv(conn, "warehouses", v_seed["warehouses"])
            self._set_kv(conn, "settings", v_seed["settings"])
            self._set_kv(conn, "global_signals_base", ce_seed["global_signals"])
            self._set_kv(conn, "global_events", [
                {**ev, "aktif": False, "mulai_tanggal": None} for ev in ce_seed["global_events"]
            ])
            self._set_kv(conn, "scenario_presets", ce_seed["scenario_presets"])
            self._set_kv(conn, "cluster_villages", ce_seed["cluster_villages"])
            self._set_kv(conn, "foods", foods)

            warehouses = v_seed["warehouses"]
            # Insert commodities & initial stock batches across 4 warehouses
            for comm in c_seed:
                conn.execute(
                    """
                    INSERT INTO commodities (
                        id, kode, nama, satuan, kelompok, norma_per_kapita_hari,
                        stok_awal, eksposur_impor, ketergantungan_pupuk,
                        porsi_pasokan_rutin, umur_simpan_hari, harga_acuan,
                        kkal_per_unit, protein_g_per_unit
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        comm["id"],
                        comm["kode"],
                        comm["nama"],
                        comm["satuan"],
                        comm["kelompok"],
                        comm["norma_per_kapita_hari"],
                        comm["stok_awal"],
                        comm["eksposur_impor"],
                        comm["ketergantungan_pupuk"],
                        comm["porsi_pasokan_rutin"],
                        comm["umur_simpan_hari"],
                        comm["harga_acuan"],
                        comm["kkal_per_unit"],
                        comm["protein_g_per_unit"],
                    ),
                )

                total_stok = float(comm["stok_awal"])
                shelf_days = int(comm["umur_simpan_hari"])
                # Ensure no initial batch expires before being consumed in initial state (16.2)
                if shelf_days <= 30:
                    age_offsets = [1, 2, 3, 2]
                else:
                    age_offsets = [45, 25, 12, 5]

                allocated = 0.0
                for idx, wh in enumerate(warehouses):
                    if idx < len(warehouses) - 1:
                        wh_qty = round(total_stok * float(wh["share"]), 2)
                        allocated += wh_qty
                    else:
                        wh_qty = round(total_stok - allocated, 2)

                    entry_date = base_date - timedelta(days=age_offsets[idx % len(age_offsets)])
                    exp_date = entry_date + timedelta(days=shelf_days)
                    batch_id = f"b-init-{comm['kode']}-{wh['sumber']}"
                    tx_id = f"tx-init-{comm['kode']}-{wh['sumber']}"

                    conn.execute(
                        """
                        INSERT INTO stock_batches (
                            id, commodity_id, warehouse_id, jumlah_awal, jumlah_sisa, tanggal_masuk, expiry_date
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                        (batch_id, comm["id"], wh["id"], wh_qty, wh_qty, entry_date.isoformat(), exp_date.isoformat()),
                    )
                    conn.execute(
                        """
                        INSERT INTO stock_transactions (
                            id, village_id, commodity_id, warehouse_id, jenis, jumlah,
                            tanggal, expiry_date, catatan, reverses_id, client_created_at, synced_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            tx_id,
                            "v-sidomulyo",
                            comm["id"],
                            wh["id"],
                            "masuk_panen" if comm["kelompok"] == "pokok" and comm["kode"] != "terigu" else "masuk_beli",
                            wh_qty,
                            entry_date.isoformat(),
                            exp_date.isoformat(),
                            "Saldo stok awal (data simulasi seed)",
                            None,
                            now_iso,
                            now_iso,
                        ),
                    )

            # Seed harvest plans
            for hp in ce_seed["harvest_plans"]:
                t_tanam = base_date - timedelta(days=int(hp["hari_tanam_lalu"]))
                pred = predict_harvest_yield(
                    komoditas=hp["komoditas_tanam"],
                    luas_ha=float(hp["luas_ha"]),
                    tanggal_tanam=t_tanam,
                    varietas=hp["varietas"],
                    kondisi_pupuk=hp["kondisi_pupuk"],
                    sumber_air=hp["sumber_air"],
                )
                conn.execute(
                    """
                    INSERT INTO harvest_plans (
                        id, village_id, commodity_id, komoditas_tanam, luas_ha,
                        tanggal_tanam, varietas, kondisi_pupuk, sumber_air, aktif_di_proyeksi, prediksi_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        hp["id"],
                        hp["village_id"],
                        hp["commodity_id"],
                        hp["komoditas_tanam"],
                        hp["luas_ha"],
                        t_tanam.isoformat(),
                        hp["varietas"],
                        hp["kondisi_pupuk"],
                        hp["sumber_air"],
                        1 if hp.get("aktif_di_proyeksi") else 0,
                        json.dumps(pred, ensure_ascii=False),
                    ),
                )

            # Seed incoming transfer request from Mulyorejo (16.5)
            for tr in ce_seed.get("incoming_requests", []):
                conn.execute(
                    """
                    INSERT INTO transfers (
                        id, dari_village_id, dari_village_nama, ke_village_id, ke_village_nama,
                        commodity_id, commodity_nama, satuan, jumlah, jarak_km, biaya_angkut,
                        status, draf_pesan, arah, status_log_json, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        tr["id"],
                        tr["dari_village_id"],
                        tr["dari_village_nama"],
                        tr["ke_village_id"],
                        tr["ke_village_nama"],
                        tr["commodity_id"],
                        tr["commodity_nama"],
                        tr["satuan"],
                        tr["jumlah"],
                        tr["jarak_km"],
                        tr["biaya_angkut"],
                        tr["status"],
                        tr["draf_pesan"],
                        tr["arah"],
                        json.dumps([{"status": tr["status"], "waktu": now_iso}], ensure_ascii=False),
                        now_iso,
                    ),
                )

        return {"status": "ok", "jam_virtual": now_iso}

    # --- Helpers for Virtual Clock & Config ---
    def get_settings(self) -> Dict[str, Any]:
        return self._get_kv("settings", {})

    def update_settings(self, patch: Dict[str, Any]) -> Dict[str, Any]:
        curr = self.get_settings()
        for k, v in patch.items():
            if isinstance(v, dict) and isinstance(curr.get(k), dict):
                curr[k].update(v)
            else:
                curr[k] = v
        with self._conn() as conn:
            self._set_kv(conn, "settings", curr)
        return curr

    def get_as_of_date(self) -> date:
        st = self.get_settings()
        jv = st.get("jam_virtual", "2026-11-12T08:00:00")
        return date.fromisoformat(str(jv)[:10])

    def get_threshold_config(self) -> ThresholdConfig:
        st = self.get_settings()
        amb = st.get("ambang", {})
        return ThresholdConfig(
            aman=float(amb.get("aman", 21.0)),
            waspada=float(amb.get("waspada", 14.0)),
            siaga=float(amb.get("siaga", 7.0)),
            kritis=float(amb.get("kritis", 0.0)),
            bawah_72_jam=float(amb.get("bawah_72_jam", 3.0)),
            target_hari=float(st.get("target_hari", 30.0)),
            batas_donor=float(st.get("batas_donor", 21.0)),
        )

    def get_village(self) -> Dict[str, Any]:
        v = self._get_kv("village", {})
        pop = self.get_population()
        return {**v, "jumlah_penduduk": pop.get("total", 1800)}

    def update_village(self, patch: Dict[str, Any]) -> Dict[str, Any]:
        v = self._get_kv("village", {})
        for k in ("nama", "kecamatan", "kabupaten", "lat", "lon", "luas_lahan_ha"):
            if k in patch and patch[k] is not None:
                v[k] = patch[k]
        with self._conn() as conn:
            self._set_kv(conn, "village", v)
        return self.get_village()

    def get_population(self) -> Dict[str, Any]:
        return self._get_kv("population", {})

    def update_population(self, patch: Dict[str, Any]) -> Dict[str, Any]:
        pop = self.get_population()
        for k in (
            "total",
            "kk",
            "balita",
            "ibu_hamil_menyusui",
            "lansia",
            "akg_umum_kkal",
            "akg_umum_protein_g",
            "akg_balita_kkal",
            "akg_balita_protein_g",
            "akg_bumil_kkal",
            "akg_bumil_protein_g",
        ):
            if k in patch and patch[k] is not None:
                pop[k] = patch[k]
        with self._conn() as conn:
            self._set_kv(conn, "population", pop)
        return pop

    # --- Active Global Events & Signals ---
    def get_global_events(self) -> List[Dict[str, Any]]:
        return self._get_kv("global_events", [])

    def get_active_event(self) -> Optional[Dict[str, Any]]:
        for ev in self.get_global_events():
            if ev.get("aktif"):
                return ev
        return None

    def trigger_global_event(self, event_id: Optional[str], aktif: bool = True) -> List[Dict[str, Any]]:
        events = self.get_global_events()
        as_of_str = self.get_as_of_date().isoformat()
        for ev in events:
            if event_id and ev["id"] == event_id:
                ev["aktif"] = bool(aktif)
                ev["mulai_tanggal"] = as_of_str if aktif else None
            elif aktif and event_id:
                ev["aktif"] = False
                ev["mulai_tanggal"] = None
            elif not event_id and not aktif:
                ev["aktif"] = False
                ev["mulai_tanggal"] = None
        with self._conn() as conn:
            self._set_kv(conn, "global_events", events)
        return events

    def get_global_signals(self) -> Dict[str, Any]:
        base_signals = self._get_kv("global_signals_base", [])
        active_ev = self.get_active_event()
        signals_out = []
        intensities = []

        for sig in base_signals:
            kode = sig["kode"]
            val = float(sig["nilai_awal"])
            chg = float(sig["perubahan_14d_pct"])
            inten = float(sig["intensitas_awal"])

            if active_ev:
                efek = active_ev.get("efek_sinyal", {})
                if kode == "kurs_usd_idr" and "kurs_usd_idr_pct" in efek:
                    chg = float(efek["kurs_usd_idr_pct"])
                    val = round(val * (1.0 + chg / 100.0), 0)
                    inten = min(1.0, chg / 10.0)
                elif kode == "harga_pupuk_urea" and "harga_pupuk_urea_pct" in efek:
                    chg = float(efek["harga_pupuk_urea_pct"])
                    val = round(val * (1.0 + chg / 100.0), 1)
                    inten = min(1.0, chg / 25.0)
                elif kode == "indeks_gangguan_logistik" and "indeks_gangguan_logistik_val" in efek:
                    new_v = float(efek["indeks_gangguan_logistik_val"])
                    chg = round(((new_v - val) / max(1.0, val)) * 100.0, 1)
                    val = new_v
                    inten = min(1.0, val / 100.0)
                elif kode == "indeks_pangan_global" and "indeks_pangan_global_pct" in efek:
                    chg = float(efek["indeks_pangan_global_pct"])
                    val = round(val * (1.0 + chg / 100.0), 1)
                    inten = min(1.0, chg / 15.0)
                elif kode == "indeks_energi" and "indeks_energi_pct" in efek:
                    chg = float(efek["indeks_energi_pct"])
                    val = round(val * (1.0 + chg / 100.0), 1)
                    inten = min(1.0, chg / 35.0)

            intensities.append(inten)
            # Generate 12-point sparkline ending at val
            spark = [
                round(val * (1.0 - (chg / 100.0) * ((11 - i) / 11.0)), 1)
                for i in range(12)
            ]
            signals_out.append({
                "kode": kode,
                "nama": sig["nama"],
                "satuan": sig["satuan"],
                "nilai": val,
                "perubahan_14d_pct": chg,
                "intensitas": round(inten, 2),
                "komoditas_terpapar": sig["komoditas_terpapar"],
                "sparkline": spark,
            })

        mean_intensity = float(sum(intensities) / max(1, len(intensities)))
        return {
            "sinyal": signals_out,
            "intensitas_rata_rata": round(mean_intensity, 3),
            "peristiwa_aktif": active_ev,
        }

    # --- Commodities, Prices & Batches ---
    def get_commodities_with_prices(self) -> List[CommodityInput]:
        as_of = self.get_as_of_date()
        active_ev = self.get_active_event()
        sig_info = self.get_global_signals()
        sig_intensity = float(sig_info["intensitas_rata_rata"])

        with self._conn() as conn:
            rows = conn.execute("SELECT * FROM commodities ORDER BY rowid").fetchall()

        result: List[CommodityInput] = []
        for r in rows:
            e_k = float(r["eksposur_impor"])
            harga_acuan = float(r["harga_acuan"])
            uplift_full = 0.0
            uplift_7d = 0.0
            days_since = 0

            if active_ev:
                p = active_ev["parameter"]
                dp = float(p["delta_p"])
                dk = float(p["delta_k"])
                # 16.4 kenaikan penuh = (1 + dP * e) * (1 + dK * e) - 1; 35% in first 7 days
                uplift_full = (1.0 + dp * e_k) * (1.0 + dk * e_k) - 1.0
                uplift_7d = 0.35 * uplift_full
                if active_ev.get("mulai_tanggal"):
                    mulai = date.fromisoformat(active_ev["mulai_tanggal"])
                    days_since = max(1, (as_of - mulai).days)
                else:
                    days_since = 7

            series = generate_104w_price_series(
                kode=r["kode"],
                harga_acuan=harga_acuan,
                as_of=as_of,
                active_event_uplift_7d=uplift_7d,
                active_event_uplift_full=uplift_full,
                days_since_event=days_since,
            )
            fc = forecast_price_4_weeks(
                series_104w=series,
                as_of=as_of,
                eksposur_impor=e_k,
                signal_intensity=sig_intensity,
                event_active=bool(active_ev),
            )

            result.append(
                CommodityInput(
                    id=r["id"],
                    kode=r["kode"],
                    nama=r["nama"],
                    satuan=r["satuan"],
                    kelompok=r["kelompok"],
                    norma_per_kapita_hari=float(r["norma_per_kapita_hari"]),
                    eksposur_impor=e_k,
                    ketergantungan_pupuk=float(r["ketergantungan_pupuk"]),
                    porsi_pasokan_rutin=float(r["porsi_pasokan_rutin"]),
                    umur_simpan_hari=int(r["umur_simpan_hari"]),
                    harga_acuan=harga_acuan,
                    kkal_per_unit=float(r["kkal_per_unit"]),
                    protein_g_per_unit=float(r["protein_g_per_unit"]),
                    harga_sekarang=float(fc["harga_sekarang"]),
                    kenaikan_harga_7d_pct=float(fc["perubahan_7d_pct"]),
                    kenaikan_harga_30d_pct=float(fc["perubahan_30d_pct"]),
                    prediksi_naik_4w_pct=float(fc["prediksi_4w_pct"]),
                )
            )
        return result

    def update_commodity_norma(self, commodity_id: str, norma_baru: float) -> Dict[str, Any]:
        if norma_baru <= 0 or norma_baru > 5.0:
            raise ValueError("Norma konsumsi harus berada di antara 0,001 dan 5,0 satuan per orang per hari.")
        with self._conn() as conn:
            cur = conn.execute(
                "UPDATE commodities SET norma_per_kapita_hari = ? WHERE id = ? OR kode = ?",
                (float(norma_baru), commodity_id, commodity_id),
            )
            if cur.rowcount == 0:
                raise KeyError("Komoditas tidak ditemukan.")
        return {"commodity_id": commodity_id, "norma_per_kapita_hari": float(norma_baru)}

    def get_all_batches(self, commodity_id: Optional[str] = None) -> List[BatchInput]:
        with self._conn() as conn:
            if commodity_id:
                rows = conn.execute(
                    "SELECT * FROM stock_batches WHERE commodity_id = ? ORDER BY expiry_date ASC",
                    (commodity_id,),
                ).fetchall()
            else:
                rows = conn.execute("SELECT * FROM stock_batches ORDER BY expiry_date ASC").fetchall()

        return [
            BatchInput(
                id=r["id"],
                commodity_id=r["commodity_id"],
                warehouse_id=r["warehouse_id"],
                jumlah_sisa=float(r["jumlah_sisa"]),
                tanggal_masuk=date.fromisoformat(r["tanggal_masuk"]),
                expiry_date=date.fromisoformat(r["expiry_date"]) if r["expiry_date"] else None,
            )
            for r in rows
        ]

    def get_scheduled_harvests(self) -> List[HarvestScheduleInput]:
        with self._conn() as conn:
            rows = conn.execute("SELECT * FROM harvest_plans").fetchall()
        out: List[HarvestScheduleInput] = []
        for r in rows:
            pred = json.loads(r["prediksi_json"]) if r["prediksi_json"] else {}
            t_panen_str = pred.get("tanggal_panen_median")
            if t_panen_str:
                out.append(
                    HarvestScheduleInput(
                        commodity_id=r["commodity_id"],
                        tanggal_panen=date.fromisoformat(t_panen_str),
                        volume_kg=float(pred.get("volume_median_kg", 0.0)),
                        aktif=bool(r["aktif_di_proyeksi"]),
                    )
                )
        return out

    # --- Stock Overview & Transactions (F2, F3) ---
    def compute_full_stock_and_status(self) -> Dict[str, Any]:
        as_of = self.get_as_of_date()
        cfg = self.get_threshold_config()
        st = self.get_settings()
        include_harvest = bool(st.get("hitung_panen_terjadwal", False))
        pop = self.get_population()
        penduduk = int(pop.get("total", 1800))

        comms = self.get_commodities_with_prices()
        all_batches = self.get_all_batches()
        sched_harvests = self.get_scheduled_harvests()
        warehouses = self._get_kv("warehouses", [])
        wh_map = {w["id"]: w for w in warehouses}

        batches_by_comm: Dict[str, List[BatchInput]] = {}
        for b in all_batches:
            batches_by_comm.setdefault(b.commodity_id, []).append(b)

        harvest_by_comm: Dict[str, List[HarvestScheduleInput]] = {}
        for h in sched_harvests:
            harvest_by_comm.setdefault(h.commodity_id, []).append(h)

        stock_by_id: Dict[str, float] = {}
        doc_by_id: Dict[str, float] = {}
        expiring_7d_by_id: Dict[str, float] = {}
        commodities_detail: List[Dict[str, Any]] = []

        for comm in comms:
            c_batches = batches_by_comm.get(comm.id, [])
            eff_stok = compute_effective_stock(c_batches, as_of)
            exp7_stok = compute_expiring_soon_stock(c_batches, as_of, within_days=7)
            d_k = compute_daily_demand(penduduk, comm.norma_per_kapita_hari)
            doc_val, exceeds, _ = simulate_fefo_doc(
                batches=c_batches,
                daily_demand=d_k,
                as_of=as_of,
                horizon=180,
                scheduled_harvests=harvest_by_comm.get(comm.id, []),
                include_harvest=include_harvest,
            )

            stock_by_id[comm.id] = round(eff_stok, 2)
            doc_by_id[comm.id] = round(doc_val, 1)
            expiring_7d_by_id[comm.id] = round(exp7_stok, 2)

            # Per warehouse breakdown
            per_sumber: Dict[str, float] = {}
            for w in warehouses:
                per_sumber[w["nama"]] = 0.0
            for b in c_batches:
                if b.jumlah_sisa > 1e-9 and (b.expiry_date is None or b.expiry_date > as_of):
                    w_nama = wh_map.get(b.warehouse_id, {}).get("nama", b.warehouse_id)
                    per_sumber[w_nama] = round(per_sumber.get(w_nama, 0.0) + b.jumlah_sisa, 2)

            status_info = classify_status(doc_val, cfg)
            commodities_detail.append({
                "id": comm.id,
                "kode": comm.kode,
                "nama": comm.nama,
                "satuan": comm.satuan,
                "kelompok": comm.kelompok,
                "norma_per_kapita_hari": comm.norma_per_kapita_hari,
                "kebutuhan_harian": round(d_k, 2),
                "stok_efektif": round(eff_stok, 1),
                "hari_bertahan": round(doc_val, 1),
                "lebih_dari_180_hari": exceeds,
                "stok_segera_kedaluwarsa_7d": round(exp7_stok, 1),
                "segera_kedaluwarsa": exp7_stok > 0,
                "harga_acuan": comm.harga_acuan,
                "harga_sekarang": comm.harga_sekarang,
                "perubahan_harga_7d_pct": comm.kenaikan_harga_7d_pct,
                "perubahan_harga_30d_pct": comm.kenaikan_harga_30d_pct,
                "prediksi_harga_4w_pct": comm.prediksi_naik_4w_pct,
                "eksposur_impor": comm.eksposur_impor,
                "ketergantungan_pupuk": comm.ketergantungan_pupuk,
                "porsi_pasokan_rutin": comm.porsi_pasokan_rutin,
                "umur_simpan_hari": comm.umur_simpan_hari,
                "kkal_per_unit": comm.kkal_per_unit,
                "protein_g_per_unit": comm.protein_g_per_unit,
                "rincian_sumber": per_sumber,
                **status_info,
            })

        pools = compute_pools_and_weakest(
            commodities=comms,
            stock_by_id=stock_by_id,
            doc_by_id=doc_by_id,
            penduduk=penduduk,
            cfg=cfg,
        )

        sig_info = self.get_global_signals()
        skor = compute_resilience_score(
            commodities=comms,
            doc_pokok=float(pools["pool_pokok"]["hari_bertahan"]),
            doc_protein=float(pools["pool_protein"]["hari_bertahan"]),
            doc_pelengkap=float(pools["pool_pelengkap"]["hari_bertahan"]),
            doc_terlemah=float(pools["titik_terlemah"]["hari_bertahan"]),
            signal_intensity=float(sig_info["intensitas_rata_rata"]),
            pmt_coverage=float(pop.get("pmt_coverage_30d", 0.78)),
            target_hari=cfg.target_hari,
            weights=st.get("bobot_skor"),
        )

        pokok_doc = pools["pool_pokok"]["hari_bertahan"]
        weak_nama = pools["titik_terlemah"]["nama"]
        weak_doc = pools["titik_terlemah"]["hari_bertahan"]
        kalimat_ringkasan = (
            f"Jika pasokan dari luar berhenti, pangan pokok desa bertahan {str(pokok_doc).replace('.', ',')} hari. "
            f"Titik terlemah: {weak_nama} ({str(weak_doc).replace('.', ',')} hari)."
        )

        return {
            "as_of": as_of.isoformat(),
            "jam_virtual": st.get("jam_virtual"),
            "label_data": "Data simulasi untuk prototipe",
            "kalimat_ringkasan": kalimat_ringkasan,
            "pool_pokok": pools["pool_pokok"],
            "pool_protein": pools["pool_protein"],
            "pool_pelengkap": pools["pool_pelengkap"],
            "titik_terlemah": pools["titik_terlemah"],
            "skor_ketahanan": skor,
            "komoditas": commodities_detail,
            "target_hari": cfg.target_hari,
            "hitung_panen_terjadwal": include_harvest,
        }

    def record_stock_transaction(self, tx: Dict[str, Any]) -> Dict[str, Any]:
        """
        8.F3 Append-only ledger transaction with UUID idempotency and FEFO batch update.
        """
        tx_id = str(tx.get("id") or uuid.uuid4())
        with self._conn() as conn:
            existing = conn.execute(
                "SELECT * FROM stock_transactions WHERE id = ?", (tx_id,)
            ).fetchone()
            if existing:
                return {"id": tx_id, "idempoten_skip": True, "status": "sudah_tercatat"}

            comm_id = str(tx["commodity_id"])
            comm_row = conn.execute(
                "SELECT * FROM commodities WHERE id = ? OR kode = ?", (comm_id, comm_id)
            ).fetchone()
            if not comm_row:
                raise KeyError(f"Komoditas '{comm_id}' tidak ditemukan.")
            real_comm_id = comm_row["id"]
            shelf_days = int(comm_row["umur_simpan_hari"])

            wh_id = str(tx.get("warehouse_id") or "wh-lumbung")
            jenis = str(tx["jenis"])
            jumlah = float(tx["jumlah"])
            if jumlah <= 0:
                raise ValueError("Jumlah transaksi harus lebih dari 0.")

            as_of = self.get_as_of_date()
            tanggal_str = str(tx.get("tanggal") or as_of.isoformat())[:10]
            t_date = date.fromisoformat(tanggal_str)
            clean_note, _ = sanitize_untrusted_note(str(tx.get("catatan") or ""))
            reverses_id = tx.get("reverses_id")

            is_inbound = jenis.startswith("masuk_") or (jenis == "penyesuaian" and tx.get("arah") == "masuk")
            if jenis == "pembalik" and reverses_id:
                orig = conn.execute(
                    "SELECT * FROM stock_transactions WHERE id = ?", (str(reverses_id),)
                ).fetchone()
                if orig:
                    is_inbound = not str(orig["jenis"]).startswith("masuk_")

            if is_inbound:
                exp_str = tx.get("expiry_date") or (t_date + timedelta(days=shelf_days)).isoformat()
                batch_id = f"b-{tx_id[:12]}"
                conn.execute(
                    """
                    INSERT INTO stock_batches (
                        id, commodity_id, warehouse_id, jumlah_awal, jumlah_sisa, tanggal_masuk, expiry_date
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (batch_id, real_comm_id, wh_id, jumlah, jumlah, tanggal_str, exp_str),
                )
            else:
                # Outbound FEFO consumption across unexpired batches
                batches = conn.execute(
                    """
                    SELECT * FROM stock_batches
                    WHERE commodity_id = ? AND jumlah_sisa > 0 AND expiry_date > ?
                    ORDER BY expiry_date ASC, tanggal_masuk ASC
                    """,
                    (real_comm_id, as_of.isoformat()),
                ).fetchall()
                total_avail = sum(float(b["jumlah_sisa"]) for b in batches)
                if jumlah > total_avail + 1e-6:
                    raise ValueError(
                        f"Stok {comm_row['nama']} tidak mencukupi (tersedia {total_avail:.1f} {comm_row['satuan']}, "
                        f"diminta {jumlah:.1f} {comm_row['satuan']}). Saldo stok tidak boleh negatif."
                    )
                rem = jumlah
                for b in batches:
                    sisa = float(b["jumlah_sisa"])
                    take = min(sisa, rem)
                    new_sisa = round(max(0.0, sisa - take), 4)
                    conn.execute(
                        "UPDATE stock_batches SET jumlah_sisa = ? WHERE id = ?",
                        (new_sisa, b["id"]),
                    )
                    rem -= take
                    if rem <= 1e-6:
                        break
                exp_str = None

            now_iso = datetime.utcnow().isoformat()
            client_ts = str(tx.get("client_created_at") or now_iso)
            conn.execute(
                """
                INSERT INTO stock_transactions (
                    id, village_id, commodity_id, warehouse_id, jenis, jumlah,
                    tanggal, expiry_date, catatan, reverses_id, client_created_at, synced_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    tx_id,
                    "v-sidomulyo",
                    real_comm_id,
                    wh_id,
                    jenis,
                    jumlah,
                    tanggal_str,
                    exp_str,
                    clean_note,
                    reverses_id,
                    client_ts,
                    now_iso,
                ),
            )

        return {"id": tx_id, "idempoten_skip": False, "status": "berhasil"}

    def perform_stock_opname(
        self, commodity_id: str, jumlah_fisik: float, warehouse_id: str = "wh-lumbung", catatan: str = ""
    ) -> Dict[str, Any]:
        """8.F3 Stock opname creates an automatic Penyesuaian transaction."""
        if jumlah_fisik < 0:
            raise ValueError("Jumlah fisik tidak boleh negatif.")
        as_of = self.get_as_of_date()
        batches = self.get_all_batches(commodity_id)
        stok_sistem = compute_effective_stock(batches, as_of)
        selisih = round(jumlah_fisik - stok_sistem, 2)
        if abs(selisih) < 1e-4:
            return {"status": "sesuai", "selisih": 0.0, "stok_akhir": stok_sistem}

        arah = "masuk" if selisih > 0 else "keluar"
        tx_res = self.record_stock_transaction({
            "id": str(uuid.uuid4()),
            "commodity_id": commodity_id,
            "warehouse_id": warehouse_id,
            "jenis": "penyesuaian",
            "arah": arah,
            "jumlah": abs(selisih),
            "tanggal": as_of.isoformat(),
            "catatan": catatan or f"Penyesuaian stock opname (sistem {stok_sistem:.1f} -> fisik {jumlah_fisik:.1f})",
        })
        return {
            "status": "disesuaikan",
            "stok_sebelum": round(stok_sistem, 1),
            "stok_fisik": round(jumlah_fisik, 1),
            "selisih": selisih,
            "transaksi": tx_res,
        }

    def advance_virtual_clock(self, days: int) -> Dict[str, Any]:
        """14.0 Advance virtual clock by +1, +7, or +30 days and simulate daily consumption & harvests."""
        step_days = max(1, min(90, int(days)))
        st = self.get_settings()
        curr_dt = datetime.fromisoformat(str(st.get("jam_virtual", "2026-11-12T08:00:00")))
        new_dt = curr_dt + timedelta(days=step_days)

        pop = self.get_population()
        penduduk = int(pop.get("total", 1800))
        comms = self.get_commodities_with_prices()

        for comm in comms:
            d_k = compute_daily_demand(penduduk, comm.norma_per_kapita_hari)
            net_drain = max(0.0, d_k * (1.0 - comm.porsi_pasokan_rutin) * step_days)
            batches = self.get_all_batches(comm.id)
            avail = compute_effective_stock(batches, curr_dt.date())
            consume_qty = min(avail * 0.65, round(net_drain, 1))
            if consume_qty >= 1.0:
                try:
                    self.record_stock_transaction({
                        "id": f"tx-sim-{comm.kode}-{new_dt.date().isoformat()}-{uuid.uuid4().hex[:6]}",
                        "commodity_id": comm.id,
                        "warehouse_id": "wh-rt",
                        "jenis": "keluar_salur",
                        "jumlah": consume_qty,
                        "tanggal": new_dt.date().isoformat(),
                        "catatan": f"Konsumsi harian warga otomatis (+{step_days} hari jam virtual)",
                    })
                except Exception:
                    pass

        self.update_settings({"jam_virtual": new_dt.isoformat()})
        return self.compute_full_stock_and_status()


store = SeedStore()
