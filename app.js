const SPOTIFY_SHOW='https://open.spotify.com/show/4G8GrUlhLDT0u02XAyxcg1';
const IVOOX_SHOW='https://www.ivoox.com/podcast-badrolls_sq_f13110723_1.html';
const INSTAGRAM='https://www.instagram.com/badrolls_players/';
const esc=s=>(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=s=>{try{return new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(s))}catch{return ''}};

const spotifyIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><circle class="spotify-disc" cx="12" cy="12" r="12"/><path class="spotify-wave" d="M17.95 17.18a.74.74 0 0 1-1.02.25c-2.8-1.71-6.32-2.1-10.47-1.15a.74.74 0 1 1-.33-1.45c4.54-1.04 8.44-.59 11.57 1.32.35.22.46.68.25 1.03Zm1.46-3.25a.93.93 0 0 1-1.28.31c-3.21-1.97-8.1-2.53-11.9-1.39a.93.93 0 1 1-.54-1.78c4.34-1.31 9.75-.68 13.42 1.57.44.27.57.84.3 1.29Zm.13-3.37C15.7 8.27 9.35 8.06 5.67 9.17a1.12 1.12 0 1 1-.65-2.15c4.22-1.27 11.24-1.02 15.66 1.6a1.12 1.12 0 0 1-1.14 1.94Z"/></svg>`;
const ivooxLogo=`<svg viewBox="0 0 124 38" aria-hidden="true"><text x="1" y="30" font-family="Montserrat,Arial,sans-serif" font-size="36" font-weight="850" letter-spacing="-2">ivoox</text></svg>`;
const instagramIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="17.4" cy="6.7" r="1.25" fill="currentColor"/></svg>`;

function listenLinks(spotifyUrl,ivooxUrl){
 const spotifyTarget=esc(spotifyUrl||SPOTIFY_SHOW);
 const ivooxTarget=esc(ivooxUrl||IVOOX_SHOW);
 return `<div class="listen-row"><span class="listen-label">Escuchar</span><div class="platform-links"><a class="platform-link spotify" href="${spotifyTarget}" target="_blank" rel="noopener" aria-label="Escuchar el último episodio de Badrolls en Spotify">${spotifyIcon}<span>Spotify</span></a><a class="platform-link ivoox" href="${ivooxTarget}" target="_blank" rel="noopener" aria-label="Escuchar el último episodio de Badrolls en iVoox">${ivooxLogo}</a><a class="platform-link instagram" href="${INSTAGRAM}" target="_blank" rel="noopener" aria-label="Seguir Badrolls en Instagram">${instagramIcon}</a></div></div>`
}

async function loadPodcast(){
 const hero=document.querySelector('#latest-episode');
 try{
  const r=await fetch('/api/podcast'); const d=await r.json();
  if(!d.ok||!d.episodes?.length) throw new Error('feed');
  const latest=d.episodes[0];
  const ivooxEpisodeUrl=latest.link||latest.guid||IVOOX_SHOW;
  const spotifyEpisodeUrl=d.spotifyEpisode||SPOTIFY_SHOW;
  hero.innerHTML=`<a class="episode-art" href="${esc(ivooxEpisodeUrl)}" target="_blank" rel="noopener" aria-label="Escuchar ${esc(latest.title)}"><img src="${esc(latest.image)}" alt="Miniatura de ${esc(latest.title)}"></a>${listenLinks(spotifyEpisodeUrl,ivooxEpisodeUrl)}<div class="hero-episode-info"><p class="meta">ÚLTIMO EPISODIO${latest.number?' · '+esc(latest.number):''}</p><h2>${esc(latest.title)}</h2><p class="episode-meta">${date(latest.date)}${latest.duration?' · '+esc(latest.duration):''}</p></div>`;
 }catch(e){
  hero.innerHTML=`<a class="spotify-card" href="${SPOTIFY_SHOW}" target="_blank" rel="noopener" aria-label="Escuchar Badrolls en Spotify"><iframe class="spotify-embed" src="https://open.spotify.com/embed/show/4G8GrUlhLDT0u02XAyxcg1?theme=0" width="100%" height="352" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Badrolls en Spotify"></iframe></a>${listenLinks(SPOTIFY_SHOW,IVOOX_SHOW)}<div class="hero-episode-info"><p class="meta">BADROLLS</p><h2>ESCUCHA EL PODCAST</h2></div>`;
 }
}
loadPodcast();