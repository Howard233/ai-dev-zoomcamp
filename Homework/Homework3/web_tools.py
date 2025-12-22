from __future__ import annotations

import requests

JINA_READER_PREFIX = "https://r.jina.ai/"


def _normalize_reader_url(url: str) -> str:
    cleaned = url.strip()
    if cleaned.startswith(JINA_READER_PREFIX):
        return cleaned
    if cleaned.startswith("http://") or cleaned.startswith("https://"):
        return f"{JINA_READER_PREFIX}{cleaned}"
    return f"{JINA_READER_PREFIX}https://{cleaned}"


def download_page(url: str, timeout_s: int = 30) -> str:
    """Download page content via Jina Reader and return markdown."""
    reader_url = _normalize_reader_url(url)
    response = requests.get(reader_url, timeout=timeout_s)
    response.raise_for_status()
    return response.text
