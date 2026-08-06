#!/usr/bin/env python3
"""Build the dependency-free static Malta Veterans Association website."""

from __future__ import annotations

import html
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "docs"
EXPORT = ROOT / "Old Website"


PAGES = [
    {
        "source": "home.html",
        "output": "index.html",
        "url": "",
        "title": "Home",
        "description": "The official website of the Malta Veterans Association.",
        "key": "home",
    },
    {
        "source": "events.html",
        "output": "events/index.html",
        "url": "events/",
        "title": "Events",
        "description": "Events and news from the Malta Veterans Association.",
        "key": "events",
    },
    {
        "source": "apply.html",
        "output": "apply/index.html",
        "url": "apply/",
        "title": "Apply",
        "description": "Apply to join the Malta Veterans Association.",
        "key": "apply",
    },
    {
        "source": "contacts.html",
        "output": "contacts/index.html",
        "url": "contacts/",
        "title": "Contacts",
        "description": "Contact the Malta Veterans Association.",
        "key": "contacts",
    },
    {
        "source": "statute.html",
        "output": "statute/index.html",
        "url": "statute/",
        "title": "Statute",
        "description": "The statute of the Veterans Association Armed Forces of Malta.",
        "key": "statute",
        "body_class": "page-statute no-hero statute-page",
        "footer": False,
    },
    {
        "source": "operation-pedestal.html",
        "output": "operation-pedestal/index.html",
        "url": "operation-pedestal/",
        "title": "Operation Pedestal",
        "description": "The Santa Maria Convoy, also known as Operation Pedestal.",
        "key": "operation-pedestal",
        "section": "articles",
    },
    {
        "source": "victory-day.html",
        "output": "victory-day/index.html",
        "url": "victory-day/",
        "title": "Victory Day",
        "description": "The history and commemoration of Victory Day in Malta.",
        "key": "victory-day",
        "section": "articles",
    },
    {
        "source": "remembrance-sunday.html",
        "output": "remembrance-sunday/index.html",
        "url": "remembrance-sunday/",
        "title": "Remembrance Sunday",
        "description": "Remembrance Sunday commemorations from the Malta Veterans Association.",
        "key": "remembrance-sunday",
        "section": "articles",
    },
    {
        "source": "independence-day.html",
        "output": "independence-day/index.html",
        "url": "independence-day/",
        "title": "Independence Day",
        "description": "The history of Malta's Independence Day.",
        "key": "independence-day",
        "section": "articles",
    },
    {
        "source": "language-policy.html",
        "output": "language-policy/index.html",
        "url": "language-policy/",
        "title": "Language Policy",
        "description": "The Malta Veterans Association language policy.",
        "key": "language-policy",
    },
    {
        "source": "branding.html",
        "output": "branding/index.html",
        "url": "branding/",
        "title": "Branding",
        "description": "Malta Veterans Association brand guidelines.",
        "key": "branding",
    },
    {
        "source": "old-branding.html",
        "output": "old-branding/index.html",
        "url": "old-branding/",
        "title": "OLD Branding",
        "description": "Legacy Malta Veterans Association brand guidelines.",
        "key": "old-branding",
    },
    {
        "source": "privacy-policy.html",
        "output": "privacy-policy/index.html",
        "url": "privacy-policy/",
        "title": "privacy-policy",
        "description": "Malta Veterans Association privacy policy.",
        "key": "privacy-policy",
    },
]


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def fill(template: str, values: dict[str, str]) -> str:
    for key, value in values.items():
        template = template.replace("{{" + key + "}}", value)
    return template


def active_header(template: str, key: str, section: str | None = None) -> str:
    pattern = rf'(<a\b[^>]*\bdata-nav="{re.escape(key)}")'
    template, count = re.subn(pattern, r'\1 aria-current="page"', template, count=1)
    if not count and key not in {"branding", "old-branding", "privacy-policy"}:
        raise ValueError(f"Navigation key not found in header: {key}")
    if section:
        template = template.replace(
            f'data-nav-section="{section}"',
            f'data-nav-section="{section}" class="has-dropdown is-current-section"',
        ).replace('class="has-dropdown" data-nav-section="articles" class="has-dropdown is-current-section"',
                  'class="has-dropdown is-current-section" data-nav-section="articles"')
    return template


def actual_extension(path: Path) -> str:
    signature = path.read_bytes()[:12]
    if signature.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if signature.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    raise ValueError(f"Unsupported image format: {path}")


def copy_image(source: Path, destination_dir: Path, name: str | None = None) -> Path:
    extension = actual_extension(source)
    destination_dir.mkdir(parents=True, exist_ok=True)
    destination = destination_dir / ((name or source.stem) + extension)
    shutil.copy2(source, destination)
    return destination


def rebase_fragment_assets(fragment: str, site_root: str) -> str:
    """Make fragment-local asset URLs work from the generated page directory."""
    return re.sub(
        r"(\b(?:href|src|poster)=[\"'])assets/",
        rf"\1{site_root}/assets/",
        fragment,
    )


def prepare_assets() -> None:
    assets_out = OUT / "assets"
    shutil.copytree(SRC / "assets", assets_out, dirs_exist_ok=True)

    shared = assets_out / "images" / "shared"
    copy_image(EXPORT / "27416dec8a25529529f66f91f4cdcf16.jpg", shared, "logo")
    copy_image(EXPORT / "7d126d7e190beab477d8a0764fa38564.jpg", shared, "favicon")
    copy_image(EXPORT / "Home" / "a7b9fabe35702470920bcb0dde7ac1cb.jpg", shared, "hero")
    shared.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / "statute" / "logo.svg", shared / "statute-logo.svg")

    groups = {
        "Home": "home",
        "Events": "events",
        "Independence Day": "independence-day",
        "branding": "branding",
        "OLD Branding": "old-branding",
    }
    hero_name = "a7b9fabe35702470920bcb0dde7ac1cb.jpg"
    for source_name, output_name in groups.items():
        source_dir = EXPORT / source_name
        destination_dir = assets_out / "images" / output_name
        for image_path in sorted(source_dir.glob("*.jpg")):
            if image_path.name == hero_name:
                continue
            copy_image(image_path, destination_dir)


def build_pages() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    base = read_text(SRC / "templates" / "base.html")
    header_template = read_text(SRC / "templates" / "header.html")
    footer_template = read_text(SRC / "templates" / "footer.html")

    for page in PAGES:
        content_path = SRC / "pages" / page["source"]
        if not content_path.exists():
            raise FileNotFoundError(f"Missing page fragment: {content_path}")
        destination = OUT / page["output"]
        depth = len(destination.relative_to(OUT).parent.parts)
        site_root = "/".join([".."] * depth) if depth else "."
        canonical_url = "https://veterans.mt/" + page["url"]
        header = fill(
            active_header(header_template, page["key"], page.get("section")),
            {"site_root": site_root},
        )
        content = rebase_fragment_assets(read_text(content_path), site_root)
        content = fill(content, {"site_root": site_root})
        footer = fill(footer_template, {"site_root": site_root})
        body_class = page.get("body_class", f'page-{page["key"]}')
        rendered = fill(
            base,
            {
                "title": html.escape(page["title"]),
                "description": html.escape(page["description"], quote=True),
                "canonical_url": html.escape(canonical_url, quote=True),
                "site_root": site_root,
                "body_class": body_class,
                "header": header,
                "content": content,
                "footer": footer if page.get("footer", True) else "",
            },
        )
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(rendered, encoding="utf-8")

    (OUT / ".nojekyll").write_text("", encoding="utf-8")


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    prepare_assets()
    build_pages()
    print(f"Built {len(PAGES)} folder-based pages in {OUT}")


if __name__ == "__main__":
    main()
