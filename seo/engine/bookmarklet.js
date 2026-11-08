// Bouton-favori « Auditer cette page » : exécuté SUR le site de l'utilisateur, il lit sans proxy
// (même origine, donc pas de blocage CORS) le HTML brut, les en-têtes, robots.txt, le sitemap,
// llms.txt, quelques pages internes et le rendu après JavaScript, puis les transmet à SEO 360
// par postMessage — uniquement vers l'origine de SEO 360. Rien ne transite par un serveur tiers.

export function bookmarkletCode(appUrl) {
  const app = JSON.stringify(appUrl)
  const origin = JSON.stringify(new URL(appUrl).origin)
  const src = `(async()=>{const A=${app},O=${origin},w=window.open(A+'#bm','seo360')||{closed:true,postMessage(){}};
const o=location.origin,M=3e6,g=async(u,f)=>{const t=performance.now();try{const r=await fetch(u,{cache:'no-store',redirect:'follow',credentials:'omit'});const b=await r.text();return{url:u,finalUrl:r.url,status:r.status,redirected:r.redirected,headers:Object.fromEntries(r.headers),body:b.slice(0,M),timeMs:Math.round(performance.now()-t)}}catch(e){return{url:u,status:0,error:String(e)}}};
const m=await g(location.href);const side=await Promise.all(['/robots.txt','/sitemap.xml','/sitemap_index.xml','/llms.txt'].map(p=>g(o+p)));
const sm=((side[0].body||'').match(/^\\s*sitemap:\\s*(\\S+)/im)||[])[1];if(sm&&sm.startsWith(o)&&!/\\/sitemap(_index)?\\.xml$/.test(sm))side.push(await g(sm));
const L=[...new Set([...(m.body||'').matchAll(/href\\s*=\\s*["']([^"'#]+)/gi)].map(x=>{try{const u=new URL(x[1],location.href);u.hash='';return u.href}catch(e){return''}}).filter(u=>u.startsWith(o+'/')&&u!==location.href&&!/\\.(pdf|jpe?g|png|webp|avif|gif|svg|zip|css|js|xml|ico|mp4|mp3|docx?|xlsx?)(\\?|$)/i.test(u)))].slice(0,15);
const pages=[];for(let i=0;i<L.length;i+=3)pages.push(...await Promise.all(L.slice(i,i+3).map(u=>g(u))));
const d={type:'seo360-bm',v:1,url:location.href,main:m,side,pages,rendered:document.documentElement.outerHTML.slice(0,M),title:document.title};
let ok=false,n=0;const dl=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:'application/json'}));a.download='seo360-page.json';document.body.appendChild(a);a.click();a.remove();alert('SEO 360 : ce site empêche la transmission directe. Le fichier seo360-page.json vient d’être téléchargé : importez-le dans SEO 360 (Plus d’options → Importer).')};
addEventListener('message',e=>{if(e.origin===O&&e.data==='seo360-ack')ok=true});const s=setInterval(()=>{if(ok){clearInterval(s);return}if(w.closed||++n>40){clearInterval(s);if(!ok)dl();return}try{w.postMessage(d,O)}catch(e){}},500)})()`
  return 'javascript:' + encodeURIComponent(src.replace(/\n/g, ''))
}

// Vérifie la forme des données reçues (elles viennent d'une page tierce : non fiables).
export function validateBundle(d) {
  const okResp = (x) => x && typeof x === 'object' && typeof x.url === 'string' && typeof (x.status ?? 0) === 'number' && (x.body == null || typeof x.body === 'string')
  if (!d || d.type !== 'seo360-bm' || typeof d.url !== 'string' || !/^https?:\/\//.test(d.url)) return false
  if (!okResp(d.main) || !Array.isArray(d.side) || !Array.isArray(d.pages)) return false
  return d.side.every(okResp) && d.pages.every(okResp) && (d.rendered == null || typeof d.rendered === 'string')
}

// Fetcher qui sert les réponses collectées ; tout le reste est « non vérifié » (statut 0).
export function bundleFetcher(d) {
  const map = new Map()
  const key = (u) => { try { const x = new URL(u); x.hash = ''; return x.href } catch { return u } }
  for (const r of [d.main, ...d.side, ...d.pages]) {
    if (!r) continue
    const v = { status: r.status || 0, headers: lower(r.headers), body: r.body || '', finalUrl: r.finalUrl || r.url, redirects: r.redirected ? [{ url: r.url, status: 0 }] : [], timeMs: r.timeMs, error: r.error }
    map.set(key(r.url), v)
    if (r.finalUrl) map.set(key(r.finalUrl), v)
  }
  return async (url, { noFollow } = {}) => (noFollow ? {} : map.get(key(url)) || { status: 0, unknown: true })
}
const lower = (h) => Object.fromEntries(Object.entries(h || {}).map(([k, v]) => [String(k).toLowerCase(), String(v)]))
