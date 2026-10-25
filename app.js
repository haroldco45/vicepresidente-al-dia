/* Vicepresidente al Día — Software por Vibras Positivas HM
   Seguimiento ciudadano al vicepresidente José Manuel Restrepo.
   - data/noticias.json y data/videos.json los actualiza el robot de GitHub Actions cada 30 min.
   - Al abrir la app, además busca en vivo en la red (Bing Noticias / Google Noticias / YouTube). */

const TZ = 'America/Bogota';
const POSESION = new Date('2026-08-07T15:00:00-05:00');
const MILAGRO_WEEK = new Date('2026-11-16T08:00:00-05:00');
const PROXIES = [
  u => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u),
  u => 'https://corsproxy.io/?url=' + encodeURIComponent(u),
  u => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(u)
];
const FOTOS_BASE = [
  { img: 'https://imagenes.portafolio.co/files/image_1200_600/files/fp/uploads/2026/10/19/6ad648a90bab4.r_d.688-196-0.jpeg', cred: 'Foto: Vicepresidencia / Portafolio' },
  { img: 'https://www.semana.com/resizer/v2/YQHEDAUJ5JECLHMGM5QFNPOFLA.jfif?auth=d55b6e843c88743d6772f5eb2798dc43ccd4787c99629482994c7699af72942d&smart=true&quality=75&width=1280&height=720', cred: 'Foto: Vicepresidencia / Semana' },
  { img: 'https://www.infobae.com/resizer/v2/X7IG4O7L7FGZLG6BTGHTBJQA2U.jfif?auth=58325054ba91fbff70c6a5fea63a83ef539c6909d7108b0755591b668b9d9649&smart=true&width=1200&height=630&quality=85', cred: 'Foto: @jrestrp / Infobae' },
  { img: 'https://www.semana.com/resizer/v2/PBFRDA7REBENXMWJFL4ZZEKZ2M.jpeg?auth=52ad178931f54260cc5cbde9d1eda8021dfcb8677f0f8c0977addac74857b11e&width=1280&height=854', cred: 'Foto: Vicepresidencia / Semana' },
  { img: 'https://imagenes.portafolio.co/files/main_image_800_600/uploads/2026/07/01/6a4515f463c59.jpeg', cred: 'Foto: Portafolio' }
];

const MISIONES = [
  { k: '01', t: 'Colombia sin trabas', d: 'Modernizar y simplificar el Estado: menos trámites, interoperabilidad y uso de inteligencia artificial.', img: FOTOS_BASE[0].img },
  { k: '02', t: 'Talento ColombIA', d: 'Formar jóvenes en IA y habilidades digitales con el SENA para cerrar la brecha de los 2,5 millones de "ninis".', img: FOTOS_BASE[3].img },
  { k: '03', t: 'Energía y recursos', d: 'Dinamizar generación y transmisión de energía, hidrocarburos, minerales críticos y renovables.', img: 'https://www.infobae.com/resizer/v2/4TZZIRPC4BF3XAX2RFDZJHX34E.JPG?auth=6f8441e91caa910ebb8fac5dfbd11073045e748fb7fbd0e387debd5bd2a58d1f&smart=true&width=350&height=232&quality=85' },
  { k: '04', t: 'Más inversión', d: 'Duplicar la relación inversión/PIB, banco de proyectos y las Semanas Milagro en el mundo.', img: FOTOS_BASE[1].img },
  { k: '05', t: 'Financiamiento y estabilidad', d: 'Coordinar la estabilidad macroeconómica y el ajuste fiscal con la llamada Ley de Rescate.', img: FOTOS_BASE[2].img }
];

// estado: anun (anunciado), curso (en marcha), prog (programado con fecha)
const COMPROMISOS = [
  { t: 'Crecer al 6 % anual', e: 'curso', p: 15, d: 'Meta central del Gobierno. Restrepo señala que el crecimiento que recibieron fue de 1,6 %. Se medirá con los datos trimestrales del DANE.', f: 'Infobae, 24 oct 2026', u: 'https://www.infobae.com/colombia/2026/10/24/jose-manuel-restrepo-aseguro-que-el-ajuste-fiscal-para-el-pais-debe-ser-de-casi-70-billones-llega-el-momento-de-atraer-inversion/' },
  { t: 'Ley de Rescate: ajuste de casi $70 billones para 2027', e: 'anun', p: 10, d: 'Anunció que la radicarían "la próxima semana" para eliminar gasto que el Gobierno llama derroche, revisar exenciones y combatir la evasión. Pendiente: radicación en el Congreso.', f: 'El Tiempo, 24 oct 2026', u: 'https://www.eltiempo.com/politica/gobierno/el-gobierno-anterior-dejo-una-bomba-de-tiempo-vicepresidente-jose-manuel-restrepo-hablo-sobre-el-sobreendeudamiento-del-pais-3596023' },
  { t: 'Evitar la "bomba fiscal" de marzo de 2027', e: 'curso', p: 20, d: 'Advierte que la deuda pasó de 800 a más de 1.200 billones entre 2022 y 2026 y que sin ajuste habría una crisis en marzo de 2027. Es su diagnóstico; economistas del gobierno anterior lo discuten.', f: 'Semana, 24 oct 2026', u: 'https://www.semana.com/politica/articulo/dejaron-al-pais-jodido-jose-manuel-restrepo-advierte-que-el-gobierno-petro-dejo-una-grave-bomba-fiscal-y-revela-las-soluciones/202654/' },
  { t: 'Portafolio de 133 proyectos por US$120.324 millones', e: 'curso', p: 35, d: '86 priorizados para las Milagro Weeks (US$56.799 millones) y 53 listos para rondas de inversión.', f: 'Portafolio, 19 oct 2026', u: 'https://www.portafolio.co/economia/gobierno/vicepresidente-presenta-133-proyectos-por-us-120-324-millones-para-atraer-inversiones-a-colombia-504715' },
  { t: 'Milagro Week en Nueva York (16–19 nov)', e: 'prog', p: 60, d: 'Primera vitrina internacional para presentar proyectos colombianos a inversionistas, presidida por el vicepresidente.', f: 'Semana, 23 oct 2026', u: 'https://www.semana.com/politica/articulo/vicepresidente-jose-manuel-restrepo-anuncio-proyectos-estrategicos-para-el-desarrollo-del-uraba-antioqueno/202619/' },
  { t: 'Urabá: túnel del Toyo, vía Chocó–Urabá y zona franca', e: 'anun', p: 10, d: 'Compromisos anunciados en Urabá: terminar el túnel del Toyo y conectarlo con Puerto Antioquia, un corredor vial con Chocó y evaluar una zona franca y una planta de banano y plátano.', f: 'Semana, 23 oct 2026', u: 'https://www.semana.com/politica/articulo/vicepresidente-jose-manuel-restrepo-anuncio-proyectos-estrategicos-para-el-desarrollo-del-uraba-antioqueno/202619/' },
  { t: 'Propuestas de Reinventando Colombia 2030 para el Plan Nacional de Desarrollo', e: 'prog', p: 50, d: '12 mesas de trabajo; Accenture entregará el documento consolidado a la Vicepresidencia en noviembre como insumo del PND 2026–2030.', f: 'Portafolio, 19 oct 2026', u: 'https://www.portafolio.co/economia/gobierno/vicepresidente-presenta-133-proyectos-por-us-120-324-millones-para-atraer-inversiones-a-colombia-504715' },
  { t: 'Duplicar la inversión privada frente al PIB', e: 'curso', p: 10, d: 'Dice que hay unos 170 proyectos listos por más de $600 billones para atraer capital nacional y extranjero.', f: 'Portafolio, sep 2026', u: 'https://www.portafolio.co/economia/gobierno/de-la-espriella-le-fija-cinco-grandes-tareas-a-restrepo-inversion-empleo-energia-e-inteligencia-artificial-502387' }
];

const XPOSTS = ['2113616745194033543']; // Video de Semana: Restrepo en Urabá (23 oct 2026)
const CHIPS = ['José Manuel Restrepo', 'Ley de Rescate', 'Milagro Week', 'Misión Crecer', 'Talento ColombIA', 'Restrepo Urabá', 'Restrepo energía', 'críticas Restrepo'];

let NOTICIAS = [], VIDEOS = [], tlShown = 12;
const $ = s => document.querySelector(s);
const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const diaBog = d => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(d));
const hoyBog = () => diaBog(new Date());
const fFecha = d => new Intl.DateTimeFormat('es-CO', { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));
const fHora = d => new Intl.DateTimeFormat('es-CO', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }).format(new Date(d));
const hace = d => {
  const m = Math.round((Date.now() - new Date(d)) / 60000);
  if (m < 60) return 'hace ' + Math.max(m, 1) + ' min';
  if (m < 1440) return 'hace ' + Math.round(m / 60) + ' h';
  return fFecha(d);
};
const imgTag = (src, alt = '') => src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${FOTOS_BASE[0].img}'">` : `<img src="${FOTOS_BASE[Math.floor(Math.random() * FOTOS_BASE.length)].img}" alt="" loading="lazy" referrerpolicy="no-referrer">`;

function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); setTimeout(() => el.classList.remove('on'), 2600); }

async function getJSON(path) {
  try { const r = await fetch(path + '?t=' + Date.now(), { cache: 'no-store' }); if (r.ok) return await r.json(); } catch (e) {}
  return null;
}
async function viaProxy(url) {
  for (const p of PROXIES) {
    try {
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 9000);
      const r = await fetch(p(url), { signal: ctl.signal }); clearTimeout(to);
      if (r.ok) { const t = await r.text(); if (t && t.length > 200) return t; }
    } catch (e) {}
  }
  return null;
}

/* ---------- Búsqueda en vivo ---------- */
function limpiaLink(l) {
  try { const u = new URL(l); const real = u.searchParams.get('url'); return real || l; } catch (e) { return l; }
}
function fuenteDe(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
const relevante = n => /restrepo|vicepresident/i.test((n.titulo || '') + ' ' + (n.resumen || ''));

async function buscarBing(q) {
  const xml = await viaProxy('https://www.bing.com/news/search?q=' + encodeURIComponent(q) + '&format=rss&setlang=es-CO&cc=CO&qft=sortbydate%3d%221%22');
  if (!xml) return [];
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  return [...doc.getElementsByTagName('item')].map(it => {
    const g = n => (it.getElementsByTagName(n)[0] || {}).textContent || '';
    const link = limpiaLink(g('link'));
    let img = g('News:Image');
    if (img) img = img.replace(/&amp;/g, '&') + (img.includes('?') ? '&w=640&h=360&c=7' : '');
    const src = g('News:Source') || fuenteDe(link);
    return { titulo: g('title'), url: link, resumen: g('description').replace(/<[^>]+>/g, ''), fecha: new Date(g('pubDate') || Date.now()).toISOString(), fuente: src, img, cat: 'En vivo' };
  }).filter(relevante);
}
async function buscarGoogle(q) {
  const xml = await viaProxy('https://news.google.com/rss/search?q=' + encodeURIComponent(q + ' when:7d') + '&hl=es-419&gl=CO&ceid=CO:es-419');
  if (!xml) return [];
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  return [...doc.getElementsByTagName('item')].slice(0, 25).map(it => {
    const g = n => (it.getElementsByTagName(n)[0] || {}).textContent || '';
    const t = g('title'); const src = g('source');
    return { titulo: t.replace(new RegExp('\\s-\\s' + src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), ''), url: g('link'), resumen: '', fecha: new Date(g('pubDate') || Date.now()).toISOString(), fuente: src, img: '', cat: 'En vivo' };
  }).filter(relevante);
}
async function buscarEnVivo(q) {
  const [a, b] = await Promise.all([buscarBing(q), buscarGoogle(q)]);
  const vistos = new Set(); const out = [];
  for (const n of [...a, ...b]) {
    const k = n.titulo.toLowerCase().replace(/[^a-záéíóúñ0-9 ]/gi, '').slice(0, 60);
    if (vistos.has(k)) continue; vistos.add(k); out.push(n);
  }
  return out.sort((x, y) => new Date(y.fecha) - new Date(x.fecha));
}

async function buscarVideosEnVivo() {
  const html = await viaProxy('https://www.youtube.com/results?search_query=' + encodeURIComponent('José Manuel Restrepo vicepresidente') + '&sp=CAI%253D');
  if (!html) return [];
  const out = []; const re = /"videoRenderer":\{"videoId":"([\w-]{11})".*?"title":\{"runs":\[\{"text":"(.*?)"\}/g; let m;
  while ((m = re.exec(html)) && out.length < 12) {
    const titulo = m[2].replace(/\\u0026/g, '&').replace(/\\"/g, '"');
    if (/restrepo|vicepresident/i.test(titulo)) out.push({ id: m[1], titulo, canal: '' });
  }
  return out;
}

/* ---------- Pintar ---------- */
function card(n, i = 0) {
  const nuevo = diaBog(n.fecha) === hoyBog();
  return `<a class="card" href="${esc(n.url)}" target="_blank" rel="noopener" style="animation-delay:${Math.min(i, 10) * 60}ms">
    <div class="ph">${imgTag(n.img, n.titulo)}</div>
    <div class="bd">
      <div class="meta"><span class="tag ${nuevo ? 'new' : ''}">${nuevo ? 'Hoy' : esc(n.cat || 'Noticia')}</span>${esc(n.fuente)} · ${nuevo ? fHora(n.fecha) : hace(n.fecha)}</div>
      <h3>${esc(n.titulo)}</h3>
      ${n.resumen ? `<p>${esc(n.resumen.slice(0, 170))}${n.resumen.length > 170 ? '…' : ''}</p>` : ''}
    </div></a>`;
}

function mezclar(nuevas) {
  const map = new Map(NOTICIAS.map(n => [n.url, n]));
  const titulos = new Set(NOTICIAS.map(n => n.titulo.toLowerCase().slice(0, 60)));
  let add = 0;
  for (const n of nuevas) {
    if (map.has(n.url) || titulos.has(n.titulo.toLowerCase().slice(0, 60))) continue;
    NOTICIAS.push(n); map.set(n.url, n); titulos.add(n.titulo.toLowerCase().slice(0, 60)); add++;
  }
  NOTICIAS.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  return add;
}

function pintarHoy() {
  const hoy = hoyBog();
  $('#hoyFecha').textContent = new Intl.DateTimeFormat('es-CO', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()) + ' · actualizado ' + fHora(new Date());
  let lista = NOTICIAS.filter(n => diaBog(n.fecha) === hoy);
  if (lista.length) $('#hoyInfo').textContent = lista.length + (lista.length === 1 ? ' noticia' : ' noticias') + ' del vicepresidente hoy.';
  else { lista = NOTICIAS.slice(0, 6); $('#hoyInfo').textContent = 'Todavía no hay noticias de hoy. Esto es lo más reciente:'; }
  $('#hoyFeed').innerHTML = lista.slice(0, 12).map(card).join('');
  $('#sHoy').textContent = NOTICIAS.filter(n => diaBog(n.fecha) === hoy).length;
  $('#sNot').textContent = NOTICIAS.length;
}

function pintarTicker() {
  const items = NOTICIAS.slice(0, 10).map(n => `<a href="${esc(n.url)}" target="_blank" rel="noopener"><b>${esc(hace(n.fecha))}</b>${esc(n.titulo)}</a>`).join('');
  $('#ticker').innerHTML = items + items;
}

let heroI = 0, heroT;
function pintarHero() {
  const fotos = [...NOTICIAS.filter(n => n.img && !/bing\.com\/th/.test(n.img)).slice(0, 4).map(n => ({ img: n.img, cred: 'Foto: ' + n.fuente })), ...FOTOS_BASE].slice(0, 7);
  const h = $('#hero');
  h.querySelectorAll('.slide').forEach(s => s.remove());
  fotos.forEach((f, i) => {
    const d = document.createElement('div'); d.className = 'slide' + (i === 0 ? ' on' : ''); d.dataset.cred = f.cred;
    d.innerHTML = `<img src="${esc(f.img)}" alt="José Manuel Restrepo" referrerpolicy="no-referrer" onerror="this.parentNode.remove()">`;
    h.prepend(d);
  });
  $('#dots').innerHTML = fotos.map((_, i) => `<i data-i="${i}" class="${i === 0 ? 'on' : ''}"></i>`).join('');
  const ir = i => {
    const s = [...h.querySelectorAll('.slide')].reverse(); if (!s.length) return;
    heroI = (i + s.length) % s.length;
    s.forEach((x, j) => x.classList.toggle('on', j === heroI));
    document.querySelectorAll('#dots i').forEach((x, j) => x.classList.toggle('on', j === heroI));
    $('#heroCredit').textContent = s[heroI].dataset.cred || '';
  };
  $('#dots').onclick = e => { if (e.target.dataset.i) { ir(+e.target.dataset.i); } };
  clearInterval(heroT); heroT = setInterval(() => ir(heroI + 1), 5500); ir(0);
}

function pintarMisiones() {
  $('#mis').innerHTML = MISIONES.map(m => `<div class="mi"><img src="${esc(m.img)}" alt="" loading="lazy" referrerpolicy="no-referrer"><div><div class="k">${m.k}</div><h3>${esc(m.t)}</h3><p>${esc(m.d)}</p></div></div>`).join('');
}

function pintarCompromisos() {
  const et = { anun: 'Anunciado', curso: 'En marcha', prog: 'Con fecha' };
  $('#goals').innerHTML = COMPROMISOS.map(c => `<div class="goal ${c.e}"><h3>${esc(c.t)}</h3><span class="st ${c.e}">${et[c.e]}</span>
    <p>${esc(c.d)}</p><div class="bar"><i style="width:0" data-w="${c.p}"></i></div>
    <div class="src">Fuente: <a href="${esc(c.u)}" target="_blank" rel="noopener">${esc(c.f)}</a></div></div>`).join('');
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.style.width = e.target.dataset.w + '%'; io.unobserve(e.target); } }));
  document.querySelectorAll('.bar i').forEach(b => io.observe(b));
}

function cuentaRegresiva() {
  const ms = MILAGRO_WEEK - Date.now();
  if (ms <= 0) { $('#cd').innerHTML = '<div><b>¡Ya!</b><span>en curso</span></div>'; return; }
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
  $('#cd').innerHTML = [[d, 'días'], [h, 'horas'], [m, 'min'], [s, 'seg']].map(([n, l]) => `<div><b>${String(n).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
}

function pintarVideos() {
  $('#sVid').textContent = VIDEOS.length;
  if (!VIDEOS.length) { $('#vids').innerHTML = '<div class="empty">Buscando videos en YouTube… mientras tanto, mira el video de Semana abajo.</div>'; return; }
  $('#vids').innerHTML = VIDEOS.slice(0, 9).map(v => `<div class="vid"><div class="fr" data-id="${esc(v.id)}">
    <img src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg" alt="" loading="lazy"><span class="play"></span></div>
    <div class="bd">${esc(v.titulo)}<small>${esc(v.canal || 'YouTube')}${v.fecha ? ' · ' + esc(v.fecha) : ''}</small></div></div>`).join('');
}
document.addEventListener('click', e => {
  const fr = e.target.closest('.fr[data-id]'); if (!fr) return;
  fr.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${fr.dataset.id}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
});

function pintarX() {
  $('#xposts').innerHTML = XPOSTS.map(id => `<blockquote class="twitter-tweet" data-theme="dark" data-lang="es"><a href="https://twitter.com/x/status/${id}"></a></blockquote>`).join('');
  const s = document.createElement('script'); s.src = 'https://platform.twitter.com/widgets.js'; s.async = true; document.body.appendChild(s);
}

function pintarGaleria() {
  const vistos = new Set(); const fotos = [];
  for (const n of NOTICIAS) { if (n.img && !vistos.has(n.img) && !/bing\.com\/th/.test(n.img)) { vistos.add(n.img); fotos.push(n); } }
  $('#gal').innerHTML = fotos.slice(0, 18).map(n => `<a href="${esc(n.url)}" target="_blank" rel="noopener"><img src="${esc(n.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.remove()"><span>${esc(fFecha(n.fecha))} · ${esc(n.fuente)}</span></a>`).join('');
}

function pintarLinea() {
  $('#tl').innerHTML = NOTICIAS.slice(0, tlShown).map(n => `<a class="ti" href="${esc(n.url)}" target="_blank" rel="noopener">${imgTag(n.img)}<div class="bd"><div class="d">${esc(fFecha(n.fecha))}</div><h3>${esc(n.titulo)}</h3><div class="s">${esc(n.fuente)}</div></div></a>`).join('');
  $('#btnMore').style.display = NOTICIAS.length > tlShown ? 'block' : 'none';
}
$('#btnMore').onclick = () => { tlShown += 12; pintarLinea(); };

function pintarTodo() {
  pintarHoy(); pintarTicker(); pintarGaleria(); pintarLinea(); pintarVideos();
  $('#sDias').textContent = Math.max(0, Math.floor((Date.now() - POSESION) / 864e5));
}

/* ---------- Buscador ---------- */
async function ejecutarBusqueda(q) {
  $('#liveFeed').innerHTML = '<div class="empty">Buscando "' + esc(q) + '" en la red…</div>';
  const res = await buscarEnVivo(q);
  if (!res.length) {
    const loc = NOTICIAS.filter(n => (n.titulo + ' ' + n.resumen).toLowerCase().includes(q.toLowerCase().replace('josé manuel restrepo', 'restrepo')));
    $('#liveFeed').innerHTML = loc.length ? loc.slice(0, 12).map(card).join('') : '<div class="empty">No encontramos resultados ahora. Intenta de nuevo en un momento.</div>';
    return 0;
  }
  $('#liveFeed').innerHTML = res.slice(0, 12).map(card).join('');
  return mezclar(res);
}
$('#chips').innerHTML = CHIPS.map((c, i) => `<span class="chip ${i === 0 ? 'on' : ''}">${esc(c)}</span>`).join('');
$('#chips').onclick = e => {
  if (!e.target.classList.contains('chip')) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); e.target.classList.add('on');
  $('#q').value = e.target.textContent; ejecutarBusqueda(e.target.textContent);
};
$('#fBuscar').onsubmit = e => { e.preventDefault(); const q = $('#q').value.trim(); if (q) ejecutarBusqueda(/restrepo|vicepresident/i.test(q) ? q : 'vicepresidente Restrepo ' + q); };

/* ---------- Carga y actualización ---------- */
let ultimaCarga = 0;
async function cargar(manual) {
  if (!manual && Date.now() - ultimaCarga < 120000) return;
  ultimaCarga = Date.now();
  const btn = $('#btnRefresh'); btn.classList.add('spin'); btn.textContent = 'Buscando…';
  const [n, v] = await Promise.all([getJSON('data/noticias.json'), getJSON('data/videos.json')]);
  if (n && n.items) { mezclar(n.items); $('#upd').textContent = 'Robot: última revisión ' + fFecha(n.actualizado) + ', ' + fHora(n.actualizado) + ' (hora Colombia)'; }
  if (v && v.items) VIDEOS = v.items;
  pintarTodo(); pintarHero();

  const antes = NOTICIAS.length;
  const [nuevas, vids] = await Promise.all([ejecutarBusqueda('José Manuel Restrepo vicepresidente'), buscarVideosEnVivo()]);
  for (const x of vids) if (!VIDEOS.some(y => y.id === x.id)) VIDEOS.unshift(x);
  pintarTodo();
  btn.classList.remove('spin'); btn.textContent = 'Actualizar';
  const dif = NOTICIAS.length - antes;
  if (manual || dif) toast(dif ? dif + ' novedades encontradas' : 'Todo al día');
}

$('#btnRefresh').onclick = () => cargar(true);

// Pestañas activas al hacer scroll
const secs = [...document.querySelectorAll('section[id]')];
addEventListener('scroll', () => {
  let act = secs[0].id;
  for (const s of secs) if (s.getBoundingClientRect().top < 160) act = s.id;
  document.querySelectorAll('#tabs a').forEach(a => {
    const on = a.getAttribute('href') === '#' + act;
    if (on && !a.classList.contains('on')) a.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    a.classList.toggle('on', on);
  });
}, { passive: true });

pintarMisiones(); pintarCompromisos(); pintarX();
setInterval(cuentaRegresiva, 1000); cuentaRegresiva();
cargar(false);
setInterval(() => cargar(false), 10 * 60 * 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) cargar(false); });

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
