import sys
import time
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app  # noqa: E402
from app.store import store  # noqa: E402

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_state():
    store.reset_to_seed()
    yield


def test_demo_story_flow():
    """Langkah 3, 7, 9, 10 skenario demo PRD Bagian 17."""
    base = client.get("/api/v1/status/overview").json()
    assert base["pool_pokok"]["hari_bertahan"] == 32.8

    # 3. Picu krisis: harga terigu naik ~19% dalam 7 hari, peringatan R2/R3 muncul
    ev = client.post("/api/v1/demo/event", json={"event_id": "evt-konflik-gandum", "aktif": True}).json()
    codes = {a["rule_code"] for a in ev["peringatan"]}
    assert {"R2", "R3"} <= codes
    terigu = next(c for c in ev["overview"]["komoditas"] if c["kode"] == "terigu")
    assert 15.0 <= terigu["perubahan_harga_7d_pct"] <= 23.0

    # 7. Cari bantuan -> ajukan -> setujui otomatis -> stok terigu naik
    stok_awal = terigu["stok_efektif"]
    opt = client.post("/api/v1/network/optimize", json={}).json()
    u = next(x for x in opt["usulan_transfer"] if x["commodity_kode"] == "terigu")
    tr = client.post("/api/v1/transfers", json={
        "dari_village_id": u["dari_village_id"], "dari_village_nama": u["dari_village_nama"],
        "commodity_id": u["commodity_id"], "commodity_nama": u["commodity_nama"],
        "jumlah": u["jumlah_kg"], "jarak_km": u["jarak_km"], "biaya_angkut": u["biaya_angkut_rp"],
    }).json()
    ap = client.post("/api/v1/demo/approve-transfer", json={"transfer_id": tr["id"]}).json()
    terigu2 = next(c for c in ap["overview"]["komoditas"] if c["kode"] == "terigu")
    assert terigu2["stok_efektif"] > stok_awal

    # 9. Laporan + tautan publik
    sh = client.post("/api/v1/reports/share", json={"periode": 30}).json()
    pub = client.get(f"/api/v1/public/reports/{sh['token']}")
    assert pub.status_code == 200

    # 10. Reset < 5 detik, kembali ke baseline
    t0 = time.perf_counter()
    rs = client.post("/api/v1/demo/reset").json()
    assert time.perf_counter() - t0 < 5.0
    assert rs["overview"]["pool_pokok"]["hari_bertahan"] == 32.8


def test_assistant_tools_and_advance_clock():
    r = client.post("/api/v1/assistant/chat", json={"pesan": "Desa mana yang bisa bantu kedelai?"}).json()
    assert r["dasar_jawaban"][0]["tool"] == "suggest_transfers"
    before = store.get_as_of_date()
    client.post("/api/v1/demo/advance", json={"days": 7})
    assert (store.get_as_of_date() - before).days == 7
