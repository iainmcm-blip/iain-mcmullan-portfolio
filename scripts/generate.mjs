/**
 * Build-time generator: Sanity articles -> this static portfolio site.
 * Regenerates, in the repo root:
 *   - articles/<slug>.html      (full standalone pages, from passion.html as template)
 *   - perspectives.html         (cards block + ART + CATS arrays; bespoke JS left untouched)
 *   - index.html                (the 3-card homepage strip, by homepagePosition)
 *   - assets/img/perspectives/<slug>.jpg  (hero images pulled from Sanity)
 *
 * Run locally:
 *   npm install
 *   npm run generate                 # live: published content only
 *   SANITY_MODE=staging SANITY_READ_TOKEN=xxx npm run generate   # drafts preview
 *
 * In the cloud (Vercel build command `npm install && npm run generate`):
 *   production project -> SANITY_MODE=live
 *   staging project    -> SANITY_MODE=staging + SANITY_READ_TOKEN
 * See PUBLISHING.md for the full setup.
 */
import { createClient } from '@sanity/client';
import { toHTML } from '@portabletext/to-html';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(__dirname, '..');

// MODE decides which content the build reads:
//   live    (default) -> only PUBLISHED content. Used by the production deploy.
//   staging           -> your DRAFTS overlaid on published, so work-in-progress
//                        is visible before you hit Publish. Needs a read token.
const MODE = process.env.SANITY_MODE === 'staging' ? 'staging' : 'live';
const TOKEN = process.env.SANITY_READ_TOKEN || undefined;
const perspective = MODE === 'staging' && TOKEN ? 'drafts' : 'published';
if (MODE === 'staging' && !TOKEN) {
  console.warn('! staging mode without SANITY_READ_TOKEN: drafts will not be readable; output will match live.');
}
console.log(`Generator mode: ${MODE} (perspective: ${perspective}${TOKEN ? ', authed' : ''})`);
const client = createClient({ projectId: 'yespk9j6', dataset: 'production', apiVersion: '2024-10-01', useCdn: false, perspective, token: TOKEN });

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s = '') => esc(s).replace(/"/g, '&quot;');
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const fmtDate = (iso) => { if (!iso) return ''; const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
const objPos = (h) => (h && typeof h.x === 'number' ? `${Math.round(h.x * 100)}% ${Math.round(h.y * 100)}%` : 'center');

// Decorative blobs behind the (lazy) card image — one consistent set is fine; the image covers them.
const BLOBS = [
  '<span class="persp-blob" style="width:62%;aspect-ratio:1/1;left:-8%;top:-12%;background:#C4922A;opacity:0.18"></span>',
  '<span class="persp-blob" style="width:52%;aspect-ratio:1/1;right:-10%;bottom:-12%;background:#F0E6D0;opacity:0.62"></span>',
  '<span class="persp-blob" style="width:36%;aspect-ratio:1/1;left:40%;top:40%;background:#E8D5A0;opacity:0.42"></span>',
].join('\n            ');

// The expanded card repeats the teaser unless we drop the opening block when it
// matches the excerpt (the standalone page keeps the full body).
const ptText = (b) => (b && b.children ? b.children.map((c) => c.text || '').join('') : '');
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
const inPlaceBody = (a) =>
  a.body && a.body[0] && a.excerpt && norm(ptText(a.body[0])).slice(0, 60) === norm(a.excerpt).slice(0, 60)
    ? a.body.slice(1)
    : a.body || [];

// portable text -> the <p>… body HTML the pages use
const bodyHtml = (body) => toHTML(body || [], {
  components: {
    types: {
      seoImage: ({ value }) => value?.asset ? `<figure class="article-figure"><img src="${escAttr(value.assetUrl || '')}" alt="${escAttr(value.alt || '')}" loading="lazy"></figure>` : '',
    },
  },
});

async function main() {
  const cats = await client.fetch(`*[_type=="category"]|order(order asc){ "key":slug.current, "label":title }`);
  const arts = await client.fetch(`*[_type=="article" && defined(slug.current)]|order(orderRank asc, publishDate desc){
    title, "slug":slug.current, "cat":category->slug.current, "catLabel":category->title,
    publishDate, excerpt, homepagePosition,
    "alt":heroImage.alt, "hotspot":heroImage.hotspot, "imgUrl":heroImage.asset->url,
    metaTitle, metaDescription, body
  }`);
  if (!arts.length) { console.error('No articles found in Sanity. Aborting.'); process.exit(1); }
  console.log(`Fetched ${cats.length} categories, ${arts.length} articles.`);

  // 1) hero images -> local paths the site/JS expect
  for (const a of arts) {
    if (!a.imgUrl) { console.warn(`  ! ${a.slug}: no hero image`); continue; }
    const buf = Buffer.from(await (await fetch(a.imgUrl)).arrayBuffer());
    writeFileSync(resolve(SITE, 'assets/img/perspectives', a.slug + '.jpg'), buf);
  }
  console.log('Hero images synced.');

  // 2) standalone article pages, from the live passion.html as the template
  const tpl = readFileSync(resolve(SITE, 'articles/passion.html'), 'utf8');
  for (const a of arts) {
    const desc = a.metaDescription || a.excerpt || '';
    const html = tpl
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(a.metaTitle || a.title)} | Iain McMullan</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escAttr(desc)}">`)
      .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="https://www.iainmcmullan.com/articles/${a.slug}.html">`)
      .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escAttr(a.metaTitle || a.title)}">`)
      .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escAttr(desc)}">`)
      .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="https://www.iainmcmullan.com/articles/${a.slug}.html">`)
      .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="https://www.iainmcmullan.com/assets/img/perspectives/${a.slug}.jpg">`)
      .replace(/(<div class="article-hero reveal">\s*<img src=")[^"]*(" alt=")[^"]*(")/, `$1../assets/img/perspectives/${a.slug}.jpg$2${escAttr(a.alt || '')}$3`)
      .replace(/(<span class="section-label">)[\s\S]*?(<\/span>)/, `$1${esc(a.catLabel || '')}$2`)
      .replace(/<h1 class="article-title">[\s\S]*?<\/h1>/, `<h1 class="article-title">${esc(a.title)}</h1>`)
      .replace(/(<span class="byl-date">)[\s\S]*?(<\/span>)/, `$1${esc(fmtDate(a.publishDate))}$2`)
      .replace(/(<div class="article-body reveal">)[\s\S]*?(<\/div>\s*<div class="article-author)/, `$1\n        ${bodyHtml(a.body)}\n      $2`);
    writeFileSync(resolve(SITE, 'articles', a.slug + '.html'), html);
  }
  console.log(`Wrote ${arts.length} article pages.`);

  // 3) perspectives.html — cards block + ART + CATS
  const perspCards = arts.map((a) => `        <article class="persp-card reveal">
          <div class="persp-art">
            ${BLOBS}
          </div>
          <div class="persp-body">
            <span class="persp-tag">${esc(a.catLabel || '')}</span>
            <h3 class="persp-title">${esc(a.title)}</h3>
            <p class="persp-text">${esc(a.excerpt || '')}</p>
          </div>
          <div class="persp-article">
            <div class="persp-article-inner">
              <div class="persp-article-content">
                ${bodyHtml(inPlaceBody(a))}
                <button type="button" class="persp-collapse">Collapse <span aria-hidden="true">&uarr;</span></button>
              </div>
            </div>
          </div>
        </article>`).join('\n\n');

  const artArr = 'var ART = [\n' + arts.map((a) =>
    `    { slug: ${js(a.slug)}, cat: ${js(a.cat)}, date: ${js(fmtDate(a.publishDate))}, alt: ${js(a.alt || '')}, pos: ${js(objPos(a.hotspot))} }`
  ).join(',\n') + '\n  ];';
  const catsArr = 'var CATS = [\n' + cats.map((c) => `    { key: ${js(c.key)}, label: ${js(c.label)} }`).join(',\n') + '\n  ];';

  let persp = readFileSync(resolve(SITE, 'perspectives.html'), 'utf8');
  persp = replaceBetween(persp, '<div class="persp-grid">\n', '\n\n      </div>\n\n      <a href="index.html" class="pf-back">', '\n' + perspCards + '\n', 'perspectives cards');
  persp = replaceRe(persp, /var ART = \[[\s\S]*?\n {2}\];/, artArr, 'ART array');
  persp = replaceRe(persp, /var CATS = \[[\s\S]*?\n {2}\];/, catsArr, 'CATS array');
  writeFileSync(resolve(SITE, 'perspectives.html'), persp);
  console.log('Wrote perspectives.html (cards + ART + CATS).');

  // 4) index.html homepage strip
  const byPos = (p) => arts.find((a) => a.homepagePosition === p);
  const strip = ['1', '2', '3'].map((p, i) => {
    const a = byPos(p);
    if (!a) return `      <!-- Card ${i + 1}: no article flagged for homepage position ${p} -->`;
    return `      <!-- Card ${i + 1} -->
      <article class="persp-card reveal">
        <div class="persp-art">
          <img src="assets/img/perspectives/${a.slug}.jpg" alt="${escAttr(a.alt || '')}" loading="lazy" style="object-position:${objPos(a.hotspot)}">
          ${BLOBS}
        </div>
        <div class="persp-body">
          <span class="persp-tag">${esc(a.catLabel || '')}</span>
          <h3 class="persp-title">${esc(a.title)}</h3>
          <p class="persp-text">${esc(a.excerpt || '')}</p>
          <a class="persp-readfull" href="articles/${a.slug}.html">Read Full Article <span aria-hidden="true">&rarr;</span></a>
        </div>
      </article>`;
  }).join('\n\n');

  let index = readFileSync(resolve(SITE, 'index.html'), 'utf8');
  index = replaceBetween(index, '<div class="persp-grid persp-grid--strip">\n', '\n    </div>\n\n    <a href="perspectives.html" class="persp-readmore', '\n' + strip + '\n', 'homepage strip');
  writeFileSync(resolve(SITE, 'index.html'), index);
  console.log('Wrote index.html (homepage strip).');

  console.log('\nDone. Sync to staging, verify, then push.\n');
}

const js = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
function replaceBetween(src, startAnchor, endAnchor, middle, name) {
  const i = src.indexOf(startAnchor), j = src.indexOf(endAnchor);
  if (i === -1 || j === -1 || j < i) throw new Error(`Anchor not found for ${name} (start ${i}, end ${j})`);
  return src.slice(0, i + startAnchor.length) + middle + src.slice(j);
}
function replaceRe(src, re, repl, name) {
  if (!re.test(src)) throw new Error(`Pattern not found for ${name}`);
  return src.replace(re, repl.replace(/\$/g, '$$$$'));
}

main().catch((e) => { console.error(e); process.exit(1); });
