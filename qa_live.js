// Renders the REAL index.html drawing code to PNGs (no duplicated code).
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const realCanvas = createCanvas(440, 820);
const _style = {};
const game = new Proxy(realCanvas, { get(t,p){ if(p==='style') return _style; const v=t[p]; return typeof v==='function'? v.bind(t): v; }, set(t,p,v){ if(p!=='style') t[p]=v; return true; } });
function stub(n){const f=function(){return stub(n);};return new Proxy(f,{get(t,p){
 if(p==='style')return stub('s');if(p==='classList')return{add(){},remove(){},contains(){return false;},toggle(){}};
 if(p==='dataset')return{};if(p==='length')return 0;if(p==='value')return'';
 if(p==='textContent'||p==='innerHTML')return'';if(p==='children')return[];
 if(p===Symbol.toPrimitive)return()=>0;if(p==='then')return undefined;
 return stub(n+'.'+String(p));},set(){return true;},apply(){return stub('a');}});}
global.document={getElementById:(id)=>id==='game'?game:stub('#'+id),querySelector:()=>stub('q'),querySelectorAll:()=>[],createElement:()=>stub('el'),addEventListener:()=>{},body:stub('b')};
global.window={addEventListener:()=>{},devicePixelRatio:1,innerWidth:440,innerHeight:820,AudioContext:function(){return stub('x');},DeviceOrientationEvent:undefined,requestAnimationFrame:()=>0,localStorage:{getItem:()=>null,setItem:()=>{}}};
global.localStorage=window.localStorage;global.requestAnimationFrame=()=>0;global.cancelAnimationFrame=()=>0;
global.Image=function(){return stub('i');};global.AudioContext=window.AudioContext;global.navigator={userAgent:'node'};global.performance={now:()=>0};
let code=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const hook='\n;globalThis.__g={begin,draw,getState:()=>state,PHASE,CASTELLS,cById,drawCasteller,setLevelH:(v)=>{levelH=v;},getCtx:()=>ctx,setColla:(c)=>{Object.assign(COLLA,c);}};\n';
const i=code.lastIndexOf('})();');code=code.slice(0,i)+hook+code.slice(i);
new Function('document','window','localStorage','requestAnimationFrame','cancelAnimationFrame','Image','AudioContext','navigator','performance',code)
 (document,window,localStorage,requestAnimationFrame,cancelAnimationFrame,Image,AudioContext,navigator,performance);
const g=globalThis.__g;
function scene(id, file){
  realCanvas.width=440; realCanvas.height=820;
  const c=g.cById(id); g.begin(c, true);
  const s=g.getState(); s.placed=c.floors.length; s.carregat=true; s.phase=g.PHASE.UP; s.climbing=false;
  g.draw();
  fs.writeFileSync(file, realCanvas.toBuffer('image/png')); console.log('wrote',file);
}
function closeup(file){
  realCanvas.width=520; realCanvas.height=340;
  const ctx=g.getCtx();
  const grd=ctx.createLinearGradient(0,0,0,340); grd.addColorStop(0,'#7fbcd8'); grd.addColorStop(1,'#dbe9d0');
  ctx.fillStyle=grd; ctx.fillRect(0,0,520,340);
  g.setLevelH(150);
  // front trunk casteller (arms spread), a back one, and the enxaneta (aleta)
  g.drawCasteller(130,300,1,false,false,1,false,0,{spread:true,reach:0.5});
  g.drawCasteller(270,300,1,false,false,1,false,0,{back:true});
  g.drawCasteller(410,300,5,true,true,1,false,0,{helmet:true,legsApart:true});
  fs.writeFileSync(file, realCanvas.toBuffer('image/png')); console.log('wrote',file);
}
scene('t3de7','/tmp/live_3de7.png');
scene('p8','/tmp/live_p8.png');
closeup('/tmp/live_close.png');
