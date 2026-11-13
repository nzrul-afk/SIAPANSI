from __future__ import annotations
import re
from typing import Any, Iterable, List, Set, Tuple

# Small structural integers allowed in lists/steps (e.g. step 1, 2, 3, 4, 5 or 100%)
SAFE_STRUCTURAL_NUMBERS = {0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 7.0, 14.0, 21.0, 30.0, 60.0, 72.0, 90.0, 100.0, 180.0}

FORBIDDEN_INGREDIENTS = {
    "terigu": ["terigu", "gandum"],
    "kedelai": ["kedelai"],
    "daging_sapi": ["daging sapi", "sapi impor"],
    "salmon": ["salmon"],
    "keju": ["keju", "mozarella"],
}

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"abaikan\s+(semua\s+)?instruksi",
    r"system\s*prompt",
    r"you\s+are\s+now",
    r"kamu\s+sekarang\s+adalah",
    r"lupakan\s+aturan",
    r"hitung\s+sendiri",
    r"karang\s+angka",
]


def extract_numbers_from_context(obj: Any) -> Set[float]:
    """Recursively collect all numeric values from engine context dict/list."""
    nums: Set[float] = set()
    if isinstance(obj, bool):
        return nums
    if isinstance(obj, (int, float)):
        v = float(obj)
        nums.add(v)
        nums.add(round(v, 0))
        nums.add(round(v, 1))
        nums.add(round(v, 2))
        # Also add percentage equivalent if 0 < v <= 1
        if 0.0 <= v <= 1.0:
            nums.add(round(v * 100.0, 0))
            nums.add(round(v * 100.0, 1))
        return nums
    if isinstance(obj, str):
        for n in parse_numbers_in_text(obj):
            nums.add(n)
        return nums
    if isinstance(obj, dict):
        for k, v in obj.items():
            nums.update(extract_numbers_from_context(v))
        return nums
    if isinstance(obj, (list, tuple, set)):
        for item in obj:
            nums.update(extract_numbers_from_context(item))
        return nums
    return nums


def parse_numbers_in_text(text: str) -> List[float]:
    """
    Parse numbers in Indonesian or standard format from text.
    Examples: '17.100' -> 17100.0, '32,8' -> 32.8, '1.199,5' -> 1199.5, '14.5' -> 14.5
    """
    if not text:
        return []
    # Remove ISO dates like 2026-11-12 so year/month/day aren't misread
    cleaned = re.sub(r"\b20\d{2}-\d{2}-\d{2}\b", " ", text)
    pattern = r"(?<![a-zA-Z0-9_])\d+(?:[.,]\d+)*(?![a-zA-Z0-9_])"
    matches = re.findall(pattern, cleaned)
    results: List[float] = []

    for m in matches:
        try:
            if "." in m and "," in m:
                # Indonesian 1.234,5
                norm = m.replace(".", "").replace(",", ".")
                results.append(float(norm))
            elif "," in m:
                parts = m.split(",")
                if len(parts) == 2 and len(parts[1]) in (1, 2):
                    results.append(float(m.replace(",", ".")))
                else:
                    results.append(float(m.replace(",", "")))
            elif "." in m:
                parts = m.split(".")
                # If thousand separator like 17.100 or 1.200.000
                if all(len(p) == 3 for p in parts[1:]) and len(parts[0]) <= 3:
                    results.append(float(m.replace(".", "")))
                else:
                    results.append(float(m))
            else:
                results.append(float(m))
        except ValueError:
            continue
    return results


def validate_numbers_against_context(
    text: str,
    context: Any,
    rel_tol: float = 0.02,
    abs_tol: float = 1.0,
) -> Tuple[bool, List[float]]:
    """
    10.4 Verify that every number mentioned in LLM output text matches a number in context
    within rounding tolerance. Returns (is_valid, unmatched_numbers).
    """
    allowed = extract_numbers_from_context(context) | SAFE_STRUCTURAL_NUMBERS
    found = parse_numbers_in_text(text)
    unmatched: List[float] = []

    for val in found:
        matched = False
        for ref in allowed:
            if abs(val - ref) <= max(abs_tol, abs(ref) * rel_tol):
                matched = True
                break
        if not matched:
            unmatched.append(val)

    return (len(unmatched) == 0, unmatched)


def validate_menu_ingredients(text: str, allowed_ingredient_names: Iterable[str]) -> Tuple[bool, List[str]]:
    """
    10.4 Verify that LLM menu text does not hallucinate forbidden/excluded ingredients
    that are not in `allowed_ingredient_names`.
    """
    lower_text = text.lower()
    allowed_lower = " ".join(n.lower() for n in allowed_ingredient_names)
    violations: List[str] = []

    for key, keywords in FORBIDDEN_INGREDIENTS.items():
        for kw in keywords:
            if kw in lower_text and kw not in allowed_lower:
                violations.append(kw)

    return (len(violations) == 0, violations)


def sanitize_untrusted_note(note: str) -> Tuple[str, bool]:
    """
    10.5 Guardrail against prompt injection inside user stock notes or inputs.
    Treats user note strictly as data and strips instruction-hijacking patterns.
    """
    if not note:
        return ("", False)
    flagged = False
    cleaned = note
    for pat in INJECTION_PATTERNS:
        if re.search(pat, cleaned, flags=re.IGNORECASE):
            flagged = True
            cleaned = re.sub(pat, "[catatan-disaring]", cleaned, flags=re.IGNORECASE)
    return (cleaned[:300], flagged)
