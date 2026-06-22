tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* ── Semantic tokens (Motion Sensory brand system) ── */
        "background": "#07091C",      /* Abyss — hero/full-bleed ground */
        "surface": "#0D1535",         /* Midnight — elevated surfaces */
        "surface-low": "#1A2458",     /* Dusk — elevated card surfaces */
        "surface-lowest": "#03040D",  /* Void — recessed/banded sections */
        "ink": "#EEF0FF",             /* Nimbus — primary text (never pure white) */
        "ink-dim": "#7A88B4",         /* Slate — secondary text */
        "ink-faint": "#4D567C",       /* deep Slate — captions */
        "primary": "#8AABFF",         /* Haze — accent text / UI accents */
        "outline": "#3A4675",
        /* ── Named brand tokens ── */
        "abyss": "#07091C",
        "midnight": "#0D1535",
        "volt": "#1232D6",            /* brand hero blue — CTAs, brand moments */
        "pulse": "#2B5CF0",           /* interactive blue — hover, glows */
        "amethyst": "#5B22C4",        /* primary purple — gradient anchor */
        "iris": "#8055D8",            /* secondary violet — soft emphasis */
        "sky": "#C5D3FF",             /* lightest blue tint — data labels */
        "haze": "#8AABFF",            /* light blue — UI accents, hover tints */
        "dusk": "#1A2458",            /* lightest foundation — card surfaces */
        "void": "#03040D",            /* darkest foundation — shadow overlays */
        "nimbus": "#EEF0FF",
        "slate": "#7A88B4",
        "grain": "#D4BC8A",           /* rare brass/gold material cue (max ~5%) */
      },
      spacing: {
        "section-gap": "180px",
        "gutter": "32px",
        "margin-desktop": "80px",
        "margin-mobile": "24px",
      },
      fontFamily: {
        "sans": ["Raleway", "sans-serif"],
      },
    },
  },
}
