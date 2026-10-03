/* TrippyCharts cursor art: one distinct look per skin. Shared by index.html and toys.html. */
(function(){
const TAU = Math.PI*2;
function glow(c, r, stops){ const g=c.createRadialGradient(0,0,0,0,0,r); stops.forEach(([o,col])=>g.addColorStop(o,col)); c.fillStyle=g; c.beginPath(); c.arc(0,0,r,0,TAU); c.fill(); }
function rnd(a,b){ return a+Math.random()*(b-a); }
function parts(st, key){ return st[key] || (st[key]=[]); }
function stepParts(c, list, dx, dy, drawFn){
  for (let i=list.length-1;i>=0;i--){ const p=list[i]; p.x+=p.vx-dx; p.y+=p.vy-dy; p.life-=p.decay; if(p.life<=0){ list.splice(i,1); continue; } drawFn(p); }
}
function tailDir(st, dx, dy){
  const sp=Math.hypot(dx,dy);
  if (sp>0.4){ const a=Math.atan2(-dy,-dx); st.tail = st.tail==null ? a : st.tail + Math.atan2(Math.sin(a-st.tail),Math.cos(a-st.tail))*0.25; }
  if (st.tail==null) st.tail = 2.4;
  st.spd = (st.spd||0)*0.9 + sp*0.1;
  return st.tail;
}

const ART = {
  nebula(c, t, st, dx, dy){ // spiral galaxy
    c.globalCompositeOperation="lighter";
    glow(c, 30, [[0,"rgba(190,120,255,.55)"],[.5,"rgba(90,40,200,.25)"],[1,"rgba(40,0,90,0)"]]);
    const arms=3, rot=t*0.9;
    for (let a=0;a<arms;a++){
      for (let i=0;i<34;i++){
        const u=i/34, r=3+u*26, th=rot+a*TAU/arms+u*3.6;
        const x=Math.cos(th)*r, y=Math.sin(th)*r*0.78;
        const hue=(290-u*110+a*30)%360;
        c.fillStyle=`hsla(${hue},100%,${70-u*15}%,${0.75-u*0.5})`;
        c.beginPath(); c.arc(x+Math.sin(i*7.3)*1.6, y+Math.cos(i*5.1)*1.6, 2.6-u*1.6, 0, TAU); c.fill();
      }
    }
    for (let i=0;i<14;i++){ const th=i*2.39996+rot*0.4, r=8+((i*37)%22); const tw=0.5+0.5*Math.sin(t*5+i);
      c.fillStyle=`rgba(255,255,255,${0.35+0.6*tw})`; c.fillRect(Math.cos(th)*r-0.6, Math.sin(th)*r*0.78-0.6, 1.3, 1.3); }
    glow(c, 8, [[0,"#fff"],[.4,"rgba(255,220,255,.9)"],[1,"rgba(255,150,255,0)"]]);
  },
  comet(c, t, st, dx, dy){ // icy comet with streaming tail
    const a=tailDir(st,dx,dy), len=46+Math.min(40,(st.spd||0)*5);
    c.globalCompositeOperation="lighter";
    c.save(); c.rotate(a);
    const g=c.createLinearGradient(0,0,len,0); g.addColorStop(0,"rgba(200,240,255,.9)"); g.addColorStop(.4,"rgba(90,170,255,.45)"); g.addColorStop(1,"rgba(60,80,255,0)");
    c.fillStyle=g; c.beginPath(); c.moveTo(-2,-6); c.quadraticCurveTo(len*0.45,-13+Math.sin(t*6)*2,len,Math.sin(t*3)*4); c.quadraticCurveTo(len*0.45,13+Math.sin(t*6+1)*2,-2,6); c.arc(0,0,6,Math.PI/2,-Math.PI/2,false); c.closePath(); c.fill();
    const g2=c.createLinearGradient(0,0,len*0.8,0); g2.addColorStop(0,"rgba(255,230,160,.7)"); g2.addColorStop(1,"rgba(255,140,60,0)");
    c.fillStyle=g2; c.beginPath(); c.moveTo(0,-4); c.quadraticCurveTo(len*0.4,-3,len*0.8,-9+Math.sin(t*4)*2); c.quadraticCurveTo(len*0.4,2,0,4); c.closePath(); c.fill();
    c.restore();
    const L=parts(st,"cs"); if (L.length<40) for(let k=0;k<2;k++){ const s=rnd(-.5,.5); L.push({x:Math.cos(a+s)*6,y:Math.sin(a+s)*6,vx:Math.cos(a+s)*rnd(.4,1.2),vy:Math.sin(a+s)*rnd(.4,1.2),life:1,decay:rnd(.02,.04)}); }
    stepParts(c,L,dx,dy,p=>{ c.fillStyle=`rgba(200,235,255,${p.life})`; c.beginPath(); c.arc(p.x,p.y,1.4*p.life+0.3,0,TAU); c.fill(); });
    glow(c, 14, [[0,"rgba(255,255,255,1)"],[.35,"rgba(180,230,255,.9)"],[1,"rgba(80,160,255,0)"]]);
    c.globalCompositeOperation="source-over";
    c.fillStyle="#f4fbff"; c.beginPath(); c.arc(0,0,5,0,TAU); c.fill();
  },
  lotus(c, t, st){ // layered breathing lotus
    const open=0.55+0.45*Math.sin(t*1.6); c.scale(1.3,1.3);
    const layers=[[9,26,9,"#ff4fa3","#ff9fd0",-t*0.25],[8,20,7,"#ff7fc0","#ffd2ea",t*0.35+0.4],[6,13,5,"#fff0f8","#ffc2e2",-t*0.5]];
    c.save(); c.globalAlpha=0.35; glow(c,30,[[0,"rgba(255,120,200,.9)"],[1,"rgba(255,80,180,0)"]]); c.restore();
    layers.forEach(([n,len,wid,c1,c2,rot],li)=>{
      for (let i=0;i<n;i++){
        c.save(); c.rotate(rot+i*TAU/n); c.scale(1, 0.75+0.25*open);
        const L=len*(0.7+0.3*open);
        const g=c.createLinearGradient(0,0,0,-L); g.addColorStop(0,c2); g.addColorStop(1,c1);
        c.fillStyle=g; c.strokeStyle="rgba(120,0,70,.35)"; c.lineWidth=0.8;
        c.beginPath(); c.moveTo(0,0); c.bezierCurveTo(wid,-L*0.35,wid*0.6,-L*0.85,0,-L); c.bezierCurveTo(-wid*0.6,-L*0.85,-wid,-L*0.35,0,0); c.fill(); c.stroke();
        c.restore();
      }
    });
    glow(c,6,[[0,"#fff7b0"],[.6,"#ffc93a"],[1,"rgba(255,170,0,0)"]]);
    for (let i=0;i<8;i++){ const a=i*TAU/8+t; c.fillStyle="#ffe46a"; c.beginPath(); c.arc(Math.cos(a)*3.4,Math.sin(a)*3.4,0.9,0,TAU); c.fill(); }
  },
  void(c, t, st, dx, dy){ // eldritch void eye
    c.globalCompositeOperation="lighter";
    for (let r=0;r<3;r++){ c.save(); c.rotate(t*(r%2?-0.8:1.1)+r); c.setLineDash([3+r*2,4+r]); c.lineWidth=1.4; c.strokeStyle=`hsla(${270+r*25},100%,${65-r*8}%,.8)`; c.beginPath(); c.arc(0,0,20+r*5,0,TAU); c.stroke(); c.restore(); }
    c.setLineDash([]);
    const L=parts(st,"vp"); if (L.length<30){ const a=rnd(0,TAU); L.push({x:Math.cos(a)*34,y:Math.sin(a)*34,vx:-Math.cos(a)*0.7,vy:-Math.sin(a)*0.7,life:1,decay:0.022}); }
    stepParts(c,L,0,0,p=>{ c.fillStyle=`hsla(280,100%,75%,${p.life})`; c.fillRect(p.x-0.8,p.y-0.8,1.6,1.6); });
    c.globalCompositeOperation="source-over";
    const blink=Math.max(0.08, Math.min(1, Math.abs(Math.sin(t*0.45))*6));
    c.save(); c.scale(1,blink);
    c.fillStyle="#12001f"; c.beginPath(); c.moveTo(-17,0); c.quadraticCurveTo(0,-15,17,0); c.quadraticCurveTo(0,15,-17,0); c.fill();
    c.strokeStyle="#c58bff"; c.lineWidth=1.6; c.stroke();
    let lx=0, ly=0; const sp=Math.hypot(dx,dy); if (sp>0.3){ lx=dx/sp*5; ly=dy/sp*3; } st.lx=(st.lx||0)*0.85+lx*0.15; st.ly=(st.ly||0)*0.85+ly*0.15;
    c.save(); c.translate(st.lx,st.ly);
    const ig=c.createRadialGradient(0,0,1,0,0,8); ig.addColorStop(0,"#fff2a8"); ig.addColorStop(.5,"#ff7af5"); ig.addColorStop(1,"#5a12b8");
    c.fillStyle=ig; c.beginPath(); c.arc(0,0,8,0,TAU); c.fill();
    c.fillStyle="#05000a"; c.beginPath(); c.ellipse(0,0,1.8,6.5,0,0,TAU); c.fill();
    c.fillStyle="rgba(255,255,255,.85)"; c.beginPath(); c.arc(-2.5,-2.5,1.4,0,TAU); c.fill();
    c.restore(); c.restore();
  },
  prism(c, t, st){ // spinning gem with rainbow beams
    c.globalCompositeOperation="lighter";
    for (let i=0;i<7;i++){ const a=t*0.7+i*TAU/7; c.save(); c.rotate(a);
      const g=c.createLinearGradient(8,0,38,0); g.addColorStop(0,`hsla(${i*51},100%,65%,.7)`); g.addColorStop(1,`hsla(${i*51},100%,60%,0)`);
      c.fillStyle=g; c.beginPath(); c.moveTo(6,-1.2); c.lineTo(38,-5); c.lineTo(38,5); c.lineTo(6,1.2); c.fill(); c.restore(); }
    c.globalCompositeOperation="source-over";
    const sq=Math.cos(t*1.8), n=6, R=13;
    const pts=[]; for (let i=0;i<n;i++){ const a=i*TAU/n+Math.PI/6; pts.push([Math.cos(a)*R*Math.max(0.25,Math.abs(sq)), Math.sin(a)*R*1.25]); }
    for (let i=0;i<n;i++){ const p=pts[i], q=pts[(i+1)%n]; const hue=(i*60+t*90)%360;
      c.fillStyle=`hsla(${hue},90%,${60+15*Math.sin(t*3+i)}%,.9)`; c.beginPath(); c.moveTo(0,0); c.lineTo(p[0],p[1]); c.lineTo(q[0],q[1]); c.closePath(); c.fill(); }
    c.strokeStyle="rgba(255,255,255,.9)"; c.lineWidth=1.1; c.beginPath(); pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.closePath(); c.stroke();
    pts.forEach(p=>{ c.beginPath(); c.moveTo(0,0); c.lineTo(p[0],p[1]); c.strokeStyle="rgba(255,255,255,.35)"; c.stroke(); });
    const sp=(t*1.3)%3; if (sp<1){ c.save(); c.globalCompositeOperation="lighter"; c.translate(pts[0][0]*0.6,pts[0][1]*0.6); c.rotate(t); c.fillStyle=`rgba(255,255,255,${1-sp})`;
      c.beginPath(); for(let k=0;k<4;k++){ c.rotate(Math.PI/2); c.moveTo(0,0); c.lineTo(1.2,1.2); c.lineTo(0,7); c.lineTo(-1.2,1.2); } c.fill(); c.restore(); }
  },
  aurora(c, t, st, dx, dy){ // aurora curtain ribbons
    c.globalCompositeOperation="lighter";
    const H=st.ah || (st.ah=[]); H.unshift({x:0,y:0}); H.forEach(p=>{ p.x-=dx; p.y-=dy; }); if (H.length>34) H.length=34;
    if (Math.hypot(dx,dy)<0.3) H.forEach((p,i)=>{ if(i){ p.x += -1.1 + Math.sin(t*0.9+i*0.3)*0.3; p.y += Math.sin(t*1.3+i*0.4)*0.5; } });
    for (let band=0;band<3;band++){
      for (let i=1;i<H.length;i++){
        const p=H[i], u=i/H.length, wave=Math.sin(t*3+i*0.5+band*2)*4;
        const top=-16-band*8-wave, bot=10+band*3+wave*0.5;
        const g=c.createLinearGradient(0,p.y+top,0,p.y+bot);
        const hue=[140,170,285][band];
        g.addColorStop(0,`hsla(${hue+40},100%,70%,0)`); g.addColorStop(.6,`hsla(${hue},100%,60%,${0.3*(1-u*0.8)})`); g.addColorStop(1,`hsla(${hue-20},100%,55%,0)`);
        c.strokeStyle=g; c.lineWidth=2.6; c.beginPath(); c.moveTo(p.x+band*1.5,p.y+top); c.lineTo(p.x+band*1.5,p.y+bot); c.stroke();
      }
    }
    glow(c,11,[[0,"rgba(255,255,255,.95)"],[.3,"rgba(160,255,200,.8)"],[1,"rgba(80,255,170,0)"]]);
    c.save(); c.rotate(t*0.6); c.fillStyle="#eafff4"; c.beginPath(); for(let k=0;k<4;k++){ c.rotate(Math.PI/2); c.moveTo(0,0); c.lineTo(1.4,1.4); c.lineTo(0,9); c.lineTo(-1.4,1.4); } c.fill(); c.restore();
  },
  ember(c, t, st, dx, dy){ // fireball shedding embers
    const a=tailDir(st,dx,dy) , sp=st.spd||0;
    const L=parts(st,"em"); if (L.length<60) for(let k=0;k<2;k++) L.push({x:rnd(-6,6),y:rnd(-6,6),vx:rnd(-.4,.4)+Math.cos(a)*sp*0.15,vy:rnd(-1.2,-.4)+Math.sin(a)*sp*0.15,life:1,decay:rnd(.012,.03),r:rnd(.8,2)});
    c.globalCompositeOperation="lighter";
    stepParts(c,L,dx,dy,p=>{ p.vy-=0.01; c.fillStyle=`hsla(${20+p.life*30},100%,${50+p.life*20}%,${p.life})`; c.beginPath(); c.arc(p.x,p.y,p.r*p.life+0.3,0,TAU); c.fill(); });
    const up = Math.hypot(dx,dy)>0.4 ? a : -Math.PI/2;
    st.fa = st.fa==null?up:st.fa+Math.atan2(Math.sin(up-st.fa),Math.cos(up-st.fa))*0.2;
    c.save(); c.rotate(st.fa+Math.PI/2);
    const flick=1+0.12*Math.sin(t*17)+0.08*Math.sin(t*29);
    [[16,24,"rgba(255,60,0,.55)","rgba(255,120,0,0)"],[11,18,"rgba(255,150,20,.8)","rgba(255,90,0,0)"],[6.5,11,"rgba(255,245,180,1)","rgba(255,200,60,0)"]].forEach(([w,hgt,c1,c2],k)=>{
      const H=hgt*flick; const g=c.createRadialGradient(0,2,0,0,-H*0.2,w*1.6); g.addColorStop(0,c1); g.addColorStop(1,c2);
      c.fillStyle=g; c.beginPath(); c.moveTo(0,-H*1.3); c.bezierCurveTo(w*0.6,-H*0.6+Math.sin(t*11+k)*2,w,H*0.1,0,w*0.95); c.bezierCurveTo(-w,H*0.1,-w*0.6,-H*0.6+Math.cos(t*13+k)*2,0,-H*1.3); c.fill(); });
    c.restore();
  },
  candy(c, t, st){ // candy solar system
    const items=[[22,0.95,0,"gum"],[30,-0.6,2.1,"wrap"],[17,1.5,4.0,"dot"],[27,0.75,3.3,"donut"]];
    const drawn=items.map(([r,w,ph,kind])=>{ const a=t*w+ph; return {x:Math.cos(a)*r, y:Math.sin(a)*r*0.42, z:Math.sin(a), kind, a}; });
    c.strokeStyle="rgba(255,190,230,.25)"; c.lineWidth=0.8; items.forEach(([r])=>{ c.beginPath(); c.ellipse(0,0,r,r*0.42,0,0,TAU); c.stroke(); });
    const back=drawn.filter(d=>d.z<0), front=drawn.filter(d=>d.z>=0);
    const piece=d=>{ const s=0.8+0.25*d.z; c.save(); c.translate(d.x,d.y); c.scale(s,s);
      if(d.kind==="gum"){ c.fillStyle="#4fe3ff"; c.beginPath(); c.arc(0,0,4.5,0,TAU); c.fill(); c.fillStyle="rgba(255,255,255,.7)"; c.beginPath(); c.arc(-1.5,-1.5,1.4,0,TAU); c.fill(); }
      else if(d.kind==="wrap"){ c.rotate(d.a*2); c.fillStyle="#ffd23f"; c.beginPath(); c.moveTo(-9,-3.5); c.lineTo(-5,0); c.lineTo(-9,3.5); c.closePath(); c.moveTo(9,-3.5); c.lineTo(5,0); c.lineTo(9,3.5); c.closePath(); c.fill(); c.fillStyle="#ff5d8f"; c.beginPath(); c.ellipse(0,0,5.5,4,0,0,TAU); c.fill(); c.strokeStyle="#fff"; c.lineWidth=1; c.beginPath(); c.moveTo(-3,-3); c.lineTo(3,3); c.stroke(); }
      else if(d.kind==="dot"){ c.fillStyle="#9dff6a"; c.beginPath(); c.moveTo(-4,3); c.quadraticCurveTo(0,-7,4,3); c.closePath(); c.fill(); }
      else { c.fillStyle="#d08a4a"; c.beginPath(); c.arc(0,0,5.5,0,TAU); c.fill(); c.fillStyle="#ff8fd0"; c.beginPath(); c.arc(0,0,4.6,0,TAU); c.fill(); c.fillStyle="#1a0820"; c.beginPath(); c.arc(0,0,1.8,0,TAU); c.fill(); }
      c.restore(); };
    back.forEach(piece);
    c.save(); c.rotate(t*1.4); c.fillStyle="#fff"; c.beginPath(); c.arc(0,0,11,0,TAU); c.fill();
    c.lineWidth=3.2; c.strokeStyle="#ff3d8b"; c.beginPath(); for(let i=0;i<60;i++){ const u=i/60, a=u*TAU*2.2, r=u*10.5; i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(0,0); } c.stroke();
    c.strokeStyle="#7a2cff"; c.lineWidth=1.2; c.beginPath(); c.arc(0,0,11,0,TAU); c.stroke(); c.restore();
    c.fillStyle="rgba(255,255,255,.55)"; c.beginPath(); c.ellipse(-4,-5,3,1.5,-0.6,0,TAU); c.fill();
    front.forEach(piece);
  },
  plasma(c, t, st){ // plasma globe with lightning
    c.globalCompositeOperation="lighter";
    glow(c,24,[[0,"rgba(120,40,255,.15)"],[.85,"rgba(255,60,220,.12)"],[1,"rgba(255,60,220,0)"]]);
    if (!st.bolts || (st.bt=(st.bt||0)+1)%4===0){
      st.bolts=[]; const n=5+Math.floor(Math.random()*3);
      for(let b=0;b<n;b++){ const a=(st.ba=(st.ba||0)+rnd(0.6,1.6)); const pts=[[0,0]]; const segs=7;
        for(let s=1;s<=segs;s++){ const r=s/segs*22; const j=s===segs?0:rnd(-.35,.35); pts.push([Math.cos(a+j)*r, Math.sin(a+j)*r]); }
        st.bolts.push({pts,hue:rnd(280,330)}); }
    }
    st.bolts.forEach(b=>{ [[4,.25],[1.4,.95]].forEach(([w,al])=>{ c.strokeStyle=`hsla(${b.hue},100%,${w>2?60:85}%,${al})`; c.lineWidth=w; c.beginPath(); b.pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.stroke(); });
      const e=b.pts[b.pts.length-1]; c.fillStyle=`hsla(${b.hue},100%,80%,.9)`; c.beginPath(); c.arc(e[0],e[1],1.6,0,TAU); c.fill(); });
    glow(c,7,[[0,"#fff"],[.5,"rgba(255,170,255,.9)"],[1,"rgba(200,80,255,0)"]]);
    c.globalCompositeOperation="source-over";
    c.strokeStyle="rgba(200,220,255,.55)"; c.lineWidth=1.3; c.beginPath(); c.arc(0,0,23,0,TAU); c.stroke();
    c.strokeStyle="rgba(255,255,255,.5)"; c.lineWidth=1.6; c.beginPath(); c.arc(0,0,20,3.6,4.4); c.stroke();
  },
  ufo(c, t, st, dx, dy){ // UFO Beam (Trippy Pass, Oct 2026): saucer with chasing rim lights and a pulsing tractor beam
    const tilt=Math.max(-0.35,Math.min(0.35,(dx||0)*0.06)); st.tl=(st.tl||0)*0.85+tilt*0.15;
    c.save(); c.rotate(st.tl);
    c.globalCompositeOperation="lighter";
    const pulse=0.6+0.4*Math.sin(t*4);
    const g=c.createLinearGradient(0,4,0,42); g.addColorStop(0,"rgba(140,255,200,"+(0.6*pulse)+")"); g.addColorStop(1,"rgba(140,255,200,0)");
    c.fillStyle=g; c.beginPath(); c.moveTo(-6,5); c.lineTo(6,5); c.lineTo(19,42); c.lineTo(-19,42); c.closePath(); c.fill();
    const ps=parts(st,"ufo"); if (ps.length<14 && Math.random()<0.5) ps.push({x:rnd(-14,14), y:40, vx:0, vy:-rnd(.6,1.3), life:1, decay:.03});
    stepParts(c, ps, 0, 0, p=>{ p.x*=0.97; c.fillStyle="rgba(200,255,225,"+p.life+")"; c.beginPath(); c.arc(p.x,p.y,1.3,0,TAU); c.fill(); });
    c.globalCompositeOperation="source-over";
    const hull=c.createLinearGradient(0,-4,0,7); hull.addColorStop(0,"#eef0ff"); hull.addColorStop(1,"#5d6290");
    c.fillStyle=hull; c.beginPath(); c.ellipse(0,1,20,6.5,0,0,TAU); c.fill();
    c.strokeStyle="#1b1430"; c.lineWidth=1.2; c.stroke();
    const dome=c.createRadialGradient(-2,-6,1,0,-3,9); dome.addColorStop(0,"rgba(225,255,250,.95)"); dome.addColorStop(1,"rgba(80,200,255,.6)");
    c.fillStyle=dome; c.beginPath(); c.ellipse(0,-2,9,7.5,0,Math.PI,TAU); c.closePath(); c.fill(); c.stroke();
    for (let k=0;k<8;k++){ const a=t*2.2+k*TAU/8; if (Math.sin(a)<-0.15) continue;
      c.fillStyle="hsl("+((k*45+t*140)%360)+",100%,65%)"; c.beginPath(); c.arc(Math.cos(a)*16, 1.5+Math.sin(a)*4.4, 1.8, 0, TAU); c.fill(); }
    c.restore();
  }
};
function draw(c, skin, x, y, s, st, opts){
  const fn=ART[skin]; if(!fn) return false;
  opts=opts||{}; const t=(opts.t!=null?opts.t:performance.now()/1000);
  const dx=(opts.dx||0)/s, dy=(opts.dy||0)/s;
  c.save(); c.translate(x,y); c.scale(s,s); fn(c,t,st,dx,dy); c.restore(); return true;
}
window.CursorArt = { draw, has: k => !!ART[k] };
})();
