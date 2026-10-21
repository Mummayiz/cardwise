from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user
from app.db.database import get_db
from app.exports.vcard import contacts_to_vcard
from app.exports.workbook import generate_master_workbook, master_workbook_path
from app.models.business_card import BusinessCard
from app.models.user import User

router = APIRouter(prefix="/exports", tags=["Exports"])


@router.get("/contacts.xlsx")
def export_contacts_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    path = master_workbook_path(current_user.id)
    try:
        generate_master_workbook(db, current_user.id, path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Could not generate the contact workbook") from exc
    return FileResponse(
        path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="Master_Contacts.xlsx",
    )


@router.get("/contacts.vcf")
def export_contacts_vcf(
    contact_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(BusinessCard).filter(BusinessCard.owner_id == current_user.id)
    if contact_id is not None:
        query = query.filter(BusinessCard.id == contact_id)
    contacts = query.order_by(BusinessCard.created_at.desc(), BusinessCard.id.desc()).all()
    if contact_id is not None and not contacts:
        raise HTTPException(status_code=404, detail="Contact not found")
    return Response(
        content=contacts_to_vcard(contacts),
        media_type="text/vcard; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="Contacts.vcf"'},
    )
