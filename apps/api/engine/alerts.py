from __future__ import annotations
from typing import Dict, List, Optional
from .core import CommodityInput, ThresholdConfig


SEVERITY_ORDER = {"Kritis": 4, "Siaga": 3, "Waspada": 2, "Info": 1}


def evaluate_alerts(
    commodities: List[CommodityInput],
    doc_by_id: Dict[str, float],
    stock_by_id: Dict[str, float],
    expiring_7d_by_id: Dict[str, float],
    doc_protein: float,
    pmt_coverage: float = 0.78,
    global_signals: Optional[Dict[str, float]] = None,
    harvest_drop_alerts: Optional[List[Dict[str, object]]] = None,
    surplus_opportunities: Optional[List[Dict[str, object]]] = None,
    days_since_last_tx: int = 0,
    cfg: Optional[ThresholdConfig] = None,
) -> List[Dict[str, object]]:
    """
    9.5 Evaluates Alert Rules R1 - R8 and generates deterministic template text.
    """
    c = cfg or ThresholdConfig()
    signals = global_signals or {}
    alerts: List[Dict[str, object]] = []

    # R1: Stok menipis (Waspada, Siaga, Kritis)
    for comm in commodities:
        doc = doc_by_id.get(comm.id, 0.0)
        stok = stock_by_id.get(comm.id, 0.0)
        if doc < c.aman:
            if doc < c.siaga:
                tingkat = "Kritis"
            elif doc < c.waspada:
                tingkat = "Siaga"
            else:
                tingkat = "Waspada"
            alerts.append({
                "rule_code": "R1",
                "tingkat": tingkat,
                "commodity_id": comm.id,
                "commodity_nama": comm.nama,
                "judul": f"Cadangan {comm.nama} masuk status {tingkat} ({doc:.1f} hari)",
                "data_pemicu": {
                    "hari_bertahan": round(doc, 1),
                    "stok_efektif": round(stok, 1),
                    "satuan": comm.satuan,
                    "ambang_aman": c.aman,
                },
                "penjelasan": (
                    f"Stok efektif {comm.nama} saat ini {stok:.0f} {comm.satuan}, cukup untuk {doc:.1f} hari "
                    f"(di bawah batas Aman {c.aman:.0f} hari)."
                ),
                "kenapa_penting": (
                    f"Jika pasokan luar desa terhambat, cadangan {comm.nama} akan habis dalam {doc:.1f} hari."
                ),
                "tindakan": "lihat_bantuan" if comm.eksposur_impor >= 0.5 else "jalankan_simulasi",
            })

    # R2: Lonjakan harga
    for comm in commodities:
        rise7 = comm.kenaikan_harga_7d_pct
        pred4w = comm.prediksi_naik_4w_pct
        harga_now = comm.harga_sekarang or comm.harga_acuan
        tingkat = None
        if rise7 >= 30.0:
            tingkat = "Kritis"
        elif rise7 >= 20.0:
            tingkat = "Siaga"
        elif rise7 >= 10.0 or pred4w >= 15.0:
            tingkat = "Waspada"

        if tingkat:
            pemicu_str = f"naik {rise7:.1f}% dalam 7 hari" if rise7 >= 10.0 else f"diprediksi naik {pred4w:.1f}% dalam 4 minggu"
            alerts.append({
                "rule_code": "R2",
                "tingkat": tingkat,
                "commodity_id": comm.id,
                "commodity_nama": comm.nama,
                "judul": f"Harga {comm.nama} {pemicu_str}",
                "data_pemicu": {
                    "kenaikan_7_hari_pct": round(rise7, 1),
                    "prediksi_4_minggu_pct": round(pred4w, 1),
                    "harga_sekarang": round(harga_now, 0),
                },
                "penjelasan": (
                    f"Harga {comm.nama} tercatat Rp {harga_now:,.0f}/{comm.satuan} ({pemicu_str})."
                ).replace(",", "."),
                "kenapa_penting": "Kenaikan harga mengurangi daya beli warga desa terutama keluarga rentan.",
                "tindakan": "buat_menu_substitusi",
            })

    # R3: Eksposur global
    kurs_14d = signals.get("kurs_14d_pct", 0.0)
    pupuk_14d = signals.get("pupuk_14d_pct", 0.0)
    logistik_val = signals.get("indeks_logistik", 35.0)
    global_triggered = (kurs_14d >= 3.0) or (pupuk_14d >= 15.0) or (logistik_val >= 70.0)
    if global_triggered:
        exposed_comms = [
            comm for comm in commodities
            if comm.eksposur_impor >= 0.5 and doc_by_id.get(comm.id, 0.0) < 30.0
        ]
        for comm in exposed_comms:
            doc = doc_by_id.get(comm.id, 0.0)
            alerts.append({
                "rule_code": "R3",
                "tingkat": "Siaga",
                "commodity_id": comm.id,
                "commodity_nama": comm.nama,
                "judul": f"Risiko pasokan global pada {comm.nama} (bertahan {doc:.1f} hari)",
                "data_pemicu": {
                    "hari_bertahan": round(doc, 1),
                    "eksposur_impor": comm.eksposur_impor,
                    "kurs_14d_pct": round(kurs_14d, 1),
                    "pupuk_14d_pct": round(pupuk_14d, 1),
                    "indeks_logistik": round(logistik_val, 0),
                },
                "penjelasan": (
                    f"Sinyal global memburuk (indeks logistik {logistik_val:.0f}, pupuk +{pupuk_14d:.0f}%, kurs +{kurs_14d:.1f}%) "
                    f"sedangkan {comm.nama} memiliki ketergantungan impor {comm.eksposur_impor*100:.0f}% dan stok {doc:.1f} hari."
                ),
                "kenapa_penting": "Komoditas berbasis impor rawan mengalami kelangkaan dan kenaikan harga mendadak.",
                "tindakan": "jalankan_simulasi",
            })

    # R4: Panen turun
    if harvest_drop_alerts:
        for h_alert in harvest_drop_alerts:
            ratio_pct = float(h_alert.get("rasio_baseline_pct", 100.0))
            delay_days = int(h_alert.get("mundur_hari", 0))
            if ratio_pct < 85.0 or delay_days > 14:
                comm_nama = str(h_alert.get("commodity_nama", "Pangan"))
                alerts.append({
                    "rule_code": "R4",
                    "tingkat": "Waspada",
                    "commodity_id": h_alert.get("commodity_id"),
                    "commodity_nama": comm_nama,
                    "judul": f"Prediksi panen {comm_nama} turun ke {ratio_pct:.0f}% dari normal",
                    "data_pemicu": {
                        "rasio_baseline_pct": round(ratio_pct, 1),
                        "mundur_hari": delay_days,
                    },
                    "penjelasan": (
                        f"Perkiraan hasil panen {comm_nama} hanya mencapai {ratio_pct:.1f}% dari target normal "
                        f"dengan pergeseran waktu {delay_days} hari."
                    ),
                    "kenapa_penting": "Penurunan panen lokal akan mempercepat berkurangnya cadangan lumbung desa.",
                    "tindakan": "jalankan_simulasi",
                })

    # R5: Kedaluwarsa
    for comm in commodities:
        stok = stock_by_id.get(comm.id, 0.0)
        exp7 = expiring_7d_by_id.get(comm.id, 0.0)
        if stok > 0 and (exp7 / stok) > 0.10:
            pct = (exp7 / stok) * 100.0
            alerts.append({
                "rule_code": "R5",
                "tingkat": "Waspada",
                "commodity_id": comm.id,
                "commodity_nama": comm.nama,
                "judul": f"{pct:.0f}% stok {comm.nama} segera kedaluwarsa dalam 7 hari",
                "data_pemicu": {
                    "stok_segera_kedaluwarsa": round(exp7, 1),
                    "stok_total": round(stok, 1),
                    "persentase": round(pct, 1),
                },
                "penjelasan": (
                    f"Sebanyak {exp7:.1f} {comm.satuan} ({pct:.1f}%) dari total {stok:.1f} {comm.satuan} {comm.nama} "
                    f"akan kedaluwarsa dalam 7 hari ke depan."
                ),
                "kenapa_penting": "Stok perlu segera disalurkan memakai aturan FEFO agar tidak terbuang sia-sia.",
                "tindakan": "buat_menu_substitusi",
            })

    # R6: Kesenjangan gizi
    if doc_protein < 14.0 or pmt_coverage < 0.70:
        alerts.append({
            "rule_code": "R6",
            "tingkat": "Waspada",
            "commodity_id": None,
            "commodity_nama": "Sumber Protein",
            "judul": f"Kesenjangan cadangan protein ({doc_protein:.1f} hari) / PMT ({pmt_coverage*100:.0f}%)",
            "data_pemicu": {
                "doc_protein": round(doc_protein, 1),
                "cakupan_pmt_pct": round(pmt_coverage * 100.0, 1),
            },
            "penjelasan": (
                f"Cadangan kelompok protein desa bertahan {doc_protein:.1f} hari dengan cakupan PMT kelompok rentan {pmt_coverage*100:.1f}%."
            ),
            "kenapa_penting": "Kekurangan asupan protein berisiko mengganggu tumbuh kembang balita dan ibu hamil.",
            "tindakan": "buat_menu_substitusi",
        })

    # R7: Peluang distribusi
    if surplus_opportunities:
        for opp in surplus_opportunities:
            comm_nama = str(opp.get("commodity_nama", ""))
            donor_nama = str(opp.get("donor_nama", ""))
            kapasitas = float(opp.get("kapasitas_kg", 0.0))
            alerts.append({
                "rule_code": "R7",
                "tingkat": "Info",
                "commodity_id": opp.get("commodity_id"),
                "commodity_nama": comm_nama,
                "judul": f"Peluang bantuan {comm_nama} dari {donor_nama} ({kapasitas:.0f} kg)",
                "data_pemicu": {
                    "donor_nama": donor_nama,
                    "kapasitas_kg": round(kapasitas, 0),
                },
                "penjelasan": (
                    f"{donor_nama} memiliki surplus {comm_nama} hingga {kapasitas:.0f} kg di atas batas aman 21 hari."
                ),
                "kenapa_penting": "Kerja sama antar desa dapat menutup kekurangan stok dengan biaya angkut rendah.",
                "tindakan": "lihat_bantuan",
            })

    # R8: Data usang
    if days_since_last_tx > 7:
        alerts.append({
            "rule_code": "R8",
            "tingkat": "Info",
            "commodity_id": None,
            "commodity_nama": "Semua Komoditas",
            "judul": f"Catatan stok belum diperbarui selama {days_since_last_tx} hari",
            "data_pemicu": {"hari_tanpa_pencatatan": days_since_last_tx},
            "penjelasan": f"Tidak ada transaksi stok masuk atau keluar selama {days_since_last_tx} hari terakhir.",
            "kenapa_penting": "Data stok yang mutakhir diperlukan agar perhitungan Hari Bertahan tetap akurat.",
            "tindakan": "catat_stok",
        })

    alerts.sort(key=lambda a: SEVERITY_ORDER.get(str(a["tingkat"]), 0), reverse=True)
    return alerts
