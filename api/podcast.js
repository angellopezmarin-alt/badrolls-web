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
const decodeSpotifyHtml = s => s
  .replace(/\\u([0-9a-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16)))
  .replace(/\\\//g,'/')
  .replace(/\\"/g,'"')
  .replace(/&amp;/g,'&')
  .replace(/&#x27;|&#39;/g,"'")
  .replace(/&quot;/g,'"');

async function spotifyEpisodeMap(items){
  const result = {};
  try{
    const r=await fetch(SPOTIFY_SHOW,{headers:{'user-agent':'Mozilla/5.0'}});
    if(!r.ok) return result;
    const html=decodeSpotifyHtml(await r.text());
    const occurrences=[];
    for(const m of html.matchAll(/(?:https:\/\/open\.spotify\.com)?\/episode\/([A-Za-z0-9]{10,})/g)){
      occurrences.push({id:m[1],index:m.index||0});
    }
    const unique=[];
    const seen=new Set();
    for(const o of occurrences){
      if(!seen.has(o.id)){seen.add(o.id);unique.push(o)}
    }
    const used=new Set();
    for(const item of items){
      const num=String(item.number||'').padStart(2,'0');
      if(!/^\d{2,3}$/.test(num)) continue;
      const positions=[];
      const exact=item.title;
      let pos=html.indexOf(exact);
      while(pos!==-1){positions.push(pos);pos=html.indexOf(exact,pos+1)}
      if(!positions.length){
        const re=new RegExp(`(?:^|[^0-9])${num}\\s*[-–—]`,'g');
        for(const m of html.matchAll(re)) positions.push(m.index||0);
      }
      if(!positions.length) continue;
      let best=null;
      for(const o of unique){
        if(used.has(o.id)) continue;
        const distance=Math.min(...positions.map(p=>Math.abs(p-o.index)));
        if(!best || distance<best.distance) best={...o,distance};
      }
      if(best && best.distance<12000){
        result[num]=`https://open.spotify.com/episode/${best.id}`;
        used.add(best.id);
      }
    }
    return result;
  }catch(_){return result}
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
  const items = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(m => {
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
  const spotifyMap = await spotifyEpisodeMap(items);
  const episodes=items.map(item=>({...item,spotifyUrl:spotifyMap[String(item.number||'').padStart(2,'0')]||''}));
  const spotifyEpisode=episodes[0]?.spotifyUrl||SPOTIFY_SHOW;
  res.status(200).json({ok:true, source, show:{title:strip(tag(xml,'title')), image:channelImage}, spotifyEpisode, spotifyShow:SPOTIFY_SHOW, episodes});
};