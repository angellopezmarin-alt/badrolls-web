const SPOTIFY_SHOW='https://open.spotify.com/show/4G8GrUlhLDT0u02XAyxcg1';
const esc=s=>(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=s=>{try{return new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(s))}catch{return ''}};

const spotifyIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12"/><path d="M17.5 16.3a.75.75 0 0 1-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 1 1-.33-1.46c4.57-1.04 8.5-.59 11.66 1.34.35.21.46.67.25 1.03Zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.23-1.98-8.16-2.55-11.98-1.4a.94.94 0 1 1-.54-1.8c4.37-1.32 9.81-.68 13.5 1.58.44.27.58.85.31 1.29Zm.13-3.4C15.23 7.33 8.83 7.12 5.13 8.23a1.13 1.13 0 1 1-.65-2.16c4.25-1.28 11.32-1.03 15.77 1.61a1.13 1.13 0 0 1-1.15 1.95Z"/></svg>`;
const ivooxLogo=`<svg viewBox="0 0 124 38" aria-hidden="true"><text x="1" y="30" font-family="Montserrat,Arial,sans-serif" font-size="36" font-weight="850" letter-spacing="-2">ivoox</text></svg>`;

function listenLinks(episodeUrl){const target=esc(episodeUrl||SPOTIFY_SHOW);return `<div class="listen-row"><span class="listen-label">Escuchar</span><div class="platform-links"><a class="platform-link spotify" href="${target}" target="_blank" rel="noopener" aria-label="Escuchar el último episodio de Badrolls">${spotifyIcon}<span>Spotify</span></a><a class="platform-link ivoox" href="${target}" target="_blank" rel="noopener" aria-label="Escuchar el último episodio de Badrolls en iVoox">${ivooxLogo}</a></div></div>`}

async function loadPodcast(){
 const hero=document.querySelector('#latest-episode');
 try{
  const r=await fetch('/api/podcast'); const d=await r.json();
  if(!d.ok||!d.episodes?.length) throw new Error('feed');
  const latest=d.episodes[0];
  const episodeUrl=latest.link||latest.guid||SPOTIFY_SHOW;
  hero.innerHTML=`<a class="episode-art" href="${esc(episodeUrl)}" target="_blank" rel="noopener" aria-label="Escuchar ${esc(latest.title)}"><img src="${esc(latest.image)}" alt="Miniatura de ${esc(latest.title)}"></a>${listenLinks(episodeUrl)}<div class="hero-episode-info"><p class="meta">ÚLTIMO EPISODIO${latest.number?' · '+esc(latest.number):''}</p><h2>${esc(latest.title)}</h2><p class="episode-meta">${date(latest.date)}${latest.duration?' · '+esc(latest.duration):''}</p></div>`;
 }catch(e){
  hero.innerHTML=`<a class="spotify-card" href="${SPOTIFY_SHOW}" target="_blank" rel="noopener" aria-label="Escuchar Badrolls en Spotify"><iframe class="spotify-embed" src="https://open.spotify.com/embed/show/4G8GrUlhLDT0u02XAyxcg1?theme=0" width="100%" height="352" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Badrolls en Spotify"></iframe></a>${listenLinks(SPOTIFY_SHOW)}<div class="hero-episode-info"><p class="meta">BADROLLS</p><h2>ESCUCHA EL PODCAST</h2></div>`;
 }
}
loadPodcast();