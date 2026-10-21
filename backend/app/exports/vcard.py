"""Minimal vCard 3.0 serializer with UTF-8-safe line folding."""

from typing import Iterable

from app.models.business_card import BusinessCard


def _escape(value: str) -> str:
    return (
        str(value)
        .replace("\\", "\\\\")
        .replace("\r\n", "\\n")
        .replace("\n", "\\n")
        .replace("\r", "\\n")
        .replace(",", "\\,")
        .replace(";", "\\;")
    )


def _fold(line: str) -> str:
    chunks = []
    current = ""
    current_bytes = 0
    for character in line:
        width = len(character.encode("utf-8"))
        if current_bytes + width > 75:
            chunks.append(current)
            current = " "
            current_bytes = 1
        current += character
        current_bytes += width
    chunks.append(current)
    return "\r\n".join(chunks)


def contacts_to_vcard(contacts: Iterable[BusinessCard]) -> bytes:
    cards = []
    for contact in contacts:
        name = contact.full_name or contact.company or contact.email or "Unnamed contact"
        parts = name.split()
        given = parts[0] if parts else ""
        family = parts[-1] if len(parts) > 1 else ""
        middle = " ".join(parts[1:-1]) if len(parts) > 2 else ""
        lines = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            f"N:{_escape(family)};{_escape(given)};{_escape(middle)};;",
            f"FN:{_escape(name)}",
        ]
        if contact.company:
            lines.append(f"ORG:{_escape(contact.company)}")
        if contact.job_title:
            lines.append(f"TITLE:{_escape(contact.job_title)}")
        if contact.phone:
            lines.append(f"TEL;TYPE=WORK,VOICE:{_escape(contact.phone)}")
        if contact.email:
            lines.append(f"EMAIL;TYPE=INTERNET,WORK:{_escape(contact.email)}")
        if contact.website:
            lines.append(f"URL:{_escape(contact.website)}")
        if contact.address:
            lines.append(f"ADR;TYPE=WORK:;;{_escape(contact.address)};;;;")
        if contact.notes:
            lines.append(f"NOTE:{_escape(contact.notes)}")
        lines.extend([f"UID:business-card-{contact.id}", "END:VCARD"])
        cards.append("\r\n".join(_fold(line) for line in lines))
    return ("\r\n".join(cards) + ("\r\n" if cards else "")).encode("utf-8")
