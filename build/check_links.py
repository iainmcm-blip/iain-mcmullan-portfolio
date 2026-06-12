#!/usr/bin/env python3
"""Verify all internal href/src targets exist and no '#' placeholders remain."""
import re, pathlib, sys

root = pathlib.Path(".")
errs = []
pages = list(root.glob("*.html")) + list(root.glob("case-studies/*.html"))
for p in pages:
    html = p.read_text()
    for m in re.finditer(r'(?:href|src)="([^"]+)"', html):
        u = m.group(1)
        if u.startswith(("http://", "https://", "mailto:", "tel:", "data:")):
            continue
        if u == "#":
            errs.append(f"{p}: dead '#' link")
            continue
        target = u.split("#")[0]
        if not target:
            continue
        if not (p.parent / target).exists():
            errs.append(f"{p}: missing {u}")
print("\n".join(errs) or f"all internal links OK across {len(pages)} pages")
sys.exit(1 if errs else 0)
