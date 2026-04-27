(function () {
  const { useEffect, useRef, useState } = React;

  function GlobeView({ posts, selectedPostId, onPinClick }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const stateRef = useRef({ rot:[15,-25], scale:1, drag:false, last:null, hov:null, world:null, spin:true, raf:null, turkeyRaf:null });
    const postsRef = useRef(posts);
    const selRef = useRef(selectedPostId);
    const clickRef = useRef(onPinClick);
    const drawRef = useRef(null);
    const [tip, setTip] = useState({ show:false, x:0, y:0, text:'' });

    useEffect(() => { postsRef.current = posts; drawRef.current && drawRef.current(); }, [posts]);
    useEffect(() => { selRef.current = selectedPostId; drawRef.current && drawRef.current(); }, [selectedPostId]);
    useEffect(() => { clickRef.current = onPinClick; }, [onPinClick]);

    useEffect(() => {
      const canvas = canvasRef.current;
      const ct = containerRef.current;
      const ctx = canvas.getContext('2d');
      const st = stateRef.current;

      const resize = () => {
        const sz = Math.min(ct.clientWidth - 8, ct.clientHeight - 80, 700);
        canvas.width = canvas.height = Math.max(sz, 220);
        draw();
      };

      const proj = () => d3.geoOrthographic()
        .scale((canvas.width / 2 - 4) * st.scale)
        .translate([canvas.width / 2, canvas.width / 2])
        .rotate(st.rot)
        .clipAngle(90);

      const vis = (c) => d3.geoDistance(c, [-st.rot[0], -st.rot[1]]) < Math.PI / 2;

      const draw = () => {
        const w = canvas.width;
        if (!w) return;
        const p = proj();
        const path = d3.geoPath(p, ctx);
        ctx.clearRect(0, 0, w, w);

        // Ocean
        const og = ctx.createRadialGradient(w*.42, w*.42, 0, w/2, w/2, w/2);
        og.addColorStop(0, '#fff0f3'); og.addColorStop(1, '#f8c8d5');
        ctx.beginPath(); path({type:'Sphere'});
        ctx.fillStyle = og; ctx.fill();
        ctx.beginPath(); path({type:'Sphere'});
        ctx.strokeStyle = '#e87898'; ctx.lineWidth = Math.max(1.5, w*.003); ctx.stroke();

        // Graticule
        ctx.beginPath(); path(d3.geoGraticule()());
        ctx.strokeStyle = 'rgba(232,120,152,0.09)'; ctx.lineWidth = .6; ctx.stroke();

        if (st.world) {
          const land = topojson.feature(st.world, st.world.objects.countries);
          ctx.beginPath(); path(land);
          ctx.fillStyle = 'rgba(217,88,120,0.16)'; ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = .7; ctx.stroke();
          const borders = topojson.mesh(st.world, st.world.objects.countries, (a,b) => a!==b);
          ctx.beginPath(); path(borders);
          ctx.strokeStyle = 'rgba(192,48,96,0.18)'; ctx.lineWidth = .4; ctx.stroke();
        }

        // Dedupe pins by location
        const seen = new Set();
        postsRef.current.forEach(post => {
          const key = post.coords.join(',');
          if (seen.has(key)) return;
          seen.add(key);
          if (!vis(post.coords)) return;
          const [px, py] = p(post.coords);
          const pinR = Math.max(7, w * .013);
          const isSel = selRef.current === post.id;
          const isHov = st.hov === key;
          const sc = isSel ? 1.55 : isHov ? 1.25 : 1;
          const ty = -pinR * 2.6;

          ctx.save();
          ctx.translate(px, py);
          ctx.scale(sc, sc);

          // Shadow
          ctx.beginPath(); ctx.ellipse(0, 5, pinR*.65, pinR*.25, 0, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fill();

          // Pin head
          ctx.beginPath(); ctx.arc(0, ty, pinR, 0, Math.PI*2);
          const g = ctx.createRadialGradient(-pinR*.3, ty-pinR*.3, 0, 0, ty, pinR);
          g.addColorStop(0, isSel ? '#e84070' : '#e87898');
          g.addColorStop(1, isSel ? '#c03060' : '#d95878');
          ctx.fillStyle = g; ctx.fill();
          ctx.strokeStyle = 'white'; ctx.lineWidth = 2.5; ctx.stroke();

          // Stem
          ctx.beginPath();
          ctx.moveTo(-pinR*.45, ty+pinR*.9);
          ctx.lineTo(pinR*.45, ty+pinR*.9);
          ctx.lineTo(0, 2); ctx.closePath();
          ctx.fillStyle = isSel ? '#c03060' : '#d95878'; ctx.fill();

          // Inner dot
          ctx.beginPath(); ctx.arc(0, ty, pinR*.42, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fill();

          // Selected ring
          if (isSel) {
            ctx.beginPath(); ctx.arc(0, ty, pinR*1.75, 0, Math.PI*2);
            ctx.strokeStyle = 'rgba(217,88,120,0.35)'; ctx.lineWidth = 2.5; ctx.stroke();
          }

          ctx.restore();
        });
      };

      drawRef.current = draw;

      const pinAt = (ex, ey) => {
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
        const cx = (ex - rect.left) * sx, cy = (ey - rect.top) * sy;
        const p = proj();
        const pinR = Math.max(7, canvas.width * .013) * 1.8;

        const seen = new Set();
        for (const post of postsRef.current) {
          const key = post.coords.join(',');
          if (seen.has(key)) continue;
          seen.add(key);
          if (!vis(post.coords)) continue;
          const [px, py] = p(post.coords);
          if (Math.hypot(cx-px, cy-(py-pinR*2.6)) < pinR*2.5) return post;
        }
        return null;
      };

      const isTurkey = (ex, ey) => {
        try {
          const rect = canvas.getBoundingClientRect();
          const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
          const cx = (ex - rect.left) * sx, cy = (ey - rect.top) * sy;
          const p = proj();
          const inv = p.invert([cx, cy]);
          if (!inv) return false;
          const [lon, lat] = inv;
          // Check visibility + Turkey bounding box
          if (d3.geoDistance(inv, [-st.rot[0], -st.rot[1]]) >= Math.PI/2) return false;
          return lon > 26 && lon < 45 && lat > 35.8 && lat < 42.2;
        } catch { return false; }
      };

      const onDown = e => {
        const pin = pinAt(e.clientX, e.clientY);
        if (pin) {
          clickRef.current(pin);
          st.spin = false;
          e.preventDefault(); return;
        }
        st.drag = true; st.spin = false;
        st.last = [e.clientX, e.clientY];
        e.preventDefault();
      };

      const onMove = e => {
        if (st.drag) {
          const dx = e.clientX - st.last[0], dy = e.clientY - st.last[1];
          st.last = [e.clientX, e.clientY];
          st.rot[0] += dx * .35;
          st.rot[1] = Math.max(-90, Math.min(90, st.rot[1] - dy * .35));
          cancelAnimationFrame(st.raf); st.raf = requestAnimationFrame(draw); return;
        }
        const pin = pinAt(e.clientX, e.clientY);
        const turkey = isTurkey(e.clientX, e.clientY);
        const key = pin ? pin.coords.join(',') : null;
        const prev = st.hov;
        st.hov = key;
        if (turkey) {
          canvas.style.cursor = HEART_CURSOR;
        } else {
          canvas.style.cursor = pin ? 'pointer' : 'grab';
        }
        if (pin) {
          const rect = canvas.getBoundingClientRect();
          setTip({show:true, x:e.clientX-rect.left+14, y:e.clientY-rect.top-38, text:pin.location});
        } else {
          setTip(t => ({...t, show:false}));
        }
        if (st.hov !== prev) { cancelAnimationFrame(st.raf); st.raf = requestAnimationFrame(draw); }
      };

      const onUp = () => { st.drag = false; };
      const onLeave = () => { st.hov = null; setTip(t => ({...t, show:false})); canvas.style.cursor = 'grab'; };
      const onWheel = e => {
        st.scale = Math.max(.4, Math.min(5, st.scale - e.deltaY * .001));
        cancelAnimationFrame(st.raf); st.raf = requestAnimationFrame(draw);
        e.preventDefault();
      };
      const onTS = e => {
        st.spin = false;
        const t = e.touches[0];
        const pin = pinAt(t.clientX, t.clientY);
        if (pin) { clickRef.current(pin); e.preventDefault(); return; }
        st.drag = true; st.last = [t.clientX, t.clientY]; e.preventDefault();
      };
      const onTM = e => {
        if (!st.drag) return;
        const dx = e.touches[0].clientX - st.last[0], dy = e.touches[0].clientY - st.last[1];
        st.last = [e.touches[0].clientX, e.touches[0].clientY];
        st.rot[0] += dx * .35;
        st.rot[1] = Math.max(-90, Math.min(90, st.rot[1] - dy * .35));
        cancelAnimationFrame(st.raf); st.raf = requestAnimationFrame(draw);
        e.preventDefault();
      };

      canvas.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      canvas.addEventListener('mouseleave', onLeave);
      canvas.addEventListener('wheel', onWheel, {passive:false});
      canvas.addEventListener('touchstart', onTS, {passive:false});
      canvas.addEventListener('touchmove', onTM, {passive:false});
      canvas.addEventListener('touchend', () => { st.drag = false; });
      window.addEventListener('resize', resize);

      fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json')
        .then(r => r.json()).then(w => { st.world = w; draw(); }).catch(() => {});

      let animId;
      const spin = () => {
        if (st.spin && !st.drag) { st.rot[0] += .1; draw(); }
        animId = requestAnimationFrame(spin);
      };
      resize();
      spin();

      return () => {
        canvas.removeEventListener('mousedown', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        canvas.removeEventListener('mouseleave', onLeave);
        canvas.removeEventListener('wheel', onWheel);
        canvas.removeEventListener('touchstart', onTS);
        canvas.removeEventListener('touchmove', onTM);
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animId);
        cancelAnimationFrame(st.raf);
      };
    }, []);

    return (
      <div ref={containerRef} style={{position:'relative',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',width:'100%'}}>
        <canvas ref={canvasRef} style={{cursor:'grab',display:'block'}} />
        {tip.show && (
          <div style={{
            position:'absolute', left:tip.x, top:tip.y, pointerEvents:'none',
            background:'rgba(255,255,255,0.96)', border:'2px solid #e87898',
            borderRadius:10, padding:'5px 12px',
            fontFamily:'var(--font-display)', fontSize:13, color:'#c03060',
            boxShadow:'0 2px 10px rgba(200,100,120,0.15)', whiteSpace:'nowrap', zIndex:50,
          }}>{tip.text}</div>
        )}
        <div style={{fontFamily:'var(--font-display)',fontSize:11.5,color:'#d95878',opacity:.6,marginTop:6,textAlign:'center'}}>
          drag to spin · scroll to zoom · click a pin
        </div>
      </div>
    );
  }

  Object.assign(window, { GlobeView });
})();
