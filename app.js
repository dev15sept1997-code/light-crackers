// ==== CONFIG: shop WhatsApp number (country code, digits only, no +) ====
const WHATSAPP_NUMBER = '918708073865';
const SHOP = 'Light Crackers, Narnaul';

const CATS = {
 'Sparklers':['✨','#3a2a08'],'Flower Pots':['🌋','#3d1a0a'],'Ground Chakkars':['🌀','#0d2a3a'],
 'Rockets':['🚀','#1a1a3d'],'Aerial/Multi-colour Shots':['🎆','#2a0d3a'],'Fountains':['⛲','#0d3a2a'],
 'Fancy/Novelty':['🎉','#3a0d2a'],'Bombs/Atom':['💥','#3a0d0d'],'Kids/Baby items':['🧒','#2a3a0d'],
 'Gift Boxes/Combos':['🎁','#3a250d'],'Wala/Garland':['🧨','#3a100d'],'Pencils':['✏️','#2a2a2a'],'Twinkling Stars':['🌟','#1d2340']};
const COMBOS = [
 {id:'c-kids',ic:'🧒',name:'Kids Combo',price:3999,desc:'Sparklers, small flower pots, mini chakkars — gentle & fun.'},
 {id:'c-family',ic:'👨‍👩‍👧',name:'Family Combo',price:7999,desc:'Balanced mix of sparklers, anars, chakkars & sky shots.'},
 {id:'c-mega',ic:'🎆',name:'Mega Combo',price:13999,desc:'Big variety with rockets & multi-colour shots.'},
 {id:'c-premium',ic:'🎁',name:'Premium Gift Box',price:19999,desc:'Elegant gift box for family & corporate gifting.'}];
const PAGE = 24;
const STATES = ['Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka','Kerala','Ladakh','Lakshadweep','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];
const $ = s => document.querySelector(s);
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

let P = [], byId = {}, cart = {}, st = {cat:'All', q:'', max:0, sort:'name', green:false, shown:PAGE};
try { cart = JSON.parse(localStorage.getItem('lc-enq') || '{}'); } catch(e) {}
const save = () => { try { localStorage.setItem('lc-enq', JSON.stringify(cart)); } catch(e) {} };

function qtyCtl(id){
  const q = cart[id] || 0;
  return q ? `<div class="qty"><button class="minus" data-a="-" data-id="${id}" aria-label="Decrease">−</button><span aria-live="polite">${q}</span><button class="plus" data-a="+" data-id="${id}" aria-label="Increase">+</button></div>`
           : `<button class="addb" data-a="+" data-id="${id}">+ Add to enquiry</button>`;
}
const priceHtml = p => p.price != null ? `<div class="price">${inr(p.price)}</div><div class="ind">Indicative price, final at shop</div>` : `<div class="price na">Price on request</div>`;

function cardHtml(p){
  const [ic,bg] = CATS[p.cat] || ['🎇','#2a1a30'];
  return `<article class="card${cart[p.id]?' in':''}" data-card="${p.id}">
   <div class="art" style="background:linear-gradient(135deg,${bg},#120d1b)" aria-hidden="true">${ic}</div>
   <div class="cb"><h3>${esc(p.name)}</h3><div class="meta">${esc(p.cat)}${p.pack?' · '+esc(p.pack):''}</div>
   ${p.green?'<div class="gt">🌿 Green tagged</div>':''}${priceHtml(p)}<div class="ctl">${qtyCtl(p.id)}</div></div></article>`;
}

function filtered(){
  const q = st.q.trim().toLowerCase();
  let r = P.filter(p => (st.cat==='All'||p.cat===st.cat) && (!q || (p.name+' '+p.cat+' '+p.brand).toLowerCase().includes(q))
     && (p.price==null || p.price<=st.max) && (!st.green||p.green));
  const big = 1e12;
  if (st.sort==='low') r.sort((a,b)=>(a.price??big)-(b.price??big));
  else if (st.sort==='high') r.sort((a,b)=>(b.price??-1)-(a.price??-1));
  else r.sort((a,b)=>a.name.localeCompare(b.name));
  return r;
}
function render(){
  const r = filtered();
  $('#resCount').textContent = `${r.length} product${r.length===1?'':'s'} found`;
  $('#grid').innerHTML = r.slice(0, st.shown).map(cardHtml).join('') || '<p class="empty">No products match. Try another search.</p>';
  $('#more').hidden = r.length <= st.shown;
}
function chips(){
  const counts = {All:P.length}; P.forEach(p => counts[p.cat]=(counts[p.cat]||0)+1);
  const order = ['All', ...Object.keys(counts).filter(c=>c!=='All').sort((a,b)=>counts[b]-counts[a])];
  $('#chips').innerHTML = order.map(c => `<button class="chip" role="tab" aria-selected="${c===st.cat}" data-cat="${esc(c)}">${c==='All'?'🪔':(CATS[c]||['🎇'])[0]} ${esc(c)}<small>${counts[c]}</small></button>`).join('');
}
function find(id){ return byId[id] || COMBOS.find(c=>c.id===id); }
function setQty(id, d){
  cart[id] = Math.max(0, (cart[id]||0) + d); if (!cart[id]) delete cart[id];
  save(); refreshCtl(id); renderDrawer();
}
function refreshCtl(id){
  document.querySelectorAll(`[data-card="${id}"]`).forEach(c => { c.classList.toggle('in', !!cart[id]); c.querySelector('.ctl').innerHTML = qtyCtl(id); });
}
function renderDrawer(){
  const ids = Object.keys(cart).filter(find);
  const n = ids.reduce((s,i)=>s+cart[i],0);
  $('#badge').textContent = $('#fabCount').textContent = n;
  let total = 0, unpriced = 0;
  $('#items').innerHTML = ids.length ? ids.map(id => { const p = find(id);
    if (p.price!=null) total += p.price*cart[id]; else unpriced++;
    return `<div class="it"><div class="n">${esc(p.name)}<small>${p.price!=null?inr(p.price)+' each':'Price on request'}${id.startsWith('c-')?' · sample':''}</small></div>${qtyCtl(id)}</div>`; }).join('')
    : '<p class="empty">Your list is empty. Add products with “+”.</p>';
  $('#total').textContent = inr(total) + (unpriced?` + ${unpriced} on request`:'');
}
function waLink(){
  const ids = Object.keys(cart).filter(find); let total = 0;
  const lines = ids.map((id,i)=>{ const p=find(id), q=cart[id]; if(p.price!=null) total+=p.price*q;
    return `${i+1}. ${p.name}${p.pack?' ('+p.pack+')':''} x ${q}${p.price!=null?' – approx '+inr(p.price*q):' – price on request'}`; });
  const v = id => $(id).value.trim();
  let m = `Namaste ${SHOP}! 🪔 Diwali 2026 enquiry:\n\nName: ${v('#cname')}\nState/UT: ${v('#cstate')}\nCity/District: ${v('#ccity')}\nPIN: ${v('#cpin')}\n\n${lines.join('\n')||'(no items)'}\n\nIndicative total: ${inr(total)}\nPlease confirm stock, final price and whether this is possible for my location.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(m)}`;
}
function openDrawer(o){ $('#drawer').classList.toggle('open',o); $('#drawer').setAttribute('aria-hidden',!o); $('#scrim').hidden=!o; if(o) $('#closeDrawer').focus(); }

function init(data){
  P = data; P.forEach(p=>byId[p.id]=p);
  const maxP = Math.ceil(Math.max(...P.map(p=>p.price||0))/50)*50;
  st.max = maxP; const r = $('#price'); r.max = maxP; r.value = maxP; $('#pv').textContent = inr(maxP);
  $('#heroCount').textContent = P.length + '+';
  $('#comboGrid').innerHTML = COMBOS.map(c=>`<div class="combo" data-card="${c.id}"><span class="tag">SAMPLE PRICE</span><div class="ic">${c.ic}</div><h3>${c.name}</h3><p>${c.desc}</p><div class="price">${inr(c.price)}*</div><div class="ctl">${qtyCtl(c.id)}</div></div>`).join('');
  chips(); render(); renderDrawer();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]'); if (b) { setQty(b.dataset.id.startsWith('c-')?b.dataset.id:+b.dataset.id, b.dataset.a==='+'?1:-1); return; }
  const c = e.target.closest('.chip'); if (c) { st.cat=c.dataset.cat; st.shown=PAGE; chips(); render(); }
});
let t; $('#q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(()=>{ st.q=e.target.value; st.shown=PAGE; render();
  if (st.q && window.scrollY < $('#catalogue').offsetTop-100) $('#catalogue').scrollIntoView(); }, 150); });
$('#price').addEventListener('input', e => { st.max=+e.target.value; $('#pv').textContent=inr(st.max); st.shown=PAGE; render(); });
$('#sort').addEventListener('change', e => { st.sort=e.target.value; render(); });
$('#greenOnly').addEventListener('change', e => { st.green=e.target.checked; st.shown=PAGE; render(); });
$('#more').addEventListener('click', () => { st.shown+=PAGE; render(); });
['#openDrawer','#fab'].forEach(s=>$(s).addEventListener('click',()=>openDrawer(true)));
$('#closeDrawer').addEventListener('click',()=>openDrawer(false)); $('#scrim').addEventListener('click',()=>openDrawer(false));
document.addEventListener('keydown', e => { if (e.key==='Escape') openDrawer(false); });
$('#cstate').insertAdjacentHTML('beforeend', STATES.map(s=>`<option>${s}</option>`).join(''));
try { const f = JSON.parse(localStorage.getItem('lc-cust')||'{}'); ['cname','cstate','ccity','cpin'].forEach(k=>{ if(f[k]) $('#'+k).value=f[k]; }); } catch(e) {}
$('#cpin').addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g,'').slice(0,6));
$('#enqForm').addEventListener('submit', e => {
  e.preventDefault(); const f = e.target, err = $('#ferr');
  f.querySelectorAll('[aria-invalid]').forEach(x=>x.removeAttribute('aria-invalid'));
  const bad = [...f.querySelectorAll('input,select')].filter(x=>!x.value.trim()||!x.checkValidity());
  if (bad.length) { bad.forEach(x=>x.setAttribute('aria-invalid','true')); err.textContent = 'Please fill Name, State, City/District and a valid 6-digit PIN code.'; bad[0].focus(); return; }
  if (!Object.keys(cart).length) { err.textContent = 'Add at least one product to your list.'; return; }
  err.textContent = '';
  try { localStorage.setItem('lc-cust', JSON.stringify({cname:$('#cname').value,cstate:$('#cstate').value,ccity:$('#ccity').value,cpin:$('#cpin').value})); } catch(e) {}
  window.open(waLink(), '_blank', 'noopener');
});
$('#clear').addEventListener('click', () => { const ids=Object.keys(cart); cart={}; save(); ids.forEach(i=>refreshCtl(isNaN(i)?i:+i)); renderDrawer(); });

fetch('products.json').then(r=>{ if(!r.ok) throw 0; return r.json(); })
  .then(init).catch(()=>init(window.PRODUCTS_FALLBACK||[]));

/* ---- Fireworks canvas ---- */
(function(){
  const cv = $('#fw'), x = cv.getContext('2d'); let W,H,parts=[],rockets=[];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cols = ['#f6c453','#ff7a1a','#ff4d6d','#7cf5ff','#b18cff','#9dff8a','#fff3c4'];
  function size(){ const d=Math.min(devicePixelRatio||1,2); W=cv.clientWidth; H=cv.clientHeight; cv.width=W*d; cv.height=H*d; x.setTransform(d,0,0,d,0,0); }
  size(); addEventListener('resize', size);
  function launch(){ rockets.push({x:W*(.15+Math.random()*.7), y:H, vy:-(H/60+Math.random()*3), ty:H*(.15+Math.random()*.35), c:cols[Math.random()*cols.length|0]}); }
  function burst(r){ const n=60+Math.random()*40|0; for(let i=0;i<n;i++){ const a=Math.PI*2*i/n, s=1+Math.random()*3.5;
    parts.push({x:r.x,y:r.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,c:Math.random()<.2?'#fff3c4':r.c}); } }
  let visible = true; new IntersectionObserver(e=>visible=e[0].isIntersecting).observe(cv);
  function frame(){
    requestAnimationFrame(frame); if (!visible) return;
    x.globalCompositeOperation='destination-out'; x.fillStyle='rgba(0,0,0,.18)'; x.fillRect(0,0,W,H);
    x.globalCompositeOperation='lighter';
    if (Math.random() < .035 || rockets.length+parts.length===0) launch();
    rockets = rockets.filter(r => { r.y+=r.vy; x.fillStyle=r.c; x.fillRect(r.x,r.y,2,6); if (r.y<=r.ty){ burst(r); return false; } return true; });
    parts = parts.filter(p => { p.x+=p.vx; p.y+=p.vy; p.vy+=.04; p.vx*=.985; p.vy*=.985; p.l-=.012;
      x.globalAlpha=Math.max(p.l,0); x.fillStyle=p.c; x.beginPath(); x.arc(p.x,p.y,1.8,0,7); x.fill(); return p.l>0; });
    x.globalAlpha=1;
  }
  if (reduce) { for(let i=0;i<4;i++){ launch(); rockets[i].y=rockets[i].ty; burst(rockets[i]); } rockets=[]; for(let k=0;k<40;k++){parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.04;})} parts.forEach(p=>{x.fillStyle=p.c;x.fillRect(p.x,p.y,2,2)}); }
  else frame();
})();
