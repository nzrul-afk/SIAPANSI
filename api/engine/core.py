from __future__ import annotations
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional, Tuple


@dataclass
class BatchInput:
    id: str
    commodity_id: str
    warehouse_id: str
    jumlah_sisa: float
    tanggal_masuk: date
    expiry_date: Optional[date] = None


@dataclass
class CommodityInput:
    id: str
    kode: str
    nama: str
    satuan: str
    kelompok: str  # pokok | protein | pelengkap
    norma_per_kapita_hari: float
    eksposur_impor: float
    ketergantungan_pupuk: float
    porsi_pasokan_rutin: float
    umur_simpan_hari: int
    harga_acuan: float
    kkal_per_unit: float
    protein_g_per_unit: float
    harga_sekarang: Optional[float] = None
    kenaikan_harga_7d_pct: float = 0.0
    kenaikan_harga_30d_pct: float = 0.0
    prediksi_naik_4w_pct: float = 0.0


@dataclass
class HarvestScheduleInput:
    commodity_id: str
    tanggal_panen: date
    volume_kg: float
    aktif: bool = False


@dataclass
class ThresholdConfig:
    aman: float = 21.0
    waspada: float = 14.0
    siaga: float = 7.0
    kritis: float = 0.0
    bawah_72_jam: float = 3.0
    target_hari: float = 30.0
    batas_donor: float = 21.0


def compute_daily_demand(penduduk: int, norma_per_kapita_hari: float) -> float:
    """9.1 D_k = Penduduk * norma_k"""
    return max(0.0, float(penduduk) * float(norma_per_kapita_hari))


def get_effective_batches(batches: List[BatchInput], as_of: date) -> List[BatchInput]:
    """Return unexpired batches sorted by FEFO (earliest expiry first)."""
    valid = [
        BatchInput(
            id=b.id,
            commodity_id=b.commodity_id,
            warehouse_id=b.warehouse_id,
            jumlah_sisa=float(b.jumlah_sisa),
            tanggal_masuk=b.tanggal_masuk,
            expiry_date=b.expiry_date,
        )
        for b in batches
        if b.jumlah_sisa > 1e-9 and (b.expiry_date is None or b.expiry_date > as_of)
    ]
    valid.sort(key=lambda b: (b.expiry_date or date(9999, 12, 31), b.tanggal_masuk))
    return valid


def compute_effective_stock(batches: List[BatchInput], as_of: date) -> float:
    """9.2 S_k = sum of unexpired batches on as_of."""
    return sum(b.jumlah_sisa for b in get_effective_batches(batches, as_of))


def compute_expiring_soon_stock(batches: List[BatchInput], as_of: date, within_days: int = 7) -> float:
    """Sum of effective stock expiring within `within_days` days."""
    limit_date = as_of + timedelta(days=within_days)
    return sum(
        b.jumlah_sisa
        for b in get_effective_batches(batches, as_of)
        if b.expiry_date is not None and as_of < b.expiry_date <= limit_date
    )


def simulate_fefo_doc(
    batches: List[BatchInput],
    daily_demand: float,
    as_of: date,
    horizon: int = 180,
    scheduled_harvests: Optional[List[HarvestScheduleInput]] = None,
    include_harvest: bool = False,
) -> Tuple[float, bool, List[Dict[str, float]]]:
    """
    9.2 Conservative Days of Coverage (DoC_k) using daily FEFO simulation up to H=180.
    If no batch expires before being consumed and no harvest is added, DoC_k == S_k / D_k.
    Returns: (doc_days, exceeds_horizon, daily_projection)
    """
    eff_batches = get_effective_batches(batches, as_of)
    total_eff = sum(b.jumlah_sisa for b in eff_batches)
    if daily_demand <= 1e-9:
        return float(horizon), True, [{"day": d, "stock": round(total_eff, 2)} for d in range(horizon + 1)]

    # Check if any batch expires before total_eff / daily_demand when no harvest is included
    harvest_map: Dict[date, float] = {}
    if include_harvest and scheduled_harvests:
        for h in scheduled_harvests:
            if h.aktif and h.tanggal_panen >= as_of and h.volume_kg > 0:
                harvest_map[h.tanggal_panen] = harvest_map.get(h.tanggal_panen, 0.0) + h.volume_kg

    # Fast exact path when no batch expires early and no harvest is injected
    earliest_expiry = min((b.expiry_date for b in eff_batches if b.expiry_date is not None), default=None)
    naive_doc = total_eff / daily_demand
    no_early_expiry = earliest_expiry is None or (earliest_expiry - as_of).days >= naive_doc

    sim_batches = [
        {
            "sisa": b.jumlah_sisa,
            "expiry": b.expiry_date or (as_of + timedelta(days=3650)),
        }
        for b in eff_batches
    ]

    projection: List[Dict[str, float]] = [{"day": 0, "stock": round(total_eff, 2)}]
    days_covered = 0.0
    depleted = False

    for day_idx in range(1, horizon + 1):
        curr_date = as_of + timedelta(days=day_idx)
        # Remove batches that expired prior to or at start of day if expiry < curr_date
        sim_batches = [b for b in sim_batches if b["expiry"] >= curr_date and b["sisa"] > 1e-9]

        if curr_date in harvest_map:
            sim_batches.append({
                "sisa": harvest_map[curr_date],
                "expiry": curr_date + timedelta(days=180),
            })
            sim_batches.sort(key=lambda x: x["expiry"])

        avail = sum(b["sisa"] for b in sim_batches)
        if avail <= 1e-9:
            depleted = True
            projection.append({"day": day_idx, "stock": 0.0})
            continue

        if not depleted:
            if avail >= daily_demand:
                rem = daily_demand
                for b in sim_batches:
                    take = min(b["sisa"], rem)
                    b["sisa"] -= take
                    rem -= take
                    if rem <= 1e-9:
                        break
                days_covered += 1.0
            else:
                days_covered += avail / daily_demand
                for b in sim_batches:
                    b["sisa"] = 0.0
                depleted = True

        end_stock = sum(b["sisa"] for b in sim_batches if b["expiry"] > curr_date)
        projection.append({"day": day_idx, "stock": round(max(0.0, end_stock), 2)})

    if no_early_expiry and not harvest_map:
        exact_doc = naive_doc
        exceeds = exact_doc > horizon
        return (round(min(float(horizon), exact_doc), 2), exceeds, projection)

    exceeds = not depleted and sum(b["sisa"] for b in sim_batches) > 1e-9
    return (round(days_covered, 2), exceeds, projection)


def classify_status(doc: float, cfg: Optional[ThresholdConfig] = None) -> Dict[str, object]:
    """9.4 Ambang status."""
    c = cfg or ThresholdConfig()
    if doc >= c.aman:
        status = "Aman"
        level = "aman"
    elif doc >= c.waspada:
        status = "Waspada"
        level = "waspada"
    elif doc >= c.siaga:
        status = "Siaga"
        level = "siaga"
    else:
        status = "Kritis"
        level = "kritis"

    return {
        "status": status,
        "level": level,
        "bawah_72_jam": doc < c.bawah_72_jam,
        "progress_target_pct": round(min(100.0, (doc / max(1.0, c.target_hari)) * 100.0), 1),
    }


def compute_pools_and_weakest(
    commodities: List[CommodityInput],
    stock_by_id: Dict[str, float],
    doc_by_id: Dict[str, float],
    penduduk: int,
    cfg: Optional[ThresholdConfig] = None,
) -> Dict[str, object]:
    """
    9.3 Hari Bertahan per kelompok pangan (pool) & Titik Terlemah.
    - Pool Pokok (energi): sum(S_k * kkal_k) / sum(D_k * kkal_k)
    - Pool Protein: sum(S_k * protein_k) / sum(D_k * protein_k)
    - Pool Pelengkap: sum(S_k * kkal_k) / sum(D_k * kkal_k) (or simple aggregate)
    """
    c = cfg or ThresholdConfig()
    pokok_num = 0.0
    pokok_den = 0.0
    prot_num = 0.0
    prot_den = 0.0
    pel_num = 0.0
    pel_den = 0.0

    weakest_comm = None
    weakest_doc = float("inf")

    for comm in commodities:
        s_k = stock_by_id.get(comm.id, 0.0)
        d_k = compute_daily_demand(penduduk, comm.norma_per_kapita_hari)
        doc_k = doc_by_id.get(comm.id, 0.0)

        if doc_k < weakest_doc:
            weakest_doc = doc_k
            weakest_comm = comm

        if comm.kelompok == "pokok":
            pokok_num += s_k * comm.kkal_per_unit
            pokok_den += d_k * comm.kkal_per_unit
        elif comm.kelompok == "protein":
            prot_num += s_k * comm.protein_g_per_unit
            prot_den += d_k * comm.protein_g_per_unit
        else:
            weight = comm.kkal_per_unit if comm.kkal_per_unit > 0 else 1000.0
            pel_num += s_k * weight
            pel_den += d_k * weight

    doc_pokok = round(pokok_num / pokok_den, 1) if pokok_den > 0 else 0.0
    doc_protein = round(prot_num / prot_den, 1) if prot_den > 0 else 0.0
    doc_pelengkap = round(pel_num / pel_den, 1) if pel_den > 0 else 0.0

    return {
        "pool_pokok": {
            "hari_bertahan": doc_pokok,
            **classify_status(doc_pokok, c),
        },
        "pool_protein": {
            "hari_bertahan": doc_protein,
            **classify_status(doc_protein, c),
        },
        "pool_pelengkap": {
            "hari_bertahan": doc_pelengkap,
            **classify_status(doc_pelengkap, c),
        },
        "titik_terlemah": {
            "commodity_id": weakest_comm.id if weakest_comm else "",
            "kode": weakest_comm.kode if weakest_comm else "",
            "nama": weakest_comm.nama if weakest_comm else "",
            "hari_bertahan": round(weakest_doc, 1) if weakest_comm else 0.0,
            **(classify_status(weakest_doc, c) if weakest_comm else {}),
        },
    }


def compute_resilience_score(
    commodities: List[CommodityInput],
    doc_pokok: float,
    doc_protein: float,
    doc_pelengkap: float,
    doc_terlemah: float,
    signal_intensity: float = 0.20,
    pmt_coverage: float = 0.78,
    target_hari: float = 30.0,
    weights: Optional[Dict[str, float]] = None,
) -> Dict[str, float]:
    """
    9.6 Skor Ketahanan (0-100):
    Skor = 0.4 * Ketersediaan + 0.3 * Akses + 0.3 * Pemanfaatan
    """
    w = weights or {"ketersediaan": 0.4, "akses": 0.3, "pemanfaatan": 0.3}
    t = max(1.0, float(target_hari))

    # 1. Ketersediaan
    k1 = min(1.0, doc_pokok / t)
    k2 = min(1.0, doc_protein / t)
    k3 = min(1.0, doc_terlemah / t)
    ketersediaan = 100.0 * ((k1 + k2 + k3) / 3.0)

    # 2. Akses
    total_exp = sum(c.norma_per_kapita_hari * (c.harga_sekarang or c.harga_acuan) for c in commodities)
    if total_exp <= 0:
        indeks_harga = 0.0
        skor_eksposur_global = 0.0
    else:
        weighted_price_rise = 0.0
        weighted_import_exp = 0.0
        for c in commodities:
            exp_w = (c.norma_per_kapita_hari * (c.harga_sekarang or c.harga_acuan)) / total_exp
            rise_ratio = max(0.0, c.kenaikan_harga_30d_pct / 30.0)
            weighted_price_rise += exp_w * min(1.0, rise_ratio)
            weighted_import_exp += exp_w * c.eksposur_impor * max(0.0, min(1.0, signal_intensity))

        indeks_harga = min(1.0, weighted_price_rise) * 100.0
        skor_eksposur_global = min(1.0, weighted_import_exp) * 100.0

    akses = max(0.0, min(100.0, 100.0 - (0.5 * indeks_harga + 0.5 * skor_eksposur_global)))

    # 3. Pemanfaatan
    groups_above_7 = sum(1 for g_doc in (doc_pokok, doc_protein, doc_pelengkap) if g_doc >= 7.0)
    keragaman = groups_above_7 / 3.0
    p1 = min(1.0, doc_protein / t)
    p3 = max(0.0, min(1.0, pmt_coverage))
    pemanfaatan = 100.0 * ((p1 + keragaman + p3) / 3.0)

    total = (
        w.get("ketersediaan", 0.4) * ketersediaan
        + w.get("akses", 0.3) * akses
        + w.get("pemanfaatan", 0.3) * pemanfaatan
    )

    return {
        "skor_total": round(total, 1),
        "ketersediaan": round(ketersediaan, 1),
        "akses": round(akses, 1),
        "pemanfaatan": round(pemanfaatan, 1),
        "indeks_harga": round(indeks_harga, 1),
        "skor_eksposur_global": round(skor_eksposur_global, 1),
    }
