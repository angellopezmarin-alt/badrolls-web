const SPOTIFY='https://open.spotify.com/show/4G8GrUlhLDT0u02XAyxcg1';
const esc=s=>(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short=s=>(s||'').length>190?s.slice(0,187).trim()+'…':s||'';
const date=s=>{try{return new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(s))}catch{return ''}};

async function loadPodcast(){
 const hero=document.querySelector('#latest-episode');
 const grid=document.querySelector('#episode-grid');
 try{
  const r=await fetch('/api/podcast'); const d=await r.json();
  if(!d.ok||!d.episodes?.length) throw new Error('feed');
  const [latest,...rest]=d.episodes;
  hero.innerHTML=`<a class="episode-art" href="${SPOTIFY}" target="_blank" rel="noopener"><img src="${esc(latest.image)}" alt="Miniatura de ${esc(latest.title)}"></a><div class="hero-episode-info"><p class="meta">ÚLTIMO EPISODIO${latest.number?' · '+esc(latest.number):''}</p><h2>${esc(latest.title)}</h2><p class="episode-meta">${date(latest.date)}${latest.duration?' · '+esc(latest.duration):''}</p><div class="hero-actions"><a class="primary-link" href="${SPOTIFY}" target="_blank" rel="noopener">Spotify <span>↗</span></a>${latest.link?`<a class="secondary-link" href="${esc(latest.link)}" target="_blank" rel="noopener">iVoox ↗</a>`:''}</div></div>`;
  grid.innerHTML=rest.slice(0,4).map(e=>`<article class="episode-card"><a class="card-art" href="${esc(e.link||SPOTIFY)}" target="_blank" rel="noopener"><img src="${esc(e.image)}" alt="Miniatura de ${esc(e.title)}"></a><p class="episode-meta">${e.number?'EP. '+esc(e.number)+' · ':''}${date(e.date)}</p><h3>${esc(e.title)}</h3><p>${esc(short(e.description))}</p><a class="secondary-link" href="${esc(e.link||SPOTIFY)}" target="_blank" rel="noopener">Escuchar ↗</a></article>`).join('');
 }catch(e){
  hero.innerHTML=`<div class="spotify-card"><iframe class="spotify-embed" src="https://open.spotify.com/embed/show/4G8GrUlhLDT0u02XAyxcg1?theme=0" width="100%" height="352" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Badrolls en Spotify"></iframe></div><div class="hero-episode-info"><p class="meta">BADROLLS EN SPOTIFY</p><h2>ESCUCHA LOS ÚLTIMOS EPISODIOS</h2><a class="primary-link" href="${SPOTIFY}" target="_blank" rel="noopener">Abrir Spotify <span>↗</span></a></div>`;
  grid.innerHTML='';
 }
}
loadPodcast();