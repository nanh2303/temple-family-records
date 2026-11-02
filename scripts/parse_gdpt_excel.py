#!/usr/bin/env python3
"""Parse GDPT Đức Tuệ Excel into JSON profile payloads for Supabase import."""

from __future__ import annotations

import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from pathlib import Path

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

EXCEL_PATH = Path(__file__).resolve().parents[1] / "public" / "THONG TIN GDPT DUC TUE CAP NHAT 10.2025.xlsx"

# Training: (date_col, decision_col, record_key)
TRAINING_COLUMNS = [
    (24, 25, "long_term_mo_mat"),
    (26, 27, "long_term_canh_mem"),
    (28, 29, "long_term_chan_cung"),
    (30, 31, "long_term_tung_bay"),
    (36, 37, "long_term_huong_thien"),
    (38, 39, "long_term_so_thien"),
    (40, 41, "long_term_trung_thien"),
    (42, 43, "long_term_chanh_thien"),
    (48, 49, "long_term_hoa"),
    (50, 51, "long_term_truc"),
    (53, 54, "long_term_kien"),
    (55, 56, "long_term_tri"),
    (57, 58, "long_term_dinh"),
    (59, 60, "long_term_luc"),
    (32, 33, "camp_tuyet_son"),
    (44, 45, "camp_anoma_nilien"),
    (61, 62, "camp_loc_uyen"),
    (63, 64, "camp_a_duc"),
    (65, 66, "camp_huyen_trang"),
    (67, 68, "camp_van_hanh"),
    (69, 70, "ordination_tap"),
    (71, 72, "ordination_tin"),
    (73, 74, "ordination_tan"),
    (None, 75, "ordination_dung"),
]

MAPPED_HEADER_LABELS = {
    2: "GHI CHÚ → other notes",
    4: "HỌ VÀ TÊN → full_name",
    7: "NGÀY SINH → birth_date",
    9: "PHÁP DANH → dharma_name",
    10: "QUY Y → refuge_date",
    11: "PHÁT NGUYỆN → vow_date",
    12: "SỐ DANH BỘ → family_registry_no",
    13: "BỔN SƯ TRUYỀN GIỚI → preceptor",
    14: "HỌ TÊN CHA → father_name",
    15: "HỌ TÊN MẸ → mother_name",
    16: "ĐỊA CHỈ → address",
    20: "NGÀY VÀO ĐƠN VỊ → joined_unit_date",
    76: "ĐƯƠNG NHIỆM - ĐV → roles",
    77: "ĐƯƠNG NHIỆM - BHD → roles",
    78: "THÀNH TÍCH CÁ NHÂN → achievements",
    80: "N TẠ THẾ → death_date",
}


def col_row(cell_ref: str) -> tuple[int, int]:
    match = re.match(r"([A-Z]+)(\d+)", cell_ref)
    if not match:
        raise ValueError(f"Bad cell ref: {cell_ref}")
    col_letters, row_s = match.group(1), match.group(2)
    col = 0
    for ch in col_letters:
        col = col * 26 + (ord(ch) - 64)
    return col, int(row_s)


def load_sheet(path: Path) -> tuple[dict[int, dict[int, str]], dict[int, str | None]]:
    with zipfile.ZipFile(path) as zf:
        ss_root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
        strings: list[str] = []
        for si in ss_root.findall("m:si", NS):
            texts = [t.text or "" for t in si.findall(".//m:t", NS)]
            strings.append("".join(texts))

        sheet = ET.fromstring(zf.read("xl/worksheets/sheet1.xml"))
        rows: dict[int, dict[int, str]] = {}
        max_col = 0
        for cell in sheet.findall(".//m:c", NS):
            ref = cell.attrib.get("r")
            if not ref:
                continue
            col, row = col_row(ref)
            cell_type = cell.attrib.get("t")
            v = cell.find("m:v", NS)
            is_elem = cell.find("m:is", NS)
            val: str | None = None
            if cell_type == "s" and v is not None and v.text is not None:
                val = strings[int(v.text)]
            elif cell_type == "inlineStr" and is_elem is not None:
                val = "".join(t.text or "" for t in is_elem.findall(".//m:t", NS))
            elif v is not None and v.text is not None:
                val = v.text
            if val is None:
                continue
            rows.setdefault(row, {})[col] = val
            max_col = max(max_col, col)

    headers = {c: rows.get(1, {}).get(c) for c in range(1, max_col + 1)}
    return rows, headers


def clean_text(value: object | None) -> str | None:
    if value is None:
        return None
    text = str(value).strip().strip('"').strip("'").strip()
    if not text:
        return None
    return text


def excel_serial_to_iso(serial: float) -> str | None:
    try:
        # Excel 1900 date system (with the 1900 leap-year bug baked into the epoch)
        dt = datetime(1899, 12, 30) + timedelta(days=float(serial))
        return dt.date().isoformat()
    except (OverflowError, ValueError):
        return None


def is_valid_iso(value: str) -> bool:
    match = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", value)
    if not match:
        return False
    year, month, day = map(int, match.groups())
    try:
        datetime(year, month, day)
        return True
    except ValueError:
        return False


def parse_date(value: object | None, *, allow_year_only: bool = False) -> tuple[str | None, str | None]:
    """Return (iso_date_or_none, error_or_none). Empty input is not an error."""
    text = clean_text(value)
    if text is None:
        return None, None

    # Excel serial
    if re.fullmatch(r"\d+(\.\d+)?", text):
        number = float(text)
        if number > 20000:
            iso = excel_serial_to_iso(number)
            if iso and is_valid_iso(iso):
                return iso, None
            return None, f"Invalid Excel serial date: {text}"
        if allow_year_only and re.fullmatch(r"\d{4}", text):
            year = int(text)
            if 1900 <= year <= 2100:
                return f"{year:04d}-01-01", None
        if allow_year_only and 1900 <= number <= 2100 and number == int(number):
            return f"{int(number):04d}-01-01", None

    if allow_year_only and re.fullmatch(r"\d{4}", text):
        year = int(text)
        if 1900 <= year <= 2100:
            return f"{year:04d}-01-01", None

    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", text):
        return (text, None) if is_valid_iso(text) else (None, f"Invalid ISO date: {text}")

    # Strip leftover quotes / whitespace noise
    text = text.replace("́", "").strip()

    slash = re.fullmatch(r"(\d{1,2})[/-](\d{1,2})[/-](\d{4})", text)
    if slash:
        a, b, year = map(int, slash.groups())
        # Prefer DD/MM/YYYY; if month would be invalid, try MM/DD/YYYY
        day, month = a, b
        if month > 12 and day <= 12:
            month, day = a, b
            day, month = b, a
        try:
            iso = datetime(year, month, day).date().isoformat()
            return iso, None
        except ValueError:
            # Retry swapped
            try:
                iso = datetime(year, a if a <= 12 else b, b if a <= 12 else a).date().isoformat()
                # Better: try MM/DD explicitly when DD/MM failed
                iso = datetime(year, a, b).date().isoformat() if a <= 12 else None
                if iso and is_valid_iso(iso):
                    return iso, None
            except ValueError:
                pass
            try:
                iso = datetime(year, b, a).date().isoformat() if b <= 12 else None
                if iso:
                    return iso, None
            except ValueError:
                pass
            return None, f"Unparseable date: {text}"

    return None, f"Unparseable date: {text}"


def parse_training_date(value: object | None) -> tuple[str | None, str | None]:
    """Training N columns: dates only. Non-date text is ignored (not an error)."""
    text = clean_text(value)
    if text is None:
        return None, None
    # Pure decision-like text in a date column → ignore
    if not re.search(r"\d", text):
        return None, None
    if re.fullmatch(r"\d+(\.\d+)?", text) and float(text) > 20000:
        return parse_date(text)
    if re.search(r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}", text) or re.fullmatch(r"\d{4}-\d{2}-\d{2}", text):
        return parse_date(text)
    if re.fullmatch(r"\d{4}", text):
        return parse_date(text, allow_year_only=True)
    # Serial-looking integers that aren't clearly dates — try serial
    if re.fullmatch(r"\d+(\.\d+)?", text):
        return parse_date(text)
    return None, None


def truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def split_lines(value: object | None) -> list[str]:
    text = clean_text(value)
    if not text:
        return []
    parts: list[str] = []
    for line in re.split(r"[\r\n;]+", text):
        item = line.strip()
        if item:
            parts.append(item)
    return parts


def cell(row: dict[int, str], col: int | None) -> str | None:
    if col is None:
        return None
    return clean_text(row.get(col))


def build_profile(row_number: int, row: dict[int, str]) -> dict:
    errors: list[str] = []
    warnings: list[str] = []

    full_name = cell(row, 4)
    if not full_name:
        errors.append("Missing HỌ VÀ TÊN")

    birth_date, birth_err = parse_date(row.get(7), allow_year_only=True)
    if birth_err:
        warnings.append(f"birth_date: {birth_err} (left null)")
        birth_date = None

    refuge_date, refuge_err = parse_date(row.get(10))
    if refuge_err:
        warnings.append(f"refuge_date: {refuge_err} (left null)")
        refuge_date = None

    vow_date, vow_err = parse_date(row.get(11))
    if vow_err:
        warnings.append(f"vow_date: {vow_err} (left null)")
        vow_date = None

    joined_unit_date, joined_err = parse_date(row.get(20), allow_year_only=True)
    if joined_err:
        warnings.append(f"joined_unit_date: {joined_err} (left null)")
        joined_unit_date = None

    death_date, death_err = parse_date(row.get(80), allow_year_only=True)
    if death_err:
        warnings.append(f"death_date: {death_err} (left null)")
        death_date = None

    training_records: list[dict] = []
    for date_col, decision_col, key in TRAINING_COLUMNS:
        completed_date = None
        if date_col is not None:
            completed_date, date_err = parse_training_date(row.get(date_col))
            if date_err:
                warnings.append(f"{key} date: {date_err}")
                completed_date = None
        decision_raw = cell(row, decision_col)
        decision_no = truncate(decision_raw, 500) if decision_raw else None
        if completed_date or decision_no:
            training_records.append(
                {
                    "key": key,
                    "completed_date": completed_date,
                    "decision_no": decision_no,
                }
            )

    roles: list[dict] = []
    for col, organization in ((76, "Đơn vị"), (77, "BHD")):
        for title in split_lines(row.get(col)):
            roles.append(
                {
                    "role_title": truncate(title, 500),
                    "organization": organization,
                }
            )

    notes: list[dict] = []
    for content in split_lines(row.get(78)):
        notes.append({"note_type": "achievement", "content": truncate(content, 2000)})
    note_text = cell(row, 2)
    if note_text:
        notes.append({"note_type": "other", "content": truncate(note_text, 2000)})

    payload = {
        "family_registry_no": cell(row, 12),
        "bhd_registry_no": None,
        "full_name": full_name or "",
        "birth_date": birth_date,
        "birth_place": None,
        "dharma_name": cell(row, 9),
        "address": cell(row, 16),
        "hometown": None,
        "joined_unit_date": joined_unit_date,
        "vow_date": vow_date,
        "refuge_date": refuge_date,
        "preceptor": cell(row, 13),
        "father_name": cell(row, 14),
        "mother_name": cell(row, 15),
        "profile_picture_url": None,
        "death_date": death_date,
        "grave_location": None,
        "afterlife_note": None,
        "training_records": training_records,
        "roles": roles,
        "notes": notes,
    }

    return {
        "rowNumber": row_number,
        "status": "error" if errors else "ready",
        "errors": errors,
        "warnings": warnings,
        "payload": payload if not errors else None,
    }


def main() -> int:
    if not EXCEL_PATH.exists():
        print(json.dumps({"ok": False, "error": f"Missing Excel file: {EXCEL_PATH}"}))
        return 1

    rows, headers = load_sheet(EXCEL_PATH)
    max_row = max(rows)
    data_row_nums = [r for r in range(2, max_row + 1) if r in rows]

    mapped_cols = set(MAPPED_HEADER_LABELS)
    for date_col, decision_col, _key in TRAINING_COLUMNS:
        if date_col is not None:
            mapped_cols.add(date_col)
        if decision_col is not None:
            mapped_cols.add(decision_col)

    unmapped = []
    for col, label in headers.items():
        if col in mapped_cols:
            continue
        # Skip empty helper columns with no useful header
        if label is None:
            # Check occupancy
            occupied = sum(1 for r in data_row_nums if clean_text(rows[r].get(col)))
            if occupied == 0:
                continue
            unmapped.append({"col": col, "header": None, "occupied": occupied})
        else:
            occupied = sum(1 for r in data_row_nums if clean_text(rows[r].get(col)))
            unmapped.append({"col": col, "header": label.replace("\n", " ").strip(), "occupied": occupied})

    parsed_rows = [build_profile(r, rows[r]) for r in data_row_nums]
    ready = [r for r in parsed_rows if r["status"] == "ready"]
    errored = [r for r in parsed_rows if r["status"] == "error"]
    warned = [r for r in ready if r["warnings"]]

    result = {
        "ok": True,
        "source": str(EXCEL_PATH),
        "totalRows": len(parsed_rows),
        "readyRows": len(ready),
        "errorRows": len(errored),
        "warningRows": len(warned),
        "mappedHeaders": [{"col": c, "mapping": MAPPED_HEADER_LABELS[c]} for c in sorted(MAPPED_HEADER_LABELS)],
        "trainingColumnCount": len(TRAINING_COLUMNS),
        "unmappedHeaders": unmapped,
        "errors": [
            {"rowNumber": r["rowNumber"], "errors": r["errors"]}
            for r in errored
        ],
        "sampleWarnings": [
            {"rowNumber": r["rowNumber"], "full_name": r["payload"]["full_name"], "warnings": r["warnings"]}
            for r in warned[:20]
        ],
        "rows": ready,
    }
    json.dump(result, sys.stdout, ensure_ascii=False)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
