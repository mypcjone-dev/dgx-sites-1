const KEY='dailysheet.v1',TK='dailysheet.theme2',$=id=>document.getElementById(id);
const TC=['#d92d20','#16803c','#1d4ed8','#c2570c','#7e3fd1'],HL=['#fde68a','#bbf7d0','#fbcfe8','#bfdbfe'];
const THEMES=[['sunrise','Sunrise','#f7efe4','#c2410c'],['ocean','Ocean','#eaf4fb','#0369a1'],['forest','Forest','#eaf3ec','#15803d'],['rose','Rose','#fbeef1','#be123c'],['lavender','Lavender','#f1eefb','#6d28d9'],['night','Night','#0d1019','#fbbf24'],['midnight','Midnight','#07131f','#38bdf8'],['graphite','Graphite','#121314','#4ade80']];
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const cell=v=>({v:v||'',b:0,c:'',h:''});
function blank(cols,ai){cols=cols||['Item','Amount','Notes'];ai=ai==null?1:ai;return{id:String(Date.now()+Math.random()),date:today(),title:'',cols:cols.slice(),ai,rows:Array.from({length:6},()=>cols.map(()=>cell()))}}
function sample(){const s=blank();s.title='Example: Shop expenses';[['Tea & snacks','120','Example row, edit me'],['Stock purchase','4500',''],['Transport','350',''],['Electricity','900','']].forEach((r,i)=>r.forEach((v,j)=>s.rows[i][j].v=v));s.rows[1][1].b=1;s.rows[1][1].h=HL[0];s.rows[3][1].c=TC[0];return s}
function norm(s){if(s.ai==null||s.ai<0||s.ai>=s.cols.length||s.cols[s.ai]!=='Amount'){let i=s.cols.indexOf('Amount');if(i<0){s.cols.push('Amount');s.rows.forEach(r=>r.push(cell()));i=s.cols.length-1}s.ai=i}}
let S=null;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||!S.sheets||!S.sheets.length){const s=sample();S={sheets:[s]}}
if(S.sym==null)S.sym='₹';
S.sheets.forEach(norm);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
let curId=null,day=today(),sel=null,inp=[];
const cur=()=>S.sheets.find(s=>s.id===curId);
const num=v=>{const t=String(v).trim();return /^[₹$€]?\s*-?[\d,]*\.?\d+$/.test(t)?parseFloat(t.replace(/[₹$€,\s]/g,'')):null};
const money=n=>n.toLocaleString('en-IN',{maximumFractionDigits:2});
const rs=n=>S.sym+money(n);
const pd=d=>{const p=d.split('-');return new Date(+p[0],+p[1]-1,+p[2])};
const nice=d=>pd(d).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
function st(el,k){el.style.fontWeight=k.b?'700':'';el.style.color=k.c||(k.h?'#1f1a16':'');el.style.background=k.h||''}

/* date list (home) */
function showList(){curId=null;$('sheetView').hidden=true;$('listView').hidden=false;const g=$('grid');g.innerHTML='';const t=today();
 const items=S.sheets.filter(s=>s.date!==t).sort((a,b)=>b.date.localeCompare(a.date));
 const ts=S.sheets.filter(s=>s.date===t);
 const all=(ts.length?ts:[{id:null,date:t}]).concat(items);
 all.forEach(s=>{const d=pd(s.date),b=document.createElement('button');b.type='button';b.className='dc'+(s.date===t?' today':'');
  b.innerHTML=(s.date===t?'<span class="pill">Today</span>':'<span class="wk">&nbsp;</span>')+'<span class="dd">'+String(d.getDate()).padStart(2,'0')+'</span><span class="mm">'+d.toLocaleDateString('en-IN',{month:'long',year:'numeric'})+'</span><span class="wk">'+d.toLocaleDateString('en-IN',{weekday:'long'})+'</span>';
  b.setAttribute('aria-label','Open '+nice(s.date));b.onclick=()=>openDay(s);g.appendChild(b)});
 scrollTo(0,0)}
function openDay(s){if(!s.id){const b=S.sheets.slice().sort((a,c)=>c.date.localeCompare(a.date))[0];s=blank(b?b.cols:null,b?b.ai:null);S.sheets.push(s);save()}
 curId=s.id;$('listView').hidden=true;$('sheetView').hidden=false;render();scrollTo(0,0)}

/* sheet */
function totals(){const s=cur();
 s.cols.forEach((_,c)=>{let t=0,any=false;s.rows.forEach(r=>{const n=num(r[c].v);if(n!==null){t+=n;any=true}});const e=$('t'+c);if(e)e.textContent=any?(c===s.ai?rs(t):'Total '+money(t)):''});
 const a=[];s.rows.forEach(r=>{const n=num(r[s.ai].v);if(n!==null)a.push(n)});const sum=a.reduce((x,y)=>x+y,0);
 $('gt').textContent=rs(sum);$('cnt').textContent=a.length;$('hi').textContent=rs(a.length?Math.max(...a):0);$('avg').textContent=rs(a.length?sum/a.length:0)}

function render(){const s=cur();sel=null;inp=[];$('title').value=s.title;$('sym').value=S.sym;
 $('dateTxt').textContent=nice(s.date);$('pill').textContent=s.date===today()?'Today':'Past day';
 const hr=$('hr'),tb=$('tb'),ft=$('ft');hr.innerHTML='';tb.innerHTML='';ft.innerHTML='';
 s.cols.forEach((name,c)=>{const th=document.createElement('th');const i=document.createElement('input');i.value=name;i.setAttribute('aria-label','Column name');
  if(c===s.ai){th.className='amt';i.readOnly=true;i.title='Permanent column';th.appendChild(i);th.insertAdjacentHTML('beforeend','<span class="lock" title="Permanent column"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span>')}
  else{i.oninput=()=>{s.cols[c]=i.value;save()};th.appendChild(i);const x=document.createElement('button');x.className='x';x.type='button';x.textContent='×';x.title='Delete column';x.setAttribute('aria-label','Delete column');x.onclick=()=>{s.cols.splice(c,1);s.rows.forEach(r=>r.splice(c,1));if(c<s.ai)s.ai--;save();render()};th.appendChild(x)}
  hr.appendChild(th);const f=document.createElement('td');f.id='t'+c;if(c===s.ai)f.className='amt';ft.appendChild(f)});
 hr.appendChild(document.createElement('th'));
 s.rows.forEach((row,r)=>{const tr=document.createElement('tr');inp[r]=[];
  row.forEach((k,c)=>{const td=document.createElement('td');const i=document.createElement('input');i.type='text';i.value=k.v;i.setAttribute('aria-label',s.cols[c]+' row '+(r+1));inp[r][c]=i;
   if(c===s.ai){td.className='amt';i.inputMode='decimal';i.placeholder='0'}
   st(i,k);i.onfocus=()=>{sel={r,c};$('hint').textContent='Selected: '+s.cols[c]+', row '+(r+1)};
   i.oninput=()=>{k.v=i.value;save();totals()};td.appendChild(i);tr.appendChild(td)});
  const td=document.createElement('td');const x=document.createElement('button');x.className='x';x.type='button';x.textContent='×';x.title='Delete row';x.setAttribute('aria-label','Delete row '+(r+1));x.onclick=()=>{s.rows.splice(r,1);if(!s.rows.length)s.rows.push(s.cols.map(()=>cell()));save();render()};td.appendChild(x);tr.appendChild(td);tb.appendChild(tr)});
 ft.insertAdjacentHTML('beforeend','<td></td>');
 totals()}

function fmt(f){if(!sel)return;const s=cur();const cs=$('wr').checked?s.cols.map((_,c)=>c):[sel.c];cs.forEach(c=>{const k=s.rows[sel.r][c];f(k);st(inp[sel.r][c],k)});save()}
function swatches(id,colors,key){colors.concat(['']).forEach(c=>{const b=document.createElement('button');b.type='button';b.className='sw';b.style.background=c||'var(--btn)';b.setAttribute('aria-label',c?key+' '+c:'No '+key);if(!c){b.textContent='∅';b.style.fontSize='14px'}b.onmousedown=e=>{e.preventDefault();fmt(k=>k[key==='text colour'?'c':'h']=c)};$(id).appendChild(b)})}
swatches('tc',TC,'text colour');swatches('hc',HL,'highlight');
$('bold').onmousedown=e=>{e.preventDefault();fmt(k=>k.b=k.b?0:1)};
$('clr').onmousedown=e=>{e.preventDefault();fmt(k=>{k.b=0;k.c='';k.h=''})};
$('title').oninput=e=>{cur().title=e.target.value;save()};
$('back').onclick=showList;
$('sym').onchange=e=>{S.sym=e.target.value;save();totals()};
$('sort').onclick=()=>{const s=cur();const v=r=>{const n=num(r[s.ai].v);return n===null?-Infinity:n};s.rows=s.rows.map((r,i)=>[r,i]).sort((a,b)=>v(b[0])-v(a[0])||a[1]-b[1]).map(x=>x[0]);save();render()};
$('copy').onclick=()=>{const s=cur();const L=[nice(s.date)+(s.title?' - '+s.title:'')];s.rows.forEach(r=>{const t=r.map(k=>k.v.trim()).filter(Boolean).join(' - ');if(t)L.push(t)});L.push('Total: '+$('gt').textContent);const t=L.join('\n');
 const ok=()=>{$('hint').textContent='Summary copied.'},bad=()=>{$('hint').textContent='Copy is blocked here. Select the text and copy it yourself.'};
 try{navigator.clipboard.writeText(t).then(ok,bad)}catch(e){bad()}};
function twice(id,label,fn){let a=0;const b=$(id);b.onclick=()=>{if(!a){a=1;b.textContent='Sure? Click again';setTimeout(()=>{a=0;b.textContent=label},3000);return}a=0;b.textContent=label;fn()}}
twice('clrDay','Clear day',()=>{const s=cur();s.rows=s.rows.map(r=>r.map(()=>cell()));save();render()});
twice('delDay','Delete day',()=>{S.sheets=S.sheets.filter(s=>s.id!==curId);save();showList()});
$('addRow').onclick=()=>{const s=cur();s.rows.push(s.cols.map(()=>cell()));save();render();const i=$('tb').lastChild.querySelector('input');if(i)i.focus()};
$('addCol').onclick=()=>{const s=cur();s.cols.splice(s.ai,0,'Column '+s.cols.length);s.rows.forEach(r=>r.splice(s.ai,0,cell()));s.ai++;save();render()};

/* themes */
const root=document.documentElement;
function applyTheme(id,keep){root.dataset.t=id;if(!keep)try{localStorage.setItem(TK,id)}catch(e){}[...$('tp').children].forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===id))}
THEMES.forEach(t=>{const b=document.createElement('button');b.type='button';b.dataset.id=t[0];b.innerHTML='<span class="dot" style="background:'+t[2]+';border-color:'+t[3]+'"><i style="display:block;width:8px;height:8px;border-radius:50%;background:'+t[3]+';margin:5px"></i></span>'+t[1];b.onclick=()=>applyTheme(t[0]);$('tp').appendChild(b)});
let saved=null;try{saved=localStorage.getItem(TK)}catch(e){}
applyTheme(THEMES.some(t=>t[0]===saved)?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'night':'sunrise'),!saved);
$('themeBtn').onclick=e=>{e.stopPropagation();const h=$('tp').hidden;$('tp').hidden=!h;$('themeBtn').setAttribute('aria-expanded',String(h))};
document.addEventListener('click',e=>{if(!$('tp').hidden&&!$('tp').contains(e.target)){$('tp').hidden=true;$('themeBtn').setAttribute('aria-expanded','false')}});

/* new day while page stays open */
addEventListener('focus',()=>{if(day!==today()){day=today();if(!curId)showList()}});
showList();
