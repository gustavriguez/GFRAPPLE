(function(){
const DEFAULT_SITE=window.SITE_DATA||{};
function loadSite(){try{const saved=JSON.parse(localStorage.getItem('gr-site-multipage-v1')||'{}');return {...DEFAULT_SITE,...saved,song:{...(DEFAULT_SITE.song||{}),...(saved.song||{})},movie:{...(DEFAULT_SITE.movie||{}),...(saved.movie||{})}}}catch(e){return {...DEFAULT_SITE}}}
let SITE=loadSite();
const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
function youtubeId(raw){if(!raw)return'';raw=raw.trim();try{const u=new URL(raw);if(u.hostname.includes('youtu.be'))return u.pathname.split('/').filter(Boolean)[0]||'';if(u.pathname.startsWith('/shorts/'))return u.pathname.split('/')[2]||'';if(u.pathname.startsWith('/embed/'))return u.pathname.split('/')[2]||'';return u.searchParams.get('v')||''}catch(e){return /^[A-Za-z0-9_-]{11}$/.test(raw)?raw:''}}
function embedUrl(u){const id=youtubeId(u);return id?'https://www.youtube-nocookie.com/embed/'+id+'?rel=0':''}
function safeHeadshot(img,primary,fallback){if(!img)return;let triedFallback=false;img.onerror=()=>{if(!triedFallback&&fallback&&img.src!==fallback){triedFallback=true;img.src=fallback;return}img.onerror=null;const p=img.parentElement;img.remove();if(p&&!p.querySelector('.headshot-fallback')){const f=document.createElement('div');f.className='headshot-fallback';f.textContent='GR';p.insertBefore(f,p.firstChild)}};img.src=primary||fallback||''}
function applySite(d){SITE=d;const about=q('#aboutCopy');if(about)about.textContent=d.about||'';const st=q('#sideStatus');if(st)st.textContent=d.status||'';const cur=q('#sideCurrent');if(cur)cur.textContent=d.current||'';['gustavoHeadshot','sideHeadshot','aboutHeadshot','resumeHeadshot'].forEach(id=>safeHeadshot(document.getElementById(id),d.headshot,d.headshotFallback));for(const k of ['song','movie']){const i=d[k]||{},frame=q('#'+k+'Frame'),open=q('#'+k+'Open'),title=q('#'+k+'Title'),note=q('#'+k+'Note');const emb=embedUrl(i.url||'');if(frame&&emb)frame.src=emb;if(open)open.href=i.url||'#';if(title)title.textContent=i.title||'';if(note)note.textContent=i.note||''}const ss=q('#sideSong'),sm=q('#sideMovie');if(ss)ss.textContent=((d.song&&d.song.title)||'').split('—')[0].trim();if(sm)sm.textContent=((d.movie&&d.movie.title)||'').split('(')[0].trim()}
applySite(SITE);

// About editor
const editor=q('#editorModal'), editBtn=q('#aboutEditBtn');
function fillEditor(){if(!editor)return;q('#aboutInput').value=SITE.about||'';q('#statusInput').value=SITE.status||'';q('#currentInput').value=SITE.current||'';q('#headshotInput').value=SITE.headshot||'';q('#songUrl').value=SITE.song?.url||'';q('#songTitleInput').value=SITE.song?.title||'';q('#songNoteInput').value=SITE.song?.note||'';q('#movieUrl').value=SITE.movie?.url||'';q('#movieTitleInput').value=SITE.movie?.title||'';q('#movieNoteInput').value=SITE.movie?.note||''}
function openEditor(){if(!editor)return;fillEditor();editor.classList.add('open');editor.setAttribute('aria-hidden','false')}
if(editBtn)editBtn.addEventListener('click',()=>{if(window.openPortfolioEditor)window.openPortfolioEditor();else openEditor()});
function readEditor(){return{about:q('#aboutInput').value.trim(),status:q('#statusInput').value.trim(),current:q('#currentInput').value.trim(),headshot:q('#headshotInput').value.trim()||DEFAULT_SITE.headshot,headshotFallback:DEFAULT_SITE.headshotFallback,song:{url:q('#songUrl').value.trim(),title:q('#songTitleInput').value.trim(),note:q('#songNoteInput').value.trim()},movie:{url:q('#movieUrl').value.trim(),title:q('#movieTitleInput').value.trim(),note:q('#movieNoteInput').value.trim()}}}
if(editor){q('#closeEditor').onclick=()=>{editor.classList.remove('open');editor.setAttribute('aria-hidden','true')};editor.addEventListener('click',e=>{if(e.target===editor)q('#closeEditor').click()});q('#saveEditor').onclick=()=>{const d=readEditor();if(!youtubeId(d.song.url)||!youtubeId(d.movie.url)){alert('Use valid YouTube links for both weekly picks.');return}localStorage.setItem('gr-site-multipage-v1',JSON.stringify(d));applySite(d);q('#closeEditor').click()};q('#resetEditor').onclick=()=>{localStorage.removeItem('gr-site-multipage-v1');SITE=JSON.parse(JSON.stringify(DEFAULT_SITE));applySite(SITE);fillEditor()};q('#downloadEditor').onclick=()=>{const d=readEditor();if(!youtubeId(d.song.url)||!youtubeId(d.movie.url)){alert('Fix the YouTube links first.');return}const js='window.SITE_DATA = '+JSON.stringify(d,null,2)+';\n';const blob=new Blob([js],{type:'text/javascript'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='site-data.js';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}}

// Asset lightbox
const lightbox=q('#lightbox'), lightboxImg=q('#lightboxImg'), lightboxClose=q('#lightboxClose');
document.addEventListener('click',e=>{const b=e.target.closest('[data-lightbox]');if(!b||!lightbox)return;e.preventDefault();lightboxImg.src=b.dataset.lightbox;lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false')});if(lightboxClose)lightboxClose.onclick=()=>{lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');lightboxImg.src=''};if(lightbox)lightbox.onclick=e=>{if(e.target===lightbox&&lightboxClose)lightboxClose.click()};

// Site search redirects to the most relevant page or project anchor.
const searchRoutes=[
 {t:['exo','exoskeleton','ak80','teensy','jetson','gait'],u:'work.html#exo-project'},
 {t:['xcelodose','microbalance','reliability','lonza','root cause','rca'],u:'work.html#xcelodose'},
 {t:['smurf','power apps','maintenance request','urgent request'],u:'work.html#smurf'},
 {t:['carrt','vicon','imu','biomechanics','human motion'],u:'work.html#carrt'},
 {t:['mime','robot hand','mediapipe','servo'],u:'work.html#mime'},
 {t:['locomotive','cad','solidworks','steam'],u:'work.html#locomotive'},
 {t:['shape fight','matlab','game'],u:'work.html#shape-fight'},
 {t:['bull','ice cream','pixy','arduino','robot'],u:'work.html#bulls'},
 {t:['bakery','state flour','bread','sourdough'],u:'work.html#bakery'},
 {t:['asset','image','pdf','certificate','credential','cswa','citi'],u:'assets.html'},
 {t:['song','movie','weekly','music','film'],u:'media.html'},
 {t:['resume','résumé','skill','education'],u:'resume.html'},
 {t:['email','linkedin','contact'],u:'contact.html'},
 {t:['about','bio','gustavo'],u:'about.html'},
 {t:['project','engineering'],u:'projects.html'},
 {t:['experience','work'],u:'work.html'}
];
const sb=q('#siteSearch'), sbtn=q('#searchBtn'), smsg=q('#searchMsg');function doSearch(){if(!sb)return;const query=sb.value.trim().toLowerCase();if(!query){if(smsg)smsg.textContent='Type a project, role, skill, or credential.';return}const hit=searchRoutes.find(r=>r.t.some(x=>query.includes(x)||x.includes(query)));if(hit){location.href=hit.u}else if(smsg)smsg.textContent='No match for “'+query+'”.'}if(sbtn)sbtn.onclick=doSearch;if(sb)sb.addEventListener('keydown',e=>{if(e.key==='Enter')doSearch()});

// Word of the day
const words=[{w:'liminal',p:'LIM-uh-nuhl',pos:'adjective',d:'Occupying a position at, or on both sides of, a boundary or threshold.',e:'The empty lab after everyone left had a liminal, almost unreal quiet.'},{w:'susurrus',p:'soo-SUR-us',pos:'noun',d:'A whispering or rustling sound.',e:'The HVAC and distant traffic made a low susurrus behind the music.'},{w:'noctilucent',p:'nok-tih-LOO-sent',pos:'adjective',d:'Visible or glowing at night.',e:'The clouds looked noctilucent above the parking lot lights.'},{w:'palimpsest',p:'PAL-imp-sest',pos:'noun',d:'Something reused or altered while still showing traces of what came before.',e:'The prototype became a palimpsest of revisions, drilled holes, notes, and fixes.'},{w:'anemoia',p:'an-eh-MOY-uh',pos:'noun',d:'Nostalgia for a time you never personally experienced.',e:'Old web pages can trigger anemoia even when the design predates your first computer.'},{w:'brume',p:'broom',pos:'noun',d:'Mist or fog.',e:'A thin brume hung over the road before sunrise.'},{w:'penumbra',p:'puh-NUM-bruh',pos:'noun',d:'A partially shaded area between full shadow and full light.',e:'The monitor cast a penumbra across the workbench.'},{w:'ephemera',p:'ih-FEM-er-uh',pos:'noun',d:'Things made for short-term use that later become interesting records of a time.',e:'Flyers, screenshots, tickets, and old project notes became useful ephemera.'},{w:'vellum',p:'VEL-um',pos:'noun',d:'Fine writing material traditionally made from prepared animal skin; now also used for similar papers.',e:'The drawing looked better printed on translucent vellum.'},{w:'ataraxy',p:'AT-uh-rak-see',pos:'noun',d:'A state of calm and freedom from disturbance.',e:'Late-night CAD work occasionally settles into a strange ataraxy.'},{w:'vespertine',p:'VES-per-teen',pos:'adjective',d:'Relating to, occurring, or active in the evening.',e:'The vespertine light made the shop windows look warmer than they were.'},{w:'lacuna',p:'luh-KYOO-nuh',pos:'noun',d:'A gap, missing part, or blank space.',e:'The test notes had one lacuna: nobody recorded the setup change.'}];let wi=Math.floor(Date.now()/86400000)%words.length;function fitWord(el){if(!el)return;const len=el.textContent.trim().length;let s=len<=5?35:len<=8?33:len<=11?30:27;el.style.fontSize=s+'px';while(s>16&&el.scrollWidth>el.clientWidth){s-=.5;el.style.fontSize=s+'px'}}function renderWord(){const x=words[wi],w=q('[data-word]');if(!w)return;w.textContent=x.w;fitWord(w);q('[data-pronunciation]').textContent=x.p;q('[data-pos]').textContent=x.pos;q('[data-definition]').textContent=x.d;q('[data-example]').textContent='“'+x.e+'”';q('[data-word-index]').textContent=String(wi+1).padStart(2,'0')+'/'+words.length;qa('[data-daily-date]').forEach(el=>el.textContent=new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}).format(new Date()).toUpperCase())}const nw=q('[data-next-word]');if(nw)nw.onclick=()=>{wi=(wi+1)%words.length;renderWord()};renderWord();window.addEventListener('resize',()=>fitWord(q('[data-word]')));

// Project gallery mini windows
const GALLERIES=window.PROJECT_GALLERIES||{};
function mediaKind(item){if(!item)return'image';if(item.type)return item.type;if(/youtube\.com|youtu\.be/.test(item.src||''))return'youtube';if(/\.(mp4|webm|mov)(\?|$)/i.test(item.src||''))return'video';return'image'}
function ensureGalleryModal(){
  let modal=q('#projectGalleryModal');
  if(modal)return modal;
  modal=document.createElement('div');
  modal.id='projectGalleryModal';
  modal.className='gallery-modal';
  modal.setAttribute('aria-hidden','true');
  modal.innerHTML='<div class="gallery-window" role="dialog" aria-modal="true" aria-labelledby="galleryTitle">'+
    '<div class="gallery-bar"><div class="gallery-lights" aria-hidden="true"><i></i><i></i><i></i></div><strong id="galleryTitle">Project media</strong><button class="gallery-close" type="button" aria-label="Close gallery">×</button></div>'+
    '<div class="gallery-tabs"><button type="button" class="active" data-gallery-filter="all">All</button><button type="button" data-gallery-filter="image">Photos</button><button type="button" data-gallery-filter="video">Videos</button></div>'+
    '<div class="gallery-stage" id="galleryStage"></div><div class="gallery-caption" id="galleryCaption"></div>'+
    '<div class="gallery-thumbs" id="galleryThumbs"></div>'+
    '<div class="gallery-nav"><button type="button" data-gallery-prev>‹ previous</button><span id="galleryCount"></span><button type="button" data-gallery-next>next ›</button></div>'+
    '</div>';
  document.body.appendChild(modal);
  q('.gallery-close',modal).onclick=closeGallery;
  modal.addEventListener('click',e=>{if(e.target===modal)closeGallery()});
  qa('[data-gallery-filter]',modal).forEach(btn=>btn.addEventListener('click',()=>setGalleryFilter(btn.dataset.galleryFilter)));
  q('[data-gallery-prev]',modal).onclick=()=>stepGallery(-1);
  q('[data-gallery-next]',modal).onclick=()=>stepGallery(1);
  document.addEventListener('keydown',e=>{if(modal.getAttribute('aria-hidden')==='false'){if(e.key==='Escape')closeGallery();if(e.key==='ArrowLeft')stepGallery(-1);if(e.key==='ArrowRight')stepGallery(1)}});
  return modal
}
let galleryState={key:'',filter:'all',items:[],visible:[],index:0};
function youtubeEmbed(raw){const id=youtubeId(raw);return id?'https://www.youtube-nocookie.com/embed/'+id+'?rel=0&playsinline=1':''}
function openGallery(key){
  const g=GALLERIES[key];
  if(!g)return;
  const modal=ensureGalleryModal();
  galleryState={key,filter:'all',items:g.items||[],visible:[...(g.items||[])],index:0};
  q('#galleryTitle',modal).textContent=g.title||'Project media';
  qa('[data-gallery-filter]',modal).forEach(b=>b.classList.toggle('active',b.dataset.galleryFilter==='all'));
  modal.setAttribute('aria-hidden','false');
  document.documentElement.classList.add('gallery-open');
  renderGallery();
}
function closeGallery(){
  const modal=q('#projectGalleryModal'); if(!modal)return;
  modal.setAttribute('aria-hidden','true');
  document.documentElement.classList.remove('gallery-open');
  const stage=q('#galleryStage',modal); if(stage)stage.innerHTML='';
}
function setGalleryFilter(filter){
  galleryState.filter=filter;
  galleryState.visible=galleryState.items.filter(item=>{
    const k=mediaKind(item);
    if(filter==='all')return true;
    if(filter==='video')return k==='video'||k==='youtube';
    return k==='image'
  });
  galleryState.index=0;
  const modal=ensureGalleryModal();
  qa('[data-gallery-filter]',modal).forEach(b=>b.classList.toggle('active',b.dataset.galleryFilter===filter));
  renderGallery();
}
function stepGallery(delta){
  if(!galleryState.visible.length)return;
  galleryState.index=(galleryState.index+delta+galleryState.visible.length)%galleryState.visible.length;
  renderGallery();
}
function renderGallery(){
  const modal=ensureGalleryModal(), stage=q('#galleryStage',modal), thumbs=q('#galleryThumbs',modal), cap=q('#galleryCaption',modal), count=q('#galleryCount',modal);
  const items=galleryState.visible;
  if(!items.length){
    stage.innerHTML='<div class="gallery-missing"><b>No media in this view yet.</b><span>This project does not currently have media in this category.</span></div>';
    thumbs.innerHTML=''; cap.textContent=''; count.textContent='0 / 0'; return;
  }
  galleryState.index=Math.min(galleryState.index,items.length-1);
  const item=items[galleryState.index], kind=mediaKind(item);
  if(kind==='youtube'){
    stage.innerHTML='<iframe class="gallery-video" src="'+youtubeEmbed(item.src)+'" title="'+(item.alt||item.caption||'Project video').replace(/"/g,'&quot;')+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
  }else if(kind==='video'){
    stage.innerHTML='<video class="gallery-video" src="'+item.src+'" controls playsinline preload="metadata"></video>';
  }else{
    stage.innerHTML='<img class="gallery-image" src="'+item.src+'" alt="'+(item.alt||'Project image').replace(/"/g,'&quot;')+'">';
  }
  cap.textContent=item.caption||item.alt||'';
  count.textContent=(galleryState.index+1)+' / '+items.length;
  thumbs.innerHTML='';
  items.forEach((it,i)=>{
    const b=document.createElement('button'); b.type='button'; b.className='gallery-thumb'+(i===galleryState.index?' active':'');
    const k=mediaKind(it);
    if(k==='image')b.innerHTML='<img src="'+it.src+'" alt="">';
    else b.innerHTML='<span class="gallery-video-thumb">▶</span><small>'+(k==='youtube'?'YouTube':'Video')+'</small>';
    b.title=it.caption||it.alt||'Open media';
    b.onclick=()=>{galleryState.index=i;renderGallery()};
    thumbs.appendChild(b)
  })
}
qa('[data-gallery-open]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openGallery(el.dataset.galleryOpen)}));
})();

/* Pixel sprite add-on. This intentionally leaves the original Apple-style layout intact. */
(()=>{
  const page=document.body?.dataset?.page||'';
  const $=(s,e=document)=>e.querySelector(s);
  const el=(tag,cls)=>{const n=document.createElement(tag);if(cls)n.className=cls;return n};

  const spriteForPage={
    home:['wave','sprites/gustavo-wave.gif'],
    about:['wave','sprites/gustavo-wave.gif'],
    projects:['drill','sprites/gustavo-drill.gif'],
    work:['idle','sprites/gustavo-idle.gif'],
    media:['weather','sprites/gustavo-weather.gif'],
    assets:['shark','sprites/bullshark-swim.gif'],
    resume:['idle','sprites/gustavo-idle.gif'],
    contact:['wave','sprites/gustavo-wave.gif']
  };

  function addFloatingSprite(){
    if(page!=='home')return;
    const conf=spriteForPage[page]; if(!conf)return;
    const layer=el('div','pixel-sprite-layer');
    const s=el('div','pixel-sprite '+conf[0]);
    const i=new Image(); i.src=conf[1]; i.alt=''; i.setAttribute('aria-hidden','true');
    s.appendChild(i); layer.appendChild(s);
    const sh=el('div','pixel-sprite shark'); const si=new Image(); si.src='sprites/bullshark-swim.gif';si.alt='';si.setAttribute('aria-hidden','true');sh.appendChild(si);layer.appendChild(sh);
    document.body.appendChild(layer);
  }

  function decorateDailyCards(){
    const left=$('.daily-dock.left .daily-card');
    if(left && !left.querySelector('.daily-sprite-strip')){
      const strip=el('div','daily-sprite-strip shark-strip');
      strip.innerHTML='<img src="sprites/bullshark-swim.gif" alt="" aria-hidden="true">';
      const status=left.querySelector('.daily-status');
      left.insertBefore(strip,status||null);
    }
    const right=$('.daily-dock.right .daily-card');
    if(right && !right.querySelector('.tampa-mini')){
      const w=el('div','tampa-mini');
      w.innerHTML='<div><small>TAMPA TIME</small><br><strong data-tampa-time>--:--</strong></div><img class="sprite-weather-mini" src="sprites/gustavo-weather.gif" alt="" aria-hidden="true"><div><small>WEATHER</small><br><strong data-tampa-weather>checking…</strong></div>';
      const status=right.querySelector('.daily-status');
      right.insertBefore(w,status||null);
      updateTampa(w);
    }
  }

  function updateTime(root){
    const target=root.querySelector('[data-tampa-time]'); if(!target)return;
    const now=new Date();
    target.textContent=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/New_York'}).format(now);
  }
  async function updateTampa(root){
    updateTime(root);setInterval(()=>updateTime(root),30000);
    const out=root.querySelector('[data-tampa-weather]');
    try{
      const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=27.9506&longitude=-82.4572&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FNew_York');
      const j=await r.json();
      const map={0:'clear',1:'mostly clear',2:'partly cloudy',3:'overcast',45:'fog',48:'fog',51:'drizzle',53:'drizzle',55:'drizzle',61:'light rain',63:'rain',65:'heavy rain',80:'showers',81:'showers',82:'heavy showers',95:'storm'};
      out.textContent=Math.round(j.current.temperature_2m)+'° · '+(map[j.current.weather_code]||'outside');
    }catch(e){out.textContent='Tampa, FL';}
  }

  function addSectionBadge(){
    const title=$('.section-title'); if(!title || title.parentElement.querySelector('.section-sprite-badge'))return;
    const conf=spriteForPage[page]; if(!conf)return;
    const badge=el('span','section-sprite-badge');
    badge.innerHTML='<img src="'+conf[1]+'" alt="" aria-hidden="true">';
    title.parentElement.insertBefore(badge,title);
  }

  function addButtonJunk(){
    if($('.button-junk-wrap'))return;
    const footer=$('.footer'); if(!footer)return;
    const wrap=el('div','button-junk-wrap');
    const items=[
      ['https://www.last.fm/user/guub33','last.fm','guub33'],
      ['https://www.linkedin.com/in/gustavo33','linkedin','gustavo33'],
      ['mailto:gustavorodriguez@usf.edu','email me','@usf.edu'],
      ['#','pokémon','party data'],
      ['projects.html','robotics','+ bionics']
    ];
    items.forEach(([href,a,b])=>{
      const x=document.createElement('a');x.className='junk88';x.href=href;if(/^https/.test(href)){x.target='_blank';x.rel='noopener'}
      x.innerHTML='<span class="pix">'+a+'<br>'+b+'</span>';wrap.appendChild(x);
    });
    footer.parentNode.insertBefore(wrap,footer);
  }

  addFloatingSprite();
  decorateDailyCards();
  addSectionBadge();
  addButtonJunk();
})();


/* --- v17 live-overlay update. Keeps SITE_DATA / media edits untouched. --- */
(()=>{
  const q=(s,e=document)=>e.querySelector(s), qa=(s,e=document)=>[...e.querySelectorAll(s)];
  const page=document.body?.dataset?.page||'';

  // Remove every older shark placement; the beach vignette below is the only shark location.
  qa('.pixel-sprite.shark,.daily-sprite-strip.shark-strip').forEach(el=>el.remove());
  qa('.section-sprite-badge img[src*="bullshark"]').forEach(img=>img.closest('.section-sprite-badge')?.remove());

  // Favorite films live directly on About; no external profile button is shown.


  function addFavoriteFilms(){
    if(page!=='about' || q('#favorite-films'))return;
    const anchor=q('.about-stats')||q('.about-photo-grid'); if(!anchor)return;
    const shelf=document.createElement('section');
    shelf.className='favorite-films'; shelf.id='favorite-films';
    shelf.innerHTML=`
      <div class="favorite-films-head"><h3>Favorite films.</h3><span>current four</span></div>
      <div class="favorite-film-grid">
        <article class="favorite-film"><img src="magnolia.png" alt="Magnolia poster"><b>Magnolia</b><small>1999 · Paul Thomas Anderson</small></article>
        <article class="favorite-film"><img src="speed-racer.png" alt="Speed Racer poster"><b>Speed Racer</b><small>2008 · The Wachowskis</small></article>
        <article class="favorite-film"><img src="trainspotting.png" alt="Trainspotting poster"><b>Trainspotting</b><small>1996 · Danny Boyle</small></article>
        <article class="favorite-film"><img src="hundreds-of-beavers.png" alt="Hundreds of Beavers poster"><b>Hundreds of Beavers</b><small>2022 · Mike Cheslik</small></article>
      </div>`;
    anchor.insertAdjacentElement('afterend',shelf);
  }

  function addBeachShark(){
    if(q('.beach-shark-scene'))return;
    const s=document.createElement('div');
    s.className='beach-shark-scene'; s.setAttribute('aria-hidden','true');
    s.innerHTML='<div class="beach-sky"></div><div class="beach-ocean"><img class="beach-shark" src="sprites/bullshark-swim.gif" alt=""></div><div class="beach-sand"></div><div class="beach-palm"></div><div class="beach-palm-frond"></div>';
    document.body.appendChild(s);
  }

  function weatherLabel(code){
    const m={0:'Clear',1:'Mostly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',71:'Light snow',80:'Rain showers',81:'Showers',82:'Heavy showers',95:'Thunderstorms',96:'Storms + hail',99:'Storms + hail'};
    return m[code]||'Tampa weather';
  }
  function fmtClock(){return new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',second:'2-digit',timeZone:'America/New_York'}).format(new Date())}
  function fmtDate(){return new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric',timeZone:'America/New_York'}).format(new Date())}
  function fmtHour(iso){
    const d=new Date(iso+(/Z|[+-]\d\d:\d\d$/.test(iso)?'':'-04:00'));
    return new Intl.DateTimeFormat('en-US',{hour:'numeric',timeZone:'America/New_York'}).format(d);
  }
  function lineSvg(values, labels, type){
    const W=176,H=48,pL=5,pR=5,pT=5,pB=12;
    const nums=values.map(v=>Number(v)||0); let lo=Math.min(...nums), hi=Math.max(...nums);
    if(type==='rain'){lo=0;hi=100}else if(hi-lo<3){lo-=1.5;hi+=1.5}
    const x=i=>pL+(W-pL-pR)*(i/Math.max(1,nums.length-1));
    const y=v=>pT+(H-pT-pB)*(1-(v-lo)/Math.max(.001,hi-lo));
    const pts=nums.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const cls=type==='rain'?'tampa-chart-rain':'tampa-chart-line';
    const dots=nums.map((v,i)=> i%3===0?`<circle class="tampa-chart-dot" cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="1.5"></circle>`:'').join('');
    const indexes=[0,Math.floor((nums.length-1)/2),nums.length-1];
    const labs=indexes.map(i=>`<text class="tampa-axis" x="${x(i).toFixed(1)}" y="46" text-anchor="${i===0?'start':i===nums.length-1?'end':'middle'}">${labels[i]||''}</text>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${type==='rain'?'Rain probability':'Temperature'} forecast graph"><line class="tampa-chart-grid" x1="5" y1="18" x2="171" y2="18"></line><line class="tampa-chart-grid" x1="5" y1="32" x2="171" y2="32"></line><polyline class="${cls}" points="${pts}"></polyline>${dots}${labs}</svg>`;
  }

  function upgradeTampa(){
    const card=q('.daily-dock.right .daily-card'); if(!card)return;
    q('.tampa-mini',card)?.remove();
    if(q('.tampa-live',card))return;
    const live=document.createElement('section'); live.className='tampa-live';
    live.innerHTML=`
      <div class="tampa-live-head"><div><small>Tampa time · live</small><div class="tampa-live-clock" data-tampa-clock>--:--:--</div><div class="tampa-live-date" data-tampa-date></div></div><img class="tampa-live-sprite" src="sprites/gustavo-weather.gif" alt="" aria-hidden="true"></div>
      <div class="tampa-current"><div class="tampa-temp" data-live-temp>--°</div><div><div class="tampa-condition" data-live-condition>loading forecast…</div><div class="tampa-feels" data-live-feels>Open-Meteo connection</div></div></div>
      <div class="tampa-metrics"><div class="tampa-metric"><small>Humidity</small><strong data-live-humidity>--%</strong></div><div class="tampa-metric"><small>Wind</small><strong data-live-wind>-- mph</strong></div><div class="tampa-metric"><small>24h high</small><strong data-live-high>--°</strong></div><div class="tampa-metric"><small>24h low</small><strong data-live-low>--°</strong></div></div>
      <div class="tampa-chart"><div class="tampa-chart-head"><b>temperature · next 12h</b><span data-temp-range></span></div><div data-temp-chart></div></div>
      <div class="tampa-chart"><div class="tampa-chart-head"><b>rain chance · next 12h</b><span data-rain-max></span></div><div data-rain-chart></div></div>
      <div class="tampa-source">Forecast data: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> · Tampa, FL</div>`;
    const status=q('.daily-status',card); card.insertBefore(live,status||null);
    const tick=()=>{q('[data-tampa-clock]',live).textContent=fmtClock();q('[data-tampa-date]',live).textContent=fmtDate()}; tick(); setInterval(tick,1000);

    const url='https://api.open-meteo.com/v1/forecast?latitude=27.9506&longitude=-82.4572&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,relative_humidity_2m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York&forecast_hours=24';
    fetch(url).then(r=>{if(!r.ok)throw new Error('weather');return r.json()}).then(j=>{
      const c=j.current||{}, h=j.hourly||{};
      q('[data-live-temp]',live).textContent=Math.round(c.temperature_2m)+'°';
      q('[data-live-condition]',live).textContent=weatherLabel(c.weather_code);
      q('[data-live-feels]',live).textContent='Feels like '+Math.round(c.apparent_temperature)+'°';
      q('[data-live-humidity]',live).textContent=Math.round(c.relative_humidity_2m)+'%';
      q('[data-live-wind]',live).textContent=Math.round(c.wind_speed_10m)+' mph';
      const temps=(h.temperature_2m||[]).map(Number), rain=(h.precipitation_probability||[]).map(v=>Number(v)||0), times=(h.time||[]);
      if(temps.length){q('[data-live-high]',live).textContent=Math.round(Math.max(...temps))+'°';q('[data-live-low]',live).textContent=Math.round(Math.min(...temps))+'°'}
      const n=Math.min(12,temps.length,rain.length,times.length); const labels=times.slice(0,n).map(fmtHour);
      const t12=temps.slice(0,n), r12=rain.slice(0,n);
      q('[data-temp-chart]',live).innerHTML=lineSvg(t12,labels,'temp');
      q('[data-rain-chart]',live).innerHTML=lineSvg(r12,labels,'rain');
      if(t12.length)q('[data-temp-range]',live).textContent=Math.round(Math.min(...t12))+'–'+Math.round(Math.max(...t12))+'°F';
      if(r12.length)q('[data-rain-max]',live).textContent='max '+Math.round(Math.max(...r12))+'%';
    }).catch(()=>{
      q('[data-live-condition]',live).textContent='Live forecast unavailable';
      q('[data-live-feels]',live).textContent='Time still updates locally';
      q('[data-temp-chart]',live).innerHTML='<div class="small-print">forecast graph loads when the weather API is reachable</div>';
      q('[data-rain-chart]',live).innerHTML='<div class="small-print">no cached weather values used</div>';
    });
  }

  addFavoriteFilms(); addBeachShark(); upgradeTampa();
})();


/* --- v19 cleanup patch: Pokémon-only interaction, no forest/bear modes --- */
(()=>{
  const q=(s,e=document)=>e.querySelector(s), qa=(s,e=document)=>[...e.querySelectorAll(s)];

  function cleanButtonJunk(){
    qa('.button-junk-wrap .junk88').forEach(a=>{
      const txt=(a.textContent||'').toLowerCase().replace(/\s+/g,' ').trim();
      if(
        txt.includes('shoegaze') || txt.includes('persona') || txt.includes('letterboxd') ||
        txt.includes('favorite films') || txt.includes('forest mode') || txt.includes('bears')
      ){
        a.remove();
        return;
      }
      if(txt.includes('pokémon') || txt.includes('pokemon')){
        a.href='#'; a.removeAttribute('target'); a.removeAttribute('rel');
        a.dataset.junkAction='pokemon';
        a.innerHTML='<span class="pix">pokémon<br>party data</span>';
      }
    });
  }

  const pokemonParty=[
    {name:'Jirachi',dex:'0385',type:'Steel / Psychic',sprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/385.png'},
    {name:'Gible',dex:'0443',type:'Dragon / Ground',sprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/443.png'},
    {name:'Eevee',dex:'0133',type:'Normal',sprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png'},
    {name:'Dragapult',dex:'0887',type:'Dragon / Ghost',sprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/887.png'},
    {name:'Orbeetle',dex:'0826',type:'Bug / Psychic',sprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/826.png'},
    {name:'Masquerain',dex:'0284',type:'Bug / Flying',sprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/284.png'}
  ];

  function ensurePokemonWindow(){
    let win=q('.pokemon-party-window');
    if(win)return win;
    win=document.createElement('section');
    win.className='pokemon-party-window';
    win.setAttribute('role','dialog');
    win.setAttribute('aria-modal','true');
    win.setAttribute('aria-label','Pokémon party data');
    win.innerHTML=`
      <div class="pokemon-party-dialog">
        <div class="pokemon-party-titlebar">
          <div class="pokemon-party-title"><span class="pokemon-ball-dot" aria-hidden="true"></span><b>POKÉMON PARTY DATA</b></div>
          <button type="button" class="pokemon-party-close" aria-label="Close Pokémon party">×</button>
        </div>
        <div class="pokemon-party-subbar"><span>ACTIVE PARTY</span><span>6 / 6</span></div>
        <div class="pokemon-party-grid">
          ${pokemonParty.map((p,i)=>`<article class="pokemon-slot">
            <div class="pokemon-sprite-frame"><img src="${p.sprite}" alt="${p.name} sprite" loading="lazy"></div>
            <div class="pokemon-slot-copy"><b>${p.name}</b><small>#${p.dex}</small><span>${p.type}</span></div>
          </article>`).join('')}
        </div>
        <div class="pokemon-party-foot"><span>party data · local portfolio widget</span><span>sprites · PokeAPI</span></div>
      </div>`;
    document.body.appendChild(win);
    const close=()=>win.classList.remove('open');
    q('.pokemon-party-close',win).addEventListener('click',close);
    win.addEventListener('click',e=>{if(e.target===win)close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&win.classList.contains('open'))close()});
    return win;
  }

  function openPokemonParty(){ensurePokemonWindow().classList.add('open')}

  function fixFilmPosters(){
    const rootNames={
      'Magnolia':'magnolia.png',
      'Speed Racer':'speed-racer.png',
      'Trainspotting':'trainspotting.png',
      'Hundreds of Beavers':'hundreds-of-beavers.png'
    };
    qa('.favorite-film').forEach(card=>{
      const title=q('b',card)?.textContent?.trim(); const img=q('img',card);
      if(img && rootNames[title]){
        img.src=rootNames[title];
        img.onerror=()=>{img.style.display='none';card.classList.add('poster-missing')};
      }
    });
  }

  function wireActions(){
    cleanButtonJunk();
    qa('[data-junk-action="pokemon"]').forEach(a=>{
      if(a.dataset.v19Wired)return; a.dataset.v19Wired='1';
      a.addEventListener('click',e=>{e.preventDefault();openPokemonParty()});
    });
    fixFilmPosters();
  }

  // Clean up any stale DOM injected by older local versions if a hot reload leaves it behind.
  qa('.roaming-bear,.forest-overlay,.forest-theme-back').forEach(el=>el.remove());
  document.body.classList.remove('forest-mode-active');

  wireActions();
  requestAnimationFrame(wireActions);
})();

/* --- v20 weather patch: robust Tampa live panel + real graphs --- */
(()=>{
  const q=(s,e=document)=>e.querySelector(s);
  const TAMPA_TZ='America/New_York';
  const WEATHER_URL='https://api.open-meteo.com/v1/forecast?latitude=27.9506&longitude=-82.4572&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York&forecast_days=2';

  function weatherLabel(code){
    return ({
      0:'Clear',1:'Mostly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Rime fog',
      51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',56:'Freezing drizzle',57:'Freezing drizzle',
      61:'Light rain',63:'Rain',65:'Heavy rain',66:'Freezing rain',67:'Freezing rain',
      71:'Light snow',73:'Snow',75:'Heavy snow',77:'Snow grains',
      80:'Rain showers',81:'Showers',82:'Heavy showers',85:'Snow showers',86:'Heavy snow showers',
      95:'Thunderstorms',96:'Storms + hail',99:'Storms + hail'
    })[Number(code)] || 'Tampa weather';
  }

  function weatherSpriteName(current,daily){
    const code=Number(current?.weather_code);
    const temp=Number(current?.temperature_2m);
    const feels=Number(current?.apparent_temperature);
    const wind=Number(current?.wind_speed_10m);
    const localTime=String(current?.time||'');
    const nowHM=localTime.slice(11,16);
    const sunrise=String(daily?.sunrise?.[0]||'').slice(11,16);
    const sunset=String(daily?.sunset?.[0]||'').slice(11,16);
    const isNight=Boolean(nowHM && sunrise && sunset && (nowHM<sunrise || nowHM>=sunset));
    if([95,96,99].includes(code))return 'thunder';
    if([51,53,55,56,57,61,63,65,66,67,71,73,75,77,80,81,82,85,86].includes(code))return 'rain';
    if(Number.isFinite(wind) && wind>=13)return 'windy';
    if(Number.isFinite(feels) && feels>=90 || Number.isFinite(temp) && temp>=91)return 'hot';
    if(isNight)return 'night';
    if([1,2,3,45,48].includes(code))return 'partly-cloudy';
    if(code===0)return 'sunny';
    return 'presenter';
  }

  function updateWeatherSprite(panel,current,daily){
    const img=q('[data-v21-weather-sprite]',panel);
    if(!img)return;
    const name=weatherSpriteName(current,daily);
    const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ext=reduced?'png':'webp';
    const next=`weather-sprites/${name}.${ext}`;
    if(img.dataset.weatherName!==name){
      img.dataset.weatherName=name;
      img.alt=`Animated Gustavo weather sprite: ${name.replace('-', ' ')}`;
      img.classList.remove('sprite-swap');
      void img.offsetWidth;
      img.src=next;
      img.classList.add('sprite-swap');
    }
  }

  function clockParts(){
    const now=new Date();
    return {
      time:new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',second:'2-digit',timeZone:TAMPA_TZ}).format(now),
      date:new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric',timeZone:TAMPA_TZ}).format(now)
    };
  }

  function shortHour(localIso){
    if(!localIso)return '';
    const hh=Number(localIso.slice(11,13));
    if(Number.isNaN(hh))return '';
    const suffix=hh>=12?'PM':'AM';
    const h=((hh+11)%12)+1;
    return `${h} ${suffix}`;
  }

  function shortTime(localIso){
    if(!localIso)return '--';
    const part=localIso.slice(11,16);
    const [h0,m]=part.split(':').map(Number);
    const suffix=h0>=12?'PM':'AM';
    const h=((h0+11)%12)+1;
    return `${h}:${String(m).padStart(2,'0')} ${suffix}`;
  }

  function chartSvg(values, labels, kind){
    const vals=(values||[]).map(v=>Number(v)).filter(v=>Number.isFinite(v));
    if(!vals.length)return '<div class="tampa-empty">forecast data unavailable</div>';
    const W=218,H=70,pL=8,pR=8,pT=9,pB=19;
    let lo=Math.min(...vals), hi=Math.max(...vals);
    if(kind==='rain'){lo=0;hi=100}else if(hi-lo<4){lo-=2;hi+=2}
    const x=i=>pL+(W-pL-pR)*(i/Math.max(1,vals.length-1));
    const y=v=>pT+(H-pT-pB)*(1-(v-lo)/Math.max(.001,hi-lo));
    const pts=vals.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const indices=[0,Math.floor((vals.length-1)/2),vals.length-1];
    const axis=indices.map((i,idx)=>`<text class="tampa-v20-axis" x="${x(i).toFixed(1)}" y="66" text-anchor="${idx===0?'start':idx===2?'end':'middle'}">${labels[i]||''}</text>`).join('');
    const dots=vals.map((v,i)=>{
      if(i!==0 && i!==vals.length-1 && i%3!==0)return '';
      const val=kind==='rain'?`${Math.round(v)}%`:`${Math.round(v)}°`;
      return `<circle class="tampa-v20-dot" cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2"><title>${labels[i]||''}: ${val}</title></circle>`;
    }).join('');
    const cls=kind==='rain'?'tampa-v20-rain':'tampa-v20-temp';
    const grid=[pT, pT+(H-pT-pB)/2, H-pB].map(gy=>`<line class="tampa-v20-grid" x1="${pL}" x2="${W-pR}" y1="${gy.toFixed(1)}" y2="${gy.toFixed(1)}"></line>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${kind==='rain'?'Rain chance':'Temperature'} for the next 12 hours">${grid}<polyline class="${cls}" points="${pts}"></polyline>${dots}${axis}</svg>`;
  }

  function markup(){
    return `
      <section class="tampa-v20" aria-label="Live Tampa weather">
        <div class="tampa-v20-titlebar">
          <div>
            <small>TAMPA · LIVE</small>
            <strong data-v20-clock>--:--:--</strong>
            <span data-v20-date></span>
          </div>
          <img class="tampa-v21-weather-sprite" data-v21-weather-sprite src="weather-sprites/presenter.webp" alt="Animated Gustavo weather sprite" onerror="this.src='weather-sprites/presenter.png'">
        </div>
        <div class="tampa-v20-now">
          <div class="tampa-v20-temp" data-v20-temp>--°</div>
          <div class="tampa-v20-condition"><b data-v20-condition>connecting…</b><span data-v20-feels>live forecast</span></div>
        </div>
        <div class="tampa-v20-stats">
          <div><small>humidity</small><b data-v20-humidity>--%</b></div>
          <div><small>wind</small><b data-v20-wind>-- mph</b></div>
          <div><small>today</small><b data-v20-hilo>-- / --</b></div>
          <div><small>rain max</small><b data-v20-rainmax>--%</b></div>
          <div><small>sunrise</small><b data-v20-sunrise>--</b></div>
          <div><small>sunset</small><b data-v20-sunset>--</b></div>
        </div>
        <div class="tampa-v20-chart">
          <div class="tampa-v20-charthead"><b>temperature · next 12h</b><span data-v20-temprange></span></div>
          <div data-v20-tempchart></div>
        </div>
        <div class="tampa-v20-chart">
          <div class="tampa-v20-charthead"><b>rain chance · next 12h</b><span data-v20-rainrange></span></div>
          <div data-v20-rainchart></div>
        </div>
        <div class="tampa-v20-foot"><span data-v20-updated>updating…</span><button type="button" data-v20-refresh>refresh</button></div>
      </section>`;
  }

  function mount(){
    const card=q('.daily-dock.right .daily-card');
    if(!card)return;
    q('.tampa-mini',card)?.remove();
    q('.tampa-live',card)?.remove();
    q('.tampa-v20',card)?.remove();
    const holder=document.createElement('div');
    holder.innerHTML=markup();
    const panel=holder.firstElementChild;
    const status=q('.daily-status',card);
    card.insertBefore(panel,status||null);

    const tick=()=>{
      const x=clockParts();
      q('[data-v20-clock]',panel).textContent=x.time;
      q('[data-v20-date]',panel).textContent=x.date;
    };
    tick();
    const clockTimer=setInterval(tick,1000);

    async function load(){
      const refresh=q('[data-v20-refresh]',panel);
      refresh.disabled=true;
      q('[data-v20-updated]',panel).textContent='updating…';
      try{
        const res=await fetch(WEATHER_URL,{cache:'no-store'});
        if(!res.ok)throw new Error(`HTTP ${res.status}`);
        const j=await res.json();
        const c=j.current||{}, h=j.hourly||{}, d=j.daily||{};
        q('[data-v20-temp]',panel).textContent=Number.isFinite(Number(c.temperature_2m))?Math.round(c.temperature_2m)+'°':'--°';
        q('[data-v20-condition]',panel).textContent=weatherLabel(c.weather_code);
        q('[data-v20-feels]',panel).textContent=Number.isFinite(Number(c.apparent_temperature))?'feels like '+Math.round(c.apparent_temperature)+'°F':'Tampa, FL';
        q('[data-v20-humidity]',panel).textContent=Number.isFinite(Number(c.relative_humidity_2m))?Math.round(c.relative_humidity_2m)+'%':'--%';
        q('[data-v20-wind]',panel).textContent=Number.isFinite(Number(c.wind_speed_10m))?Math.round(c.wind_speed_10m)+' mph':'-- mph';
        const hi=Number(d.temperature_2m_max?.[0]), lo=Number(d.temperature_2m_min?.[0]);
        q('[data-v20-hilo]',panel).textContent=(Number.isFinite(hi)&&Number.isFinite(lo))?`${Math.round(hi)}° / ${Math.round(lo)}°`:'-- / --';
        const rmax=Number(d.precipitation_probability_max?.[0]);
        q('[data-v20-rainmax]',panel).textContent=Number.isFinite(rmax)?Math.round(rmax)+'%':'--%';
        q('[data-v20-sunrise]',panel).textContent=shortTime(d.sunrise?.[0]);
        q('[data-v20-sunset]',panel).textContent=shortTime(d.sunset?.[0]);
        updateWeatherSprite(panel,c,d);

        const times=h.time||[], temps=h.temperature_2m||[], rain=h.precipitation_probability||[];
        const currentHour=(c.time||'').slice(0,13);
        let start=Math.max(0,times.findIndex(t=>String(t).slice(0,13)>=currentHour));
        if(start<0)start=0;
        const end=Math.min(start+12,times.length,temps.length,rain.length);
        const tTimes=times.slice(start,end);
        const tVals=temps.slice(start,end).map(Number);
        const rVals=rain.slice(start,end).map(v=>Number(v)||0);
        const labels=tTimes.map(shortHour);
        q('[data-v20-tempchart]',panel).innerHTML=chartSvg(tVals,labels,'temp');
        q('[data-v20-rainchart]',panel).innerHTML=chartSvg(rVals,labels,'rain');
        if(tVals.length){q('[data-v20-temprange]',panel).textContent=`${Math.round(Math.min(...tVals))}–${Math.round(Math.max(...tVals))}°F`}
        if(rVals.length){q('[data-v20-rainrange]',panel).textContent=`max ${Math.round(Math.max(...rVals))}%`}
        const upd=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:TAMPA_TZ}).format(new Date());
        q('[data-v20-updated]',panel).textContent=`updated ${upd} · Open-Meteo`;
      }catch(err){
        q('[data-v20-condition]',panel).textContent='Forecast unavailable';
        q('[data-v20-feels]',panel).textContent='time still live';
        q('[data-v20-tempchart]',panel).innerHTML='<div class="tampa-empty">weather API did not respond</div>';
        q('[data-v20-rainchart]',panel).innerHTML='<div class="tampa-empty">try refresh in a moment</div>';
        q('[data-v20-updated]',panel).textContent='connection failed';
        const failSprite=q('[data-v21-weather-sprite]',panel);
        if(failSprite){failSprite.src='weather-sprites/presenter.webp';failSprite.dataset.weatherName='presenter';}
      }finally{
        refresh.disabled=false;
      }
    }

    q('[data-v20-refresh]',panel).addEventListener('click',load);
    load();
    const weatherTimer=setInterval(load,15*60*1000);
    window.addEventListener('beforeunload',()=>{clearInterval(clockTimer);clearInterval(weatherTimer)},{once:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
