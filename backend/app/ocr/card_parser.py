import re
from typing import Optional
from app.schemas.business_card import OCRResult


def parse_email(text: str) -> Optional[str]:
    match = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)
    return match.group(0) if match else None


def parse_phone(text: str) -> Optional[str]:
    match = re.search(
        r"(\+?\d[\d\s\-().]{7,}\d)", text
    )
    return match.group(0).strip() if match else None


def parse_website(text: str) -> Optional[str]:
    match = re.search(
        r"(https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9\-]+\.(com|io|net|org|co)[^\s]*)",
        text, re.IGNORECASE
    )
    return match.group(0) if match else None


def parse_linkedin(text: str) -> Optional[str]:
    match = re.search(r"linkedin\.com/in/[^\s]+", text, re.IGNORECASE)
    return match.group(0) if match else None


def parse_twitter(text: str) -> Optional[str]:
    match = re.search(r"@([a-zA-Z0-9_]{1,15})", text)
    return match.group(0) if match else None


def parse_name(lines: list[str]) -> Optional[str]:
    """
    Heuristic: first non-empty line that has no digits,
    no special chars, and looks like a name (2+ words or title-cased).
    """
    for line in lines[:5]:
        line = line.strip()
        if not line:
            continue
        if re.search(r"[\d@/\\]", line):
            continue
        words = line.split()
        if len(words) >= 2:
            return line
        if line[0].isupper() and len(line) > 3:
            return line
    return None


def parse_job_title(lines: list[str], name: Optional[str]) -> Optional[str]:
    """
    Heuristic: line after the name that contains common title keywords
    or is title-cased and has no digits.
    """
    title_keywords = [
        "manager", "director", "engineer", "developer", "designer",
        "officer", "president", "founder", "ceo", "cto", "coo", "vp",
        "head", "lead", "analyst", "consultant", "associate", "executive",
        "specialist", "coordinator", "architect", "scientist"
    ]
    name_found = False
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if name and line == name:
            name_found = True
            continue
        if name_found or name is None:
            if re.search(r"\d", line):
                continue
            if any(kw in line.lower() for kw in title_keywords):
                return line
            if line[0].isupper() and len(line.split()) <= 6:
                return line
    return None


def parse_company(lines: list[str], name: Optional[str], title: Optional[str]) -> Optional[str]:
    """
    Heuristic: look for lines with company suffixes or ALL CAPS short lines.
    """
    company_keywords = ["inc", "ltd", "llc", "corp", "co.", "group",
                        "solutions", "technologies", "services", "consulting"]
    for line in lines:
        line = line.strip()
        if not line or line == name or line == title:
            continue
        if re.search(r"[\d@]", line):
            continue
        if any(kw in line.lower() for kw in company_keywords):
            return line
        if line.isupper() and 2 <= len(line.split()) <= 5:
            return line
    return None


def parse_card(raw_text: str, confidence: float) -> OCRResult:
    """
    Parse raw OCR text into structured business card fields.
    """
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]

    email = parse_email(raw_text)
    phone = parse_phone(raw_text)
    website = parse_website(raw_text)
    linkedin = parse_linkedin(raw_text)
    twitter = parse_twitter(raw_text)
    name = parse_name(lines)
    job_title = parse_job_title(lines, name)
    company = parse_company(lines, name, job_title)

    return OCRResult(
        raw_text=raw_text,
        full_name=name,
        job_title=job_title,
        company=company,
        email=email,
        phone=phone,
        website=website,
        linkedin=linkedin,
        twitter=twitter,
        confidence=f"{confidence:.2%}"
    )
