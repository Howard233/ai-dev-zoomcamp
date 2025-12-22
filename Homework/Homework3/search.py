from __future__ import annotations

from pathlib import Path
from zipfile import ZipFile

import requests
from minsearch import Index

FASTMCP_ZIP_URL = "https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip"
DATA_DIR = Path(__file__).resolve().parent / "data"
FASTMCP_ZIP_PATH = DATA_DIR / "fastmcp-main.zip"


def download_fastmcp_zip() -> Path:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if FASTMCP_ZIP_PATH.exists():
        return FASTMCP_ZIP_PATH

    response = requests.get(FASTMCP_ZIP_URL, timeout=60)
    response.raise_for_status()
    FASTMCP_ZIP_PATH.write_bytes(response.content)
    return FASTMCP_ZIP_PATH


def _strip_first_path_component(path: str) -> str:
    parts = Path(path).parts
    return "/".join(parts[1:]) if len(parts) > 1 else path


def load_documents_from_zips(zip_dir: Path) -> list[dict]:
    documents: list[dict] = []
    for zip_path in zip_dir.glob("*.zip"):
        with ZipFile(zip_path) as zip_file:
            for info in zip_file.infolist():
                if info.is_dir():
                    continue
                name_lower = info.filename.lower()
                if not (name_lower.endswith(".md") or name_lower.endswith(".mdx")):
                    continue
                raw = zip_file.read(info.filename)
                text = raw.decode("utf-8", errors="replace")
                documents.append(
                    {
                        "filename": _strip_first_path_component(info.filename),
                        "content": text,
                    }
                )
    return documents


def build_index(documents: list[dict]) -> Index:
    index = Index(text_fields=["content"], keyword_fields=["filename"])
    index.fit(documents)
    return index


def search(index: Index, query: str) -> list[dict]:
    return index.search(query, num_results=5)


def main() -> None:
    download_fastmcp_zip()
    docs = load_documents_from_zips(DATA_DIR)
    index = build_index(docs)
    results = search(index, "demo")

    if not results:
        print("No results found.")
        return

    print("Top 5 results:")
    for doc in results:
        print(f"- {doc['filename']}")
    print(f"First result: {results[0]['filename']}")


if __name__ == "__main__":
    main()
