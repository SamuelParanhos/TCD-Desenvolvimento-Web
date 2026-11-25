#!/usr/bin/env python3
"""Exporta as fontes Graphviz para PNG e SVG, sem bibliotecas Python extras.

Uso: python3 scripts/generate-diagrams.py
Pré-requisito: Graphviz (executável dot no PATH).
"""

from pathlib import Path
import shutil
import struct
import subprocess


ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    dot = shutil.which("dot")
    if dot is None:
        raise SystemExit("Graphviz não encontrado. Instale Graphviz e execute novamente.")

    output = ROOT / "public"
    output.mkdir(exist_ok=True)
    for name in ("uml", "der"):
        source = ROOT / "docs" / "diagrams" / f"{name}.dot"
        for extension in ("png", "svg"):
            target = output / f"{name}.{extension}"
            subprocess.run(
                [dot, f"-T{extension}", "-Gdpi=180", str(source), "-o", str(target)],
                check=True,
            )
        with (output / f"{name}.png").open("rb") as image:
            header = image.read(24)
        if header[:8] != b"\x89PNG\r\n\x1a\n":
            raise SystemExit(f"Arquivo PNG inválido: {name}")
        width, height = struct.unpack(">II", header[16:24])
        if width < 1920:
            raise SystemExit(f"{name}.png ficou com {width}px; são necessários pelo menos 1920px.")
        print(f"public/{name}.png: {width} x {height}px; SVG também exportado.")


if __name__ == "__main__":
    main()
