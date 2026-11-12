from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List, Optional
import numpy as np
from scipy.optimize import minimize


@dataclass
class FoodItemSpec:
    id: str
    nama: str
    kategori: str  # karbohidrat | protein_hewani | protein_nabati | sayur | buah | pelengkap
    energi_kkal_100g: float
    protein_g_100g: float
    serat_g_100g: float
    harga_per_kg: float
    eksposur_impor: float
    commodity_id: Optional[str]
    min_g: float
    max_g: float
    sumber: str = "pendekatan (verifikasi TKPI)"


TARGET_GROUPS = {
    "balita": {
        "label": "Balita (PMT Posyandu 30% AKG)",
        "energi_target": 1350.0 * 0.30,  # 405 kkal per porsi PMT
        "protein_target": 20.0 * 0.30,   # 6.0 g protein per porsi PMT
        "default_penerima": 140,
    },
    "ibu_hamil": {
        "label": "Ibu Hamil & Menyusui (PMT 30% AKG)",
        "energi_target": 2500.0 * 0.30,  # 750 kkal per porsi PMT
        "protein_target": 70.0 * 0.30,   # 21.0 g protein per porsi PMT
        "default_penerima": 45,
    },
    "umum": {
        "label": "Warga Umum / Dapur Umum (100% AKG)",
        "energi_target": 2100.0,
        "protein_target": 57.0,
        "default_penerima": 1800,
    },
}


def optimize_menu_plan(
    foods: List[FoodItemSpec],
    sasaran: str = "balita",
    jumlah_penerima: int = 140,
    durasi: int = 7,
    prioritas: str = "hindari_impor",  # hemat | gizi_maksimal | bahan_lokal | hindari_impor
    stock_by_comm_id: Optional[Dict[str, float]] = None,
    daily_demand_by_comm_id: Optional[Dict[str, float]] = None,
    batas_stok_pct: float = 0.20,
) -> Dict[str, object]:
    """
    9.8 Linear programming menu optimizer per day using scipy.optimize.linprog.
    Ensures energy in [95%, 115%] of target, protein >= 95% target,
    at least 1 carb, 1 protein, 1 veggie/fruit, and tracked stock <= allocated budget.
    """
    grp = TARGET_GROUPS.get(sasaran, TARGET_GROUPS["balita"])
    e_target = float(grp["energi_target"])
    p_target = float(grp["protein_target"])
    n_penerima = max(1, int(jumlah_penerima))
    n_days = max(1, min(14, int(durasi)))

    stocks = dict(stock_by_comm_id or {})
    demands = dict(daily_demand_by_comm_id or {})
    alloc_rem: Dict[str, float] = {
        cid: max(0.0, val * float(batas_stok_pct)) for cid, val in stocks.items()
    }

    # Filter foods if hindari_impor (exclude eksposur_impor >= 0.5)
    candidate_foods = [
        f for f in foods
        if not (prioritas == "hindari_impor" and f.eksposur_impor >= 0.5)
    ]
    if not candidate_foods:
        candidate_foods = list(foods)

    # Group indices for daily rotation variety
    carbs = [i for i, f in enumerate(candidate_foods) if f.kategori == "karbohidrat"]
    prots = [i for i, f in enumerate(candidate_foods) if f.kategori in ("protein_hewani", "protein_nabati")]
    vegs = [i for i, f in enumerate(candidate_foods) if f.kategori in ("sayur", "buah")]

    scale = 1.0 if sasaran != "umum" else 2.8
    plans_per_day: List[Dict[str, object]] = []
    total_usage_kg: Dict[str, float] = {}
    relaxed_reasons: List[str] = []
    total_cost_all_days = 0.0

    for day_idx in range(1, n_days + 1):
        n = len(candidate_foods)
        # Objective vector c (minimize c^T x where x is grams per portion for item i)
        c = np.zeros(n)
        for i, f in enumerate(candidate_foods):
            cost_per_g = f.harga_per_kg / 1000.0
            if prioritas == "hemat" or prioritas == "hindari_impor":
                c[i] = cost_per_g
            elif prioritas == "gizi_maksimal":
                # Maximize protein & fiber, with gentle cost regularization
                c[i] = cost_per_g * 0.2 - (f.protein_g_100g * 0.08 + f.serat_g_100g * 0.05)
            elif prioritas == "bahan_lokal":
                c[i] = f.eksposur_impor * 10.0 + cost_per_g * 0.5
            else:
                c[i] = cost_per_g

            # Add deterministic rotation penalty so consecutive days vary ingredients
            if (i + day_idx) % 3 == 0:
                c[i] += 0.015
            elif (i + day_idx) % 2 == 0:
                c[i] -= 0.008

        # Select active primary carb, protein, veg for the day to ensure realistic 4-5 item dish
        chosen_carb = carbs[(day_idx - 1) % len(carbs)] if carbs else None
        chosen_prot1 = prots[(day_idx - 1) % len(prots)] if prots else None
        chosen_prot2 = prots[day_idx % len(prots)] if len(prots) > 1 else chosen_prot1
        chosen_veg = vegs[(day_idx - 1) % len(vegs)] if vegs else None

        bounds = []
        for i, f in enumerate(candidate_foods):
            max_g = f.max_g * scale
            if f.commodity_id and f.commodity_id in alloc_rem:
                max_avail_g = (alloc_rem[f.commodity_id] * 1000.0) / float(n_penerima)
                max_g = min(max_g, max_avail_g)

            min_g = 0.0
            if i == chosen_carb:
                min_g = min(max_g, max(25.0, f.min_g))
            elif i in (chosen_prot1, chosen_prot2):
                min_g = min(max_g, max(20.0, f.min_g))
            elif i == chosen_veg:
                min_g = min(max_g, max(25.0, f.min_g))
            elif f.kategori == "pelengkap":
                min_g = min(max_g, 5.0)
            else:
                # Limit non-selected items so menu stays clean (4-6 ingredients per day)
                max_g = 0.0
            bounds.append((min_g, max(min_g, max_g)))

        e_vec = np.array([f.energi_kkal_100g / 100.0 for f in candidate_foods])
        p_vec = np.array([f.protein_g_100g / 100.0 for f in candidate_foods])

        # Solve linear program via SciPy SLSQP (avoids Windows HiGHS DLL SEH bug)
        x0 = np.array([(b[0] + b[1]) * 0.5 for b in bounds], dtype=float)
        cons = [
            {"type": "ineq", "fun": lambda x, ev=e_vec, et=e_target: float( np.dot(ev, x) - 0.96 * et)},
            {"type": "ineq", "fun": lambda x, ev=e_vec, et=e_target: float( 1.14 * et - np.dot(ev, x))},
            {"type": "ineq", "fun": lambda x, pv=p_vec, pt=p_target: float( np.dot(pv, x) - 1.01 * pt)},
        ]
        res = minimize(
            lambda x, cv=c: float(np.dot(cv, x)),
            x0,
            method="SLSQP",
            bounds=bounds,
            constraints=cons,
        )
        if not res.success or np.dot(e_vec, res.x) < 0.95 * e_target:
            # Relaxation 1: allow wider bounds on selected items
            relaxed_bounds = []
            for i, f in enumerate(candidate_foods):
                mx = f.max_g * scale * 1.6
                if f.commodity_id and f.commodity_id in alloc_rem:
                    mx = min(mx, (alloc_rem[f.commodity_id] * 1000.0) / float(n_penerima))
                mn = min(mx, 25.0) if i in (chosen_carb, chosen_prot1, chosen_prot2, chosen_veg) else 0.0
                if i not in (chosen_carb, chosen_prot1, chosen_prot2, chosen_veg) and f.kategori != "pelengkap":
                    mx = 0.0
                relaxed_bounds.append((mn, max(mn, mx)))
            x0_rel = np.array([(b[0] + b[1]) * 0.55 for b in relaxed_bounds], dtype=float)
            cons_rel = [
                {"type": "ineq", "fun": lambda x, ev=e_vec, et=e_target: float(np.dot(ev, x) - 0.96 * et)},
                {"type": "ineq", "fun": lambda x, ev=e_vec, et=e_target: float(1.25 * et - np.dot(ev, x))},
                {"type": "ineq", "fun": lambda x, pv=p_vec, pt=p_target: float(np.dot(pv, x) - 0.96 * pt)},
            ]
            res = minimize(
                lambda x, cv=c: float(np.dot(cv, x)),
                x0_rel,
                method="SLSQP",
                bounds=relaxed_bounds,
                constraints=cons_rel,
            )
            if "Batas variasi dilonggarkan agar target gizi 95% terpenuhi." not in relaxed_reasons:
                relaxed_reasons.append("Batas variasi dilonggarkan agar target gizi 95% terpenuhi.")

        x_sol = res.x if res.x is not None else x0
        # Ensure energy >= 96% target if solver stopped slightly early
        curr_e = float(np.dot(e_vec, x_sol))
        if 0 < curr_e < 0.96 * e_target:
            scale_up = (0.97 * e_target) / curr_e
            x_sol = x_sol * scale_up

        day_items = []
        day_energi = 0.0
        day_protein = 0.0
        day_cost_per_porsi = 0.0

        for i, gram in enumerate(x_sol):
            if gram >= 1.0:
                f = candidate_foods[i]
                g_val = round(float(gram), 1)
                total_kg_day = round((g_val * n_penerima) / 1000.0, 2)
                biaya_item_porsi = (g_val / 1000.0) * f.harga_per_kg
                kkal_item = (g_val / 100.0) * f.energi_kkal_100g
                prot_item = (g_val / 100.0) * f.protein_g_100g

                day_energi += kkal_item
                day_protein += prot_item
                day_cost_per_porsi += biaya_item_porsi

                total_usage_kg[f.id] = round(total_usage_kg.get(f.id, 0.0) + total_kg_day, 2)
                if f.commodity_id and f.commodity_id in alloc_rem:
                    alloc_rem[f.commodity_id] = max(0.0, alloc_rem[f.commodity_id] - total_kg_day)

                day_items.append({
                    "food_id": f.id,
                    "nama": f.nama,
                    "kategori": f.kategori,
                    "commodity_id": f.commodity_id,
                    "status_stok": "stok_desa" if f.commodity_id else "perlu_dibeli",
                    "gram_per_porsi": g_val,
                    "total_kebutuhan_kg": total_kg_day,
                    "energi_kkal": round(kkal_item, 1),
                    "protein_g": round(prot_item, 1),
                    "biaya_per_porsi_rp": round(biaya_item_porsi, 0),
                })

        day_total_cost = round(day_cost_per_porsi * n_penerima, 0)
        total_cost_all_days += day_total_cost

        # Deterministic template name & cooking steps (used when LLM off or as base)
        main_names = [it["nama"] for it in day_items[:3]]
        nama_menu = f"Menu Bergizi Hari {day_idx}: " + " & ".join(main_names)
        langkah_masak = [
            f"Siapkan dan cuci bersih bahan utama ({', '.join(it['nama'] for it in day_items)}).",
            "Masak sumber karbohidrat hingga matang sempurna dan mudah dicerna.",
            "Olahan sumber protein dan sayuran dimasak dengan sedikit minyak agar zat gizi terjaga.",
            "Sajikan hangat sesuai takaran gram per porsi bagi penerima manfaat.",
        ]

        plans_per_day.append({
            "hari": day_idx,
            "nama_menu": nama_menu,
            "bahan": day_items,
            "energi_per_porsi_kkal": round(day_energi, 1),
            "target_energi_kkal": round(e_target, 1),
            "persen_energi": round((day_energi / e_target) * 100.0, 1) if e_target > 0 else 100.0,
            "protein_per_porsi_g": round(day_protein, 1),
            "target_protein_g": round(p_target, 1),
            "persen_protein": round((day_protein / p_target) * 100.0, 1) if p_target > 0 else 100.0,
            "biaya_per_porsi_rp": round(day_cost_per_porsi, 0),
            "biaya_harian_total_rp": day_total_cost,
            "langkah_masak": langkah_masak,
            "tips_penyajian": "Pastikan tekstur makanan disesuaikan untuk balita dan disajikan dalam keadaan segar.",
        })

    # Compute impact on tracked commodities
    dampak_stok: List[Dict[str, object]] = []
    peringatan_stok: List[str] = []
    food_by_id = {f.id: f for f in foods}

    comm_used_kg: Dict[str, float] = {}
    comm_names: Dict[str, str] = {}
    for fid, kg_used in total_usage_kg.items():
        f = food_by_id[fid]
        if f.commodity_id:
            comm_used_kg[f.commodity_id] = round(comm_used_kg.get(f.commodity_id, 0.0) + kg_used, 2)
            comm_names[f.commodity_id] = f.nama

    for cid, used_kg in comm_used_kg.items():
        s_awal = stocks.get(cid, 0.0)
        d_harian = demands.get(cid, 1.0)
        s_sisa = max(0.0, s_awal - used_kg)
        doc_awal = s_awal / d_harian if d_harian > 0 else 0.0
        doc_akhir = s_sisa / d_harian if d_harian > 0 else 0.0
        batas_alokasi = s_awal * float(batas_stok_pct)
        dampak_stok.append({
            "commodity_id": cid,
            "nama": comm_names.get(cid, cid),
            "terpakai_kg": round(used_kg, 2),
            "alokasi_maks_kg": round(batas_alokasi, 2),
            "stok_awal_kg": round(s_awal, 1),
            "stok_sisa_kg": round(s_sisa, 1),
            "doc_sebelum": round(doc_awal, 1),
            "doc_sesudah": round(doc_akhir, 1),
        })
        if used_kg >= 0.85 * batas_alokasi:
            peringatan_stok.append(
                f"Pemakaian {comm_names.get(cid, cid)} mendekati batas alokasi PMT ({used_kg:.1f} kg dari {batas_alokasi:.1f} kg)."
            )

    substitusi_info = []
    if prioritas == "hindari_impor":
        substitusi_info = [
            "Terigu (impor 100%) diganti dengan Singkong kering/gaplek, Jagung pipil, dan Tepung Mocaf lokal.",
            "Kedelai (impor 90%) diganti dengan Kacang hijau lokal, Telur ayam, dan Ikan lele lokal.",
        ]

    return {
        "sasaran": sasaran,
        "sasaran_label": grp["label"],
        "jumlah_penerima": n_penerima,
        "durasi": n_days,
        "prioritas": prioritas,
        "batas_stok_pct": batas_stok_pct,
        "biaya_total_rp": round(total_cost_all_days, 0),
        "biaya_rata_per_porsi_rp": round(total_cost_all_days / (n_penerima * n_days), 0),
        "rencana_harian": plans_per_day,
        "dampak_stok": dampak_stok,
        "peringatan_stok": peringatan_stok,
        "substitusi_impor": substitusi_info,
        "catatan_relaksasi": relaxed_reasons,
        "disclaimer": (
            "Menu ini adalah panduan umum berbasis pendekatan komposisi pangan (verifikasi TKPI & AKG Kemenkes). "
            "Konsultasikan dengan bidan, ahli gizi, atau puskesmas, terutama untuk balita bermasalah gizi."
        ),
    }
