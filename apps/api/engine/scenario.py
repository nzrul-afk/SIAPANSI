from __future__ import annotations
from datetime import date, timedelta
from typing import Dict, List, Optional
from .core import (
    CommodityInput,
    ThresholdConfig,
    classify_status,
    compute_daily_demand,
    compute_resilience_score,
)


def run_shock_scenario(
    commodities: List[CommodityInput],
    stock_by_id: Dict[str, float],
    conservative_doc_by_id: Dict[str, float],
    penduduk: int,
    as_of: date,
    delta_s: float = 0.0,
    delta_p: float = 0.0,
    delta_h: float = 0.0,
    delta_k: float = 0.0,
    durasi: int = 60,
    harvest_by_comm_id: Optional[Dict[str, float]] = None,
    baseline_score: Optional[Dict[str, float]] = None,
    cfg: Optional[ThresholdConfig] = None,
) -> Dict[str, object]:
    """
    9.7 Mesin skenario deterministik.
    - rho'_k = rho_k * (1 - delta_s * e_k)
    - harga'_k = harga_k * (1 + delta_p * e_k) * (1 + delta_k * e_k)
    - panen'_k = panen_k * (1 - delta_h * (0.5 + 0.5 * f_k))
    - drain_k = max(0, D_k * (1 - rho'_k) - panen_harian'_k)
    - Hari Bertahan pasokan rutin: S_k / drain_k, disimulasikan sampai H=180
    - Kekurangan akhir durasi: max(0, D_k * T * (1 - rho'_k) - S_k - panen_total'_k)
    """
    c = cfg or ThresholdConfig()
    T = max(7, min(180, int(durasi)))
    H = 180
    harvest_totals = harvest_by_comm_id or {}

    is_zero_shock = (
        abs(delta_s) < 1e-9
        and abs(delta_p) < 1e-9
        and abs(delta_h) < 1e-9
        and abs(delta_k) < 1e-9
    )

    per_commodity: List[Dict[str, object]] = []
    tambahan_biaya_total = 0.0

    # Pool accumulators under scenario
    pokok_s_cal = 0.0
    pokok_d_cal = 0.0
    prot_s_g = 0.0
    prot_d_g = 0.0
    pel_s_w = 0.0
    pel_d_w = 0.0

    weakest_comm = None
    weakest_doc = float("inf")

    scenario_comms: List[CommodityInput] = []

    for comm in commodities:
        s_k = float(stock_by_id.get(comm.id, 0.0))
        d_k = compute_daily_demand(penduduk, comm.norma_per_kapita_hari)
        e_k = float(comm.eksposur_impor)
        f_k = float(comm.ketergantungan_pupuk)
        rho_k = float(comm.porsi_pasokan_rutin)
        harga_k = float(comm.harga_sekarang or comm.harga_acuan)
        panen_k = float(harvest_totals.get(comm.id, 0.0))
        panen_harian_base = panen_k / float(T) if T > 0 else 0.0

        # Baseline with routine supply
        drain_base = max(0.0, d_k * (1.0 - rho_k) - panen_harian_base)
        if drain_base <= 1e-9:
            doc_base_rutin = float(H)
            base_exceeds = True
        else:
            raw_base = s_k / drain_base
            base_exceeds = raw_base > H
            doc_base_rutin = min(float(H), raw_base)

        kekurangan_base = max(0.0, d_k * T * (1.0 - rho_k) - s_k - panen_k)

        # Scenario parameters
        rho_prime = rho_k * (1.0 - delta_s * e_k)
        harga_prime = harga_k * (1.0 + delta_p * e_k) * (1.0 + delta_k * e_k)
        panen_prime = panen_k * (1.0 - delta_h * (0.5 + 0.5 * f_k))
        panen_harian_prime = panen_prime / float(T) if T > 0 else 0.0

        drain_prime = max(0.0, d_k * (1.0 - rho_prime) - panen_harian_prime)

        # Consistency rule: if delta_s == 1.0 and e_k == 1.0 (and no harvest), rho'_k = 0 -> conservative DoC
        if abs(delta_s - 1.0) < 1e-9 and abs(e_k - 1.0) < 1e-9 and panen_prime <= 1e-9:
            doc_scen = float(conservative_doc_by_id.get(comm.id, s_k / d_k if d_k > 0 else H))
            scen_exceeds = doc_scen > H
        elif is_zero_shock:
            doc_scen = doc_base_rutin
            scen_exceeds = base_exceeds
        else:
            if drain_prime <= 1e-9:
                doc_scen = float(H)
                scen_exceeds = True
            else:
                raw_scen = s_k / drain_prime
                scen_exceeds = raw_scen > H
                doc_scen = min(float(H), raw_scen)

        kekurangan_scen = max(0.0, d_k * T * (1.0 - rho_prime) - s_k - panen_prime)
        biaya_tambahan_k = max(0.0, kekurangan_scen * harga_prime - kekurangan_base * harga_k)
        tambahan_biaya_total += biaya_tambahan_k

        tanggal_habis = (
            None
            if scen_exceeds
            else (as_of + timedelta(days=int(round(doc_scen)))).isoformat()
        )

        if doc_scen < weakest_doc:
            weakest_doc = doc_scen
            weakest_comm = comm

        # Effective scenario demand drain for pool calculation
        eff_drain_for_pool = drain_prime if not is_zero_shock else d_k
        if comm.kelompok == "pokok":
            pokok_s_cal += s_k * comm.kkal_per_unit
            pokok_d_cal += max(0.1, eff_drain_for_pool) * comm.kkal_per_unit
        elif comm.kelompok == "protein":
            prot_s_g += s_k * comm.protein_g_per_unit
            prot_d_g += max(0.1, eff_drain_for_pool) * comm.protein_g_per_unit
        else:
            w_u = comm.kkal_per_unit if comm.kkal_per_unit > 0 else 1000.0
            pel_s_w += s_k * w_u
            pel_d_w += max(0.1, eff_drain_for_pool) * w_u

        price_rise_pct = ((harga_prime - harga_k) / harga_k) * 100.0 if harga_k > 0 else 0.0
        scenario_comms.append(
            CommodityInput(
                id=comm.id,
                kode=comm.kode,
                nama=comm.nama,
                satuan=comm.satuan,
                kelompok=comm.kelompok,
                norma_per_kapita_hari=comm.norma_per_kapita_hari,
                eksposur_impor=comm.eksposur_impor,
                ketergantungan_pupuk=comm.ketergantungan_pupuk,
                porsi_pasokan_rutin=comm.porsi_pasokan_rutin,
                umur_simpan_hari=comm.umur_simpan_hari,
                harga_acuan=comm.harga_acuan,
                kkal_per_unit=comm.kkal_per_unit,
                protein_g_per_unit=comm.protein_g_per_unit,
                harga_sekarang=harga_prime,
                kenaikan_harga_30d_pct=comm.kenaikan_harga_30d_pct + price_rise_pct,
            )
        )

        per_commodity.append({
            "commodity_id": comm.id,
            "kode": comm.kode,
            "nama": comm.nama,
            "satuan": comm.satuan,
            "kelompok": comm.kelompok,
            "stok_awal": round(s_k, 1),
            "kebutuhan_harian": round(d_k, 2),
            "rho_baseline": round(rho_k, 3),
            "rho_skenario": round(rho_prime, 3),
            "drain_baseline": round(drain_base, 2),
            "drain_skenario": round(drain_prime, 2),
            "doc_baseline": round(doc_base_rutin, 1),
            "doc_baseline_lebih_180": base_exceeds,
            "doc_skenario": round(doc_scen, 1),
            "doc_skenario_lebih_180": scen_exceeds,
            "tanggal_habis": tanggal_habis,
            "kekurangan_baseline_kg": round(kekurangan_base, 1),
            "kekurangan_skenario_kg": round(kekurangan_scen, 1),
            "harga_baseline": round(harga_k, 0),
            "harga_skenario": round(harga_prime, 0),
            "tambahan_biaya_rp": round(biaya_tambahan_k, 0),
            **classify_status(doc_scen, c),
        })

    # Intensitas sinyal untuk Skor: min(1, (ΔS + ΔP + ΔK/0.3) / 3)
    intensitas_sinyal = min(1.0, (delta_s + delta_p + (delta_k / 0.3)) / 3.0)
    if is_zero_shock and baseline_score:
        skor_sesudah = dict(baseline_score)
    else:
        doc_pokok_scen = round(pokok_s_cal / pokok_d_cal, 1) if pokok_d_cal > 0 else 30.0
        doc_prot_scen = round(prot_s_g / prot_d_g, 1) if prot_d_g > 0 else 15.0
        doc_pel_scen = round(pel_s_w / pel_d_w, 1) if pel_d_w > 0 else 20.0
        skor_sesudah = compute_resilience_score(
            commodities=scenario_comms,
            doc_pokok=min(30.0, doc_pokok_scen),
            doc_protein=min(30.0, doc_prot_scen),
            doc_pelengkap=min(30.0, doc_pel_scen),
            doc_terlemah=weakest_doc,
            signal_intensity=max(0.20, intensitas_sinyal),
            target_hari=c.target_hari,
        )

    # Dual-line stock projection series (aggregate or weakest commodity) for T days
    target_comm_item = next(
        (x for x in per_commodity if x["kode"] == "terigu"),
        per_commodity[0] if per_commodity else None,
    )
    grafik_proyeksi: List[Dict[str, object]] = []
    if target_comm_item:
        s0 = float(target_comm_item["stok_awal"])
        db = float(target_comm_item["drain_baseline"])
        ds = float(target_comm_item["drain_skenario"])
        for d in range(0, T + 1, max(1, T // 15)):
            grafik_proyeksi.append({
                "hari": d,
                "baseline": round(max(0.0, s0 - db * d), 1),
                "skenario": round(max(0.0, s0 - ds * d), 1),
            })
        if grafik_proyeksi[-1]["hari"] != T:
            grafik_proyeksi.append({
                "hari": T,
                "baseline": round(max(0.0, s0 - db * T), 1),
                "skenario": round(max(0.0, s0 - ds * T), 1),
            })

    # Rule-based Recommendations (priority ordered 1 to 5)
    rekomendasi: List[Dict[str, object]] = []
    terigu_item = next((x for x in per_commodity if x["kode"] == "terigu"), None)
    kedelai_item = next((x for x in per_commodity if x["kode"] == "kedelai"), None)

    if delta_s >= 0.2 or delta_p >= 0.2 or (terigu_item and float(terigu_item["kekurangan_skenario_kg"]) > 0):
        rekomendasi.append({
            "prioritas": 1,
            "kode": "substitusi_lokal",
            "judul": "Substitusi pangan impor ke pangan lokal desa",
            "tindakan": (
                "Alihkan sebagian konsumsi terigu ke singkong kering/gaplek dan jagung pipil lokal "
                "untuk menekan ketergantungan pasokan luar."
            ),
        })
    if tambahan_biaya_total > 0 or delta_p > 0 or delta_k > 0:
        rekomendasi.append({
            "prioritas": 2,
            "kode": "stok_pengaman",
            "judul": "Beli stok pengaman lebih awal sebelum harga naik penuh",
            "tindakan": (
                f"Amankan cadangan komoditas kritis hingga mencapai target {c.target_hari:.0f} hari "
                f"(estimasi kebutuhan anggaran tambahan Rp {tambahan_biaya_total:,.0f})."
            ).replace(",", "."),
        })
    if weakest_comm and weakest_doc < c.target_hari:
        rekomendasi.append({
            "prioritas": 3,
            "kode": "penjatahan_terukur",
            "judul": f"Atur penyaluran bertahap untuk {weakest_comm.nama}",
            "tindakan": (
                f"Sesuaikan ritme pengeluaran {weakest_comm.nama} dari lumbung agar cadangan "
                f"cukup bertahan melewati masa gangguan ({T} hari)."
            ),
        })
    if (terigu_item and float(terigu_item["kekurangan_skenario_kg"]) > 0) or (
        kedelai_item and float(kedelai_item["kekurangan_skenario_kg"]) > 0
    ):
        rekomendasi.append({
            "prioritas": 4,
            "kode": "bantuan_gugus_desa",
            "judul": "Ajukan distribusi antar desa di Gugus Sumbermulyo",
            "tindakan": (
                "Hubungi Desa Karangsari dan Desa Wonokerto yang memiliki surplus terigu dan kedelai "
                "di atas batas aman 21 hari."
            ),
        })
    rekomendasi.append({
        "prioritas": 5,
        "kode": "prioritas_pmt",
        "judul": "Prioritaskan cadangan protein untuk PMT kelompok rentan",
        "tindakan": (
            "Amankan alokasi telur dan kedelai/kacang hijau khusus untuk PMT 140 balita dan 45 ibu hamil/menyusui."
        ),
    })

    return {
        "parameter": {
            "delta_s": delta_s,
            "delta_p": delta_p,
            "delta_h": delta_h,
            "delta_k": delta_k,
            "durasi": T,
        },
        "is_zero_shock": is_zero_shock,
        "intensitas_sinyal": round(intensitas_sinyal, 3),
        "tambahan_biaya_rp": round(tambahan_biaya_total, 0),
        "komoditas_penentu_baru": {
            "commodity_id": weakest_comm.id if weakest_comm else "",
            "kode": weakest_comm.kode if weakest_comm else "",
            "nama": weakest_comm.nama if weakest_comm else "",
            "hari_bertahan": round(weakest_doc, 1) if weakest_comm else 0.0,
        },
        "skor_sebelum": baseline_score or {},
        "skor_sesudah": skor_sesudah,
        "per_komoditas": per_commodity,
        "grafik_proyeksi": grafik_proyeksi,
        "komoditas_grafik": target_comm_item["nama"] if target_comm_item else "Terigu",
        "rekomendasi": rekomendasi,
    }
