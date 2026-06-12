#!/usr/bin/env python3
"""Transform localized case-study pages: SEO head, standard nav with mobile menu,
fixed footer links, shared CSS/JS, page-specific style overrides, lazy images."""
import re, pathlib

BASE = "https://iainmcm-blip.github.io/iain-mcmullan-portfolio/case-studies/"
LINKEDIN = "https://www.linkedin.com/in/iainmcmullan/"

PAGES = {
    "hilton-asia-conference.html": (
        "Case Study | Hilton Asia GM &amp; Commercial Conference | Iain McMullan",
        "Strategic execution of Hilton's largest regional leadership forum under 'Our Team. Our Time'.",
        "",
    ),
    "emirates-flight-training-academy.html": (
        "Case Study | Emirates Flight Training Academy | Iain McMullan",
        "Launching the world's most advanced pilot training facility with an integrated global campaign.",
        "body{background-color:#131315}.glass-card{background:rgba(21,34,56,.4)}",
    ),
    "emirates-pilot-recruitment.html": (
        "Case Study | Emirates Pilot Recruitment | Iain McMullan",
        "The 'Adventure Awaits' employer-brand campaign attracting the next generation of aviators.",
        ".material-symbols-outlined{display:inline-block;vertical-align:middle}.progress-line{height:1px;background:rgba(148,163,184,.2);position:relative}.progress-active{height:2px;background:#3b82f6;position:absolute;top:-.5px;transition:width .6s ease-in-out}",
    ),
    "malaysia-airlines.html": (
        "Case Study | Malaysia Airlines — Always a Traveller | Iain McMullan",
        "A global brand repositioning that shifted the narrative from service to soul.",
        "body{background-color:#131315}",
    ),
    "uob-gallery.html": (
        "Case Study | The UOB Gallery | Iain McMullan",
        "A commemorative brand experience celebrating nine decades of UOB heritage.",
        "body{background-color:#131315}.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 24}",
    ),
    "motion-for-impact.html": (
        "Case Study | Motion: For Impact | Iain McMullan",
        "Leading strategy and communications for a purpose-driven experience agency.",
        "body{background-color:#131315}.progress-line{height:1px;background:rgba(255,255,255,.1)}.progress-active{height:1px;background:#bbc7df;transition:width .6s cubic-bezier(.4,0,.2,1)}",
    ),
}

NAV = '''<nav class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md shadow-sm border-b border-white/5 h-20">
<div class="flex justify-between items-center max-w-container-max mx-auto px-margin-desktop h-full">
<a class="font-headline-md text-headline-md font-bold text-on-background tracking-tight" href="../index.html">Iain McMullan</a>
<div class="hidden md:flex items-center gap-stack-md">
<a class="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors duration-300" href="../index.html#work">Work</a>
<a class="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors duration-300" href="../index.html#about">About</a>
<a class="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors duration-300" href="../index.html#experience">Experience</a>
<a class="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors duration-300" data-todo="cv" href="https://www.linkedin.com/in/iainmcmullan/" target="_blank" rel="noopener">Download CV</a>
<a class="px-stack-md py-2 bg-primary text-on-primary rounded-full font-label-lg text-label-lg hover:opacity-90 transition-all cursor-pointer active:scale-95" href="../index.html#contact">Hire Me</a>
</div>
<button id="menu-btn" class="md:hidden text-on-background p-2" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">
<span class="material-symbols-outlined">menu</span>
</button>
</div>
<div id="mobile-menu" class="md:hidden flex-col gap-4 px-margin-mobile py-6 bg-background/95 backdrop-blur-md border-b border-white/5 absolute top-20 left-0 w-full">
<a class="font-label-lg text-label-lg text-on-surface-variant" href="../index.html#work">Work</a>
<a class="font-label-lg text-label-lg text-on-surface-variant" href="../index.html#about">About</a>
<a class="font-label-lg text-label-lg text-on-surface-variant" href="../index.html#experience">Experience</a>
<a class="font-label-lg text-label-lg text-on-surface-variant" data-todo="cv" href="https://www.linkedin.com/in/iainmcmullan/" target="_blank" rel="noopener">Download CV</a>
<a class="font-label-lg text-label-lg text-primary" href="../index.html#contact">Hire Me</a>
</div>
</nav>'''

HEAD_TMPL = '''<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{base}{fname}">
<meta property="og:type" content="article">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{base}{fname}">
<meta property="og:image" content="https://iainmcm-blip.github.io/iain-mcmullan-portfolio/assets/img/iain-mcmullan.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%230a1628'/%3E%3Ctext x='32' y='43' font-family='sans-serif' font-size='26' font-weight='700' fill='%23bbc7df' text-anchor='middle'%3EIM%3C/text%3E%3C/svg%3E">
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/site.css">{override}'''


def transform(path):
    fname = path.name
    title, desc, override_css = PAGES[fname]
    h = path.read_text()

    override = f"\n<style>{override_css}</style>" if override_css else ""
    new_head = HEAD_TMPL.format(title=title, desc=desc, base=BASE, fname=fname, override=override)
    h2 = re.sub(r"<title>.*</style>", new_head, h, count=1, flags=re.S)
    assert h2 != h, f"{fname}: head replacement failed"
    h = h2

    h2 = re.sub(r"<nav\b.*?</nav>", NAV, h, count=1, flags=re.S)
    assert h2 != h, f"{fname}: nav replacement failed"
    h = h2

    # Footer dead links
    h = re.sub(r'(<a[^>]*)href="#"([^>]*>\s*LinkedIn\s*</a>)',
               rf'\1href="{LINKEDIN}" target="_blank" rel="noopener"\2', h)
    h = re.sub(r'<a[^>]*href="#"[^>]*>\s*(Privacy Policy|Terms)\s*</a>\n?', "", h)
    h = re.sub(r"© 202\d", "© 2026", h)

    # Lazy-load every image after the first (hero stays eager)
    imgs = list(re.finditer(r"<img[^>]+>", h))
    for m in reversed(imgs[1:]):
        tag = m.group(0)
        out = tag
        if "loading=" not in out:
            out = out.replace("<img ", '<img loading="lazy" ', 1)
        if "decoding=" not in out:
            out = out.replace("<img ", '<img decoding="async" ', 1)
        if out != tag:
            h = h[:m.start()] + out + h[m.end():]

    # Shared JS before the page's own trailing script
    if '<script src="../assets/site.js">' not in h:
        h = h.replace("</body>", '<script src="../assets/site.js"></script>\n</body>', 1)

    path.write_text(h)
    dead = h.count('href="#"')
    print(f"{fname}: ok, dead-links={dead}, imgs={len(imgs)}")


if __name__ == "__main__":
    import sys
    targets = sys.argv[1:] or sorted(pathlib.Path("case-studies").glob("*.html"))
    for t in targets:
        p = pathlib.Path(t)
        if p.name in PAGES:
            transform(p)
