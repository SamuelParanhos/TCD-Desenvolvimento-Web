#!/usr/bin/env python3
"""Empacota código, documentação e PNGs, sem dependências ou builds locais."""

from pathlib import Path
import zipfile


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "output" / "anima-entrega.zip"
EXCLUDED = {
    ".git", ".agents", ".aws", ".codex", ".next", "node_modules", "output",
    "coverage", "test-results", "playwright-report", "tmp", "__pycache__",
}


def main() -> None:
    OUTPUT.parent.mkdir(exist_ok=True)
    files = []
    for path in ROOT.rglob("*"):
        relative = path.relative_to(ROOT)
        if any(part in EXCLUDED for part in relative.parts):
            continue
        if not path.is_file() or path.is_symlink():
            continue
        if path.name.startswith(".env") or path.suffix in {".log", ".tsbuildinfo", ".pyc"}:
            continue
        files.append(path)
    with zipfile.ZipFile(OUTPUT, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(files):
            archive.write(path, Path("anima") / path.relative_to(ROOT))
    with zipfile.ZipFile(OUTPUT) as archive:
        invalid = archive.testzip()
        if invalid:
            raise SystemExit(f"Falha ao verificar o arquivo: {invalid}")
        names = set(archive.namelist())
        for required in ("public/uml.png", "public/der.png", "README.md", "package-lock.json"):
            if f"anima/{required}" not in names:
                raise SystemExit(f"Entrega incompleta: {required}")
    print(f"{OUTPUT.relative_to(ROOT)}: {len(files)} arquivos; ZIP verificado.")


if __name__ == "__main__":
    main()
