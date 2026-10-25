// Robot de Vicepresidente al Día — Vibras Positivas HM
// Corre en GitHub Actions cada 30 minutos. Trae noticias reales (Bing Noticias y Google Noticias),
// saca la foto principal de cada nota (og:image) y busca videos recientes en YouTube.
// Node 20+, sin dependencias.
import { readFile, writeFile } from 'node:fs/promises';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
const CONSULTAS = [
  'José Manuel Restrepo vicepresidente',
  'vicepresidente Restrepo',
  'vicepresidencia Colombia Restrepo',
  'Misión Crecer vicepresidente',
  'Milagro Week Colombia',
  'Ley de Rescate Restrepo'
];
const MAX_NOTICIAS = 300;
const relevante = t => /restrepo|vicepresident|milagro week|misi[oó]n crecer/i.test(t);

async function get(url, ms = 15000) {
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'es-CO,es;q=0.9' }, redirect: 'follow', signal: ctl.signal });
    return r.ok ? { text: await r.text(), url: r.url } : null;
  } catch { return null; } finally { clearTimeout(to); }
}
const tag = (xml, n) => { const m = xml.match(new RegExp(`<${n}[^>]*>([\\s\\S]*?)</${n}>`, 'i')); return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : ''; };
const limpia = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
const clave = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').slice(0, 60);

async function bing(q) {
  const r = await get('https://www.bing.com/news/search?q=' + encodeURIComponent(q) + '&format=rss&setlang=es-CO&cc=CO&qft=sortbydate%3d%221%22');
  if (!r) return [];
  return [...r.text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
    let link = limpia(tag(it, 'link'));
    try { link = new URL(link).searchParams.get('url') || link; } catch {}
    return { titulo: limpia(tag(it, 'title')), url: link, resumen: limpia(tag(it, 'description')), fecha: new Date(tag(it, 'pubDate') || Date.now()).toISOString(), fuente: limpia(tag(it, 'News:Source')) || host(link), img: '', cat: 'Noticia' };
  });
}
async function google(q) {
  const r = await get('https://news.google.com/rss/search?q=' + encodeURIComponent(q + ' when:3d') + '&hl=es-419&gl=CO&ceid=CO:es-419');
  if (!r) return [];
  return [...r.text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
    const fuente = limpia(tag(it, 'source'));
    const titulo = limpia(tag(it, 'title')).replace(new RegExp('\\s-\\s' + fuente.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), '');
    return { titulo, url: limpia(tag(it, 'link')), resumen: '', fecha: new Date(tag(it, 'pubDate') || Date.now()).toISOString(), fuente, img: '', cat: 'Noticia' };
  });
}

async function fotoDe(n) {
  const r = await get(n.url, 12000);
  if (!r) return n;
  const meta = p => { const m = r.text.match(new RegExp(`<meta[^>]+(?:property|name)=["']${p}["'][^>]*content=["']([^"']+)`, 'i')) || r.text.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${p}["']`, 'i')); return m ? limpia(m[1]) : ''; };
  const img = meta('og:image') || meta('twitter:image');
  if (img && !/logo|default|placeholder/i.test(img)) n.img = new URL(img, r.url).href;
  if (!/news\.google\.com/.test(r.url)) n.url = r.url;
  if (!n.resumen) n.resumen = meta('og:description') || meta('description');
  if (n.fuente === '' ) n.fuente = host(r.url);
  return n;
}

async function youtube() {
  const out = [];
  for (const q of ['José Manuel Restrepo vicepresidente', 'vicepresidente José Manuel Restrepo entrevista']) {
    const r = await get('https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=CAI%253D');
    if (!r) continue;
    const m = r.text.match(/var ytInitialData = (\{.*?\});<\/script>/s);
    if (!m) continue;
    let data; try { data = JSON.parse(m[1]); } catch { continue; }
    const vistos = [];
    (function rec(o) {
      if (!o || typeof o !== 'object') return;
      if (o.videoRenderer) vistos.push(o.videoRenderer);
      for (const k in o) rec(o[k]);
    })(data);
    for (const v of vistos) {
      const titulo = (v.title?.runs || []).map(x => x.text).join('');
      if (!relevante(titulo) || out.some(x => x.id === v.videoId)) continue;
      out.push({ id: v.videoId, titulo, canal: v.ownerText?.runs?.[0]?.text || '', fecha: v.publishedTimeText?.simpleText || '' });
    }
  }
  return out;
}

async function leer(path) { try { return JSON.parse(await readFile(path, 'utf8')); } catch { return { items: [] }; } }

const ahora = new Date().toISOString();
const prev = await leer('data/noticias.json');
const urls = new Set(prev.items.map(n => n.url));
const claves = new Set(prev.items.map(n => clave(n.titulo)));

let nuevas = [];
for (const q of CONSULTAS) {
  const [a, b] = await Promise.all([bing(q), google(q)]);
  for (const n of [...a, ...b]) {
    if (!n.titulo || !relevante(n.titulo + ' ' + n.resumen)) continue;
    const k = clave(n.titulo);
    if (urls.has(n.url) || claves.has(k)) continue;
    urls.add(n.url); claves.add(k); nuevas.push(n);
  }
}
nuevas.sort((x, y) => new Date(y.fecha) - new Date(x.fecha));
nuevas = nuevas.slice(0, 40);
for (let i = 0; i < nuevas.length; i += 6) await Promise.all(nuevas.slice(i, i + 6).map(fotoDe));

const items = [...nuevas, ...prev.items].sort((x, y) => new Date(y.fecha) - new Date(x.fecha)).slice(0, MAX_NOTICIAS);
await writeFile('data/noticias.json', JSON.stringify({ actualizado: ahora, items }, null, 2));

const prevV = await leer('data/videos.json');
const vids = await youtube();
const todos = [...vids, ...prevV.items.filter(v => !vids.some(x => x.id === v.id))].slice(0, 60);
await writeFile('data/videos.json', JSON.stringify({ actualizado: ahora, items: todos }, null, 2));

console.log(`Noticias nuevas: ${nuevas.length} · total ${items.length} · videos ${todos.length}`);
