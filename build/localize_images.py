#!/usr/bin/env python3
"""Rewrite googleusercontent image URLs to local assets paths. Usage: localize_images.py FILE..."""
import json, pathlib, sys

mapping = json.load(open("build/img-map.json"))
for arg in sys.argv[1:]:
    p = pathlib.Path(arg)
    html = p.read_text()
    prefix = "../" if "case-studies" in p.parts else ""
    for url, local in mapping.items():
        html = html.replace(url, prefix + local)
    p.write_text(html)
    print(f"localized {p}")
