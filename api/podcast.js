const FEEDS = [
  'https://www.ivoox.com/feed_fg_f13110723_filtro_1.xml',
  'https://www.ivoox.com/podcast-badrolls_fg_f13110723_filtro_1.xml'
];
const SPOTIFY_SHOW = 'https://open.spotify.com/show/4G8GrUlhLDT0u02XAyxcg1';

const decode = (s='') => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1')
  .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'")
  .replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const strip = s => decode(s).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return m ? decode(m[1]).trim() : '';
};
const attr = (xml, tagName, name) => {
  const m = xml.match(new RegExp(`<${tagName}[^>]*\\s${name}=["']([^"']+)["'][^>]*>`, 'i'));
  return m ? decode(m[1]) : '';
};

async function latestSpotifyEpisode(){
  try{
    const r=await fetch(SPOTIFY_SHOW,{headers:{'user-agent':'Mozilla/5.0'}});
    if(!r.ok) return SPOTIFY_SHOW;
    const html=await r.text();
    const ids=[...html.matchAll(/(?:https:\/\/open\.spotify\.com)?\/episode\/([A-Za-z0-9]{10,})/g)].map(m=>m[1]);
    const id=[...new Set(ids)][0];
    return id ? `https://open.spotify.com/episode/${id}` : SPOTIFY_SHOW;
  }catch(_){return SPOTIFY_SHOW}
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control','s-maxage=900, stale-while-revalidate=86400');
  let xml = '';
  let source = '';
  for (const url of FEEDS) {
    try {
      const r = await fetch(url, {headers:{'user-agent':'BadrollsWebsite/1.0'}});
      const text = await r.text();
      if (r.ok && /<item[\s>]/i.test(text)) { xml = text; source = url; break; }
    } catch (_) {}
  }
  if (!xml) return res.status(502).json({ok:false, error:'feed_unavailable'});

  const channelImage = attr(xml, 'itunes:image', 'href') || tag(tag(xml,'image'),'url');
  const items = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].slice(0,6).map(m => {
    const x = m[1];
    const title = strip(tag(x,'title'));
    const description = strip(tag(x,'description') || tag(x,'content:encoded'));
    const image = attr(x,'itunes:image','href') || attr(x,'media:content','url') || channelImage;
    const link = strip(tag(x,'link'));
    const guid = strip(tag(x,'guid'));
    const duration = strip(tag(x,'itunes:duration'));
    const date = strip(tag(x,'pubDate'));
    const num = (title.match(/^\s*(\d{1,3})\s*[-–—]/)||[])[1] || '';
    return {title, description, image, link, guid, duration, date, number:num};
  });
  const spotifyEpisode = await latestSpotifyEpisode();
  res.status(200).json({ok:true, source, show:{title:strip(tag(xml,'title')), image:channelImage}, spotifyEpisode, episodes:items});
};