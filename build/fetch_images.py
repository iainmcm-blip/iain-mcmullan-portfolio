#!/usr/bin/env python3
"""Download every googleusercontent image referenced by the raw exports into assets/img/,
named from the img alt text, and write a url->local-path map to build/img-map.json."""
import re, json, pathlib, urllib.request

SRC = sorted(pathlib.Path("src").glob("*.html"))
OUT = pathlib.Path("assets/img"); OUT.mkdir(parents=True, exist_ok=True)
mapping = {}

def slug(s):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s[:40] or "image"

def ext_for(data):
    if data[:3] == b"\xff\xd8\xff": return ".jpg"
    if data[:8] == b"\x89PNG\r\n\x1a\n": return ".png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP": return ".webp"
    return ".jpg"

for path in SRC:
    html = path.read_text()
    for tag in re.finditer(r"<img[^>]+>", html):
        t = tag.group(0)
        m = re.search(r'src="(https://lh3\.googleusercontent\.com/[^"]+)"', t)
        if not m:
            continue
        url = m.group(1)
        if url in mapping:
            continue
        alt = re.search(r'alt="([^"]*)"', t)
        base = slug(alt.group(1) if alt else "image")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"})
        try:
            data = urllib.request.urlopen(req).read()
        except Exception as e:
            print(f"FAILED {base}: {e}")
            continue
        name = base + ext_for(data)
        n = 2
        while (OUT / name).exists() and (OUT / name).read_bytes() != data:
            name = f"{base}-{n}{ext_for(data)}"
            n += 1
        (OUT / name).write_bytes(data)
        mapping[url] = f"assets/img/{name}"
        print(name)

json.dump(mapping, open("build/img-map.json", "w"), indent=1)
print(f"-- {len(mapping)} unique images")
