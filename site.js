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
