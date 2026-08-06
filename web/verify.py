#!/usr/bin/env python3
"""Validate the generated static site without third-party dependencies."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "docs"
EXPORT = ROOT / "Old Website"

CANONICAL_PAGES = {
    "index.html": "https://veterans.mt/",
    "events/index.html": "https://veterans.mt/events/",
    "apply/index.html": "https://veterans.mt/apply/",
    "contacts/index.html": "https://veterans.mt/contacts/",
    "statute/index.html": "https://veterans.mt/statute/",
    "operation-pedestal/index.html": "https://veterans.mt/operation-pedestal/",
    "victory-day/index.html": "https://veterans.mt/victory-day/",
    "remembrance-sunday/index.html": "https://veterans.mt/remembrance-sunday/",
    "independence-day/index.html": "https://veterans.mt/independence-day/",
    "language-policy/index.html": "https://veterans.mt/language-policy/",
    "branding/index.html": "https://veterans.mt/branding/",
    "old-branding/index.html": "https://veterans.mt/old-branding/",
    "privacy-policy/index.html": "https://veterans.mt/privacy-policy/",
}


class DocumentAudit(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.refs: list[tuple[str, str]] = []
        self.inline_urls: list[str] = []
        self.images = 0
        self.images_without_alt: list[str] = []
        self.iframes = 0
        self.iframes_without_title: list[str] = []
        self.h1_count = 0
        self.external_blank_without_rel: list[str] = []
        self.aria_references: list[str] = []
        self.canonical_urls: list[str] = []
        self.meta_refreshes: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {name: value or "" for name, value in attrs}
        if values.get("id"):
            self.ids.append(values["id"])
        for name in ("href", "src"):
            if values.get(name):
                self.refs.append((name, values[name]))
        if values.get("style"):
            self.inline_urls.extend(re.findall(r"url\(['\"]?([^)'\"]+)", values["style"]))
        for name in ("aria-controls", "aria-describedby", "aria-labelledby"):
            self.aria_references.extend(values.get(name, "").split())
        if tag == "img":
            self.images += 1
            if "alt" not in values:
                self.images_without_alt.append(values.get("src", "<unknown>"))
        if tag == "iframe":
            self.iframes += 1
            if not values.get("title"):
                self.iframes_without_title.append(values.get("src", "<unknown>"))
        if tag == "h1":
            self.h1_count += 1
        if tag == "link" and "canonical" in values.get("rel", "").lower().split():
            self.canonical_urls.append(values.get("href", ""))
        if tag == "meta" and values.get("http-equiv", "").lower() == "refresh":
            self.meta_refreshes.append(values.get("content", ""))
        if tag == "a" and values.get("target") == "_blank":
            href = values.get("href", "")
            rel = set(values.get("rel", "").split())
            if href.startswith(("http://", "https://")) and "noopener" not in rel:
                self.external_blank_without_rel.append(href)


def is_external(reference: str) -> bool:
    parsed = urlsplit(reference)
    return bool(parsed.scheme or parsed.netloc) and parsed.scheme not in {"", "file"}


def local_target(source: Path, reference: str) -> tuple[Path, str]:
    parsed = urlsplit(reference)
    clean_path = unquote(parsed.path)
    if clean_path.startswith("/"):
        target = OUT / clean_path.lstrip("/")
    else:
        target = source.parent / clean_path
    if clean_path.endswith("/") or target.is_dir():
        target /= "index.html"
    return target.resolve(), unquote(parsed.fragment)


def audit_html(path: Path, expected_canonical: str, errors: list[str]) -> DocumentAudit:
    label = path.relative_to(OUT).as_posix()
    source = path.read_text(encoding="utf-8")
    if re.search(r"{{[^{}]+}}", source):
        errors.append(f"{label}: unresolved build placeholder")
    parser = DocumentAudit()
    parser.feed(source)
    duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
    if duplicates:
        errors.append(f"{label}: duplicate IDs: {', '.join(duplicates)}")
    if parser.images_without_alt:
        errors.append(f"{label}: images without alt: {parser.images_without_alt}")
    if parser.iframes_without_title:
        errors.append(f"{label}: iframes without title: {parser.iframes_without_title}")
    if parser.external_blank_without_rel:
        errors.append(f"{label}: target=_blank links missing noopener: {parser.external_blank_without_rel}")
    missing_aria_references = sorted(set(parser.aria_references) - set(parser.ids))
    if missing_aria_references:
        errors.append(f"{label}: unresolved ARIA references: {missing_aria_references}")
    if parser.canonical_urls != [expected_canonical]:
        errors.append(
            f"{label}: expected canonical URL {expected_canonical!r}, "
            f"found {parser.canonical_urls!r}"
        )
    if parser.meta_refreshes:
        errors.append(f"{label}: unexpected redirect metadata: {parser.meta_refreshes}")

    for attribute, reference in parser.refs:
        if reference.startswith("#"):
            fragment = unquote(reference[1:])
            if fragment and fragment not in parser.ids:
                errors.append(f"{label}: missing same-page fragment #{fragment}")
            continue
        if reference.startswith(("mailto:", "tel:", "javascript:")) or is_external(reference):
            continue
        parsed_reference = urlsplit(reference)
        clean_reference_path = unquote(parsed_reference.path)
        if clean_reference_path.startswith("/"):
            errors.append(f"{label}: root-absolute local reference is not project-pages safe: {reference}")
        if attribute == "href" and clean_reference_path.lower().endswith((".html", ".htm")):
            errors.append(f"{label}: internal page link exposes an HTML filename: {reference}")
        if any(character.isupper() for character in clean_reference_path):
            errors.append(f"{label}: incorrectly capitalized local URL: {reference}")
        target, fragment = local_target(path, reference)
        try:
            target.relative_to(OUT.resolve())
        except ValueError:
            errors.append(f"{label}: local reference escapes output directory: {reference}")
            continue
        if not target.exists():
            errors.append(f"{label}: missing local reference {reference}")
            continue
        if attribute == "href" and target.name == "index.html" and not clean_reference_path.endswith("/"):
            errors.append(f"{label}: folder page link lacks a trailing slash: {reference}")
        if fragment and target.suffix.lower() in {".html", ".htm"}:
            target_parser = DocumentAudit()
            target_parser.feed(target.read_text(encoding="utf-8"))
            if fragment not in target_parser.ids:
                errors.append(f"{label}: missing fragment #{fragment} in {target.relative_to(OUT)}")
    for reference in parser.inline_urls:
        if is_external(reference) or reference.startswith("data:"):
            continue
        target, _ = local_target(path, reference)
        try:
            target.relative_to(OUT.resolve())
        except ValueError:
            errors.append(f"{label}: CSS URL escapes output directory: {reference}")
            continue
        if not target.exists():
            errors.append(f"{label}: missing inline CSS URL {reference}")
    return parser


def audit_css(path: Path, errors: list[str]) -> None:
    css = path.read_text(encoding="utf-8")
    for reference in re.findall(r"url\(['\"]?([^)'\"]+)", css):
        if is_external(reference) or reference.startswith("data:"):
            continue
        target, _ = local_target(path, reference)
        try:
            target.relative_to(OUT.resolve())
        except ValueError:
            errors.append(f"{path.relative_to(OUT)}: CSS URL escapes output directory: {reference}")
            continue
        if not target.exists():
            errors.append(f"{path.relative_to(OUT)}: missing CSS URL {reference}")


def verify_event_assets(errors: list[str]) -> None:
    source_stems = {
        path.stem
        for path in (EXPORT / "Events").glob("*.jpg")
        if path.name != "a7b9fabe35702470920bcb0dde7ac1cb.jpg"
    }
    page = (OUT / "events" / "index.html").read_text(encoding="utf-8")
    referenced_stems = {
        Path(unquote(match)).stem
        for match in re.findall(r"assets/images/events/([^'\"?#)]+)", page)
    }
    missing = sorted(source_stems - referenced_stems)
    unexpected = sorted(referenced_stems - source_stems)
    if missing:
        errors.append(f"events/index.html: {len(missing)} exported images omitted: {missing}")
    if unexpected:
        errors.append(f"events/index.html: unexpected image stems: {unexpected}")
    if len(referenced_stems) != 161:
        errors.append(f"events/index.html: expected 161 unique event photos, found {len(referenced_stems)}")


def main() -> int:
    errors: list[str] = []
    expected_pages = set(CANONICAL_PAGES)
    actual_pages = {
        path.relative_to(OUT).as_posix()
        for path in OUT.rglob("*.html")
    } if OUT.exists() else set()
    for name in sorted(expected_pages - actual_pages):
        errors.append(f"Missing generated page: {name}")
    for name in sorted(actual_pages - expected_pages):
        errors.append(f"Unexpected duplicate, legacy, or misplaced page: {name}")

    totals = {"images": 0, "iframes": 0}
    for name, canonical_url in CANONICAL_PAGES.items():
        path = OUT / name
        if not path.exists():
            continue
        result = audit_html(path, canonical_url, errors)
        totals["images"] += result.images
        totals["iframes"] += result.iframes
        if result.h1_count != 1:
            errors.append(f"{name}: expected exactly one h1, found {result.h1_count}")

    for css_path in (OUT / "assets" / "css").glob("*.css"):
        audit_css(css_path, errors)

    if (OUT / "events" / "index.html").exists():
        verify_event_assets(errors)

    if errors:
        print("Verification failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(
        f"Verified {len(CANONICAL_PAGES)} folder-based pages, no duplicate aliases, "
        f"{totals['images']} images, {totals['iframes']} video embeds, canonical URLs, "
        "and all local references."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
