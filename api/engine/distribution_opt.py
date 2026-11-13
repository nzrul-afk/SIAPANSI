from __future__ import annotations
import math
from typing import Dict, List, Optional
import numpy as np
try:
    from scipy.optimize import minimize
except ImportError:
    minimize = None


def haversine_road_km(lat1: float, lon1: float, lat2: float, lon2: float, road_factor: float = 1.3) -> float:
    """9.9 Jarak haversine dikali 1,3 (faktor jalan)."""
    r = 6371.0
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2.0) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))
    return round(r * c * road_factor, 2)


def optimize_village_distribution(
    villages: List[Dict[str, object]],
    commodities: List[Dict[str, object]],
    target_hari: float = 30.0,
    batas_donor_hari: float = 21.0,
    tarif_per_kg_km: float = 2.5,
    only_to_own_village: bool = True,
) -> Dict[str, object]:
    """
    9.9 Optimasi distribusi antar desa menggunakan Linear Programming:
    - need_jk = max(0, Target * D_jk - S_jk)
    - give_ik = max(0, S_ik - Batas * D_ik) dengan Batas = 21 hari
    - Minimalkan sum(tarif * jarak_ij * x_ijk) + penalti * u_jk
      dengan penalti lebih besar untuk desa yang Hari Bertahannya lebih rendah.
    """
    proposals: List[Dict[str, object]] = []
    surplus_deficit_table: List[Dict[str, object]] = []
    total_cost_rp = 0.0

    for comm in commodities:
        cid = str(comm["id"])
        kode = str(comm["kode"])
        cnama = str(comm["nama"])
        satuan = str(comm.get("satuan", "kg"))
        norma = float(comm["norma_per_kapita_hari"])

        donors = []
        receivers = []

        for v in villages:
            vid = str(v["id"])
            vnama = str(v["nama"])
            penduduk = int(v["penduduk"])
            is_own = bool(v.get("is_own", False))
            d_vk = float(penduduk) * norma
            s_vk = float(v["stock_by_kode"].get(kode, 0.0))
            doc_vk = s_vk / d_vk if d_vk > 0 else 0.0

            give_cap = max(0.0, s_vk - batas_donor_hari * d_vk)
            need_amt = max(0.0, target_hari * d_vk - s_vk)

            surplus_deficit_table.append({
                "village_id": vid,
                "village_nama": vnama,
                "is_own": is_own,
                "commodity_id": cid,
                "commodity_kode": kode,
                "commodity_nama": cnama,
                "satuan": satuan,
                "stok_kg": round(s_vk, 1),
                "kebutuhan_harian_kg": round(d_vk, 2),
                "hari_bertahan": round(doc_vk, 1),
                "kapasitas_donor_kg": round(give_cap, 1),
                "kebutuhan_terima_kg": round(need_amt, 1),
                "peran": "donor" if give_cap > 0.5 else ("defisit" if need_amt > 0.5 else "seimbang"),
            })

            if give_cap > 0.5:
                donors.append({
                    "id": vid,
                    "nama": vnama,
                    "lat": float(v["lat"]),
                    "lon": float(v["lon"]),
                    "d_k": d_vk,
                    "s_k": s_vk,
                    "doc": doc_vk,
                    "give": give_cap,
                })
            if need_amt > 0.5 and (not only_to_own_village or is_own):
                receivers.append({
                    "id": vid,
                    "nama": vnama,
                    "lat": float(v["lat"]),
                    "lon": float(v["lon"]),
                    "d_k": d_vk,
                    "s_k": s_vk,
                    "doc": doc_vk,
                    "need": need_amt,
                    "is_own": is_own,
                })

        if not donors or not receivers:
            continue

        n_d = len(donors)
        n_r = len(receivers)
        # Decision variables: [x_{0,0} ... x_{n_d-1, n_r-1}, u_0 ... u_{n_r-1}]
        n_vars = n_d * n_r + n_r
        c_vec = np.zeros(n_vars)
        dist_matrix = np.zeros((n_d, n_r))

        for i, d_v in enumerate(donors):
            for j, r_v in enumerate(receivers):
                dist_km = haversine_road_km(d_v["lat"], d_v["lon"], r_v["lat"], r_v["lon"])
                dist_matrix[i, j] = dist_km
                c_vec[i * n_r + j] = tarif_per_kg_km * dist_km

        for j, r_v in enumerate(receivers):
            # Penalty larger when receiver DoC is lower
            urgency_weight = max(1.0, (target_hari - r_v["doc"]) * 100.0)
            c_vec[n_d * n_r + j] = 100000.0 + urgency_weight

        # Inequality constraints: sum_j x_ij <= give_i
        A_ub = np.zeros((n_d, n_vars))
        b_ub = np.zeros(n_d)
        for i, d_v in enumerate(donors):
            for j in range(n_r):
                A_ub[i, i * n_r + j] = 1.0
            b_ub[i] = d_v["give"]

        # Equality constraints: sum_i x_ij + u_j = need_j
        A_eq = np.zeros((n_r, n_vars))
        b_eq = np.zeros(n_r)
        for j, r_v in enumerate(receivers):
            for i in range(n_d):
                A_eq[j, i * n_r + j] = 1.0
            A_eq[j, n_d * n_r + j] = 1.0
            b_eq[j] = r_v["need"]

        bounds = [(0.0, None) for _ in range(n_vars)]
        x0 = np.zeros(n_vars, dtype=float)
        # Initialize feasible starting point by urgency & distance order
        rem_give = [float(d_v["give"]) for d_v in donors]
        rem_need = [float(r_v["need"]) for r_v in receivers]
        r_order = sorted(range(n_r), key=lambda j: receivers[j]["doc"])
        for j in r_order:
            d_order = sorted(range(n_d), key=lambda i: dist_matrix[i, j])
            for i in d_order:
                alloc = min(rem_give[i], rem_need[j])
                x0[i * n_r + j] = alloc
                rem_give[i] -= alloc
                rem_need[j] -= alloc
            x0[n_d * n_r + j] = rem_need[j]

        cons = []
        for i in range(n_d):
            cons.append({"type": "ineq", "fun": lambda x, row=A_ub[i], rhs=b_ub[i]: float(rhs - np.dot(row, x))})
        for j in range(n_r):
            cons.append({"type": "eq", "fun": lambda x, row=A_eq[j], rhs=b_eq[j]: float(np.dot(row, x) - rhs)})

        if minimize is not None:
            res = minimize(
                lambda x, cv=c_vec: float(np.dot(cv, x)),
                x0,
                method="SLSQP",
                bounds=bounds,
                constraints=cons,
            )
            sol_vec = res.x if res.success and res.x is not None else x0
        else:
            sol_vec = x0

        for i, d_v in enumerate(donors):
            for j, r_v in enumerate(receivers):
                vol = float(sol_vec[i * n_r + j])
                if vol >= 1.0:
                    vol_round = round(vol, 1)
                    dist_km = float(dist_matrix[i, j])
                    biaya = round(vol_round * dist_km * tarif_per_kg_km, 0)
                    total_cost_rp += biaya

                    doc_donor_after = (d_v["s_k"] - vol_round) / d_v["d_k"]
                    doc_recv_after = (r_v["s_k"] + vol_round) / r_v["d_k"]

                    draf_pesan = (
                        f"Yth. Pengurus Pangan {d_v['nama']}, berdasarkan pemantauan Gugus Desa Sumbermulyo, "
                        f"cadangan {cnama} di {r_v['nama']} saat ini berada pada {r_v['doc']:.1f} hari. "
                        f"Kami memohon kerja sama distribusi {cnama} sebesar {vol_round:,.0f} {satuan} "
                        f"(jarak tempuh {dist_km:.1f} km, estimasi biaya angkut Rp {biaya:,.0f}). "
                        f"Setelah pengiriman ini, cadangan {d_v['nama']} tetap aman pada {doc_donor_after:.1f} hari."
                    ).replace(",", ".")

                    proposals.append({
                        "dari_village_id": d_v["id"],
                        "dari_village_nama": d_v["nama"],
                        "ke_village_id": r_v["id"],
                        "ke_village_nama": r_v["nama"],
                        "commodity_id": cid,
                        "commodity_kode": kode,
                        "commodity_nama": cnama,
                        "satuan": satuan,
                        "jumlah_kg": vol_round,
                        "kapasitas_donor_maks_kg": round(d_v["give"], 1),
                        "kebutuhan_penerima_kg": round(r_v["need"], 1),
                        "jarak_km": dist_km,
                        "biaya_angkut_rp": biaya,
                        "doc_donor_sebelum": round(d_v["doc"], 1),
                        "doc_donor_sesudah": round(doc_donor_after, 1),
                        "doc_penerima_sebelum": round(r_v["doc"], 1),
                        "doc_penerima_sesudah": round(doc_recv_after, 1),
                        "draf_pesan": draf_pesan,
                    })

    return {
        "target_hari": target_hari,
        "batas_donor_hari": batas_donor_hari,
        "tarif_per_kg_km": tarif_per_kg_km,
        "total_biaya_angkut_rp": round(total_cost_rp, 0),
        "usulan_transfer": proposals,
        "tabel_surplus_defisit": surplus_deficit_table,
    }
