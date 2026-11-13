from __future__ import annotations
import math
import warnings
from datetime import date, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
try:
    from statsmodels.tsa.holtwinters import ExponentialSmoothing
except ImportError:
    ExponentialSmoothing = None

_FORECAST_CACHE: Dict[Tuple[float, float, str, float, float, bool], Dict[str, object]] = {}


def generate_104w_price_series(
    kode: str,
    harga_acuan: float,
    as_of: date,
    active_event_uplift_7d: float = 0.0,
    active_event_uplift_full: float = 0.0,
    days_since_event: int = 0,
) -> List[Dict[str, object]]:
    """
    16.4 Generate deterministic 104-week historical price series ending at as_of.
    Without active event, the last week equals harga_acuan.
    When an event is active:
      - 35% of full increase in first 7 days, 100% by 30 days.
      - Example: terigu (e=1.0, dP=0.4, dK=0.1) -> full = 1.4*1.1 - 1 = +54%, 7d = 0.35*54% = +18.9% (~+19%).
    """
    seed_val = sum(ord(ch) * (i + 1) for i, ch in enumerate(kode)) + 2026
    rng = np.random.default_rng(seed_val)
    n_weeks = 104
    raw = np.zeros(n_weeks)

    for w in range(n_weeks):
        t = w / float(n_weeks - 1)
        if kode == "beras":
            val = 0.90 + 0.10 * t + 0.018 * math.sin(2 * math.pi * w / 52.0) + rng.normal(0, 0.008)
        elif kode == "terigu":
            bump = 0.05 if 60 <= w <= 68 else 0.0
            val = 0.96 + 0.04 * t + bump + rng.normal(0, 0.007)
        elif kode == "kedelai":
            val = 0.92 + 0.08 * t + 0.03 * math.sin(2 * math.pi * w / 26.0) + rng.normal(0, 0.015)
        elif kode == "minyak":
            bump = 0.08 if 40 <= w <= 48 else 0.0
            val = 0.98 + 0.02 * t + bump + rng.normal(0, 0.006)
        elif kode == "gula":
            val = 0.94 + 0.06 * t + 0.045 * math.sin(2 * math.pi * w / 52.0) + rng.normal(0, 0.010)
        elif kode == "telur":
            val = 0.95 + 0.05 * t + 0.07 * math.sin(4 * math.pi * w / 52.0) + rng.normal(0, 0.018)
        elif kode in ("bawang_merah", "cabai_rawit"):
            val = 0.90 + 0.10 * t + 0.22 * math.sin(2 * math.pi * w / 26.0) + rng.normal(0, 0.07)
        else:
            val = 0.94 + 0.06 * t + 0.03 * math.sin(2 * math.pi * w / 52.0) + rng.normal(0, 0.015)
        raw[w] = max(0.5, val)

    # Normalize so week 103 (last week) is exactly harga_acuan at baseline
    scale = harga_acuan / raw[-1]
    prices = raw * scale
    prices[-1] = harga_acuan
    # Keep 1 week ago and 4 weeks ago clean for baseline stability (< 3% change)
    if kode not in ("bawang_merah", "cabai_rawit"):
        prices[-2] = round(harga_acuan * 0.992, 0)
        prices[-5] = round(harga_acuan * 0.985, 0)

    # Apply event uplift if active
    if active_event_uplift_full > 0.0:
        if days_since_event <= 7:
            current_uplift = active_event_uplift_7d
        elif days_since_event >= 30:
            current_uplift = active_event_uplift_full
        else:
            frac = (days_since_event - 7.0) / 23.0
            current_uplift = active_event_uplift_7d + frac * (active_event_uplift_full - active_event_uplift_7d)
        prices[-1] = round(harga_acuan * (1.0 + current_uplift), 0)

    series = []
    start_date = as_of - timedelta(weeks=n_weeks - 1)
    for w in range(n_weeks):
        w_date = start_date + timedelta(weeks=w)
        series.append({
            "minggu_ke": w + 1,
            "tanggal": w_date.isoformat(),
            "harga": round(float(prices[w]), 0),
        })
    return series


def forecast_price_4_weeks(
    series_104w: List[Dict[str, object]],
    as_of: date,
    eksposur_impor: float = 0.0,
    signal_intensity: float = 0.20,
    event_active: bool = False,
) -> Dict[str, object]:
    """
    10.3 Forecast 4 weeks ahead using Holt-Winters ExponentialSmoothing (damped trend, seasonal=52)
    with fallback to linear trend + seasonal naive, plus 80% bootstrap residual confidence band.
    """
    y = np.array([float(x["harga"]) for x in series_104w], dtype=float)
    last_price = float(y[-1])
    prev_1w = float(y[-2]) if len(y) >= 2 else last_price
    prev_4w = float(y[-5]) if len(y) >= 5 else last_price

    cache_key = (
        round(last_price, 1),
        round(prev_1w, 1),
        as_of.isoformat(),
        round(eksposur_impor, 3),
        round(signal_intensity, 3),
        bool(event_active),
    )
    if cache_key in _FORECAST_CACHE:
        return _FORECAST_CACHE[cache_key]

    change_7d_pct = ((last_price - prev_1w) / prev_1w) * 100.0 if prev_1w > 0 else 0.0
    change_30d_pct = ((last_price - prev_4w) / prev_4w) * 100.0 if prev_4w > 0 else 0.0

    # Volatility indicator (Coefficient of Variation over last 26 weeks)
    recent_26 = y[-26:] if len(y) >= 26 else y
    cv_pct = (float(np.std(recent_26)) / max(1.0, float(np.mean(recent_26)))) * 100.0
    if cv_pct >= 12.0:
        volatilitas = "Tinggi"
    elif cv_pct >= 4.5:
        volatilitas = "Sedang"
    else:
        volatilitas = "Rendah"

    method_used = "Holt-Winters ExponentialSmoothing"
    failed_hw = False
    if ExponentialSmoothing is not None:
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                model = ExponentialSmoothing(
                    y,
                    trend="add",
                    damped_trend=True,
                    seasonal="add",
                    seasonal_periods=52,
                    initialization_method="heuristic",
                )
                fit_res = model.fit(
                    smoothing_level=0.35,
                    smoothing_trend=0.05,
                    smoothing_seasonal=0.15,
                    damping_trend=0.90,
                    optimized=False,
                )
                fc_raw = np.array(fit_res.forecast(4), dtype=float)
                residuals = y - fit_res.fittedvalues
                if np.any(np.isnan(fc_raw)) or np.any(fc_raw <= 0):
                    failed_hw = True
        except Exception:
            failed_hw = True
    else:
        failed_hw = True

    if failed_hw:
        method_used = "Tren Linier + Seasonal Naive (Fallback)"
        slope = (y[-1] - y[-13]) / 12.0 if len(y) >= 13 else 0.0
        fc_raw = np.array([
            y[-1] + slope * h + 0.3 * (y[-52 + h] - np.mean(y[-52:]))
            for h in range(1, 5)
        ], dtype=float)
        residuals = np.diff(y)

    # Bootstrap 80% confidence interval (P10 to P90 of residuals)
    rng = np.random.default_rng(104)
    boot_samples = rng.choice(residuals, size=(500, 4), replace=True)
    cum_err = np.cumsum(boot_samples, axis=1)
    q10 = np.percentile(cum_err, 10, axis=0)
    q90 = np.percentile(cum_err, 90, axis=0)

    # Global event uplift: harga_forecast * (1 + uplift) where uplift = intensitas * eksposur_k * koefisien_sinyal
    koef_sinyal = 0.28 if event_active else 0.04
    uplift_total = float(signal_intensity) * float(eksposur_impor) * koef_sinyal

    forecasts = []
    for h in range(4):
        step_uplift = 1.0 + uplift_total * ((h + 1) / 4.0)
        med = max(500.0, float(fc_raw[h]) * step_uplift)
        # Ensure smooth continuation from current price when event is active
        if event_active and med < last_price:
            med = last_price * (1.0 + 0.03 * (h + 1) * max(0.2, eksposur_impor))
        low80 = max(400.0, med + float(q10[h]) - abs(med * 0.03 * (h + 1)))
        high80 = max(med * 1.03, med + float(q90[h]) + abs(med * 0.03 * (h + 1)))
        f_date = as_of + timedelta(weeks=h + 1)
        forecasts.append({
            "minggu_ke_depan": h + 1,
            "tanggal": f_date.isoformat(),
            "harga_prediksi": round(med, 0),
            "batas_bawah_80": round(min(med * 0.96, low80), 0),
            "batas_atas_80": round(max(med * 1.04, high80), 0),
        })

    pred_4w_price = float(forecasts[-1]["harga_prediksi"])
    pred_4w_change_pct = ((pred_4w_price - last_price) / last_price) * 100.0 if last_price > 0 else 0.0

    res_dict: Dict[str, object] = {
        "harga_sekarang": round(last_price, 0),
        "perubahan_7d_pct": round(change_7d_pct, 1),
        "perubahan_30d_pct": round(change_30d_pct, 1),
        "prediksi_4w_pct": round(pred_4w_change_pct, 1),
        "volatilitas": volatilitas,
        "koefisien_variasi_pct": round(cv_pct, 1),
        "metode_model": method_used,
        "prediksi_4_minggu": forecasts,
    }
    _FORECAST_CACHE[cache_key] = res_dict
    return res_dict
