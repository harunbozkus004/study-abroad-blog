(function () {
  const { useState } = React;

  // ── SHARED FORM BITS ────────────────────────────────────────────────────────
  function TagPicker({ allTags, selected, onToggle, onNewTag }) {
    const [inp, setInp] = useState('');
    const handleKey = e => {
      if ((e.key === 'Enter' || e.key === ',') && inp.trim()) {
        e.preventDefault();
        const t = inp.trim().replace(/,$/, '');
        onNewTag(t);
        if (!selected.includes(t)) onToggle(t);
        setInp('');
      }
    };
    return (
      <div>
        <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:6}}>
          {allTags.map(tag => (
            <button key={tag} type="button"
              onClick={() => onToggle(tag)}
              style={{fontFamily:'var(--font-display)',fontSize:11,borderRadius:9999,
                padding:'3px 10px',cursor:'pointer',border:'1.5px solid',transition:'all .15s',
                background: selected.includes(tag) ? 'var(--pink-500)' : 'var(--pink-100)',
                color: selected.includes(tag) ? 'white' : 'var(--pink-600)',
                borderColor: selected.includes(tag) ? 'var(--pink-500)' : 'var(--pink-300)'}}>
              {tag}
            </button>
          ))}
        </div>
        <input className="form-input" placeholder="+ Type new tag, press Enter"
          value={inp} onChange={e => setInp(e.target.value)} onKeyDown={handleKey}/>
      </div>
    );
  }

  function StarPicker({ value, onChange }) {
    const [hov, setHov] = useState(0);
    return (
      <div style={{display:'flex',alignItems:'center',gap:4}}>
        {[1,2,3,4,5].map(n => (
          <button key={n} type="button"
            onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
            onClick={() => onChange(n)}
            style={{background:'none',border:'none',cursor:'pointer',fontSize:22,
              color: n <= (hov||value) ? 'var(--gold)' : '#ddd', padding:0, lineHeight:1}}>★</button>
        ))}
        <span style={{fontSize:12,color:'var(--gray-600)',marginLeft:4}}>{value}/5</span>
      </div>
    );
  }

  function LocSelect({ value, customC, onChange, onCustomC }) {
    const isCustom = value === 'Custom location…';
    return (
      <div>
        <select className="form-select" value={value}
          onChange={e => {
            const loc = KNOWN_LOCATIONS.find(l => l.name === e.target.value);
            onChange(e.target.value, loc ? loc.coords : null);
          }}>
          {KNOWN_LOCATIONS.map(l => <option key={l.name} value={l.name}>{l.emoji} {l.name}</option>)}
        </select>
        {isCustom && (
          <div style={{display:'flex',gap:8,marginTop:7}}>
            <input className="form-input" type="number" step=".0001" placeholder="Latitude"
              value={customC.lat} onChange={e => onCustomC({...customC, lat:e.target.value})}/>
            <input className="form-input" type="number" step=".0001" placeholder="Longitude"
              value={customC.lng} onChange={e => onCustomC({...customC, lng:e.target.value})}/>
          </div>
        )}
      </div>
    );
  }

  function ModalShell({ title, emoji, onClose, onSubmit, children }) {
    return (
      <div className="modal-overlay" onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
        <div className="modal-card">
          <div className="modal-hd">
            <span style={{fontFamily:'var(--font-display)',fontSize:18,color:'var(--pink-600)'}}>{emoji} {title}</span>
            <button className="modal-x" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-ft">
            <button className="btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn-pri" onClick={onSubmit}>Save ✈️</button>
          </div>
        </div>
      </div>
    );
  }

  // ── AUTH MODAL ───────────────────────────────────────────────────────────────
  function AuthModal({ onAuth, onClose }) {
    const [pw, setPw] = useState('');
    const [err, setErr] = useState(false);
    const tryLogin = () => {
      if (pw === AUTH_PASSWORD || pw.toLowerCase() === AUTH_PASSWORD.toLowerCase()) { onAuth(); onClose(); }
      else { setErr(true); setTimeout(() => setErr(false), 1200); }
    };
    return (
      <div className="modal-overlay" onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
        <div className="modal-card" style={{maxWidth:360}}>
          <div className="modal-hd">
            <span style={{fontFamily:'var(--font-display)',fontSize:18,color:'var(--pink-600)'}}>✈️ Blogger Login</span>
            <button className="modal-x" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <p style={{fontFamily:'var(--font-display)',fontSize:13,color:'var(--gray-600)',marginBottom:14}}>
              Enter the secret word to unlock editing mode, Anamika!
            </p>
            <input className="form-input" type="password" placeholder="Password…"
              value={pw} onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key==='Enter' && tryLogin()}
              style={{borderColor: err ? '#e84070' : undefined}}/>
            {err && <div style={{color:'#e84070',fontFamily:'var(--font-display)',fontSize:12,marginTop:5}}>Nope! Try again 😅</div>}
          </div>
          <div className="modal-ft">
            <button className="btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn-pri" onClick={tryLogin}>Enter 🗝️</button>
          </div>
        </div>
      </div>
    );
  }

  // ── BLOG MODALS ──────────────────────────────────────────────────────────────
  function BlogModal({ initial, allTags, onSave, onAddTag, onClose }) {
    const today = new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
    const d = initial || {};
    const [title, setTitle] = useState(d.title||'');
    const [locName, setLocName] = useState(d.location||'Oxford, UK');
    const [locCoords, setLocCoords] = useState(d.coords||[-1.2577,51.752]);
    const [customC, setCustomC] = useState({lat:'',lng:''});
    const [date, setDate] = useState(d.date||today);
    const [tags, setTags] = useState(d.tags||[]);
    const [hl, setHl] = useState(d.highlights||['','','']);
    const [body, setBody] = useState(d.body ? d.body.replace(/<p>/g,'').replace(/<\/p>/g,'\n\n').replace(/<br>/g,'\n').trim() : '');
    const toggle = t => setTags(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t]);
    const changeLoc = (name, coords) => { setLocName(name); if (coords) setLocCoords(coords); };
    const submit = () => {
      if (!title.trim()) return;
      const coords = locName==='Custom location…' && customC.lat && customC.lng
        ? [parseFloat(customC.lng), parseFloat(customC.lat)] : locCoords;
      onSave({...(d), title:title.trim(), location:locName, coords, date, tags,
        highlights:hl.filter(h=>h.trim()),
        body:'<p>'+body.trim().replace(/\n\n+/g,'</p><p>').replace(/\n/g,'<br>')+'</p>',
        images: d.images||[]});
    };
    return (
      <ModalShell title={initial ? 'Edit Post' : 'New Blog Post'} emoji="✈️" onClose={onClose} onSubmit={submit}>
        <div className="form-field"><label className="form-label">Title *</label>
          <input className="form-input" placeholder="e.g. Week 2 Oxford" value={title} onChange={e=>setTitle(e.target.value)}/></div>
        <div className="form-field"><label className="form-label">Location</label>
          <LocSelect value={locName} customC={customC} onChange={changeLoc} onCustomC={setCustomC}/></div>
        <div className="form-field"><label className="form-label">Date</label>
          <input className="form-input" value={date} onChange={e=>setDate(e.target.value)}/></div>
        <div className="form-field"><label className="form-label">Highlights (up to 3)</label>
          {hl.map((h,i) => (
            <input key={i} className="form-input" style={{marginBottom:5}} placeholder={`★ Highlight ${i+1}`}
              value={h} onChange={e=>setHl(p=>p.map((x,j)=>j===i?e.target.value:x))}/>
          ))}
        </div>
        <div className="form-field"><label className="form-label">Story</label>
          <textarea className="form-textarea" rows={5} placeholder="Write your adventure here!!" value={body} onChange={e=>setBody(e.target.value)}/></div>
        <div className="form-field"><label className="form-label">Tags</label>
          <TagPicker allTags={allTags} selected={tags} onToggle={toggle} onNewTag={onAddTag}/></div>
      </ModalShell>
    );
  }

  // ── PHOTO MODALS ─────────────────────────────────────────────────────────────
  function PhotoModal({ initial, allTags, onSave, onAddTag, onClose }) {
    const d = initial || {};
    const [caption, setCaption] = useState(d.caption||'');
    const [locName, setLocName] = useState(d.location||'Oxford, UK');
    const [locCoords, setLocCoords] = useState([-1.2577,51.752]);
    const [customC, setCustomC] = useState({lat:'',lng:''});
    const [tags, setTags] = useState(d.tags||[]);
    const [imgUrl, setImgUrl] = useState(d.imgUrl||'');
    const [preview, setPreview] = useState(d.imgUrl||'');
    const [selectedFile, setSelectedFile] = useState(null);
    const toggle = t => setTags(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t]);
    const changeLoc = (name,coords) => { setLocName(name); if(coords) setLocCoords(coords); };
    const handleFile = e => {
      const file = e.target.files[0];
      if (!file) return;
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    };
    const submit = async () => {
      if (!caption.trim()) return;
      let finalImgUrl = imgUrl;
      if (selectedFile) finalImgUrl = await window.AA_DB.uploadImage(selectedFile);
      onSave({...d, caption:caption.trim(), location:locName, tags, imgUrl: finalImgUrl,
        height: d.height || (160 + Math.floor(Math.random()*140))});
    };
    return (
      <ModalShell title={initial ? 'Edit Photo' : 'Add Photo'} emoji="📷" onClose={onClose} onSubmit={submit}>
        <div className="form-field"><label className="form-label">Caption *</label>
          <input className="form-input" placeholder="e.g. Sunset at the Bodleian Library" value={caption} onChange={e=>setCaption(e.target.value)}/></div>
        <div className="form-field"><label className="form-label">Location</label>
          <LocSelect value={locName} customC={customC} onChange={changeLoc} onCustomC={setCustomC}/></div>
        <div className="form-field">
          <label className="form-label">Photo</label>
          <label style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,
            border:'2px dashed var(--pink-300)',borderRadius:12,padding:'18px 12px',cursor:'pointer',
            background:'var(--pink-50)',transition:'background .15s'}}
            onMouseEnter={e=>e.currentTarget.style.background='var(--pink-100)'}
            onMouseLeave={e=>e.currentTarget.style.background='var(--pink-50)'}>
            {preview
              ? <img src={preview} style={{maxHeight:120,maxWidth:'100%',borderRadius:8,objectFit:'cover'}} alt="preview"/>
              : <><span style={{fontSize:28}}>📸</span><span style={{fontFamily:'var(--font-display)',fontSize:12,color:'var(--pink-400)'}}>Click to upload from your device</span></>}
            <input type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
          </label>
          {preview && <button type="button" onClick={()=>{setImgUrl('');setPreview('');setSelectedFile(null);}}
            style={{fontFamily:'var(--font-display)',fontSize:11,color:'var(--pink-500)',background:'none',border:'none',cursor:'pointer',marginTop:4}}>✕ Remove photo</button>}
        </div>
        <div className="form-field"><label className="form-label">Tags</label>
          <TagPicker allTags={allTags} selected={tags} onToggle={toggle} onNewTag={onAddTag}/></div>
      </ModalShell>
    );
  }

  // ── FOOD MODALS ──────────────────────────────────────────────────────────────
  function FoodModal({ initial, allTags, onSave, onAddTag, onClose }) {
    const d = initial || {};
    const [name, setName] = useState(d.name||'');
    const [rest, setRest] = useState(d.restaurant||'');
    const [locName, setLocName] = useState(d.location||'Oxford, UK');
    const [locCoords, setLocCoords] = useState([-1.2577,51.752]);
    const [customC, setCustomC] = useState({lat:'',lng:''});
    const [stars, setStars] = useState(d.stars||5);
    const [desc, setDesc] = useState(d.description||'');
    const [tags, setTags] = useState(d.tags||[]);
    const [imgUrl, setImgUrl] = useState(d.imgUrl||'');
    const [preview, setPreview] = useState(d.imgUrl||'');
    const [selectedFile, setSelectedFile] = useState(null);
    const toggle = t => setTags(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t]);
    const changeLoc = (name,coords) => { setLocName(name); if(coords) setLocCoords(coords); };
    const handleFile = e => {
      const file = e.target.files[0];
      if (!file) return;
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    };
    const submit = async () => {
      if (!name.trim()) return;
      let finalImgUrl = imgUrl;
      if (selectedFile) finalImgUrl = await window.AA_DB.uploadImage(selectedFile);
      onSave({...d, name:name.trim(), restaurant:rest.trim(), location:locName,
        stars, description:desc.trim(), tags, imgUrl: finalImgUrl,
        height: d.height || (160 + Math.floor(Math.random()*140))});
    };
    return (
      <ModalShell title={initial ? 'Edit Food Entry' : 'Add Food Entry'} emoji="🍽️" onClose={onClose} onSubmit={submit}>
        <div className="form-field"><label className="form-label">Dish / Food *</label>
          <input className="form-input" placeholder="e.g. Cream tea" value={name} onChange={e=>setName(e.target.value)}/></div>
        <div className="form-field"><label className="form-label">Restaurant / Place</label>
          <input className="form-input" placeholder="e.g. Turl St Kitchen" value={rest} onChange={e=>setRest(e.target.value)}/></div>
        <div className="form-field"><label className="form-label">Location</label>
          <LocSelect value={locName} customC={customC} onChange={changeLoc} onCustomC={setCustomC}/></div>
        <div className="form-field"><label className="form-label">Rating</label>
          <StarPicker value={stars} onChange={setStars}/></div>
        <div className="form-field">
          <label className="form-label">Photo</label>
          <label style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,
            border:'2px dashed var(--pink-300)',borderRadius:12,padding:'18px 12px',cursor:'pointer',
            background:'var(--pink-50)',transition:'background .15s'}}
            onMouseEnter={e=>e.currentTarget.style.background='var(--pink-100)'}
            onMouseLeave={e=>e.currentTarget.style.background='var(--pink-50)'}>
            {preview
              ? <img src={preview} style={{maxHeight:120,maxWidth:'100%',borderRadius:8,objectFit:'cover'}} alt="preview"/>
              : <><span style={{fontSize:28}}>🍽️</span><span style={{fontFamily:'var(--font-display)',fontSize:12,color:'var(--pink-400)'}}>Click to upload from your device</span></>}
            <input type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
          </label>
          {preview && <button type="button" onClick={()=>{setImgUrl('');setPreview('');setSelectedFile(null);}}
            style={{fontFamily:'var(--font-display)',fontSize:11,color:'var(--pink-500)',background:'none',border:'none',cursor:'pointer',marginTop:4}}>✕ Remove photo</button>}
        </div>
        <div className="form-field"><label className="form-label">Notes</label>
          <textarea className="form-textarea" rows={3} placeholder="What made it so good??" value={desc} onChange={e=>setDesc(e.target.value)}/></div>
        <div className="form-field"><label className="form-label">Tags</label>
          <TagPicker allTags={allTags} selected={tags} onToggle={toggle} onNewTag={onAddTag}/></div>
      </ModalShell>
    );
  }

  // ── CONFIRM DELETE ────────────────────────────────────────────────────────────
  function ConfirmModal({ message, onConfirm, onClose }) {
    return (
      <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
        <div className="modal-card" style={{maxWidth:340}}>
          <div className="modal-hd">
            <span style={{fontFamily:'var(--font-display)',fontSize:16,color:'var(--pink-600)'}}>🗑️ Delete?</span>
            <button className="modal-x" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <p style={{fontFamily:'var(--font-body)',fontSize:14,color:'var(--gray-900)'}}>{message}</p>
          </div>
          <div className="modal-ft">
            <button className="btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn-pri" style={{background:'#c03060'}} onClick={onConfirm}>Delete</button>
          </div>
        </div>
      </div>
    );
  }

  Object.assign(window, { BlogModal, PhotoModal, FoodModal, AuthModal, ConfirmModal });
})();
