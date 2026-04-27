(function () {
  const { useState, useCallback, useMemo, useEffect } = React;

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "decoOpacity": 0.12,
    "navColor": "#d95878",
    "bgColor": "#fce4eb",
    "fontScale": 1
  }/*EDITMODE-END*/;

  // ── BACKGROUND DECORATIONS ──────────────────────────────────────────────────
  const DECO_ITEMS = [
    {src:'uploads/5294ac2e-cb54-458f-bbf0-2c4b9fc6a59d.png', style:{top:'-30px',left:'-40px',width:'280px',transform:'rotate(-15deg)'}},
    {src:'uploads/e74f7d19-1139-42d8-a7e4-6dbc0e8aeafa.png',  style:{top:'62px',right:'-20px',width:'220px',transform:'rotate(8deg)'}},
    {src:'uploads/doodle-postage-stamp-illustration-png.png',  style:{top:'44%',right:'8px',width:'160px',transform:'rotate(-5deg)'}},
    {src:'uploads/c0cf48dd-5abc-45a2-a13e-140f06ce8ebf.png',  style:{bottom:'-20px',left:'-30px',width:'320px',transform:'rotate(6deg)'}},
    {src:'uploads/9fd22947-0537-45a6-a7ba-68e561a727fc.png',  style:{bottom:'20px',left:'36%',width:'240px',transform:'rotate(-8deg)'}},
    {src:'uploads/3ebbac5a-4629-439e-b7bf-9f98c3089340.png',  style:{bottom:'-10px',right:'40px',width:'160px',transform:'rotate(7deg)'}},
    {src:'uploads/e74f7d19-1139-42d8-a7e4-6dbc0e8aeafa.png',  style:{bottom:'60px',left:'41%',width:'140px',transform:'rotate(-12deg)'}},
    {src:'uploads/5294ac2e-cb54-458f-bbf0-2c4b9fc6a59d.png',  style:{top:'65px',left:'43%',width:'160px',transform:'rotate(20deg)'}},
    {src:'uploads/doodle-postage-stamp-illustration-png.png',  style:{bottom:'80px',left:'17%',width:'120px',transform:'rotate(10deg)'}},
    {src:'uploads/9fd22947-0537-45a6-a7ba-68e561a727fc.png',  style:{top:'80px',left:'21%',width:'180px',transform:'rotate(15deg) scaleX(-1)'}},
  ];

  function BgDecorations({ opacity }) {
    return (
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
        {DECO_ITEMS.map((d,i) => (
          <img key={i} src={d.src} alt="" style={{position:'absolute',opacity,...d.style}} />
        ))}
      </div>
    );
  }

  // ── LOCAL STORAGE HOOK ───────────────────────────────────────────────────────
  function useLS(key, def) {
    const [val, setVal] = useState(() => {
      try {
        // v6: clear old keys from before the blank-slate launch
        if (localStorage.getItem('aa_data_version') !== '6') {
          ['aa_posts','aa_photos','aa_food','aa_tags','aa_admin'].forEach(k => localStorage.removeItem(k));
          localStorage.setItem('aa_data_version', '6');
        }
        const s = localStorage.getItem(key); return s ? JSON.parse(s) : def;
      } catch { return def; }
    });
    const set = useCallback(v => {
      setVal(v);
      try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
    }, [key]);
    return [val, set];
  }

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  function Pill({ tag }) {
    return <span style={{fontFamily:'var(--font-display)',fontSize:10.5,background:'var(--pink-100)',border:'1px solid var(--pink-200)',borderRadius:9999,padding:'2px 9px',color:'var(--pink-600)'}}>{tag}</span>;
  }


  function firstImageUrl(item) {
    const imgs = item?.images || [];
    const first = imgs.find(img => img && (img.url || img.src || img.imgUrl));
    return first ? (first.url || first.src || first.imgUrl) : '';
  }

  function isUsableImageUrl(url) {
    return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/') || url.startsWith('blob:'));
  }

  function SearchBar({ value, onChange, placeholder }) {
    return (
      <div style={{position:'relative',marginBottom:16}}>
        <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:15,opacity:.45}}>🔍</span>
        <input style={{width:'100%',paddingLeft:36,paddingRight:12,height:38,border:'1.5px solid var(--pink-300)',borderRadius:9999,fontFamily:'var(--font-body)',fontSize:13,background:'rgba(255,255,255,.88)',outline:'none',color:'var(--gray-900)'}}
          placeholder={placeholder||'Search…'} value={value} onChange={e=>onChange(e.target.value)}/>
      </div>
    );
  }

  function FilterRow({ allTags, active, onChange }) {
    return (
      <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:18}}>
        {['All',...allTags].map(tag => (
          <button key={tag} onClick={()=>onChange(tag)}
            style={{fontFamily:'var(--font-display)',fontSize:12,borderRadius:9999,
              padding:'4px 13px',cursor:'pointer',border:'1.5px solid',transition:'all .15s',userSelect:'none',
              background:active===tag?'var(--pink-500)':'rgba(255,255,255,.75)',
              color:active===tag?'white':'var(--pink-600)',
              borderColor:active===tag?'var(--pink-500)':'var(--pink-300)'}}>
            {tag}
          </button>
        ))}
      </div>
    );
  }

  function FAB({ label, onClick }) {
    return (
      <button onClick={onClick}
        style={{fontFamily:'var(--font-display)',fontSize:13,background:'var(--pink-500)',color:'white',
          border:'none',borderRadius:9999,padding:'8px 18px',cursor:'pointer',display:'flex',
          alignItems:'center',gap:6,boxShadow:'0 2px 12px rgba(200,100,120,.25)',
          transition:'box-shadow .15s,transform .15s',flexShrink:0}}
        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 5px 18px rgba(200,100,120,.35)';}}
        onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 12px rgba(200,100,120,.25)';}}>
        <span style={{fontSize:16,lineHeight:1}}>+</span>{label}
      </button>
    );
  }

  function AdminBtn({ label, onClick, danger }) {
    return (
      <button onClick={onClick}
        style={{fontFamily:'var(--font-display)',fontSize:11,border:'1px solid',borderRadius:6,
          padding:'3px 10px',cursor:'pointer',transition:'all .15s',
          background: danger ? 'rgba(192,48,96,.08)' : 'rgba(217,88,120,.08)',
          color: danger ? '#c03060' : 'var(--pink-500)',
          borderColor: danger ? '#f2a0b8' : 'var(--pink-300)'}}>
        {label}
      </button>
    );
  }

  const BRAND_NAMES = ['Anamika Abroad :)', 'Euromika', 'Anamicles ;)'];

  // ── SVG ICONS ─────────────────────────────────────────────────────────────────
  const HomeIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3L21 9.5V20A1 1 0 0 1 20 21H15V16H9V21H4A1 1 0 0 1 3 20V9.5Z"/>
    </svg>
  );

  // ── NAVBAR ────────────────────────────────────────────────────────────────────
  function Navbar({ view, setView, isAdmin, onLoginClick, onLogout, navColor }) {
    const [brandIdx, setBrandIdx] = useState(0);
    const navItems = [
      {id:'home', label:'Home', icon: <HomeIcon/>},
      {id:'blog', label:'All Blogs', src:'assets/icon-scroll.png'},
      {id:'photos', label:'Photos', src:'assets/icon-camera.png'},
      {id:'food', label:'Food Diary', src:'uploads/312686.png'},
      {id:'passport', label:'Passport', src:'uploads/0104c956-8b5c-4584-a6e9-bd17beed59ae-d48a0b67.png'},
    ];
    return (
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:200,height:62,
        background: navColor || 'var(--pink-500)',boxShadow:'0 2px 10px rgba(180,60,80,.22)',
        display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px'}}>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          {navItems.map(item => (
            <button key={item.id} title={item.label}
              onClick={() => setView(item.id)}
              style={{background: view===item.id ? 'rgba(255,255,255,.22)' : 'none',
                border:'none',cursor:'pointer',width:38,height:38,borderRadius:9,
                display:'flex',alignItems:'center',justifyContent:'center',
                transition:'background .15s,transform .15s',opacity: view===item.id ? 1 : .82}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.15)';e.currentTarget.style.transform='scale(1.08)';}}
              onMouseLeave={e=>{e.currentTarget.style.background=view===item.id?'rgba(255,255,255,.22)':'none';e.currentTarget.style.transform='';}}>
              {item.icon ? item.icon : <img src={item.src} alt={item.label} style={{width:26,height:26,objectFit:'contain',filter:'brightness(0) invert(1)'}}/>}
            </button>
          ))}
        </div>
        <div onClick={()=>setBrandIdx(i=>(i+1)%BRAND_NAMES.length)}
          style={{fontFamily:'var(--font-display)',fontSize:21,color:'white',letterSpacing:'.02em',
            userSelect:'none',cursor:'pointer',transition:'transform .15s',padding:'4px 8px',borderRadius:8}}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.12)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='none';}}>
          {BRAND_NAMES[brandIdx]}
        </div>
        <div>
          {isAdmin
            ? <button onClick={onLogout} style={{fontFamily:'var(--font-display)',fontSize:12,background:'rgba(255,255,255,.18)',color:'white',border:'1.5px solid rgba(255,255,255,.35)',borderRadius:9999,padding:'5px 14px',cursor:'pointer'}}>✏️ Editing Mode</button>
            : <button onClick={onLoginClick} style={{fontFamily:'var(--font-display)',fontSize:12,background:'rgba(255,255,255,.12)',color:'rgba(255,255,255,.7)',border:'1.5px solid rgba(255,255,255,.2)',borderRadius:9999,padding:'5px 14px',cursor:'pointer'}}>🔒 Login</button>}
        </div>
      </nav>
    );
  }

  // ── HOME VIEW ─────────────────────────────────────────────────────────────────
  function HomeView({ posts, selectedPost, onPinClick, onReadMore }) {
    return (
      <div style={{display:'flex',height:'100%',alignItems:'stretch'}}>
        <div style={{width:'55%',display:'flex',alignItems:'center',justifyContent:'center',padding:'10px 0 10px 10px',flexShrink:0}}>
          <GlobeView posts={posts} selectedPostId={selectedPost ? selectedPost.id : null}
            onPinClick={pin => {
              const loc = postsNearPin(posts, pin);
              if (loc) onPinClick(loc);
            }}/>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'20px 28px 20px 14px',overflow:'hidden'}}>
          {selectedPost ? (
            <>
              <div style={{fontFamily:'var(--font-display)',fontSize:22,color:'var(--pink-600)',marginBottom:12}}>LATEST POST!!!</div>
              <div style={{background:'rgba(255,255,255,.95)',border:'2.5px solid var(--pink-400)',borderRadius:20,padding:'18px 20px',boxShadow:'0 4px 24px rgba(200,100,120,.18)'}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:12,color:'var(--pink-500)',marginBottom:4}}>📍 {selectedPost.location}</div>
                <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}}>
                  {selectedPost.tags.map(t=><Pill key={t} tag={t}/>)}
                </div>
                <div style={{fontFamily:'var(--font-display)',fontSize:20,color:'var(--gray-900)',marginBottom:2,lineHeight:1.2}}>{selectedPost.title}</div>
                <div style={{fontSize:11,color:'var(--gray-600)',marginBottom:12}}>{selectedPost.date}</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                  {(selectedPost.images||[]).slice(0,2).map((img,i)=>{
                    const url = img.url || img.src || img.imgUrl || '';
                    return (
                      <div key={i} style={{background:seedGrad(selectedPost.title,i*7),borderRadius:9,height:82,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,overflow:'hidden',position:'relative'}}>
                        {isUsableImageUrl(url)
                          ? <img src={url} alt={img.caption||''} style={{
  width:'100%',
  height:'auto',
  maxHeight:180,
  objectFit:'contain',
  display:'block'
}}/>
                          : <span style={{fontSize:24}}>{img.emoji || '📸'}</span>}
                        {img.caption && <span style={{position:isUsableImageUrl(url)?'absolute':'static',left:6,bottom:6,background:isUsableImageUrl(url)?'rgba(255,255,255,.86)':'transparent',borderRadius:999,padding:isUsableImageUrl(url)?'3px 7px':0,fontSize:9.5,color:'var(--pink-600)',fontFamily:'var(--font-display)',textAlign:'center',maxWidth:'88%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{img.caption}</span>}
                      </div>
                    );
                  })}
                  {(!selectedPost.images||selectedPost.images.length===0)&&[0,1].map(i=>(
                    <div key={i} style={{background:seedGrad(selectedPost.title,i*7),borderRadius:9,height:82,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>📸</div>
                  ))}
                </div>
                <ul style={{listStyle:'none',marginBottom:14}}>
                  {selectedPost.highlights.map((h,i)=><li key={i} style={{fontSize:12.5,color:'var(--gray-600)',padding:'2px 0',lineHeight:1.4}}><span style={{color:'var(--gold)'}}>★ </span>{h}</li>)}
                </ul>
                <button onClick={()=>onReadMore(selectedPost)}
                  style={{fontFamily:'var(--font-display)',fontSize:14,background:'var(--pink-500)',color:'white',border:'none',borderRadius:9999,padding:'8px 0',cursor:'pointer',width:'100%',boxShadow:'0 2px 8px rgba(200,100,120,.2)',transition:'all .15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';}}>
                  Read More →
                </button>
              </div>
            </>
          ) : (
            <div style={{textAlign:'center',padding:'20px'}}>
              <div style={{fontSize:52,marginBottom:16}}>✈️</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:24,color:'var(--pink-600)',marginBottom:10}}>Welcome to Anamika Abroad!</div>
              <div style={{fontFamily:'var(--font-body)',fontSize:14,color:'var(--gray-600)',lineHeight:1.7,marginBottom:20}}>
                Log in and write your first blog post<br/>to see it appear on the globe!
              </div>
              <div style={{fontFamily:'var(--font-display)',fontSize:12,color:'var(--pink-400)'}}>Spin the globe → click a pin to explore</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function postsNearPin(posts, pin) {
    const matches = posts.filter(p =>
      Math.abs(p.coords[0]-pin.coords[0]) < 1.5 && Math.abs(p.coords[1]-pin.coords[1]) < 1.5
    ).sort((a,b)=>b.id-a.id);
    return matches[0]||null;
  }

  // ── BLOG VIEW ─────────────────────────────────────────────────────────────────
  function BlogView({ posts, allTags, isAdmin, onRead, onAdd, onEdit, onDelete }) {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const filtered = useMemo(() => {
      let p = filter==='All' ? posts : posts.filter(x=>x.tags.includes(filter));
      if (search.trim()) { const q=search.toLowerCase(); p=p.filter(x=>x.title.toLowerCase().includes(q)||x.location.toLowerCase().includes(q)||(x.body&&x.body.toLowerCase().includes(q))||x.tags.some(t=>t.toLowerCase().includes(q))); }
      return p;
    }, [posts, filter, search]);
    return (
      <div className="scroll-view">
        <div className="view-hd">
          <div className="view-title">All Posts ✈️</div>
          {isAdmin && <FAB label="New Post" onClick={onAdd}/>}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search posts, locations, tags…"/>
        <FilterRow allTags={allTags} active={filter} onChange={setFilter}/>
        {!filtered.length && <div style={{fontFamily:'var(--font-display)',color:'var(--pink-400)',padding:'20px 0',fontSize:15}}>No posts found!</div>}
        <div className="archive-grid">
          {filtered.map(post=>(
            <div key={post.id} className="archive-card" onClick={()=>onRead(post)}>
              <div className="archive-card-img" style={{background:seedGrad(post.title),overflow:'hidden'}}>
                {isUsableImageUrl(firstImageUrl(post))
                  ? <img src={firstImageUrl(post)} alt={post.title} style={{
  width:'100%',
  height:'auto',
  maxHeight:180,
  objectFit:'contain',
  display:'block'
}}/>
                  : <span style={{fontSize:38}}>{locEmoji(post.location)}</span>}
              </div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:6}}>
                {post.tags.map(t=><Pill key={t} tag={t}/>)}
              </div>
              <div style={{fontFamily:'var(--font-display)',fontSize:17,color:'var(--gray-900)',marginBottom:3,lineHeight:1.3}}>{post.title}</div>
              <div style={{fontSize:11,color:'var(--gray-600)'}}>📍 {post.location} · {post.date}</div>
              {isAdmin && (
                <div style={{display:'flex',gap:6,marginTop:10}} onClick={e=>e.stopPropagation()}>
                  <AdminBtn label="✏️ Edit" onClick={()=>onEdit(post)}/>
                  <AdminBtn label="🗑️ Delete" onClick={()=>onDelete(post)} danger/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── POST DETAIL ───────────────────────────────────────────────────────────────
  function PostDetail({ post, isAdmin, onBack, onEdit, onDelete }) {
    const [idx, setIdx] = useState(0);
    if (!post) return null;
    const imgs = post.images||[];
    const total = imgs.length;
    return (
      <div className="scroll-view post-detail-view">
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <button onClick={onBack} style={{fontFamily:'var(--font-display)',fontSize:14,color:'var(--pink-500)',cursor:'pointer',background:'none',border:'none',display:'flex',alignItems:'center',gap:5}}>← Back</button>
          {isAdmin && <>
            <AdminBtn label="✏️ Edit" onClick={()=>onEdit(post)}/>
            <AdminBtn label="🗑️ Delete" onClick={()=>onDelete(post)} danger/>
          </>}
        </div>
        <div style={{maxWidth:760,margin:'0 auto',width:'100%'}}>
          <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>{post.tags.map(t=><Pill key={t} tag={t}/>)}</div>
          <div style={{fontFamily:'var(--font-display)',fontSize:34,color:'var(--pink-600)',lineHeight:1.2,marginBottom:6}}>{post.title}</div>
          <div style={{fontSize:13,color:'var(--gray-600)',marginBottom:22}}>📍 {post.location} · {post.date}</div>
          {total>0 && (
            <>
              <div style={{position:'relative',borderRadius:14,overflow:'hidden',background:seedGrad(post.title),marginBottom:10}}>
                <div style={{display:'flex',transition:'transform .35s ease',transform:`translateX(-${idx*100}%)`}}>
                  {imgs.map((img,i)=>{
                    const url = img.url || img.src || img.imgUrl || '';
                    return (
                      <div key={i} style={{
  minWidth:'100%',
  background:seedGrad(post.title,i*7),
  display:'flex',
  flexDirection:'column',
  alignItems:'center',
  justifyContent:'center',
  gap:8,
  position:'relative'
}}>
  {url
    ? <img
        src={url}
        alt=""
        style={{
          width:'100%',
          height:'auto',
          maxHeight:'none',
          objectFit:'contain',
          display:'block',
          borderRadius:14
        }}
      />
    : <div style={{
        width:'100%',
        minHeight:240,
        display:'flex',
        alignItems:'center',
        justifyContent:'center'
      }}>
        <span style={{fontSize:52}}>{img.emoji || '📸'}</span>
      </div>}
</div>
                    );
                  })}
                </div>
                {total>1&&<button onClick={()=>setIdx((idx-1+total)%total)} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,.88)',border:'none',borderRadius:'50%',width:34,height:34,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>}
                {total>1&&<button onClick={()=>setIdx((idx+1)%total)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,.88)',border:'none',borderRadius:'50%',width:34,height:34,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>}
              </div>
              {total>1&&<div style={{display:'flex',gap:6,justifyContent:'center',marginBottom:16}}>
                {imgs.map((_,i)=><button key={i} onClick={()=>setIdx(i)} style={{width:8,height:8,borderRadius:'50%',border:'none',cursor:'pointer',padding:0,background:i===idx?'var(--pink-500)':'var(--pink-300)'}}/>)}
              </div>}
            </>
          )}
          {post.highlights&&post.highlights.length>0&&(
            <div style={{background:'rgba(255,255,255,.75)',border:'1.5px solid var(--pink-200)',borderRadius:12,padding:'12px 16px',marginBottom:20}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:13,color:'var(--pink-500)',marginBottom:8}}>Highlights</div>
              <ul style={{listStyle:'none'}}>
                {post.highlights.map((h,i)=><li key={i} style={{fontSize:14,color:'var(--gray-600)',padding:'2px 0'}}><span style={{color:'var(--gold)'}}>★ </span>{h}</li>)}
              </ul>
            </div>
          )}
          <div style={{fontSize:15.5,lineHeight:1.85,color:'var(--gray-900)'}} dangerouslySetInnerHTML={{__html:post.body}}/>
        </div>
      </div>
    );
  }

  // ── PHOTOS VIEW ───────────────────────────────────────────────────────────────
  function PhotosView({ photos, allTags, isAdmin, onAdd, onEdit, onDelete }) {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const easterEgg = useMemo(() => {
      const q = search.trim().toLowerCase();
      return EASTER_EGGS[q] || null;
    }, [search]);
    const filtered = useMemo(() => {
      let p = filter==='All' ? photos : photos.filter(x=>x.tags.includes(filter));
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!EASTER_EGGS[q]) p = p.filter(x=>x.caption.toLowerCase().includes(q)||x.location.toLowerCase().includes(q)||x.tags.some(t=>t.toLowerCase().includes(q)));
        else p = [];
      }
      return p;
    }, [photos, filter, search]);
    return (
      <div className="scroll-view">
        <div className="view-hd">
          <div className="view-title">Photos 📷</div>
          {isAdmin && <FAB label="Add Photo" onClick={onAdd}/>}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search photos, locations, tags…"/>
        <FilterRow allTags={allTags} active={filter} onChange={setFilter}/>
        <div className="masonry-board">
          {easterEgg && (
            <div className="masonry-item" style={{breakInside:'avoid'}}>
              <div style={{borderRadius:14,overflow:'hidden',boxShadow:'0 4px 20px rgba(200,100,120,.2)'}}>
                <img src={easterEgg.src} alt={easterEgg.caption} style={{width:'100%',display:'block',borderRadius:14}}/>
              </div>
              <div style={{fontFamily:'var(--font-body)',fontSize:13,color:'var(--gray-900)',marginTop:7,lineHeight:1.4}}>{easterEgg.caption}</div>
              <div style={{fontSize:11,color:'var(--gray-600)',marginTop:2}}>📍 {easterEgg.location}</div>
            </div>
          )}
          {!easterEgg && !filtered.length && (
            <div style={{fontFamily:'var(--font-display)',color:'var(--pink-400)',padding:'20px 0',fontSize:15}}>No photos found!</div>
          )}
          {filtered.map(ph=>(
            <div key={ph.id} className="masonry-item">
              <div style={{borderRadius:14,overflow:'hidden'}}>
                {ph.imgUrl
                  ? <img
  src={ph.imgUrl}
  alt={ph.caption}
  style={{
    width:'100%',
    height:'auto',
    display:'block',
    borderRadius:14,
    objectFit:'contain'
  }}
/>
                  : <div style={{height:ph.height,background:seedGrad(ph.caption),borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:34,transition:'transform .2s'}}
                      className="masonry-ph-inner">📸</div>
                }
              </div>
              <div style={{fontFamily:'var(--font-body)',fontSize:13,color:'var(--gray-900)',marginTop:7,lineHeight:1.4}}>{ph.caption}</div>
              <div style={{fontSize:11,color:'var(--gray-600)',marginTop:2}}>📍 {ph.location}</div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:5}}>{ph.tags.map(t=><Pill key={t} tag={t}/>)}</div>
              {isAdmin && (
                <div style={{display:'flex',gap:5,marginTop:8}}>
                  <AdminBtn label="✏️ Edit" onClick={()=>onEdit(ph)}/>
                  <AdminBtn label="🗑️ Delete" onClick={()=>onDelete(ph)} danger/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── FOOD VIEW ─────────────────────────────────────────────────────────────────
  function FoodView({ food, allTags, isAdmin, onAdd, onEdit, onDelete }) {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const filtered = useMemo(() => {
      let f = filter==='All' ? food : food.filter(x=>x.tags.includes(filter));
      if (search.trim()) { const q=search.toLowerCase(); f=f.filter(x=>x.name.toLowerCase().includes(q)||x.location.toLowerCase().includes(q)||(x.restaurant&&x.restaurant.toLowerCase().includes(q))||x.tags.some(t=>t.toLowerCase().includes(q))); }
      return f;
    }, [food, filter, search]);
    return (
      <div className="scroll-view">
        <div className="view-hd">
          <div className="view-title">Food Diary 🍽️</div>
          {isAdmin && <FAB label="Add Food" onClick={onAdd}/>}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search dishes, restaurants, locations…"/>
        <FilterRow allTags={allTags} active={filter} onChange={setFilter}/>
        <div className="masonry-board">
          {!filtered.length && <div style={{fontFamily:'var(--font-display)',color:'var(--pink-400)',padding:'20px 0',fontSize:15}}>No food entries found!</div>}
          {filtered.map(f=>(
            <div key={f.id} className="masonry-item">
              <div style={{borderRadius:14,overflow:'hidden'}}>
                {f.imgUrl
                  ? <img
  src={f.imgUrl}
  alt={f.name}
  style={{
    width:'100%',
    height:'auto',
    display:'block',
    borderRadius:14,
    objectFit:'contain'
  }}
/>
                  : <div style={{height:f.height,background:seedGrad(f.name),borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:34}}>🍽️</div>
                }
              </div>
              <div style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:14,color:'var(--gray-900)',marginTop:7}}>{f.name}</div>
              {f.restaurant&&<div style={{fontSize:12,color:'var(--pink-500)',fontFamily:'var(--font-display)'}}>{f.restaurant}</div>}
              <div style={{fontSize:11,color:'var(--gray-600)',marginTop:2}}>📍 {f.location}</div>
              <div style={{color:'var(--gold)',fontSize:14,marginTop:3}}>{'★'.repeat(f.stars)}<span style={{color:'var(--pink-200)'}}>{'★'.repeat(5-f.stars)}</span></div>
              {f.description&&<div style={{fontSize:12,color:'var(--gray-600)',marginTop:4,lineHeight:1.4}}>{f.description}</div>}
              <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:5}}>{f.tags.map(t=><Pill key={t} tag={t}/>)}</div>
              {isAdmin && (
                <div style={{display:'flex',gap:5,marginTop:8}}>
                  <AdminBtn label="✏️ Edit" onClick={()=>onEdit(f)}/>
                  <AdminBtn label="🗑️ Delete" onClick={()=>onDelete(f)} danger/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── PASSPORT VIEW ─────────────────────────────────────────────────────────────
  function PassportView({ posts }) {
    const visited = useMemo(() => {
      const countries = {};
      posts.forEach(p => {
        const c = getCountry(p.location);
        if (!c) return;
        if (!countries[c]) countries[c] = { country:c, location:p.location, date:p.date, count:0 };
        countries[c].count++;
        // keep earliest date
        if (p.date < countries[c].date) countries[c].date = p.date;
      });
      return Object.values(countries);
    }, [posts]);

    return (
      <div className="scroll-view">
        <div className="view-hd" style={{marginBottom:4}}>
          <div className="view-title">My Passport 🛂</div>
        </div>
        <p style={{fontFamily:'var(--font-display)',fontSize:13,color:'var(--pink-400)',marginBottom:24}}>
          {visited.length} {visited.length===1?'country':'countries'} visited · Each stamp represents a blog post location
        </p>
        {/* Passport Cover */}
        <div style={{background:'linear-gradient(135deg,#8b1a4a,#c03060)',borderRadius:18,padding:'28px 32px',marginBottom:32,maxWidth:420,
          boxShadow:'0 8px 32px rgba(180,40,80,.3)',display:'flex',alignItems:'center',gap:20}}>
          <img src="uploads/0104c956-8b5c-4584-a6e9-bd17beed59ae-d48a0b67.png"
            style={{width:70,height:70,objectFit:'contain',filter:'brightness(0) invert(1)',opacity:.9}} alt="passport"/>
          <div>
            <div style={{fontFamily:'var(--font-display)',fontSize:11,color:'rgba(255,255,255,.6)',letterSpacing:'.15em',marginBottom:4}}>TRAVEL DOCUMENT</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:22,color:'white',lineHeight:1.2}}>Anamika Abroad</div>
            <div style={{fontFamily:'var(--font-body)',fontSize:12,color:'rgba(255,255,255,.7)',marginTop:4}}>Passport of Adventures</div>
          </div>
        </div>

        {/* Stamps grid */}
        {visited.length === 0 && (
          <div style={{fontFamily:'var(--font-display)',color:'var(--pink-400)',fontSize:15,padding:'20px 0'}}>
            Start writing blog posts to collect passport stamps! ✈️
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:22}}>
          {visited.map(({country,location,date,count})=>(
            <div key={country} style={{background:'rgba(255,255,255,.92)',border:'2px solid var(--pink-200)',borderRadius:16,
              padding:'16px',textAlign:'center',boxShadow:'0 2px 12px rgba(200,100,120,.10)',
              transition:'transform .2s,box-shadow .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(200,100,120,.2)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 12px rgba(200,100,120,.10)';}}>
              <div style={{height:140,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,position:'relative'}}>
                {COUNTRY_STAMPS[country]
                  ? <img src={COUNTRY_STAMPS[country]} alt={country}
                      style={{maxWidth:'100%',maxHeight:140,objectFit:'contain',borderRadius:8,
                        filter:'saturate(1.05) contrast(1.02)',
                        transform:`rotate(${((country.charCodeAt(0)*7)%14)-7}deg)`,
                        boxShadow:'2px 2px 8px rgba(0,0,0,0.12)'}}/>
                  : <SvgStamp country={country} flag={COUNTRY_FLAGS[country]||'🌍'}/>
                }
              </div>
              <div style={{fontFamily:'var(--font-display)',fontSize:14,color:'var(--pink-600)',fontWeight:'bold'}}>{country}</div>
              <div style={{fontSize:11,color:'var(--gray-600)',marginTop:2}}>{location.split(', ')[0]}</div>
              <div style={{fontSize:10,color:'var(--gray-400)',marginTop:2}}>{count} post{count>1?'s':''}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function SvgStamp({ country, flag }) {
    const col = getStampColor(country);
    const sz = 120;
    const r = sz/2-4;
    return (
      <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{transform:`rotate(${((country.charCodeAt(0)*7)%14)-7}deg)`}}>
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={col} strokeWidth="3" strokeDasharray="4 3"/>
        <circle cx={sz/2} cy={sz/2} r={r-8} fill="none" stroke={col} strokeWidth="1.5"/>
        <text x={sz/2} y={sz/2-2} textAnchor="middle" dominantBaseline="middle" fontSize="28">{flag}</text>
        <path id={`arc-${country}`} d={`M ${sz/2-r+16},${sz/2} A ${r-16},${r-16} 0 1 1 ${sz/2+r-16},${sz/2}`} fill="none"/>
        <text fontSize="8" fill={col} letterSpacing="2" fontFamily="'Lato',sans-serif" fontWeight="bold">
          <textPath href={`#arc-${country}`} startOffset="12%">{country.toUpperCase()}</textPath>
        </text>
      </svg>
    );
  }

  // ── MAIN APP ──────────────────────────────────────────────────────────────────
  function App() {
    const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

    const [posts, setPosts] = useState(INIT_POSTS);
    const [photos, setPhotos] = useState(INIT_PHOTOS);
    const [food, setFood] = useState(INIT_FOOD);
    const [isAdmin, setIsAdmin] = useState(false); // never persisted — always starts logged out

    useEffect(() => {
      if (!window.AA_DB?.isConfigured) {
        console.warn('Supabase is not configured yet. Add your URL and anon key in supabase-client.js.');
        return;
      }

      let alive = true;

      async function loadData() {
        const [dbPosts, dbPhotos, dbFood] = await Promise.all([
          window.AA_DB.getAll('posts'),
          window.AA_DB.getAll('photos'),
          window.AA_DB.getAll('food')
        ]);

        if (!alive) return;
        setPosts(dbPosts);
        setPhotos(dbPhotos);
        setFood(dbFood);
        setSelectedPost(dbPosts[0] || null);
      }

      loadData();
      const unsubscribe = window.AA_DB.subscribeToChanges(() => loadData());

      return () => {
        alive = false;
        if (unsubscribe) unsubscribe();
      };
    }, []);

    // Tags derived exclusively from content — no pre-made tags
    const allContentTags = useMemo(() =>
      [...new Set([...posts.flatMap(p=>p.tags), ...photos.flatMap(p=>p.tags), ...food.flatMap(f=>f.tags)])].sort()
    , [posts, photos, food]);
    const blogFilterTags  = useMemo(() => [...new Set(posts.flatMap(p=>p.tags))].sort(),  [posts]);
    const photoFilterTags = useMemo(() => [...new Set(photos.flatMap(p=>p.tags))].sort(), [photos]);
    const foodFilterTags  = useMemo(() => [...new Set(food.flatMap(f=>f.tags))].sort(),   [food]);
    const [view, setView] = useState('home');
    const [selectedPost, setSelectedPost] = useState(posts[0]||null);
    const [detailPost, setDetailPost] = useState(null);
    const [fromView, setFromView] = useState('home');
    const [modal, setModal] = useState(null); // 'auth','blog','photo','food','editBlog','editPhoto','editFood','delete'
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteType, setDeleteType] = useState(null);

    const addTag = useCallback(t => {}, []); // tags are derived from content, no global state needed

    const navSetView = v => {
      setView(v);
      if (v !== 'detail') setDetailPost(null);
    };

    const openDetail = (post, from) => { setDetailPost(post); setFromView(from||view); setView('detail'); };
    const goBack = () => { setView(fromView); setDetailPost(null); };

    // ── BLOG CRUD ────────────────────────────────────────────────────────────
    const saveBlog = useCallback(async data => {
      if (!window.AA_DB?.isConfigured) {
        alert('Supabase is not configured yet. Add your URL and anon key in supabase-client.js.');
        return;
      }

      const saved = await window.AA_DB.saveRow('posts', data);

      if (data.id) setPosts(prev => prev.map(p => p.id===saved.id ? saved : p));
      else setPosts(prev => [saved, ...prev]);

      data.tags.forEach(addTag);
      setModal(null); setEditTarget(null);
      // Update detail if editing
      if (data.id && detailPost && detailPost.id===data.id) setDetailPost(saved);
    }, [addTag, detailPost]);

    // ── PHOTO CRUD ───────────────────────────────────────────────────────────
    const savePhoto = useCallback(async data => {
      if (!window.AA_DB?.isConfigured) {
        alert('Supabase is not configured yet. Add your URL and anon key in supabase-client.js.');
        return;
      }

      const saved = await window.AA_DB.saveRow('photos', data);

      if (data.id) setPhotos(prev => prev.map(p => p.id===saved.id ? saved : p));
      else setPhotos(prev => [saved, ...prev]);

      data.tags.forEach(addTag);
      setModal(null); setEditTarget(null);
    }, [addTag]);

    // ── FOOD CRUD ────────────────────────────────────────────────────────────
    const saveFood = useCallback(async data => {
      if (!window.AA_DB?.isConfigured) {
        alert('Supabase is not configured yet. Add your URL and anon key in supabase-client.js.');
        return;
      }

      const saved = await window.AA_DB.saveRow('food', data);

      if (data.id) setFood(prev => prev.map(f => f.id===saved.id ? saved : f));
      else setFood(prev => [saved, ...prev]);

      data.tags.forEach(addTag);
      setModal(null); setEditTarget(null);
    }, [addTag]);

    // ── DELETE ───────────────────────────────────────────────────────────────
    const confirmDelete = async () => {
      if (!window.AA_DB?.isConfigured) {
        alert('Supabase is not configured yet. Add your URL and anon key in supabase-client.js.');
        return;
      }

      if (deleteType==='blog') {
        await window.AA_DB.deleteRow('posts', deleteTarget.id);
        setPosts(prev => prev.filter(p=>p.id!==deleteTarget.id));
        if (detailPost&&detailPost.id===deleteTarget.id) goBack();
      } else if (deleteType==='photo') {
        await window.AA_DB.deleteRow('photos', deleteTarget.id);
        setPhotos(prev=>prev.filter(p=>p.id!==deleteTarget.id));
      } else if (deleteType==='food') {
        await window.AA_DB.deleteRow('food', deleteTarget.id);
        setFood(prev=>prev.filter(f=>f.id!==deleteTarget.id));
      }
      setModal(null); setDeleteTarget(null); setDeleteType(null);
    };

    const triggerDelete = (item, type) => { setDeleteTarget(item); setDeleteType(type); setModal('delete'); };
    const triggerEdit = (item, type) => { setEditTarget(item); setModal(type==='blog'?'editBlog':type==='photo'?'editPhoto':'editFood'); };

    const displayView = view==='detail' ? fromView : view;

    return (
      <div style={{height:'100vh',background:tweaks.bgColor,fontFamily:'var(--font-body)',overflow:'hidden',position:'relative'}}>
        <BgDecorations opacity={tweaks.decoOpacity}/>
        <Navbar view={displayView} setView={navSetView} isAdmin={isAdmin}
          navColor={tweaks.navColor}
          onLoginClick={()=>setModal('auth')} onLogout={()=>setIsAdmin(false)}/>
        <div style={{paddingTop:62,height:'100%',boxSizing:'border-box'}}>
          {/* HOME - keep mounted so globe persists */}
          <div style={{display:view==='home'?'block':'none',height:'100%'}}>
            <HomeView posts={posts} selectedPost={selectedPost}
              onPinClick={p=>{setSelectedPost(p);}}
              onReadMore={p=>openDetail(p,'home')}/>
          </div>
          {view==='blog' && <BlogView posts={posts} allTags={blogFilterTags} isAdmin={isAdmin}
            onRead={p=>openDetail(p,'blog')} onAdd={()=>setModal('blog')}
            onEdit={p=>triggerEdit(p,'blog')} onDelete={p=>triggerDelete(p,'blog')}/>}
          {view==='detail' && <PostDetail post={detailPost} isAdmin={isAdmin} onBack={goBack}
            onEdit={p=>triggerEdit(p,'blog')} onDelete={p=>triggerDelete(p,'blog')}/>}
          {view==='photos' && <PhotosView photos={photos} allTags={photoFilterTags} isAdmin={isAdmin}
            onAdd={()=>setModal('photo')} onEdit={p=>triggerEdit(p,'photo')} onDelete={p=>triggerDelete(p,'photo')}/>}
          {view==='food' && <FoodView food={food} allTags={foodFilterTags} isAdmin={isAdmin}
            onAdd={()=>setModal('food')} onEdit={f=>triggerEdit(f,'food')} onDelete={f=>triggerDelete(f,'food')}/>}
          {view==='passport' && <PassportView posts={posts}/>}
        </div>

        {/* MODALS */}
        {modal==='auth' && <AuthModal onAuth={()=>setIsAdmin(true)} onClose={()=>setModal(null)}/>}
        {modal==='blog' && <BlogModal allTags={allContentTags} onSave={saveBlog} onAddTag={addTag} onClose={()=>setModal(null)}/>}
        {modal==='editBlog' && <BlogModal initial={editTarget} allTags={allContentTags} onSave={saveBlog} onAddTag={addTag} onClose={()=>{setModal(null);setEditTarget(null);}}/>}
        {modal==='photo' && <PhotoModal allTags={allContentTags} onSave={savePhoto} onAddTag={addTag} onClose={()=>setModal(null)}/>}
        {modal==='editPhoto' && <PhotoModal initial={editTarget} allTags={allContentTags} onSave={savePhoto} onAddTag={addTag} onClose={()=>{setModal(null);setEditTarget(null);}}/>}
        {modal==='food' && <FoodModal allTags={allContentTags} onSave={saveFood} onAddTag={addTag} onClose={()=>setModal(null)}/>}
        {modal==='editFood' && <FoodModal initial={editTarget} allTags={allContentTags} onSave={saveFood} onAddTag={addTag} onClose={()=>{setModal(null);setEditTarget(null);}}/>}
        {modal==='delete' && <ConfirmModal message={`Delete "${deleteTarget?.title||deleteTarget?.name||deleteTarget?.caption}"? This cannot be undone.`} onConfirm={confirmDelete} onClose={()=>{setModal(null);setDeleteTarget(null);setDeleteType(null);}}/>}

        <TweaksPanel>
          <TweakSection label="Background"/>
          <TweakSlider label="Decoration opacity" min={0} max={0.35} step={0.01}
            value={tweaks.decoOpacity}
            onChange={v => setTweak('decoOpacity', v)}/>
          <TweakColor label="Background colour"
            value={tweaks.bgColor}
            onChange={v => setTweak('bgColor', v)}/>
          <TweakSection label="Navigation"/>
          <TweakColor label="Nav bar colour"
            value={tweaks.navColor}
            onChange={v => setTweak('navColor', v)}/>
        </TweaksPanel>
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
