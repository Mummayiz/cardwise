"""Build the private, per-user master contact workbook."""

import logging
import os
import tempfile
from pathlib import Path
from typing import Optional
from datetime import timezone

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.worksheet.table import Table, TableStyleInfo
from sqlalchemy.orm import Session

from app.models.business_card import BusinessCard

logger = logging.getLogger(__name__)

HEADERS = [
    "Contact ID",
    "Full Name",
    "Company Name",
    "Designation",
    "Phone Number",
    "Email Address",
    "Website",
    "Business Address",
    "Date Scanned",
    "Notes",
    "Review Status",
]


def master_workbook_path(owner_id: int) -> Path:
    # Keep private exports outside the publicly mounted uploads directory.
    backend_root = Path(__file__).resolve().parents[2]
    return backend_root / "private_exports" / str(owner_id) / "Master_Contacts.xlsx"


def _spreadsheet_text(value: Optional[str]) -> str:
    """Force untrusted text values to remain literal in spreadsheet apps."""
    if value is None:
        return ""
    text = str(value)
    if text.lstrip().startswith(("=", "+", "-", "@", "\t", "\r")):
        return "'" + text
    return text


def _excel_datetime(value):
    if value is None or value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


def generate_master_workbook(db: Session, owner_id: int, destination: Path) -> Path:
    contacts = (
        db.query(BusinessCard)
        .filter(BusinessCard.owner_id == owner_id)
        .order_by(BusinessCard.created_at.desc(), BusinessCard.id.desc())
        .all()
    )

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Master Contacts"
    sheet.append(HEADERS)

    for contact in contacts:
        values = [
            contact.id,
            _spreadsheet_text(contact.full_name),
            _spreadsheet_text(contact.company),
            _spreadsheet_text(contact.job_title),
            _spreadsheet_text(contact.phone),
            _spreadsheet_text(contact.email),
            _spreadsheet_text(contact.website),
            _spreadsheet_text(contact.address),
            _excel_datetime(contact.created_at),
            _spreadsheet_text(contact.notes),
            "Saved",
        ]
        sheet.append(values)
        # Contact numbers are text: preserve leading +, zeros, and formatting.
        sheet.cell(sheet.max_row, 5).number_format = "@"

    header_fill = PatternFill("solid", fgColor="176B4C")
    for cell in sheet[1]:
        cell.fill = header_fill
        cell.font = Font(name="Arial", size=10, bold=True, color="FFFFFF")
        cell.alignment = Alignment(vertical="center")

    for row in sheet.iter_rows(min_row=2):
        for cell in row:
            cell.font = Font(name="Arial", size=10, color="18241F")
            cell.alignment = Alignment(vertical="top", wrap_text=cell.column in (8, 10))
        row[8].number_format = "yyyy-mm-dd hh:mm"

    sheet.freeze_panes = "A2"
    sheet.auto_filter.ref = f"A1:K{max(sheet.max_row, 1)}"
    sheet.row_dimensions[1].height = 28
    widths = {"A": 13, "B": 24, "C": 26, "D": 22, "E": 20, "F": 30, "G": 28, "H": 38, "I": 20, "J": 34, "K": 18}
    for column, width in widths.items():
        sheet.column_dimensions[column].width = width

    if contacts:
        table = Table(displayName="MasterContacts", ref=f"A1:K{sheet.max_row}")
        table.tableStyleInfo = TableStyleInfo(
            name="TableStyleMedium4",
            showFirstColumn=False,
            showLastColumn=False,
            showRowStripes=True,
            showColumnStripes=False,
        )
        sheet.add_table(table)

    destination.parent.mkdir(parents=True, exist_ok=True)
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            dir=destination.parent,
            prefix=".master-contacts-",
            suffix=".xlsx",
            delete=False,
        ) as temp_file:
            temp_path = Path(temp_file.name)
        workbook.save(temp_path)
        os.replace(temp_path, destination)
    finally:
        if temp_path and temp_path.exists():
            temp_path.unlink()
    return destination


def refresh_master_workbook(db: Session, owner_id: int) -> None:
    """Refresh after contact mutations without failing the saved contact operation."""
    try:
        generate_master_workbook(db, owner_id, master_workbook_path(owner_id))
    except Exception:
        logger.exception("Could not refresh the master workbook for owner %s", owner_id)
