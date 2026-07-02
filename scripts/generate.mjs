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
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
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
const escJson = (s = '') => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const isoDate = (d) => d ? String(d).substring(0, 10) : '2026-06-20';
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
    marks: {
      textColor: ({ children, value }) => `<span style="color:${escAttr(value?.color || 'inherit')}">${children}</span>`,
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
  const RELATED_WORK = {
    'loyalty':           { url: '../case-studies/emirates-skywards-my-family.html', title: 'Emirates Skywards: My Family' },
    'experiential':      { url: '../case-studies/hilton-asia-conference.html',       title: 'Hilton APAC GM &amp; Commercial Conference' },
    'brand-performance': { url: '../case-studies/malaysia-airlines.html',            title: 'Malaysia Airlines: This is Malaysian Hospitality' },
  };
  const relatedBlock = (slug) => {
    const r = RELATED_WORK[slug];
    if (!r) return '';
    return `\n      <div class="article-related reveal">\n        <p class="article-related-label">See the work</p>\n        <a href="${r.url}" class="article-related-link">${r.title} &rarr;</a>\n      </div>`;
  };
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
      .replace(/(<div class="article-body reveal">)[\s\S]*?(<\/div>\s*<div class="article-author)/, `$1\n        ${bodyHtml(a.body)}\n      $2`)
      .replace('"SCHEMA_HEADLINE"', `"${escJson(a.title)}"`)
      .replace('"SCHEMA_DESCRIPTION"', `"${escJson(desc)}"`)
      .replace('"SCHEMA_DATE"', `"${isoDate(a.publishDate)}"`)
      .replace(/SCHEMA_URL/g, `https://www.iainmcmullan.com/articles/${a.slug}.html`)
      .replace('    </article>', relatedBlock(a.slug) + '\n    </article>');
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

  // 4b) Recommendations — homepage pull quote + standalone /recommendations.html page
  const recs = await client.fetch(`*[_type=="recommendation"]|order(orderRank asc){
    _id, recommenderName, recommenderTitle, recommenderCompany,
    linkedinUrl, relationshipNote, dateGiven,
    quote, featuredOnHomepage, pullQuote
  }`);
  console.log(`Fetched ${recs.length} recommendations.`);

  const featured = recs.find((r) => r.featuredOnHomepage) || recs[0];

  // 4b.i) Inject the homepage pull quote into index.html
  if (featured) {
    const pullText = (featured.pullQuote && featured.pullQuote.trim()) || (featured.quote || '').split(/\n\s*\n/)[0].trim();
    const roleLine = [featured.recommenderTitle, featured.recommenderCompany].filter(Boolean).map(esc).join(' &middot; ');
    const recBlock =
      '\n    <figure class="rec-quote">' +
      '\n      <span class="rec-mark" aria-hidden="true">&ldquo;</span>' +
      '\n      <blockquote class="rec-blockquote">' + esc(pullText) + '</blockquote>' +
      '\n      <figcaption class="rec-attrib">' +
      '\n        <span class="rec-name">' + esc(featured.recommenderName || '') + '</span>' +
      '\n        <span class="rec-role">' + roleLine + '</span>' +
      (featured.relationshipNote ? '\n        <span class="rec-note">' + esc(featured.relationshipNote) + '</span>' : '') +
      '\n      </figcaption>' +
      '\n    </figure>' +
      '\n    <a class="rec-more" href="recommendations.html">More recommendations <span aria-hidden="true">&rarr;</span></a>' +
      '\n    ';
    index = replaceBetween(index, '<!-- RECOMMENDATION:START -->', '<!-- RECOMMENDATION:END -->', recBlock, 'homepage recommendation pull quote');
    console.log('Wrote index.html (homepage strip + recommendation).');
  } else {
    console.warn('No recommendations in Sanity — homepage pull-quote placeholder left in place.');
    console.log('Wrote index.html (homepage strip).');
  }
  writeFileSync(resolve(SITE, 'index.html'), index);

  // 4b.ii) Build the standalone /recommendations.html
  const recItems = recs.map((r) => {
    const paragraphs = (r.quote || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const role = [r.recommenderTitle, r.recommenderCompany].filter(Boolean).map(esc).join(', ');
    const linkedinLink = r.linkedinUrl
      ? '\n              <a class="rec-meta-linkedin" href="' + escAttr(r.linkedinUrl) + '" target="_blank" rel="noopener noreferrer">On LinkedIn &rarr;</a>'
      : '';
    return '        <article class="rec-item reveal">' +
      '\n          <div class="rec-text">' +
      paragraphs.map((p) => '\n            <p>' + esc(p) + '</p>').join('') +
      '\n          </div>' +
      '\n          <div class="rec-meta">' +
      '\n            <div class="rec-meta-text">' +
      '\n              <p class="rec-meta-name">' + esc(r.recommenderName || '') + '</p>' +
      '\n              <p class="rec-meta-role">' + role + '</p>' +
      '\n              <span class="rec-meta-note">' + esc(r.relationshipNote || '') +
      (r.dateGiven ? '<span class="rec-meta-date"> &middot; ' + esc(fmtDate(r.dateGiven)) + '</span>' : '') +
      '</span>' + linkedinLink +
      '\n            </div>' +
      '\n          </div>' +
      '\n        </article>';
  }).join('\n');

  let recPage = readFileSync(resolve(SITE, 'recommendations.html'), 'utf8');
  const recsBody = recs.length ? '\n' + recItems + '\n        ' : '\n        <p style="text-align:center; color:var(--ink-mid);">No recommendations published yet.</p>\n        ';
  recPage = replaceBetween(recPage, '<!-- RECOMMENDATIONS:START -->', '<!-- RECOMMENDATIONS:END -->', recsBody, 'recommendations page list');
  writeFileSync(resolve(SITE, 'recommendations.html'), recPage);
  console.log(`Wrote recommendations.html (${recs.length} recommendations).`);

  // 5) skills.html — the Capabilities page, from the skillsPage singleton
  const sk = await client.fetch(`*[_id=="skillsPage"][0]{
    eyebrow, heading, intro, introBold, hint, footerLine,
    outcomes[]{ text, highlight },
    categories[]{ title, skills[]{ name, proof, caseStudyUrl } }
  }`);
  if (sk && sk.categories && sk.categories.length) {
    const boldFirst = (s, phrase) => {
      const e = esc(s || '');
      if (!phrase) return e;
      const p = esc(phrase);
      const i = e.indexOf(p);
      return i === -1 ? e : e.slice(0, i) + '<strong>' + p + '</strong>' + e.slice(i + p.length);
    };
    const slug = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const pad = (n) => String(n).padStart(2, '0');

    const header =
      '\n    <span class="section-label sk-fade">' + esc(sk.eyebrow || '') + '</span>' +
      '\n    <h1 class="display-heading display-lg sk-fade" style="animation-delay:0.05s">' + esc(sk.heading || '') + '</h1>' +
      '\n    <p class="sk-intro sk-fade" style="animation-delay:0.1s">' + boldFirst(sk.intro, sk.introBold) + '</p>' +
      '\n    <ul class="sk-outcomes sk-fade" style="animation-delay:0.15s" aria-label="What I do">' +
      (sk.outcomes || []).map((o) => '\n      <li>' + boldFirst(o.text, o.highlight) + '</li>').join('') +
      '\n    </ul>' +
      '\n    <p class="sk-hint sk-fade" style="animation-delay:0.18s">' + esc(sk.hint || '') + '</p>' +
      '\n    ';

    const menu = '\n\n' + sk.categories.map((c, ci) => {
      const head =
        '        <div class="sk-group" id="' + slug(c.title) + '">' +
        '\n          <p class="sk-group-label"><span class="n">' + pad(ci + 1) + '</span><span class="t">' + esc(c.title) + '</span></p>';
      const rows = (c.skills || []).map((s) => {
        const href = s.caseStudyUrl ? ' data-href="' + escAttr(s.caseStudyUrl) + '"' : '';
        const link = s.caseStudyUrl ? '<a class="sk-item-link" href="' + escAttr(s.caseStudyUrl) + '">See the work &rarr;</a>' : '';
        return '\n          <div class="sk-item" data-cat="' + escAttr(c.title) + '" data-name="' + escAttr(s.name) + '"' + href + '>' +
          '\n            <button class="sk-item-btn" type="button" aria-expanded="false">' + esc(s.name) + '<span class="sk-chev" aria-hidden="true">+</span></button>' +
          '\n            <div class="sk-item-panel"><div class="sk-item-panel-inner"><p class="sk-item-proof">' + esc(s.proof) + '</p>' + link + '</div></div>' +
          '\n          </div>';
      }).join('');
      return head + rows + '\n        </div>';
    }).join('\n\n') + '\n\n        ';

    const c0 = sk.categories[0];
    const s0 = (c0.skills || [])[0] || {};
    const sLink = s0.caseStudyUrl
      ? '<a class="sk-spot-link" href="' + escAttr(s0.caseStudyUrl) + '">See the work <span aria-hidden="true">&rarr;</span></a>'
      : '<a class="sk-spot-link" href="#" hidden>See the work <span aria-hidden="true">&rarr;</span></a>';
    const spot =
      '\n          <span class="sk-spot-cat">' + esc(c0.title) + '</span>' +
      '\n          <h2 class="sk-spot-name">' + esc(s0.name || '') + '</h2>' +
      '\n          <p class="sk-spot-proof">' + esc(s0.proof || '') + '</p>' +
      '\n          ' + sLink +
      '\n          ';

    const foot = '<p class="sk-foot-line">' + esc(sk.footerLine || '') + '</p>';

    let skp = readFileSync(resolve(SITE, 'skills.html'), 'utf8');
    skp = replaceBetween(skp, '<!--SKGEN:header:start-->', '<!--SKGEN:header:end-->', header, 'skills header');
    skp = replaceBetween(skp, '<!--SKGEN:menu:start-->', '<!--SKGEN:menu:end-->', menu, 'skills menu');
    skp = replaceBetween(skp, '<!--SKGEN:spot:start-->', '<!--SKGEN:spot:end-->', spot, 'skills spotlight');
    skp = replaceBetween(skp, '<!--SKGEN:foot:start-->', '<!--SKGEN:foot:end-->', foot, 'skills foot');
    writeFileSync(resolve(SITE, 'skills.html'), skp);
    console.log('Wrote skills.html (from skillsPage).');
  } else {
    console.log('No skillsPage found — skills.html left as-is.');
  }

  // 5) portfolio.html — featured pair + results index, from case studies.
  // Two entries with featured=true become the large cards (in drag order);
  // the rest fill the index (in drag order). Safe fallback: if fewer than two
  // case studies exist, leave the hand-authored markup so a build never blanks
  // the page.
  const cases = await client.fetch(`*[_type=="caseStudy" && defined(metric) && defined(slug.current)]|order(orderRank asc){
    title, "slug":slug.current, featured, containImage, metric, metricLabel, category, role,
    "alt":cardImage.alt, "imgUrl":cardImage.asset->url
  }`);
  if (cases.length < 2) {
    console.warn(`! Only ${cases.length} case study(ies) in Sanity; leaving portfolio.html static.`);
  } else {
    // Card image displayed on the card. Kept in original format (the Skywards
    // coins are a transparent PNG), cached immutably like the hero images.
    mkdirSync(resolve(SITE, 'assets/img/case-studies'), { recursive: true });
    const extOf = (u) => (String(u).match(/\.(png|jpe?g|webp)/i) || [, 'jpg'])[1].toLowerCase().replace('jpeg', 'jpg');
    for (const c of cases) {
      if (!c.imgUrl) { console.warn(`  ! ${c.slug}: no card image`); continue; }
      const e = extOf(c.imgUrl);
      const buf = Buffer.from(await (await fetch(c.imgUrl)).arrayBuffer());
      writeFileSync(resolve(SITE, 'assets/img/case-studies', c.slug + '.' + e), buf);
      c._img = `assets/img/case-studies/${c.slug}.${e}`;
    }
    // Sector key -> the tag shown on the card.
    const SECTOR = { loyalty: 'Loyalty', branding: 'Branding', integrated: 'Integrated Campaign', event: 'Event', 'social-pr': 'Social / PR', recruitment: 'Employer Brand' };
    // Colour the operators (+ % arrow) in the result number; other glyphs stay ink.
    const wrapOps = (m) => esc(m).replace(/(\+|%|→|&gt;|&rarr;)/g, '<span class="mop">$1</span>');
    const sector = (c) => esc(SECTOR[c.category] || c.category || '');

    const featured = cases.filter((c) => c.featured).slice(0, 2);
    const featSlugs = new Set(featured.map((c) => c.slug));
    const index = cases.filter((c) => !featSlugs.has(c.slug));

    const featHtml = featured.map((c) => `        <a href="case-studies/${c.slug}.html" class="feat-card${c.containImage ? ' feat-card--contain' : ''}" data-cat="${escAttr(c.category)}" aria-label="${escAttr(c.title)} case study">
          <div class="feat-img"><img src="${escAttr(c._img || '')}" alt="${escAttr(c.alt || c.title)}" loading="lazy"></div>
          <div class="feat-body">
            <span class="feat-metric">${wrapOps(c.metric)}</span>
            <span class="feat-metric-label">${esc(c.metricLabel || '')}</span>
            <h3 class="feat-title">${esc(c.title)}</h3>
            <p class="feat-meta"><span class="feat-sector">${sector(c)}</span> &middot; ${esc(c.role || '')}</p>
          </div>
        </a>`).join('\n\n');

    const idxHtml = index.map((c) => `        <a href="case-studies/${c.slug}.html" class="idx-row" data-cat="${escAttr(c.category)}" aria-label="${escAttr(c.title)} case study">
          <span class="idx-metric">${wrapOps(c.metric)}</span>
          <div class="idx-main"><h4 class="idx-title">${esc(c.title)}</h4><p class="idx-sub">${esc(c.metricLabel || '')} &middot; ${esc(c.role || '')}</p></div>
          <span class="idx-right"><span class="idx-sector">${sector(c)}</span><span class="idx-arrow" aria-hidden="true">&rarr;</span></span>
        </a>`).join('\n\n');

    const workInner =
      '\n\n        <div class="feat-row">\n\n' + featHtml + '\n\n        </div>\n\n' +
      '        <p class="idx-head">The full index</p>\n\n' +
      '        <div class="work-index">\n\n' + idxHtml + '\n\n        </div>';

    let pf = readFileSync(resolve(SITE, 'portfolio.html'), 'utf8');
    pf = replaceBetween(pf, '<div class="work">', '\n\n      </div>\n\n      <a href="index.html" class="pf-back"', workInner, 'portfolio work');
    writeFileSync(resolve(SITE, 'portfolio.html'), pf);
    console.log(`Wrote portfolio.html (${featured.length} featured, ${index.length} index).`);
  }

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
