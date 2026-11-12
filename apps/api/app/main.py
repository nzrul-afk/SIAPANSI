from __future__ import annotations
import json
import os
import secrets
import uuid
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple, Union

from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

from ai.client import llm_client
from engine.alerts import evaluate_alerts
from engine.core import (
    classify_status,
    compute_daily_demand,
    compute_effective_stock,
    compute_expiring_soon_stock,
    simulate_fefo_doc,
)
from engine.distribution_opt import optimize_village_distribution
from engine.menu_optimizer import FoodItemSpec, optimize_menu_plan
from engine.scenario import run_shock_scenario
from ml.harvest_model import get_model_metadata, predict_harvest_yield
from ml.price_forecasting import forecast_price_4_weeks, generate_104w_price_series
from .store import store

app = FastAPI(
    title="SIAPANSA API",
    description="Backend API Prototipe Ketahanan Pangan Desa Berbasis AI (Kelompok 11 Politeknik Negeri Malang)",
    version="1.0.0",
)

cors_origins = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:4173",
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Uniform error handler in Bahasa Indonesia (Section 13)
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail
    if isinstance(detail, dict) and "kode" in detail and "pesan" in detail:
        return JSONResponse(status_code=exc.status_code, content=detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "kode": f"ERR_{exc.status_code}",
            "pesan": str(detail),
            "detail": str(detail),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "kode": "INPUT_TIDAK_VALID",
            "pesan": "Data masukan tidak sesuai format yang diminta. Periksa kembali angka atau pilihan Anda.",
            "detail": exc.errors(),
        },
    )


# --- Pydantic Request Schemas ---
class LoginRequest(BaseModel):
    email: str = "petugas@siapansa.demo"
    password: str = "demo1234"
    demo_instant: bool = False


class NormaUpdateRequest(BaseModel):
    norma_per_kapita_hari: float = Field(..., gt=0, le=5.0)


class StockTransactionItem(BaseModel):
    id: Optional[str] = None
    commodity_id: str
    warehouse_id: str = "wh-lumbung"
    jenis: str
    jumlah: float = Field(..., gt=0)
    tanggal: Optional[str] = None
    expiry_date: Optional[str] = None
    catatan: Optional[str] = ""
    reverses_id: Optional[str] = None
    arah: Optional[str] = None
    client_created_at: Optional[str] = None


class StockTransactionBatchRequest(BaseModel):
    transactions: List[StockTransactionItem]


class OpnameRequest(BaseModel):
    jumlah_fisik: float = Field(..., ge=0)
    warehouse_id: str = "wh-lumbung"
    catatan: Optional[str] = ""


class AlertPatchRequest(BaseModel):
    status: str = "Dilihat"
    tunda_24_jam: bool = False


class ScenarioParams(BaseModel):
    nama: Optional[str] = "Skenario Kustom"
    delta_s: float = Field(0.0, ge=0.0, le=1.0)
    delta_p: float = Field(0.0, ge=0.0, le=1.0)
    delta_h: float = Field(0.0, ge=0.0, le=0.6)
    delta_k: float = Field(0.0, ge=0.0, le=0.3)
    durasi: int = Field(60, ge=7, le=180)


class HarvestForecastRequest(BaseModel):
    komoditas: str = "padi"
    luas_ha: float = Field(2.0, gt=0.0, le=500.0)
    tanggal_tanam: Optional[str] = None
    varietas: str = ""
    kondisi_pupuk: str = "cukup"
    sumber_air: str = "irigasi_teknis"


class HarvestPlanCreateRequest(HarvestForecastRequest):
    commodity_id: Optional[str] = None
    aktif_di_proyeksi: bool = True


class HarvestPlanPatchRequest(BaseModel):
    aktif_di_proyeksi: Optional[bool] = None
    kondisi_pupuk: Optional[str] = None
    luas_ha: Optional[float] = None


class MenuGenerateRequest(BaseModel):
    sasaran: str = "balita"
    jumlah_penerima: Optional[int] = None
    durasi: int = Field(7, ge=1, le=14)
    prioritas: str = "hindari_impor"
    batas_stok_pct: float = Field(0.20, ge=0.05, le=0.80)


class TransferCreateRequest(BaseModel):
    dari_village_id: str
    dari_village_nama: str
    ke_village_id: str = "v-sidomulyo"
    ke_village_nama: str = "Desa Sidomulyo"
    commodity_id: str
    commodity_nama: str
    satuan: str = "kg"
    jumlah: float = Field(..., gt=0)
    jarak_km: float = Field(..., ge=0)
    biaya_angkut: float = Field(..., ge=0)
    draf_pesan: Optional[str] = None


class TransferPatchRequest(BaseModel):
    status: str  # Draft | Diajukan | Disetujui | Dikirim | Diterima | Ditolak


class ChatRequest(BaseModel):
    pesan: str
    stream: bool = False


class ReportRequest(BaseModel):
    periode: int = 30


class DemoAdvanceRequest(BaseModel):
    days: int = Field(1, ge=1, le=90)


class DemoEventRequest(BaseModel):
    event_id: Optional[str] = "evt-konflik-gandum"
    aktif: bool = True


class DemoApproveTransferRequest(BaseModel):
    transfer_id: Optional[str] = None


class DemoStoryRequest(BaseModel):
    story_step: str = "krisis_gandum"


# --- Operational Endpoints ---
@app.get("/api/v1/health")
def get_health() -> Dict[str, Any]:
    st = store.get_settings()
    return {
        "status": "sehat",
        "aplikasi": "SIAPANSA API",
        "versi": "1.0.0",
        "jam_virtual": st.get("jam_virtual"),
        "label": "Data simulasi untuk prototipe",
    }


@app.get("/api/v1/ai/status")
def get_ai_status() -> Dict[str, Any]:
    st = store.get_settings()
    return llm_client.get_status(bool(st.get("ai_enabled", True)))


# --- F1: Auth & Village Profile ---
@app.post("/api/v1/auth/login")
def login(req: LoginRequest, response: Response) -> Dict[str, Any]:
    user = store._get_kv("user", {})
    if not req.demo_instant:
        if req.email.strip().lower() != user.get("email", "").lower() or req.password != user.get("password_plain"):
            raise HTTPException(
                status_code=401,
                detail={
                    "kode": "LOGIN_GAGAL",
                    "pesan": "Email atau kata sandi tidak cocok. Gunakan akun demo: petugas@siapansa.demo / demo1234.",
                    "detail": "Kredensial tidak valid",
                },
            )
    token = f"jwt-demo-{secrets.token_urlsafe(24)}"
    expires_at = (datetime.utcnow() + timedelta(days=7)).isoformat()
    response.set_cookie(
        key="siapansa_token",
        value=token,
        httponly=True,
        max_age=7 * 86400,
        samesite="lax",
    )
    return {
        "token": token,
        "expires_at": expires_at,
        "user": {
            "id": user.get("id"),
            "nama": user.get("nama"),
            "email": user.get("email"),
            "role": user.get("role"),
            "village_id": user.get("village_id"),
        },
        "village": store.get_village(),
    }


@app.post("/api/v1/auth/logout")
def logout(response: Response) -> Dict[str, str]:
    response.delete_cookie("siapansa_token")
    return {"status": "berhasil_keluar", "pesan": "Sesi berhasil dibersihkan."}


@app.get("/api/v1/me")
def get_me() -> Dict[str, Any]:
    user = store._get_kv("user", {})
    return {
        "user": {
            "id": user.get("id"),
            "nama": user.get("nama"),
            "email": user.get("email"),
            "role": user.get("role"),
            "village_id": user.get("village_id"),
        },
        "village": store.get_village(),
    }


@app.get("/api/v1/village")
def get_village() -> Dict[str, Any]:
    return store.get_village()


@app.put("/api/v1/village")
def update_village(payload: Dict[str, Any]) -> Dict[str, Any]:
    return store.update_village(payload)


# --- F4: Population & Settings ---
@app.get("/api/v1/population")
def get_population() -> Dict[str, Any]:
    pop = store.get_population()
    return {
        **pop,
        "catatan_akg": (
            "Nilai awal energi 2.100 kkal dan protein 57 g per orang per hari adalah acuan umum. "
            "Nilai kelompok sasaran di seed bersifat ilustratif dan wajib diverifikasi (AKG Kemenkes) "
            "sebelum dipakai di luar prototipe."
        ),
    }


@app.put("/api/v1/population")
def update_population(payload: Dict[str, Any]) -> Dict[str, Any]:
    return store.update_population(payload)


@app.get("/api/v1/settings")
def get_settings() -> Dict[str, Any]:
    return store.get_settings()


@app.put("/api/v1/settings")
def update_settings(payload: Dict[str, Any]) -> Dict[str, Any]:
    return store.update_settings(payload)


# --- F2 & F3: Commodities, Stock, Overview & Projection ---
@app.get("/api/v1/commodities")
def list_commodities() -> Dict[str, Any]:
    overview = store.compute_full_stock_and_status()
    return {
        "as_of": overview["as_of"],
        "komoditas": overview["komoditas"],
        "warehouses": store._get_kv("warehouses", []),
    }


@app.put("/api/v1/commodities/{commodity_id}/norma")
def update_norma(commodity_id: str, req: NormaUpdateRequest) -> Dict[str, Any]:
    try:
        res = store.update_commodity_norma(commodity_id, req.norma_per_kapita_hari)
        return {**res, "overview": store.compute_full_stock_and_status()}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/status/overview")
def get_status_overview() -> Dict[str, Any]:
    overview = store.compute_full_stock_and_status()
    alerts = _build_all_alerts(overview)
    return {
        **overview,
        "peringatan_teratas": alerts[:3],
        "jumlah_peringatan_aktif": len(alerts),
        "peristiwa_global_aktif": store.get_active_event(),
    }


@app.get("/api/v1/status/projection")
def get_status_projection(
    commodity: str = Query("c-beras", description="ID atau kode komoditas"),
    days: int = Query(30, ge=7, le=180),
) -> Dict[str, Any]:
    as_of = store.get_as_of_date()
    cfg = store.get_threshold_config()
    st = store.get_settings()
    include_harvest = bool(st.get("hitung_panen_terjadwal", False))
    pop = store.get_population()
    penduduk = int(pop.get("total", 1800))

    comms = store.get_commodities_with_prices()
    target_comm = next((c for c in comms if c.id == commodity or c.kode == commodity), comms[0])
    batches = store.get_all_batches(target_comm.id)
    harvests = [h for h in store.get_scheduled_harvests() if h.commodity_id == target_comm.id]

    d_k = compute_daily_demand(penduduk, target_comm.norma_per_kapita_hari)
    doc_val, exceeds, proj = simulate_fefo_doc(
        batches=batches,
        daily_demand=d_k,
        as_of=as_of,
        horizon=days,
        scheduled_harvests=harvests,
        include_harvest=include_harvest,
    )

    series = []
    for pt in proj:
        d_idx = int(pt["day"])
        p_date = as_of + timedelta(days=d_idx)
        series.append({
            "hari_ke": d_idx,
            "tanggal": p_date.isoformat(),
            "stok": pt["stock"],
            "ambang_aman": round(d_k * cfg.aman, 1),
            "ambang_waspada": round(d_k * cfg.waspada, 1),
            "ambang_siaga": round(d_k * cfg.siaga, 1),
        })

    return {
        "commodity_id": target_comm.id,
        "kode": target_comm.kode,
        "nama": target_comm.nama,
        "satuan": target_comm.satuan,
        "kebutuhan_harian": round(d_k, 2),
        "hari_bertahan": round(doc_val, 1),
        "lebih_dari_180_hari": exceeds,
        "horizon_hari": days,
        "hitung_panen_terjadwal": include_harvest,
        "proyeksi": series,
    }


@app.get("/api/v1/stock")
def get_stock_summary() -> Dict[str, Any]:
    overview = store.compute_full_stock_and_status()
    return {
        "as_of": overview["as_of"],
        "pool_pokok": overview["pool_pokok"],
        "pool_protein": overview["pool_protein"],
        "titik_terlemah": overview["titik_terlemah"],
        "komoditas": overview["komoditas"],
        "warehouses": store._get_kv("warehouses", []),
    }


@app.get("/api/v1/stock/transactions")
def list_stock_transactions(
    commodity_id: Optional[str] = None, limit: int = Query(50, ge=1, le=200)
) -> Dict[str, Any]:
    warehouses = {w["id"]: w["nama"] for w in store._get_kv("warehouses", [])}
    comms = {c.id: c for c in store.get_commodities_with_prices()}

    with store._conn() as conn:
        if commodity_id:
            rows = conn.execute(
                "SELECT * FROM stock_transactions WHERE commodity_id = ? ORDER BY synced_at DESC LIMIT ?",
                (commodity_id, limit),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM stock_transactions ORDER BY synced_at DESC LIMIT ?",
                (limit,),
            ).fetchall()

    items = []
    for r in rows:
        c_obj = comms.get(r["commodity_id"])
        items.append({
            "id": r["id"],
            "commodity_id": r["commodity_id"],
            "commodity_nama": c_obj.nama if c_obj else r["commodity_id"],
            "satuan": c_obj.satuan if c_obj else "kg",
            "warehouse_id": r["warehouse_id"],
            "warehouse_nama": warehouses.get(r["warehouse_id"], r["warehouse_id"]),
            "jenis": r["jenis"],
            "jumlah": float(r["jumlah"]),
            "tanggal": r["tanggal"],
            "expiry_date": r["expiry_date"],
            "catatan": r["catatan"],
            "reverses_id": r["reverses_id"],
            "client_created_at": r["client_created_at"],
            "synced_at": r["synced_at"],
        })
    return {"transaksi": items}


@app.get("/api/v1/stock/{commodity_id}")
def get_commodity_stock_detail(commodity_id: str) -> Dict[str, Any]:
    overview = store.compute_full_stock_and_status()
    as_of = store.get_as_of_date()
    comm_item = next(
        (c for c in overview["komoditas"] if c["id"] == commodity_id or c["kode"] == commodity_id),
        None,
    )
    if not comm_item:
        raise HTTPException(status_code=404, detail="Komoditas tidak ditemukan.")

    real_id = comm_item["id"]
    warehouses = {w["id"]: w["nama"] for w in store._get_kv("warehouses", [])}
    raw_batches = store.get_all_batches(real_id)

    batches_out = []
    for b in raw_batches:
        if b.jumlah_sisa <= 1e-6:
            continue
        days_to_exp = (b.expiry_date - as_of).days if b.expiry_date else 999
        batches_out.append({
            "id": b.id,
            "warehouse_id": b.warehouse_id,
            "warehouse_nama": warehouses.get(b.warehouse_id, b.warehouse_id),
            "jumlah_sisa": round(b.jumlah_sisa, 2),
            "tanggal_masuk": b.tanggal_masuk.isoformat(),
            "expiry_date": b.expiry_date.isoformat() if b.expiry_date else None,
            "sisa_hari_simpan": days_to_exp,
            "status_batch": (
                "kedaluwarsa"
                if days_to_exp <= 0
                else ("segera_kedaluwarsa" if days_to_exp <= 7 else "aktif")
            ),
        })

    tx_list = list_stock_transactions(commodity_id=real_id, limit=30)["transaksi"]
    proj = get_status_projection(commodity=real_id, days=30)["proyeksi"]

    return {
        "komoditas": comm_item,
        "batches": batches_out,
        "transaksi": tx_list,
        "proyeksi_30_hari": proj,
    }


@app.post("/api/v1/stock/transactions")
def create_stock_transactions(
    payload: Union[StockTransactionItem, StockTransactionBatchRequest, Dict[str, Any]]
) -> Dict[str, Any]:
    """
    8.F3 & 13 Supports both single transaction and batch transactions for idempotent offline sync.
    """
    raw = payload.model_dump() if hasattr(payload, "model_dump") else dict(payload)
    tx_items = raw.get("transactions") if "transactions" in raw else [raw]

    results = []
    try:
        for item in tx_items:
            res = store.record_stock_transaction(item)
            results.append(res)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    overview = store.compute_full_stock_and_status()
    return {
        "hasil": results,
        "jumlah_diproses": len(results),
        "overview_ringkas": {
            "pool_pokok": overview["pool_pokok"],
            "pool_protein": overview["pool_protein"],
            "titik_terlemah": overview["titik_terlemah"],
            "skor_ketahanan": overview["skor_ketahanan"],
        },
    }


@app.post("/api/v1/stock/{commodity_id}/opname")
def post_stock_opname(commodity_id: str, req: OpnameRequest) -> Dict[str, Any]:
    try:
        res = store.perform_stock_opname(
            commodity_id=commodity_id,
            jumlah_fisik=req.jumlah_fisik,
            warehouse_id=req.warehouse_id,
            catatan=req.catatan or "",
        )
        return {**res, "overview": store.compute_full_stock_and_status()}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- F5: Early Warning Alerts ---
def _build_all_alerts(overview: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    ov = overview or store.compute_full_stock_and_status()
    as_of = store.get_as_of_date()
    cfg = store.get_threshold_config()
    st = store.get_settings()
    ai_enabled = bool(st.get("ai_enabled", True))
    comms = store.get_commodities_with_prices()

    stock_by_id = {c["id"]: float(c["stok_efektif"]) for c in ov["komoditas"]}
    doc_by_id = {c["id"]: float(c["hari_bertahan"]) for c in ov["komoditas"]}
    exp7_by_id = {c["id"]: float(c["stok_segera_kedaluwarsa_7d"]) for c in ov["komoditas"]}

    sig_data = store.get_global_signals()
    sig_map: Dict[str, float] = {}
    for s in sig_data["sinyal"]:
        if s["kode"] == "kurs_usd_idr":
            sig_map["kurs_14d_pct"] = float(s["perubahan_14d_pct"])
        elif s["kode"] == "harga_pupuk_urea":
            sig_map["pupuk_14d_pct"] = float(s["perubahan_14d_pct"])
        elif s["kode"] == "indeks_gangguan_logistik":
            sig_map["indeks_logistik"] = float(s["nilai"])

    # Check R4 harvest drops
    harvest_drops = []
    with store._conn() as conn:
        hp_rows = conn.execute("SELECT * FROM harvest_plans").fetchall()
        saved_states = {
            r["alert_key"]: dict(r)
            for r in conn.execute("SELECT * FROM alert_states").fetchall()
        }

    comm_name_map = {c.id: c.nama for c in comms}
    for hp in hp_rows:
        pred = json.loads(hp["prediksi_json"]) if hp["prediksi_json"] else {}
        rasio = float(pred.get("rasio_baseline_pct", 100.0))
        if rasio < 85.0:
            harvest_drops.append({
                "commodity_id": hp["commodity_id"],
                "commodity_nama": comm_name_map.get(hp["commodity_id"], hp["komoditas_tanam"]),
                "rasio_baseline_pct": rasio,
                "mundur_hari": 7 if hp["kondisi_pupuk"] != "cukup" else 0,
            })

    # Check R7 distribution opportunities for deficit commodities
    surplus_opps = [
        {"commodity_id": "c-terigu", "commodity_nama": "Terigu", "donor_nama": "Desa Karangsari", "kapasitas_kg": 675.0},
        {"commodity_id": "c-kedelai", "commodity_nama": "Kedelai", "donor_nama": "Desa Karangsari", "kapasitas_kg": 198.0},
    ]

    raw_alerts = evaluate_alerts(
        commodities=comms,
        doc_by_id=doc_by_id,
        stock_by_id=stock_by_id,
        expiring_7d_by_id=exp7_by_id,
        doc_protein=float(ov["pool_protein"]["hari_bertahan"]),
        pmt_coverage=float(store.get_population().get("pmt_coverage_30d", 0.78)),
        global_signals=sig_map,
        harvest_drop_alerts=harvest_drops,
        surplus_opportunities=surplus_opps,
        days_since_last_tx=0,
        cfg=cfg,
    )

    enriched = []
    for a in raw_alerts:
        alert_id = f"alt-{a['rule_code']}-{a.get('commodity_id') or 'umum'}"
        st_row = saved_states.get(alert_id, {})
        curr_status = st_row.get("status", "Baru")
        snoozed_until = st_row.get("snoozed_until")

        # Critical alerts cannot be hidden/snoozed before being handled (8.F5)
        if snoozed_until and a["tingkat"] != "Kritis" and snoozed_until > as_of.isoformat():
            continue

        # U1: LLM explanation validated against data_pemicu
        gen = llm_client.generate_validated(
            use_case="U1_alert",
            context=a["data_pemicu"],
            prompt=(
                f"Jelaskan peringatan '{a['judul']}' kepada petugas pangan desa dalam 1-2 kalimat sederhana. "
                f"Wajib hanya memakai angka dari data pemicu ini: {json.dumps(a['data_pemicu'])}"
            ),
            template_fn=lambda _: str(a["penjelasan"]),
            ai_enabled=ai_enabled,
        )

        enriched.append({
            "id": alert_id,
            **a,
            "penjelasan": gen["teks"],
            "sumber_penjelasan": gen["sumber"],
            "label_ai": gen["label_ai"],
            "status": curr_status,
            "snoozed_until": snoozed_until,
        })

    return enriched


@app.get("/api/v1/alerts")
def get_alerts(tingkat: Optional[str] = None) -> Dict[str, Any]:
    alerts = _build_all_alerts()
    if tingkat and tingkat.lower() != "semua":
        alerts = [a for a in alerts if str(a["tingkat"]).lower() == tingkat.lower()]
    return {"as_of": store.get_as_of_date().isoformat(), "peringatan": alerts}


@app.patch("/api/v1/alerts/{alert_id}")
def patch_alert(alert_id: str, req: AlertPatchRequest) -> Dict[str, Any]:
    alerts = _build_all_alerts()
    target = next((a for a in alerts if a["id"] == alert_id), None)
    if target and target["tingkat"] == "Kritis" and req.tunda_24_jam:
        raise HTTPException(
            status_code=400,
            detail="Peringatan tingkat Kritis tidak dapat disembunyikan atau ditunda sebelum ditangani.",
        )

    as_of = store.get_as_of_date()
    snooze_str = (as_of + timedelta(days=1)).isoformat() if req.tunda_24_jam else None
    with store._conn() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO alert_states (alert_key, status, snoozed_until, updated_at) VALUES (?, ?, ?, ?)",
            (alert_id, req.status, snooze_str, datetime.utcnow().isoformat()),
        )
    return {"id": alert_id, "status": req.status, "snoozed_until": snooze_str}


# --- F6: Shock Simulator ---
def _execute_scenario(req: ScenarioParams) -> Dict[str, Any]:
    ov = store.compute_full_stock_and_status()
    as_of = store.get_as_of_date()
    cfg = store.get_threshold_config()
    st = store.get_settings()
    ai_enabled = bool(st.get("ai_enabled", True))
    penduduk = int(store.get_population().get("total", 1800))
    comms = store.get_commodities_with_prices()

    stock_by_id = {c["id"]: float(c["stok_efektif"]) for c in ov["komoditas"]}
    cons_doc_by_id = {c["id"]: float(c["hari_bertahan"]) for c in ov["komoditas"]}

    # Scheduled harvests are active in Simulator (16.3)
    harvest_totals: Dict[str, float] = {}
    for h in store.get_scheduled_harvests():
        days_until = (h.tanggal_panen - as_of).days
        if 0 <= days_until <= req.durasi:
            harvest_totals[h.commodity_id] = harvest_totals.get(h.commodity_id, 0.0) + h.volume_kg

    sim = run_shock_scenario(
        commodities=comms,
        stock_by_id=stock_by_id,
        conservative_doc_by_id=cons_doc_by_id,
        penduduk=penduduk,
        as_of=as_of,
        delta_s=req.delta_s,
        delta_p=req.delta_p,
        delta_h=req.delta_h,
        delta_k=req.delta_k,
        durasi=req.durasi,
        harvest_by_comm_id=harvest_totals,
        baseline_score=ov["skor_ketahanan"],
        cfg=cfg,
    )

    # U2: Narrative summary validated against engine output
    ctx_summary = {
        "durasi": req.durasi,
        "komoditas_penentu": sim["komoditas_penentu_baru"]["nama"],
        "hari_bertahan": sim["komoditas_penentu_baru"]["hari_bertahan"],
        "tambahan_biaya_rp": sim["tambahan_biaya_rp"],
        "skor_sebelum": sim["skor_sebelum"].get("skor_total", 75.0),
        "skor_sesudah": sim["skor_sesudah"].get("skor_total", 75.0),
    }
    gen = llm_client.generate_validated(
        use_case="U2_scenario",
        context=ctx_summary,
        prompt=(
            f"Rangkum hasil simulasi guncangan {req.durasi} hari ini dalam 2 kalimat bahasa Indonesia. "
            f"Fakta: {json.dumps(ctx_summary)}"
        ),
        template_fn=lambda c: (
            f"Pada simulasi {c['durasi']} hari, titik terlemah desa berada pada {c['komoditas_penentu']} "
            f"({c['hari_bertahan']} hari) dengan Skor Ketahanan berubah dari {c['skor_sebelum']} menjadi {c['skor_sesudah']}. "
            f"Perkiraan tambahan anggaran belanja untuk menutup kekurangan stok adalah Rp {c['tambahan_biaya_rp']:,.0f}."
        ).replace(",", "."),
        ai_enabled=ai_enabled,
    )

    return {
        **sim,
        "nama": req.nama or "Skenario Simulasi",
        "narasi_ringkasan": gen["teks"],
        "sumber_narasi": gen["sumber"],
        "label_ai": gen["label_ai"],
    }


@app.get("/api/v1/scenarios/presets")
def get_scenario_presets() -> Dict[str, Any]:
    return {"presets": store._get_kv("scenario_presets", [])}


@app.post("/api/v1/scenarios/run")
def run_scenario_endpoint(req: ScenarioParams) -> Dict[str, Any]:
    return _execute_scenario(req)


@app.post("/api/v1/scenarios")
def save_scenario(req: ScenarioParams) -> Dict[str, Any]:
    res = _execute_scenario(req)
    scen_id = f"scen-{uuid.uuid4().hex[:10]}"
    now_iso = datetime.utcnow().isoformat()
    with store._conn() as conn:
        conn.execute(
            "INSERT INTO scenarios (id, nama, parameter_json, hasil_json, created_at) VALUES (?, ?, ?, ?, ?)",
            (
                scen_id,
                req.nama or "Skenario Tersimpan",
                json.dumps(res["parameter"], ensure_ascii=False),
                json.dumps(res, ensure_ascii=False),
                now_iso,
            ),
        )
    return {"id": scen_id, "created_at": now_iso, **res}


@app.get("/api/v1/scenarios")
def list_saved_scenarios() -> Dict[str, Any]:
    with store._conn() as conn:
        rows = conn.execute("SELECT * FROM scenarios ORDER BY created_at DESC").fetchall()
    items = []
    for r in rows:
        hasil = json.loads(r["hasil_json"])
        items.append({
            "id": r["id"],
            "nama": r["nama"],
            "parameter": json.loads(r["parameter_json"]),
            "komoditas_penentu_baru": hasil.get("komoditas_penentu_baru"),
            "tambahan_biaya_rp": hasil.get("tambahan_biaya_rp"),
            "skor_sesudah": hasil.get("skor_sesudah"),
            "created_at": r["created_at"],
        })
    return {"skenario": items}


@app.get("/api/v1/scenarios/{scenario_id}")
def get_saved_scenario(scenario_id: str) -> Dict[str, Any]:
    with store._conn() as conn:
        r = conn.execute("SELECT * FROM scenarios WHERE id = ?", (scenario_id,)).fetchone()
    if not r:
        raise HTTPException(status_code=404, detail="Skenario tidak ditemukan.")
    return {"id": r["id"], "nama": r["nama"], **json.loads(r["hasil_json"])}


# --- F7: Harvest Prediction (ML) ---
@app.get("/api/v1/harvest-plans")
def list_harvest_plans() -> Dict[str, Any]:
    active_ev = store.get_active_event()
    delta_h = float(active_ev["parameter"]["delta_h"]) if active_ev else 0.0
    comms = {c.id: c for c in store.get_commodities_with_prices()}

    with store._conn() as conn:
        rows = conn.execute("SELECT * FROM harvest_plans ORDER BY tanggal_tanam DESC").fetchall()

    plans = []
    for r in rows:
        c_obj = comms.get(r["commodity_id"])
        f_k = c_obj.ketergantungan_pupuk if c_obj else 0.7
        pred = predict_harvest_yield(
            komoditas=r["komoditas_tanam"],
            luas_ha=float(r["luas_ha"]),
            tanggal_tanam=date.fromisoformat(r["tanggal_tanam"]),
            varietas=r["varietas"],
            kondisi_pupuk=r["kondisi_pupuk"],
            sumber_air=r["sumber_air"],
            delta_h_shock=delta_h,
            ketergantungan_pupuk=f_k,
        )
        plans.append({
            "id": r["id"],
            "commodity_id": r["commodity_id"],
            "commodity_nama": c_obj.nama if c_obj else r["komoditas_tanam"],
            "komoditas_tanam": r["komoditas_tanam"],
            "luas_ha": float(r["luas_ha"]),
            "tanggal_tanam": r["tanggal_tanam"],
            "varietas": r["varietas"],
            "kondisi_pupuk": r["kondisi_pupuk"],
            "sumber_air": r["sumber_air"],
            "aktif_di_proyeksi": bool(r["aktif_di_proyeksi"]),
            "prediksi": pred,
        })

    return {
        "rencana_tanam": plans,
        "catatan_impor": "Tidak ada rencana tanam kedelai dan gandum di desa (menunjukkan ketergantungan impor).",
        "metadata_model": get_model_metadata(),
    }


@app.post("/api/v1/forecast/harvest")
def forecast_harvest_endpoint(req: HarvestForecastRequest) -> Dict[str, Any]:
    as_of = store.get_as_of_date()
    t_tanam = date.fromisoformat(req.tanggal_tanam[:10]) if req.tanggal_tanam else as_of
    active_ev = store.get_active_event()
    delta_h = float(active_ev["parameter"]["delta_h"]) if active_ev else 0.0
    return predict_harvest_yield(
        komoditas=req.komoditas,
        luas_ha=req.luas_ha,
        tanggal_tanam=t_tanam,
        varietas=req.varietas,
        kondisi_pupuk=req.kondisi_pupuk,
        sumber_air=req.sumber_air,
        delta_h_shock=delta_h,
    )


@app.post("/api/v1/harvest-plans")
def create_harvest_plan(req: HarvestPlanCreateRequest) -> Dict[str, Any]:
    as_of = store.get_as_of_date()
    t_tanam = date.fromisoformat(req.tanggal_tanam[:10]) if req.tanggal_tanam else as_of
    crop_to_comm = {
        "padi": "c-beras",
        "jagung": "c-jagung",
        "kedelai": "c-kedelai",
        "singkong": "c-singkong",
        "cabai_rawit": "c-cabai",
        "bawang_merah": "c-bawang",
    }
    cid = req.commodity_id or crop_to_comm.get(req.komoditas.lower(), "c-beras")
    pred = predict_harvest_yield(
        komoditas=req.komoditas,
        luas_ha=req.luas_ha,
        tanggal_tanam=t_tanam,
        varietas=req.varietas,
        kondisi_pupuk=req.kondisi_pupuk,
        sumber_air=req.sumber_air,
    )
    hp_id = f"hp-{uuid.uuid4().hex[:8]}"
    with store._conn() as conn:
        conn.execute(
            """
            INSERT INTO harvest_plans (
                id, village_id, commodity_id, komoditas_tanam, luas_ha,
                tanggal_tanam, varietas, kondisi_pupuk, sumber_air, aktif_di_proyeksi, prediksi_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                hp_id,
                "v-sidomulyo",
                cid,
                req.komoditas,
                req.luas_ha,
                t_tanam.isoformat(),
                pred["varietas"],
                req.kondisi_pupuk,
                req.sumber_air,
                1 if req.aktif_di_proyeksi else 0,
                json.dumps(pred, ensure_ascii=False),
            ),
        )
    if req.aktif_di_proyeksi:
        store.update_settings({"hitung_panen_terjadwal": True})
    return {"id": hp_id, "aktif_di_proyeksi": req.aktif_di_proyeksi, "prediksi": pred}


@app.patch("/api/v1/harvest-plans/{plan_id}")
def patch_harvest_plan(plan_id: str, req: HarvestPlanPatchRequest) -> Dict[str, Any]:
    with store._conn() as conn:
        row = conn.execute("SELECT * FROM harvest_plans WHERE id = ?", (plan_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Rencana tanam tidak ditemukan.")

        aktif = req.aktif_di_proyeksi if req.aktif_di_proyeksi is not None else bool(row["aktif_di_proyeksi"])
        pupuk = req.kondisi_pupuk or row["kondisi_pupuk"]
        luas = req.luas_ha if req.luas_ha is not None else float(row["luas_ha"])

        pred = predict_harvest_yield(
            komoditas=row["komoditas_tanam"],
            luas_ha=luas,
            tanggal_tanam=date.fromisoformat(row["tanggal_tanam"]),
            varietas=row["varietas"],
            kondisi_pupuk=pupuk,
            sumber_air=row["sumber_air"],
        )
        conn.execute(
            """
            UPDATE harvest_plans
            SET aktif_di_proyeksi = ?, kondisi_pupuk = ?, luas_ha = ?, prediksi_json = ?
            WHERE id = ?
            """,
            (1 if aktif else 0, pupuk, luas, json.dumps(pred, ensure_ascii=False), plan_id),
        )

    if req.aktif_di_proyeksi is not None:
        store.update_settings({"hitung_panen_terjadwal": bool(req.aktif_di_proyeksi)})

    return {"id": plan_id, "aktif_di_proyeksi": aktif, "prediksi": pred}


# --- F8: Prices & Global Signals ---
@app.get("/api/v1/prices/{commodity_id}")
def get_commodity_price_history(commodity_id: str) -> Dict[str, Any]:
    comms = store.get_commodities_with_prices()
    comm = next((c for c in comms if c.id == commodity_id or c.kode == commodity_id), comms[0])
    as_of = store.get_as_of_date()
    active_ev = store.get_active_event()
    sig_info = store.get_global_signals()

    uplift_full = 0.0
    uplift_7d = 0.0
    if active_ev:
        p = active_ev["parameter"]
        uplift_full = (1.0 + float(p["delta_p"]) * comm.eksposur_impor) * (
            1.0 + float(p["delta_k"]) * comm.eksposur_impor
        ) - 1.0
        uplift_7d = 0.35 * uplift_full

    series = generate_104w_price_series(
        kode=comm.kode,
        harga_acuan=comm.harga_acuan,
        as_of=as_of,
        active_event_uplift_7d=uplift_7d,
        active_event_uplift_full=uplift_full,
        days_since_event=7 if active_ev else 0,
    )
    fc = forecast_price_4_weeks(
        series_104w=series,
        as_of=as_of,
        eksposur_impor=comm.eksposur_impor,
        signal_intensity=float(sig_info["intensitas_rata_rata"]),
        event_active=bool(active_ev),
    )
    return {
        "commodity_id": comm.id,
        "kode": comm.kode,
        "nama": comm.nama,
        "satuan": comm.satuan,
        "eksposur_impor": comm.eksposur_impor,
        "riwayat_104_minggu": series,
        **fc,
    }


@app.get("/api/v1/forecast/price/{commodity_id}")
def get_commodity_price_forecast(commodity_id: str) -> Dict[str, Any]:
    return get_commodity_price_history(commodity_id)


@app.get("/api/v1/global/signals")
def get_global_signals_endpoint() -> Dict[str, Any]:
    sig = store.get_global_signals()
    ov = store.compute_full_stock_and_status()
    return {
        **sig,
        "skor_eksposur_global": ov["skor_ketahanan"]["skor_eksposur_global"],
    }


@app.get("/api/v1/global/events")
def get_global_events_endpoint() -> Dict[str, Any]:
    return {"peristiwa": store.get_global_events()}


# --- F9: Menu Gizi & PMT ---
@app.post("/api/v1/menus/generate")
async def generate_menu_endpoint(req: MenuGenerateRequest) -> Dict[str, Any]:
    ov = store.compute_full_stock_and_status()
    pop = store.get_population()
    raw_foods = store._get_kv("foods", [])
    foods = [FoodItemSpec(**f) for f in raw_foods]

    default_rec = {
        "balita": int(pop.get("balita", 140)),
        "ibu_hamil": int(pop.get("ibu_hamil_menyusui", 45)),
        "umum": int(pop.get("total", 1800)),
    }
    n_penerima = req.jumlah_penerima or default_rec.get(req.sasaran, 140)
    stock_by_cid = {c["id"]: float(c["stok_efektif"]) for c in ov["komoditas"]}
    demand_by_cid = {c["id"]: float(c["kebutuhan_harian"]) for c in ov["komoditas"]}

    plan = optimize_menu_plan(
        foods=foods,
        sasaran=req.sasaran,
        jumlah_penerima=n_penerima,
        durasi=req.durasi,
        prioritas=req.prioritas,
        stock_by_comm_id=stock_by_cid,
        daily_demand_by_comm_id=demand_by_cid,
        batas_stok_pct=req.batas_stok_pct,
    )

    menu_id = f"menu-{uuid.uuid4().hex[:10]}"
    now_iso = datetime.utcnow().isoformat()
    with store._conn() as conn:
        conn.execute(
            """
            INSERT INTO menus (
                id, sasaran, jumlah_penerima, durasi, prioritas, rencana_json, biaya_total, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                menu_id,
                req.sasaran,
                n_penerima,
                req.durasi,
                req.prioritas,
                json.dumps(plan, ensure_ascii=False),
                float(plan["biaya_total_rp"]),
                "draft",
                now_iso,
            ),
        )

    return {"id": menu_id, "status": "draft", "created_at": now_iso, **plan}


@app.get("/api/v1/menus")
def list_menus() -> Dict[str, Any]:
    with store._conn() as conn:
        rows = conn.execute("SELECT * FROM menus ORDER BY created_at DESC LIMIT 20").fetchall()
    out = []
    for r in rows:
        plan = json.loads(r["rencana_json"])
        out.append({
            "id": r["id"],
            "status": r["status"],
            "created_at": r["created_at"],
            **plan,
        })
    return {"menus": out}


@app.post("/api/v1/menus/{menu_id}/commit")
def commit_menu_usage(menu_id: str) -> Dict[str, Any]:
    """8.F9 Record outbound PMT stock transactions for tracked commodities in the menu."""
    with store._conn() as conn:
        row = conn.execute("SELECT * FROM menus WHERE id = ?", (menu_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Rencana menu tidak ditemukan.")
        if row["status"] == "tercatat":
            return {"id": menu_id, "status": "sudah_tercatat", "pesan": "Pemakaian bahan menu ini sudah dicatat."}
        plan = json.loads(row["rencana_json"])

    tx_created = []
    for d in plan.get("dampak_stok", []):
        qty = float(d["terpakai_kg"])
        if qty > 0:
            tx = store.record_stock_transaction({
                "id": f"tx-pmt-{menu_id}-{d['commodity_id']}",
                "commodity_id": d["commodity_id"],
                "warehouse_id": "wh-lumbung",
                "jenis": "keluar_pmt",
                "jumlah": qty,
                "catatan": f"Pemakaian PMT {plan['sasaran_label']} ({plan['durasi']} hari)",
            })
            tx_created.append(tx)

    with store._conn() as conn:
        conn.execute("UPDATE menus SET status = 'tercatat' WHERE id = ?", (menu_id,))

    return {
        "id": menu_id,
        "status": "tercatat",
        "transaksi_pmt": tx_created,
        "overview": store.compute_full_stock_and_status(),
    }


# --- F10: Village Network & Distribution ---
def _get_all_cluster_villages_data() -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    ov = store.compute_full_stock_and_status()
    own_v = store.get_village()
    cfg = store.get_threshold_config()
    comms_raw = ov["komoditas"]

    own_stock_by_kode = {c["kode"]: float(c["stok_efektif"]) for c in comms_raw}
    own_doc_by_kode = {c["kode"]: float(c["hari_bertahan"]) for c in comms_raw}
    own_worst = min(own_doc_by_kode.values()) if own_doc_by_kode else 30.0

    villages = [
        {
            "id": own_v["id"],
            "nama": own_v["nama"],
            "kecamatan": own_v["kecamatan"],
            "kabupaten": own_v["kabupaten"],
            "lat": float(own_v["lat"]),
            "lon": float(own_v["lon"]),
            "penduduk": int(own_v["jumlah_penduduk"]),
            "is_own": True,
            "catatan_peran": "Desa Kita (Pusat Pemantauan)",
            "doc_by_kode": own_doc_by_kode,
            "stock_by_kode": own_stock_by_kode,
            "hari_bertahan_terburuk": round(own_worst, 1),
            **classify_status(own_worst, cfg),
        }
    ]

    norma_by_kode = {c["kode"]: float(c["norma_per_kapita_hari"]) for c in comms_raw}
    for cv in store._get_kv("cluster_villages", []):
        pend = int(cv["penduduk"])
        doc_map = {k: float(v) for k, v in cv["doc_by_kode"].items()}
        stk_map = {
            k: round(doc_map.get(k, 25.0) * pend * norma_by_kode.get(k, 0.02), 1)
            for k in norma_by_kode
        }
        worst_doc = min(doc_map.values()) if doc_map else 25.0
        villages.append({
            "id": cv["id"],
            "nama": cv["nama"],
            "kecamatan": cv["kecamatan"],
            "kabupaten": cv["kabupaten"],
            "lat": float(cv["lat"]),
            "lon": float(cv["lon"]),
            "penduduk": pend,
            "is_own": False,
            "catatan_peran": cv.get("catatan_peran", ""),
            "doc_by_kode": doc_map,
            "stock_by_kode": stk_map,
            "hari_bertahan_terburuk": round(worst_doc, 1),
            **classify_status(worst_doc, cfg),
        })

    return villages, comms_raw


@app.get("/api/v1/network/villages")
async def get_network_villages() -> Dict[str, Any]:
    villages, comms_raw = _get_all_cluster_villages_data()
    cfg = store.get_threshold_config()
    opt = optimize_village_distribution(
        villages=villages,
        commodities=comms_raw,
        target_hari=cfg.target_hari,
        batas_donor_hari=cfg.batas_donor,
    )
    return {
        "desa": villages,
        "target_hari": cfg.target_hari,
        "batas_donor_hari": cfg.batas_donor,
        "tabel_surplus_defisit": opt["tabel_surplus_defisit"],
    }


@app.post("/api/v1/network/optimize")
async def run_network_optimize(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    villages, comms_raw = _get_all_cluster_villages_data()
    cfg = store.get_threshold_config()
    tarif = float((payload or {}).get("tarif_per_kg_km", 2.5))
    return optimize_village_distribution(
        villages=villages,
        commodities=comms_raw,
        target_hari=cfg.target_hari,
        batas_donor_hari=cfg.batas_donor,
        tarif_per_kg_km=tarif,
        only_to_own_village=True,
    )


@app.get("/api/v1/transfers")
def list_transfers() -> Dict[str, Any]:
    with store._conn() as conn:
        rows = conn.execute(
            "SELECT * FROM transfers WHERE arah = 'keluar_permintaan' ORDER BY created_at DESC"
        ).fetchall()
    items = [
        {
            **dict(r),
            "status_log": json.loads(r["status_log_json"]),
        }
        for r in rows
    ]
    return {"transfers": items}


@app.get("/api/v1/transfers/incoming")
def list_incoming_transfers() -> Dict[str, Any]:
    ov = store.compute_full_stock_and_status()
    doc_by_id = {c["id"]: float(c["hari_bertahan"]) for c in ov["komoditas"]}
    demand_by_id = {c["id"]: float(c["kebutuhan_harian"]) for c in ov["komoditas"]}
    stock_by_id = {c["id"]: float(c["stok_efektif"]) for c in ov["komoditas"]}
    cfg = store.get_threshold_config()

    with store._conn() as conn:
        rows = conn.execute(
            "SELECT * FROM transfers WHERE arah = 'masuk' ORDER BY created_at DESC"
        ).fetchall()

    items = []
    for r in rows:
        cid = r["commodity_id"]
        s_now = stock_by_id.get(cid, 0.0)
        d_now = demand_by_id.get(cid, 1.0)
        qty = float(r["jumlah"])
        doc_after = (s_now - qty) / d_now if d_now > 0 else 0.0
        aman_disetujui = doc_after >= cfg.batas_donor
        items.append({
            **dict(r),
            "doc_desa_kita_sebelum": round(doc_by_id.get(cid, 0.0), 1),
            "doc_desa_kita_sesudah": round(doc_after, 1),
            "batas_aman_donor_hari": cfg.batas_donor,
            "aman_untuk_disetujui": aman_disetujui,
            "status_log": json.loads(r["status_log_json"]),
        })
    return {"permintaan_masuk": items}


@app.post("/api/v1/transfers")
def create_transfer_request(req: TransferCreateRequest) -> Dict[str, Any]:
    tr_id = f"tr-{uuid.uuid4().hex[:8]}"
    now_iso = store.get_settings().get("jam_virtual", datetime.utcnow().isoformat())
    draf = req.draf_pesan or (
        f"Yth. Pengurus Pangan {req.dari_village_nama}, kami dari {req.ke_village_nama} mengajukan permohonan "
        f"bantuan distribusi {req.commodity_nama} sebesar {req.jumlah:,.0f} {req.satuan} "
        f"(jarak tempuh {req.jarak_km:.1f} km, estimasi biaya angkut Rp {req.biaya_angkut:,.0f})."
    ).replace(",", ".")

    log = [{"status": "Diajukan", "waktu": now_iso}]
    with store._conn() as conn:
        conn.execute(
            """
            INSERT INTO transfers (
                id, dari_village_id, dari_village_nama, ke_village_id, ke_village_nama,
                commodity_id, commodity_nama, satuan, jumlah, jarak_km, biaya_angkut,
                status, draf_pesan, arah, status_log_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                tr_id,
                req.dari_village_id,
                req.dari_village_nama,
                req.ke_village_id,
                req.ke_village_nama,
                req.commodity_id,
                req.commodity_nama,
                req.satuan,
                req.jumlah,
                req.jarak_km,
                req.biaya_angkut,
                "Diajukan",
                draf,
                "keluar_permintaan",
                json.dumps(log, ensure_ascii=False),
                now_iso,
            ),
        )
    return {"id": tr_id, "status": "Diajukan", "draf_pesan": draf, "status_log": log}


@app.patch("/api/v1/transfers/{transfer_id}")
def update_transfer_status(transfer_id: str, req: TransferPatchRequest) -> Dict[str, Any]:
    now_iso = store.get_settings().get("jam_virtual", datetime.utcnow().isoformat())
    with store._conn() as conn:
        row = conn.execute("SELECT * FROM transfers WHERE id = ?", (transfer_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Data transfer tidak ditemukan.")

        old_status = row["status"]
        arah = row["arah"]
        cid = row["commodity_id"]
        qty = float(row["jumlah"])
        log = json.loads(row["status_log_json"])

    # If incoming request is approved by our village, verify donor 21-day safety limit (8.F10)
    if arah == "masuk" and req.status in ("Disetujui", "Dikirim", "Diterima") and old_status == "Diajukan":
        ov = store.compute_full_stock_and_status()
        cfg = store.get_threshold_config()
        c_item = next((c for c in ov["komoditas"] if c["id"] == cid), None)
        if c_item:
            s_after = float(c_item["stok_efektif"]) - qty
            d_k = float(c_item["kebutuhan_harian"])
            doc_after = s_after / d_k if d_k > 0 else 0.0
            if doc_after < cfg.batas_donor:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Permintaan tidak dapat disetujui karena akan menurunkan cadangan {c_item['nama']} "
                        f"desa kita menjadi {doc_after:.1f} hari (di bawah batas aman donor {cfg.batas_donor:.0f} hari)."
                    ),
                )
            store.record_stock_transaction({
                "id": f"tx-tr-out-{transfer_id}",
                "commodity_id": cid,
                "warehouse_id": "wh-lumbung",
                "jenis": "keluar_transfer",
                "jumlah": qty,
                "catatan": f"Transfer keluar ke {row['ke_village_nama']}",
            })

    # If our outgoing request reaches 'Diterima', automatically add inbound stock (8.F10)
    if arah == "keluar_permintaan" and req.status == "Diterima" and old_status != "Diterima":
        store.record_stock_transaction({
            "id": f"tx-tr-in-{transfer_id}",
            "commodity_id": cid,
            "warehouse_id": "wh-lumbung",
            "jenis": "masuk_transfer",
            "jumlah": qty,
            "catatan": f"Bantuan distribusi diterima dari {row['dari_village_nama']}",
        })
        # Also deduct donor stock in cluster_villages state
        cvs = store._get_kv("cluster_villages", [])
        ov = store.compute_full_stock_and_status()
        c_item = next((c for c in ov["komoditas"] if c["id"] == cid), None)
        if c_item:
            kode = c_item["kode"]
            norma = float(c_item["norma_per_kapita_hari"])
            for cv in cvs:
                if cv["id"] == row["dari_village_id"]:
                    d_donor = float(cv["penduduk"]) * norma
                    old_doc = float(cv["doc_by_kode"].get(kode, 30.0))
                    new_doc = max(21.0, round(old_doc - (qty / max(1.0, d_donor)), 1))
                    cv["doc_by_kode"][kode] = new_doc
            with store._conn() as conn:
                store._set_kv(conn, "cluster_villages", cvs)

    log.append({"status": req.status, "waktu": now_iso})
    with store._conn() as conn:
        conn.execute(
            "UPDATE transfers SET status = ?, status_log_json = ? WHERE id = ?",
            (req.status, json.dumps(log, ensure_ascii=False), transfer_id),
        )

    return {
        "id": transfer_id,
        "status": req.status,
        "status_log": log,
        "overview": store.compute_full_stock_and_status(),
    }


# --- F11: Assistant SIAPANSA (Tool-Calling + SSE) ---
def _dispatch_assistant_tool(question: str) -> Tuple[str, Dict[str, Any], str]:
    q = question.lower()
    ov = store.compute_full_stock_and_status()

    if any(k in q for k in ("bantu", "desa mana", "donor", "distribusi", "tetangga", "karangsari", "wonokerto")):
        villages, comms_raw = _get_all_cluster_villages_data()
        cfg = store.get_threshold_config()
        opt = optimize_village_distribution(
            villages=villages,
            commodities=comms_raw,
            target_hari=cfg.target_hari,
            batas_donor_hari=cfg.batas_donor,
        )
        usulan = opt["usulan_transfer"]
        if "kedelai" in q:
            usulan = [u for u in usulan if u["commodity_kode"] == "kedelai"] or usulan
        elif "terigu" in q:
            usulan = [u for u in usulan if u["commodity_kode"] == "terigu"] or usulan

        ringkas = [
            f"{u['dari_village_nama']} dapat mengirim {u['jumlah_kg']:.0f} kg {u['commodity_nama']} "
            f"(jarak {u['jarak_km']} km, biaya angkut Rp {u['biaya_angkut_rp']:,.0f})"
            for u in usulan
        ]
        teks = (
            "Berdasarkan optimasi jaringan Gugus Desa (batas aman donor 21 hari): "
            + ("; ".join(ringkas) if ringkas else "belum ada desa donor yang memiliki surplus di atas 21 hari.")
            + ". (Data simulasi prototipe)."
        ).replace(",", ".")
        return ("suggest_transfers", {"usulan_transfer": usulan, "batas_donor_hari": 21}, teks)

    if any(k in q for k in ("impor terganggu", "simulasi", "skenario", "60%", "guncangan", "kalau")):
        scen = _execute_scenario(ScenarioParams(delta_s=0.60, delta_p=0.40, delta_k=0.10, delta_h=0.20, durasi=60))
        terigu = next((c for c in scen["per_komoditas"] if c["kode"] == "terigu"), {})
        kedelai = next((c for c in scen["per_komoditas"] if c["kode"] == "kedelai"), {})
        data = {
            "durasi_hari": 60,
            "terigu_hari_bertahan": terigu.get("doc_skenario", 24.2),
            "terigu_kekurangan_kg": terigu.get("kekurangan_skenario_kg", 1199.0),
            "kedelai_hari_bertahan": kedelai.get("doc_skenario", 24.7),
            "kedelai_kekurangan_kg": kedelai.get("kekurangan_skenario_kg", 446.0),
            "tambahan_biaya_rp": scen["tambahan_biaya_rp"],
        }
        teks = (
            f"Jika pasokan impor terganggu 60% selama 60 hari, Hari Bertahan terigu dengan pasokan rutin turun menjadi "
            f"{data['terigu_hari_bertahan']} hari (kekurangan {data['terigu_kekurangan_kg']:.0f} kg) dan kedelai menjadi "
            f"{data['kedelai_hari_bertahan']} hari (kekurangan {data['kedelai_kekurangan_kg']:.0f} kg). "
            f"Disarankan substitusi ke singkong/jagung lokal dan meminta bantuan Desa Karangsari. (Data simulasi)."
        )
        return ("run_scenario", data, teks)

    if any(k in q for k in ("menu", "pmt", "balita", "posyandu", "gizi")):
        raw_foods = store._get_kv("foods", [])
        foods = [FoodItemSpec(**f) for f in raw_foods]
        stock_by_cid = {c["id"]: float(c["stok_efektif"]) for c in ov["komoditas"]}
        demand_by_cid = {c["id"]: float(c["kebutuhan_harian"]) for c in ov["komoditas"]}
        plan = optimize_menu_plan(
            foods=foods,
            sasaran="balita",
            jumlah_penerima=140,
            durasi=7,
            prioritas="hindari_impor",
            stock_by_comm_id=stock_by_cid,
            daily_demand_by_comm_id=demand_by_cid,
        )
        h1 = plan["rencana_harian"][0]
        bahan_str = ", ".join(f"{b['nama']} ({b['gram_per_porsi']}g)" for b in h1["bahan"])
        data = {
            "sasaran": plan["sasaran_label"],
            "durasi_hari": 7,
            "biaya_rata_per_porsi_rp": plan["biaya_rata_per_porsi_rp"],
            "biaya_total_rp": plan["biaya_total_rp"],
            "contoh_hari_1": h1["nama_menu"],
            "energi_kkal": h1["energi_per_porsi_kkal"],
            "protein_g": h1["protein_per_porsi_g"],
        }
        teks = (
            f"Rencana menu PMT Balita 7 hari tanpa bahan impor berhasil disusun (rata-rata Rp {data['biaya_rata_per_porsi_rp']:,.0f}/porsi). "
            f"Contoh Hari 1: {bahan_str} menghasilkan {data['energi_kkal']} kkal dan {data['protein_g']} g protein. "
            f"Panduan umum; konsultasikan dengan bidan atau puskesmas. (Data simulasi)."
        ).replace(",", ".")
        return ("plan_menu", data, teks)

    if any(k in q for k in ("peringatan", "bahaya", "risiko", "waspada", "siaga")):
        alerts = _build_all_alerts(ov)[:3]
        data = {
            "jumlah_peringatan": len(alerts),
            "peringatan_utama": [
                {"judul": a["judul"], "tingkat": a["tingkat"], "pemicu": a["data_pemicu"]}
                for a in alerts
            ],
        }
        ringkas = "; ".join(f"[{a['tingkat']}] {a['judul']}" for a in alerts)
        teks = f"Saat ini terdapat {len(alerts)} peringatan utama: {ringkas}. (Data simulasi)."
        return ("list_alerts", data, teks)

    # Default: get_status & get_stock
    data = {
        "hari_bertahan_pokok": ov["pool_pokok"]["hari_bertahan"],
        "hari_bertahan_protein": ov["pool_protein"]["hari_bertahan"],
        "titik_terlemah": ov["titik_terlemah"]["nama"],
        "hari_bertahan_terlemah": ov["titik_terlemah"]["hari_bertahan"],
        "skor_ketahanan": ov["skor_ketahanan"]["skor_total"],
    }
    teks = (
        f"Saat ini cadangan pangan pokok Desa Sidomulyo bertahan {data['hari_bertahan_pokok']} hari (Aman), "
        f"kelompok protein bertahan {data['hari_bertahan_protein']} hari (Waspada), dan titik terlemah adalah "
        f"{data['titik_terlemah']} ({data['hari_bertahan_terlemah']} hari) dengan Skor Ketahanan {data['skor_ketahanan']}. "
        f"(Data simulasi)."
    )
    return ("get_status", data, teks)


@app.post("/api/v1/assistant/chat")
async def assistant_chat_endpoint(req: ChatRequest):
    st = store.get_settings()
    res = llm_client.answer_assistant_query(
        question=req.pesan,
        tool_dispatcher=_dispatch_assistant_tool,
        ai_enabled=bool(st.get("ai_enabled", True)),
    )

    if req.stream:
        async def event_stream():
            words = res["jawaban"].split(" ")
            chunk_size = 4
            for i in range(0, len(words), chunk_size):
                piece = " ".join(words[i : i + chunk_size]) + (" " if i + chunk_size < len(words) else "")
                yield f"data: {json.dumps({'type': 'token', 'content': piece}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'response': res}, ensure_ascii=False)}\n\n"

        return StreamingResponse(event_stream(), media_type="text/event-stream")

    return res


# --- F12: Reports (Preview & Public Share Token) ---
def _build_report_snapshot(periode: int = 30) -> Dict[str, Any]:
    ov = store.compute_full_stock_and_status()
    alerts = _build_all_alerts(ov)[:3]
    scens = list_saved_scenarios()["skenario"]
    menus = list_menus()["menus"]
    proj = get_status_projection(commodity="c-beras", days=periode)["proyeksi"]

    ringkasan_naratif = (
        f"Laporan Ketahanan Pangan {store.get_village()['nama']} (Periode {periode} Hari, per {ov['as_of']}): "
        f"Cadangan pangan pokok desa mampu bertahan {ov['pool_pokok']['hari_bertahan']} hari ({ov['pool_pokok']['status']}), "
        f"sedangkan cadangan protein bertahan {ov['pool_protein']['hari_bertahan']} hari ({ov['pool_protein']['status']}). "
        f"Titik terlemah saat ini adalah {ov['titik_terlemah']['nama']} ({ov['titik_terlemah']['hari_bertahan']} hari) "
        f"dengan Skor Ketahanan total {ov['skor_ketahanan']['skor_total']} dari 100."
    )

    teks_wa = (
        f"*LAPORAN SIAPANSA - {store.get_village()['nama'].upper()}*\n"
        f"Tanggal: {ov['as_of']} (Data Simulasi)\n"
        f"• Pangan Pokok: *{ov['pool_pokok']['hari_bertahan']} hari* ({ov['pool_pokok']['status']})\n"
        f"• Protein: *{ov['pool_protein']['hari_bertahan']} hari* ({ov['pool_protein']['status']})\n"
        f"• Titik Terlemah: *{ov['titik_terlemah']['nama']} ({ov['titik_terlemah']['hari_bertahan']} hari)*\n"
        f"• Skor Ketahanan: *{ov['skor_ketahanan']['skor_total']}/100*"
    )

    return {
        "desa": store.get_village(),
        "periode_hari": periode,
        "tanggal_cetak": ov["as_of"],
        "label_data": "Data simulasi untuk prototipe — Tidak memuat data pribadi warga",
        "ringkasan_naratif": ringkasan_naratif,
        "pool_pokok": ov["pool_pokok"],
        "pool_protein": ov["pool_protein"],
        "titik_terlemah": ov["titik_terlemah"],
        "skor_ketahanan": ov["skor_ketahanan"],
        "komoditas": ov["komoditas"],
        "tiga_risiko_utama": alerts,
        "skenario_tersimpan": scens[:2],
        "menu_pmt_terakhir": menus[0] if menus else None,
        "proyeksi_beras": proj,
        "teks_whatsapp": teks_wa,
    }


@app.post("/api/v1/reports/preview")
def preview_report(req: ReportRequest) -> Dict[str, Any]:
    return _build_report_snapshot(req.periode)


@app.post("/api/v1/reports/share")
def share_report(req: ReportRequest) -> Dict[str, Any]:
    snapshot = _build_report_snapshot(req.periode)
    token = secrets.token_urlsafe(16)
    now = datetime.utcnow()
    expires = (now + timedelta(days=7)).isoformat()
    with store._conn() as conn:
        conn.execute(
            "INSERT INTO report_shares (token, periode, snapshot_json, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
            (token, req.periode, json.dumps(snapshot, ensure_ascii=False), expires, now.isoformat()),
        )
    return {
        "token": token,
        "url_publik": f"/laporan-publik/{token}",
        "expires_at": expires,
        "snapshot": snapshot,
    }


@app.get("/api/v1/public/reports/{token}")
def get_public_report(token: str) -> Dict[str, Any]:
    with store._conn() as conn:
        row = conn.execute("SELECT * FROM report_shares WHERE token = ?", (token,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Tautan laporan publik tidak ditemukan.")
    if row["expires_at"] < datetime.utcnow().isoformat():
        raise HTTPException(status_code=410, detail="Tautan laporan publik telah kedaluwarsa (berlaku 7 hari).")
    return {
        "token": row["token"],
        "expires_at": row["expires_at"],
        "snapshot": json.loads(row["snapshot_json"]),
    }


# --- F14: Demo Mode & Story Controls ---
@app.post("/api/v1/demo/advance")
def demo_advance_time(req: DemoAdvanceRequest) -> Dict[str, Any]:
    ov = store.advance_virtual_clock(req.days)
    return {"pesan": f"Jam virtual dimajukan +{req.days} hari.", "overview": ov}


@app.post("/api/v1/demo/event")
def demo_trigger_event(req: DemoEventRequest) -> Dict[str, Any]:
    events = store.trigger_global_event(req.event_id, req.aktif)
    ov = store.compute_full_stock_and_status()
    alerts = _build_all_alerts(ov)
    return {
        "peristiwa": events,
        "overview": ov,
        "peringatan": alerts,
    }


@app.post("/api/v1/demo/approve-transfer")
def demo_approve_transfer(req: DemoApproveTransferRequest) -> Dict[str, Any]:
    with store._conn() as conn:
        if req.transfer_id:
            row = conn.execute("SELECT * FROM transfers WHERE id = ?", (req.transfer_id,)).fetchone()
        else:
            row = conn.execute(
                "SELECT * FROM transfers WHERE arah = 'keluar_permintaan' AND status != 'Diterima' ORDER BY created_at DESC LIMIT 1"
            ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Tidak ada permintaan transfer aktif untuk disetujui.")

    tid = row["id"]
    update_transfer_status(tid, TransferPatchRequest(status="Disetujui"))
    update_transfer_status(tid, TransferPatchRequest(status="Dikirim"))
    final_res = update_transfer_status(tid, TransferPatchRequest(status="Diterima"))
    return {
        "pesan": f"Permintaan transfer {row['commodity_nama']} dari {row['dari_village_nama']} disetujui dan diterima otomatis.",
        **final_res,
    }


@app.post("/api/v1/demo/reset")
def demo_reset() -> Dict[str, Any]:
    store.reset_to_seed()
    return {
        "pesan": "Seluruh data berhasil dikembalikan ke kondisi awal (seed).",
        "overview": store.compute_full_stock_and_status(),
    }


@app.post("/api/v1/demo/load-story")
def demo_load_story(req: DemoStoryRequest) -> Dict[str, Any]:
    store.reset_to_seed()
    if req.story_step == "krisis_gandum":
        store.trigger_global_event("evt-konflik-gandum", True)
        _execute_scenario(ScenarioParams(
            nama="Konflik Jalur Gandum dan Pupuk",
            delta_s=0.60,
            delta_p=0.40,
            delta_k=0.10,
            delta_h=0.20,
            durasi=60,
        ))
    return {
        "pesan": f"Skenario cerita '{req.story_step}' berhasil dimuat.",
        "overview": store.compute_full_stock_and_status(),
    }
