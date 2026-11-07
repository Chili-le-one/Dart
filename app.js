const ld=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let hist=ld("dk_hist",[]),dout=ld("dk_dout",true),inm=ld("dk_in","kb"),goal=ld("dk_goal",300),g=null,view="play",mult=1,res=null,qt=false,qtm=null;
const $=s=>document.querySelector(s);
const lab=d=>d.n===0?"0":d.n===25?(d.m===2?"Bull":"25"):["","S","D","T"][d.m]+d.n;
const D3=[];for(let n=20;n>=1;n--)D3.push([(["T","D","S"])[0]+n,n*3,0],["D"+n,n*2,1],["S"+n,n,0]);D3.push(["Bull",50,1],["25",25,0]);D3.sort((a,b)=>b[1]-a[1]);
const PREF=["D20","D16","D8","D10","D12","D18","D14","D6","D4","D2","D24"];
const FIN=D3.filter(x=>x[2]).sort((a,b)=>{const i=PREF.indexOf(a[0]),j=PREF.indexOf(b[0]);return(i<0?99:i)-(j<0?99:j)});
function co(r){if(r<2||r>170)return null;
for(const f of FIN)if(f[1]===r)return[f[0]];
for(const a of D3)for(const f of FIN)if(a[1]+f[1]===r)return[a[0],f[0]];
for(const a of D3)for(const b of D3)for(const f of FIN)if(a[1]+b[1]+f[1]===r)return[a[0],b[0],f[0]];
return null}
const ORD=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
const P=(r,a)=>[(r*Math.sin(a*Math.PI/180)).toFixed(1),(-r*Math.cos(a*Math.PI/180)).toFixed(1)];
function wedge(r1,r2,a0,a1,c){const A=P(r1,a0),B=P(r2,a0),C=P(r2,a1),E=P(r1,a1);return`<path d="M${A} L${B} A${r2} ${r2} 0 0 1 ${C} L${E} A${r1} ${r1} 0 0 0 ${A}Z" fill="${c}"/>`}
const ctr=p=>[p.reduce((a,b)=>a+b[0],0)/p.length,p.reduce((a,b)=>a+b[1],0)/p.length];
function boardSVG(pts,cur,id){let s=`<svg ${id?`id="${id}" `:""}viewBox="-200 -200 400 400" style="width:100%;display:block;touch-action:manipulation"><circle r="196" fill="#101512"/>`;
ORD.forEach((n,i)=>{const a0=i*18-9,a1=a0+18,e=i%2===0,k=e?"#1b1b1b":"#efe3c2",c=e?"#c8372d":"#1f7a4d";s+=wedge(15.9,99,a0,a1,k)+wedge(99,107,a0,a1,c)+wedge(107,162,a0,a1,k)+wedge(162,170,a0,a1,c);const q=P(184,i*18);s+=`<text x="${q[0]}" y="${q[1]}" fill="#ece3c8" font-size="17" font-weight="700" text-anchor="middle" dominant-baseline="central">${n}</text>`});
s+=`<circle r="15.9" fill="#1f7a4d"/><circle r="6.35" fill="#c8372d"/>`;
(pts||[]).forEach(p=>s+=`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#ffd23f" fill-opacity=".85" stroke="#000" stroke-width="1"/>`);
(cur||[]).forEach((p,i)=>s+=`<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="#ffd23f" stroke="#000" stroke-width="1.5"/><text x="${p[0]}" y="${p[1]}" font-size="10" font-weight="800" text-anchor="middle" dominant-baseline="central" pointer-events="none">${i+1}</text>`);
if(pts&&pts.length>2){const c=ctr(pts);s+=`<g stroke="#00b4d8" stroke-width="3" fill="none"><circle cx="${c[0]}" cy="${c[1]}" r="9"/><path d="M${c[0]-14} ${c[1]}h28M${c[0]} ${c[1]-14}v28"/></g>`}
return s+"</svg>"}
function mapStats(p){if(p.length<3)return"";const c=ctr(p),d=p.reduce((a,b)=>a+Math.hypot(b[0]-c[0],b[1]-c[1]),0)/p.length,h=Math.abs(c[0])<3?"":Math.round(Math.abs(c[0]))+" mm "+t(c[0]>0?"rt":"lf"),v=Math.abs(c[1])<3?"":Math.round(Math.abs(c[1]))+" mm "+t(c[1]<0?"up":"dn");return`<p class="cap">${t("disp")} ${Math.round(d)} mm${h||v?" · "+t("bias")+" "+[h,v].filter(Boolean).join(", "):""}</p>`}
function derive(g){let rem=g.start,cur=[],vis=[],done=false,vs=0,att=[];
for(const d of g.all){const s=d.n*d.m,rb=rem-vs;if(g.mode!=="free"&&g.mode!=="ex"&&g.dout&&((rb%2===0&&rb>=2&&rb<=40)||rb===50))att.push([rb===50?25:rb/2,d.m===2&&s===rb?1:0]);cur.push(d);vs+=s;
if(g.mode==="free"||g.mode==="ex"){if(cur.length===3){vis.push({ds:cur,pts:vs,bust:false});cur=[];vs=0}continue}
const r=rem-vs;
if(r===0&&(!g.dout||d.m===2)){vis.push({ds:cur,pts:vs,bust:false});rem=0;cur=[];vs=0;done=true;break}
if(r<0||(r===1&&g.dout)||r===0){vis.push({ds:cur,pts:0,bust:true});cur=[];vs=0;continue}
if(cur.length===3){vis.push({ds:cur,pts:vs,bust:false});rem=r;cur=[];vs=0}}
const pts=vis.reduce((a,v)=>a+v.pts,0)+vs;
return{rem:rem-vs,cur:g.ex==="fin"?finInfo(g).cur:cur,vis,done,pts,att}}
function summary(g,x){const v=x.vis.filter(v=>!v.bust);const n=g.all.length;
return{t:Date.now(),mode:g.mode,dout:g.dout,darts:n,pts:x.pts,avg:n?x.pts/n*3:0,v100:v.filter(a=>a.pts>=100&&a.pts<140).length,v140:v.filter(a=>a.pts>=140&&a.pts<180).length,v180:v.filter(a=>a.pts===180).length,best:v.reduce((m,a)=>Math.max(m,a.pts),0),fin:x.done?x.vis[x.vis.length-1].pts:0,done:x.done,dh:g.all.filter(d=>d.m===2&&d.n>0).length,th:g.all.filter(d=>d.m===3).length,pos:g.all.filter(d=>d.x!==undefined).map(d=>[d.x,d.y]),dbl:x.att||[],ex:g.mode==="ex"?exInfo(g):null}}
function start(mode,ex){g={mode,ex,start:mode==="301"||mode==="501"?+mode:0,dout:mode==="ex"?false:dout,all:[]};res=null;mult=1;view="play";try{navigator.wakeLock&&navigator.wakeLock.request("screen").catch(()=>{})}catch(e){}draw()}
function finish(){const x=derive(g);if(!g.all.length||(g.mode==="ex"&&exInfo(g).n===0)){g=null;draw();return}const s=summary(g,x);hist.unshift(s);sv("dk_hist",hist);res=s;g=null;draw()}
function add(n,m,x,y){g.all.push({n,m:m||(n===0?1:mult),x,y});mult=1;const q=derive(g);if(q.done||(g.mode==="ex"&&exDone(g)))finish();else draw()}
function fmt(a){return a.toFixed(1)}
function dt(ts){return new Date(ts).toLocaleDateString(L,{day:"numeric",month:"short"})}
function nm(s){return s.ex?t("ex_"+s.ex.id):s.mode==="free"?t("sess"):s.mode}
function draw(){document.body.dataset.g=g&&!res?"1":"";
$("#tabs").innerHTML=`<button class="${view==="play"?"on":""}" data-a="v" data-v="play">${t("play")}</button><button class="${view==="stat"?"on":""}" data-a="v" data-v="stat">${t("stat")}</button><button class="${view==="hist"?"on":""}" data-a="v" data-v="hist">${t("hist")}</button>`;
const a=$("#app");
if(view==="stat"){a.innerHTML=statsHTML();return}
if(view==="hist"){a.innerHTML=histHTML();return}
if(res){a.innerHTML=`<div class="card res"><h1>${res.mode==="free"||res.mode==="ex"?t("sess"):t("won")}</h1><div class="big">${res.ex?Math.round(res.ex.hits/res.ex.n*100)+" %":fmt(res.avg)}</div><div class="cap">${res.ex?t("ex_"+res.ex.id)+" · "+res.ex.hits+"/"+res.ex.n:t("avg")+" · "+res.darts+" "+t("darts")}</div><p ${res.ex?"hidden":""}>${res.mode==="301"||res.mode==="501"?t("fin")+" "+res.fin+" · ":""}${t("hv")} ${res.best}<br>180 : ${res.v180} · 140+ : ${res.v140} · 100+ : ${res.v100}<br>${t("dh")} ${res.dh} · ${t("th")} ${res.th}</p>${res.pos&&res.pos.length?boardSVG(res.pos)+mapStats(res.pos):""}${bilan(res)}<button class="pri" data-a="v" data-v="play" data-r="1" style="width:100%">${t("again")}</button></div>`;return}
if(!g){a.innerHTML=`<h1>${t("title")}</h1>${installCard()}<div class="modes"><button data-a="s" data-mode="301">301</button><button data-a="s" data-mode="501">501</button><button class="free" data-a="s" data-mode="free">${t("free")}<small>${t("freeD")}</small></button></div><label class="chk"><input type="checkbox" data-a="do" ${dout?"checked":""}> ${t("dout")}</label>${homeExtra()}`;return}
const x=derive(g),free=g.mode==="free",ex=g.mode==="ex",E=ex?exInfo(g):null,h=free||ex?null:co(x.rem),n=g.all.length,avg=n?x.pts/n*3:0,lv=x.vis[x.vis.length-1];
let sl="";for(let i=0;i<3;i++){const d=x.cur[i];sl+=`<span class="${d?"f":""}">${d?lab(d):""}</span>`}
if(!x.cur.length&&lv&&lv.bust)sl=`<span class="f" style="color:var(--rd);flex:3">${t("bust")}</span>`;
let pad="";for(let i=1;i<=20;i++)pad+=`<button data-a="n" data-n="${i}">${i}</button>`;
pad+=`<button data-a="n" data-n="25" ${mult===3?"disabled":""}>${mult===2?"Bull":"25"}</button><button class="w" data-a="n" data-n="0">${t("miss")}</button><button class="w" data-a="u" ${n?"":"disabled"}>${t("undo")}</button>`;
if(inm==="tg")pad=`<div style="grid-column:1/-1">${boardSVG(null,x.cur.filter(d=>d.x!==undefined).map(d=>[d.x,d.y]),"bd")}</div><button data-a="n" data-n="0" style="grid-column:span 3">${t("miss")}</button><button data-a="u" style="grid-column:span 2" ${n?"":"disabled"}>${t("undo")}</button>`;
a.innerHTML=`<div class="big">${ex?E.hits+"/"+E.n:free?x.pts:x.rem}</div><div class="cap">${ex?t("ex_"+g.ex)+" · "+E.n+"/"+E.tot:free?t("pts"):t("left")+" · "+g.mode}</div><div class="hint">${ex?t("aim")+" : "+E.tgt:h?t("fin")+" : "+h.join(" · "):""}</div><div class="slots">${sl}</div><div class="info"><span>${t("avg")} ${fmt(avg)}</span><span>${n} ${t("darts")}</span><span>${ex&&g.ex==="fin"?E.res.map(r=>r?"✓":"✗").join(""):lv&&!lv.bust?lv.pts:""}</span></div><div class="mult" ${inm==="tg"?"hidden":""}>${[1,2,3].map(m=>`<button class="${mult===m?"on":""}" data-a="m" data-m="${m}">${[0,t("s"),t("d"),t("t")][m]}</button>`).join("")}</div><div class="pad">${pad}</div><div class="row">${free||ex?`<button class="pri" data-a="e">${t("end")}</button>`:""}<button data-a="im">${inm==="tg"?t("kb"):t("tg")}</button><button data-a="q">${qt?t("sure"):t("quit")}</button></div>`}
let sf="all";
function lineSVG(v,ds,dec){const n=v.length;if(n<2)return`<div class="empty">${t("need")}</div>`;
const W=340,H=150,l=34,r=8,tp=10,b=22,mn=Math.min(...v),mx=Math.max(...v),pd=(mx-mn||1)*.15,lo=mn-pd,hi=mx+pd,X=i=>(l+i*(W-l-r)/(n-1)).toFixed(1),Y=y=>(tp+(hi-y)/(hi-lo)*(H-tp-b)).toFixed(1);
let s=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block">`;
for(let k=0;k<3;k++){const y=lo+(hi-lo)*k/2;s+=`<line x1="${l}" x2="${W-r}" y1="${Y(y)}" y2="${Y(y)}" style="stroke:var(--ln)"/><text x="${l-4}" y="${Y(y)}" text-anchor="end" dominant-baseline="central" font-size="10" style="fill:var(--mu)">${y.toFixed(dec)}</text>`}
s+=`<text x="${l}" y="${H-5}" font-size="10" style="fill:var(--mu)">${ds[0]}</text><text x="${W-r}" y="${H-5}" font-size="10" text-anchor="end" style="fill:var(--mu)">${ds[n-1]}</text>`;
s+=`<polyline fill="none" style="stroke:var(--gn)" stroke-width="2" points="${v.map((y,i)=>X(i)+","+Y(y)).join(" ")}"/>`;
const ma=v.map((_,i)=>{const a=v.slice(Math.max(0,i-4),i+1);return a.reduce((x,y)=>x+y,0)/a.length});
if(n>=4)s+=`<polyline fill="none" stroke-dasharray="5 4" style="stroke:var(--rd)" stroke-width="2" points="${ma.map((y,i)=>X(i)+","+Y(y)).join(" ")}"/>`;
v.forEach((y,i)=>s+=`<circle cx="${X(i)}" cy="${Y(y)}" r="3.5" style="fill:var(--gn)"/>`);
return s+"</svg>"}
function statsHTML(){
const all=hist.slice().reverse().filter(s=>!s.ex&&(sf==="all"||s.mode===sf));
const chips=`<div class="chips">${[["all",t("all")],["301","301"],["501","501"],["free",t("lib")]].map(f=>`<button class="${sf===f[0]?"on":""}" data-a="sf" data-f="${f[0]}">${f[1]}</button>`).join("")}</div>`;
const sec=(h,svg)=>`<h2>${h}</h2><div class="card">${svg}</div>`;
let o=`<h1>${t("stat")}</h1>${diag()}${chips}`;
o+=sec(t("favg"),lineSVG(all.map(s=>s.avg),all.map(s=>dt(s.t)),1));
const dd=all.filter(s=>s.pos&&s.pos.length>2);
o+=sec(t("fdisp"),lineSVG(dd.map(s=>{const c=ctr(s.pos);return s.pos.reduce((a,b)=>a+Math.hypot(b[0]-c[0],b[1]-c[1]),0)/s.pos.length}),dd.map(s=>dt(s.t)),0));
if(sf==="301"||sf==="501"){const fd=all.filter(s=>s.done);o+=sec(t("fdarts"),lineSVG(fd.map(s=>s.darts),fd.map(s=>dt(s.t)),0))}
return o+`<p class="cap">${t("leg")}</p>`}
const EX={t20:30,bull:30,dbl:60};
function exInfo(g){if(g.ex==="fin"){const f=finInfo(g);return{id:"fin",hits:f.ok,n:f.k,tot:f.tot,dd:[],res:f.res,tgt:f.rem+" ("+(co(f.rem)||["?"]).join(" · ")+")"}}let h=0;const dd=Array(20).fill(0);g.all.forEach((d,i)=>{const k=Math.floor(i/3)+1,ok=g.ex==="t20"?d.n===20&&d.m===3:g.ex==="bull"?d.n===25&&d.m===2:d.m===2&&d.n===k;if(ok){h++;if(g.ex==="dbl")dd[k-1]++}});const n=g.all.length;return{id:g.ex,hits:h,n,tot:EX[g.ex],dd,tgt:g.ex==="t20"?"T20":g.ex==="bull"?"Bull":"D"+Math.min(20,Math.floor(n/3)+1)}}
function periodDarts(){const d=new Date(),day=(d.getDay()+6)%7,w=new Date(d.getFullYear(),d.getMonth(),d.getDate()-day).getTime(),m=new Date(d.getFullYear(),d.getMonth(),1).getTime();let a=0,b=0;hist.forEach(s=>{if(s.t>=w)a+=s.darts;if(s.t>=m)b+=s.darts});return[a,b]}
function dblAgg(){const a={};hist.forEach(s=>{(s.dbl||[]).forEach(([n,h])=>{a[n]=a[n]||[0,0];a[n][0]++;a[n][1]+=h});if(s.ex&&s.ex.id==="dbl")s.ex.dd.forEach((h,i)=>{a[i+1]=a[i+1]||[0,0];a[i+1][0]+=3;a[i+1][1]+=h})});return a}
function weak(){const a=dblAgg(),tot=Object.values(a).reduce((s,v)=>[s[0]+v[0],s[1]+v[1]],[0,0]),rows=Object.entries(a).filter(([k,v])=>v[0]>=5).map(([k,v])=>[k==25?"Bull":"D"+k,v[0],v[1],v[1]/v[0]]).sort((x,y)=>x[3]-y[3]);return{tot,rows}}
function adv(p){const c=ctr(p),sp=p.reduce((s,b)=>s+Math.hypot(b[0]-c[0],b[1]-c[1]),0)/p.length,off=Math.hypot(c[0],c[1]);return off>10&&sp<off*2?t("adv_b"):sp>25?t("adv_s"):t("adv_ok")}
function diag(){let o="";const w=weak(),tt=w.tot,f=r=>r[0]+" "+Math.round(r[3]*100)+" %";
if(tt[0]>=5)o+=`<h2>${t("dg_d")}</h2><div class="card"><b>${Math.round(tt[1]/tt[0]*100)} %</b> (${tt[1]}/${tt[0]})${w.rows.length>1?`<p class="cap" style="margin:6px 0 0">${t("dg_t")} : ${w.rows.slice(0,3).map(f).join(" · ")}<br>${t("dg_b")} : ${w.rows.slice(-3).reverse().map(f).join(" · ")}</p>`:""}</div>`;
const ex=["t20","bull","dbl","fin"].map(id=>{const l=hist.filter(s=>s.ex&&s.ex.id===id).map(s=>s.ex.hits/s.ex.n);return l.length?`${t("ex_"+id)} : <b>${Math.round(l[0]*100)} %</b> <span class="cap">(${t("rbest")} ${Math.round(Math.max(...l)*100)} %)</span>`:""}).filter(Boolean);
if(ex.length)o+=`<h2>${t("exs")}</h2><div class="card">${ex.join("<br>")}</div>`;
const p=hist.slice(0,5).flatMap(s=>s.pos||[]);
if(p.length>=6)o+=`<h2>${t("dg_p")}</h2><div class="card">${mapStats(p)}<p style="margin:6px 0 0">${adv(p)}</p></div>`;
return o}
function bilan(s){const o=[];
if(s.ex){const p=hist.slice(1).find(x=>x.ex&&x.ex.id===s.ex.id);if(p){const d=Math.round((s.ex.hits/s.ex.n-p.ex.hits/p.ex.n)*100);o.push(`${d>=0?"+":""}${d} pts ${t("vslast")}`)}}
else{const pv=hist.slice(1,6).filter(x=>!x.ex);if(pv.length>=2){const d=s.avg-pv.reduce((a,x)=>a+x.avg,0)/pv.length;o.push(`${t("avg")} ${d>=0?"+":""}${d.toFixed(1)} ${t("vs5")}`)}
if(s.dbl&&s.dbl.length>=3)o.push(`${t("dg_d")} : ${s.dbl.reduce((a,b)=>a+b[1],0)}/${s.dbl.length}`)}
if(s.pos&&s.pos.length>=3)o.push(adv(s.pos));
const w=weak().rows[0];if(w)o.push(`${t("dg_t")} : ${w[0]} (${Math.round(w[3]*100)} %)`);
return o.length?`<div style="text-align:left;margin:8px 0">${o.map(x=>`<p style="margin:6px 0">${x}</p>`).join("")}</div>`:""}
function homeExtra(){const[w,m]=periodDarts(),pc=Math.min(100,Math.round(w/goal*100)),wk=weak().rows[0];
return`<h2>${t("goal")}</h2><div class="card"><div class="hi"><span><b>${w}</b>/${goal} ${t("darts")} · ${t("wk")}</span><span class="cap">${m} ${t("darts")} · ${t("mo")}</span></div><div class="bar"><i style="width:${pc}%"></i></div><label class="chk" style="margin:10px 0 0">${t("gset")} <input type="number" min="1" step="50" value="${goal}" data-a="goal" style="width:80px"></label></div><h2>${t("exs")}</h2>${["t20","bull","dbl","fin"].map(id=>`<button class="exb" data-a="s" data-mode="ex" data-ex="${id}"><b>${t("ex_"+id)}</b><small>${t("exd_"+id)}</small></button>`).join("")}${wk?`<p class="cap">${t("dg_t")} : ${wk[0]} (${Math.round(wk[3]*100)} %)</p>`:""}`}
let hq="all";
const FINS=[32,40,50,60,70,81,100,121,132,141];
function finInfo(g){let k=0,rem=FINS[0],dn=0,ok=0,res=[],cur=[];
for(const d of g.all){if(k>=FINS.length)break;const r=rem-d.n*d.m;dn++;cur.push(d);
if(r===0&&d.m===2){res.push(1);ok++;k++;rem=FINS[k];dn=0;cur=[]}
else if(r<=1||dn===3){res.push(0);k++;rem=FINS[k];dn=0;cur=[]}
else rem=r}
return{k,ok,rem:rem??0,dn,cur,res,tot:FINS.length,done:k>=FINS.length}}
function exDone(g){return g.ex==="fin"?finInfo(g).done:g.all.length>=EX[g.ex]}
function hmatch(s){return hq==="all"||(["t20","bull","dbl","fin"].includes(hq)?!!s.ex&&s.ex.id===hq:hq==="free"?s.mode==="free":s.mode===hq&&!s.ex)}
function hChips(){return`<div class="chips">${[["all",t("all")],["301","301"],["501","501"],["free",t("lib")],["t20","T20"],["bull","Bull"],["dbl","Doubles"],["fin","Finishes"]].map(f=>`<button class="${hq===f[0]?"on":""}" data-a="hq" data-f="${f[0]}">${f[1]}</button>`).join("")}</div>`}
function exCards(fl){const p=fl.map(s=>s.ex.hits/s.ex.n*100);return`<div class="rec"><div class="card"><span class="v">${Math.round(Math.max(...p))} %</span><span class="l">${t("rbest")}</span></div><div class="card"><span class="v">${Math.round(p[0])} %</span><span class="l">${t("last")}</span></div></div>`}
function histHTML(){
const fh=hist.map((s,i)=>[s,i]).filter(([s])=>hmatch(s)),fl=fh.map(x=>x[0]),dn=fl.filter(s=>s.mode!=="free"&&s.done);
const bAvg=dn.reduce((m,s)=>Math.max(m,s.avg),0),hf=dn.reduce((m,s)=>Math.max(m,s.fin),0),n180=fl.reduce((a,s)=>a+(s.ex&&s.ex.id==="fin"?0:s.v180),0);
const few=m=>{const l=dn.filter(s=>s.mode===m).map(s=>s.darts);return l.length?Math.min(...l):null};
let r="";
if(dn.length||n180){r=`<div class="rec"><div class="card"><span class="v">${bAvg?fmt(bAvg):"–"}</span><span class="l">${t("best")}</span></div><div class="card"><span class="v">${hf||"–"}</span><span class="l">${t("hf")}</span></div><div class="card"><span class="v">${few("301")||"–"} / ${few("501")||"–"}</span><span class="l">${t("few")} (301 / 501)</span></div><div class="card"><span class="v">${n180}</span><span class="l">${t("n180")}</span></div></div>`}else r=`<div class="empty">${t("nb")}</div>`;
let l=fh.length?fh.map(([s,i])=>`<div class="card hi"><div><b>${nm(s)}</b> · ${dt(s.t)}${!s.ex&&s.mode!=="free"&&s.dout?" · DO":""}<br><span class="cap">${t("avg")} ${fmt(s.avg)} · ${s.darts} ${t("darts")}${s.ex?" · "+s.ex.hits+"/"+s.ex.n:s.mode!=="free"?" · "+t("fin")+" "+s.fin:""}</span></div><button data-a="x" data-i="${i}" ${qtm===i?'style="color:var(--rd)"':""}>${qtm===i?t("sure"):t("del")}</button></div>`).join(""):`<div class="empty">${t("none")}</div>`;
const pp=fl.flatMap(s=>s.pos||[]).slice(0,300);
const mp=pp.length>2?`<h2>${t("map")} (${pp.length})</h2>${boardSVG(pp)}${mapStats(pp)}`:"";
return`<h1>${t("hist")}</h1>${hChips()}<h2>${t("rec")}</h2>${fl.length&&fl.every(s=>s.ex)?exCards(fl):r}${mp}<h2>${t("hist")}</h2>${l}`}
document.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
if(a==="v"){view=b.dataset.v;if(b.dataset.r)res=null;qt=false;draw()}
else if(a==="s")start(b.dataset.mode,b.dataset.ex)
else if(a==="n")add(+b.dataset.n)
else if(a==="m"){mult=+b.dataset.m;draw()}
else if(a==="u"){g.all.pop();draw()}
else if(a==="e")finish()
else if(a==="sf"){sf=b.dataset.f;draw()}
else if(a==="hq"){hq=b.dataset.f;draw()}
else if(a==="inst"&&dip){dip.prompt();dip.userChoice.finally(()=>{dip=null;draw()})}
else if(a==="im"){inm=inm==="tg"?"kb":"tg";sv("dk_in",inm);draw()}
else if(a==="q"){if(qt){g=null;qt=false;draw()}else{qt=true;draw();setTimeout(()=>{qt=false;if(g)draw()},3000)}}
else if(a==="x"){const i=+b.dataset.i;if(qtm===i){hist.splice(i,1);sv("dk_hist",hist);qtm=null;draw()}else{qtm=i;draw();setTimeout(()=>{qtm=null;if(view==="hist")draw()},3000)}}});
function pos(e,b){const r=b.getBoundingClientRect();return[Math.round((e.clientX-r.left)/r.width*400-200),Math.round((e.clientY-r.top)/r.height*400-200)]}
function hit(x,y){const d=Math.hypot(x,y);
if(d>170)return add(0,1,x,y);
if(d<6.35)return add(25,2,x,y);
if(d<15.9)return add(25,1,x,y);
const an=((Math.atan2(x,-y)*180/Math.PI+9)%360+360)%360;add(ORD[Math.floor(an/18)],d>=162?2:(d>=99&&d<=107)?3:1,x,y)}
const BS=boardSVG(null,null,"");let lp=null;
function loupe(e,b){const[x,y]=pos(e,b);if(!lp){const d=document.createElement("div");d.className="lp";d.innerHTML=BS+'<i class="lx"></i>';document.body.appendChild(d);lp=d}
lp.firstChild.setAttribute("viewBox",`${x-22} ${y-22} 44 44`);
const w=124,lx=Math.max(4,Math.min(innerWidth-w-4,e.clientX-w/2)),ly=e.clientY-w-70;lp.style.left=lx+"px";lp.style.top=(ly<4?e.clientY+60:ly)+"px"}
function unloupe(){if(lp){lp.remove();lp=null}}
document.addEventListener("pointerdown",e=>{const b=e.target.closest("#bd");if(!b||!g)return;e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}loupe(e,b)});
document.addEventListener("pointermove",e=>{const b=document.querySelector("#bd");if(lp&&b)loupe(e,b)});
document.addEventListener("pointerup",e=>{if(!lp)return;const b=document.querySelector("#bd");unloupe();if(b&&g){const[x,y]=pos(e,b);hit(x,y)}});
document.addEventListener("pointercancel",unloupe);
document.addEventListener("contextmenu",e=>{if(e.target.closest&&e.target.closest("#bd"))e.preventDefault()});
document.addEventListener("change",e=>{if(e.target.dataset.a==="do"){dout=e.target.checked;sv("dk_dout",dout)}else if(e.target.dataset.a==="goal"){goal=Math.max(1,+e.target.value||300);sv("dk_goal",goal);draw()}});
draw();

if("serviceWorker" in navigator&&location.protocol.startsWith("http"))addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));

var dip=null;
function standalone(){return matchMedia("(display-mode: standalone)").matches||navigator.standalone}
addEventListener("beforeinstallprompt",e=>{e.preventDefault();dip=e;draw()});
addEventListener("appinstalled",()=>{dip=null;draw()});
function installCard(){if(standalone())return"";
if(dip)return`<button class="pri" data-a="inst" style="width:100%;margin:0 0 14px">${t("inst")}</button>`;
if(/iphone|ipad|ipod/i.test(navigator.userAgent))return`<div class="card"><b>${t("inst")}</b><br><span class="cap">${t("insti")}</span></div>`;
return""}
