(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
// ---- data
const MENU={coffee:[['Espresso',3.25,'Local roaster, rotating single origin',''],['Oat cortado',4.75,'Half espresso, half steamed oat milk','VG'],['Cardamom latte',5.5,'House cardamom-honey syrup',''],['Cold brew',4.5,'Steeped 18 hours, served black or sweet cream','VG'],['Chai',5,'Spiced black tea, steamed milk',''],['Hot chocolate',4.5,'Dark chocolate, whipped cream','GF']],
pastry:[['Butter croissant',4,'Laminated by hand every night',''],['Almond croissant',5.25,'Twice-baked, frangipane, toasted almonds',''],['Cardamom bun',4.75,'Swedish-style knot, pearl sugar',''],['Olive-oil cake',4.5,'Orange, rosemary, flaky salt','GF'],['Vegan blueberry muffin',4,'Oat streusel','VG'],['Sourdough loaf',9,'48-hour ferment, out at 11am','VG']],
lunch:[['Breakfast sandwich',9.5,'Egg, cheddar, chive aioli on a croissant',''],['Turkey & brie',12,'Fig jam, arugula, sourdough',''],['Roasted veg panini',11,'Peppers, zucchini, pesto, focaccia','VG'],['Harvest salad',11.5,'Greens, squash, farro, goat cheese',''],['Tomato soup',7,'With a grilled-cheese dipper','']]};
const REVIEWS=[['Maya R.','Best almond croissant in the city, and the staff remember my order. Old City is lucky.'],['Derek P.','Ordered ahead on the site, walked in, coffee was waiting. Exactly how it should work.'],['Sofia L.','Catered our office breakfast for 30. Everything showed up on time and looked beautiful.'],['James K.','Cozy, quiet in the mornings, great wifi. My go-to before work.'],['Priya S.','Vegan muffin + oat cortado = perfect Saturday. The back garden is a hidden gem.']];
const HOURS=[['Sunday',8,15],['Monday',7,16],['Tuesday',7,16],['Wednesday',7,16],['Thursday',7,17],['Friday',7,17],['Saturday',8,16]];
const fmt=h=>{const p=h>=12?'pm':'am';const x=h%12||12;return x+p};
// ---- open now
const now=new Date();const d=now.getDay(),h=now.getHours()+now.getMinutes()/60;const [,o,cl]=HOURS[d];const isOpen=h>=o&&h<cl;
const pill=$('#openPill');pill.classList.add(isOpen?'open':'closed');pill.querySelector('b').textContent=isOpen?`Open now · until ${fmt(cl)}`:`Closed · opens ${fmt(HOURS[(h>=cl?(d+1)%7:d)][1])}`;
$('#hoursList').innerHTML=HOURS.map((x,i)=>`<li class="${i===d?'today':''}"><span>${x[0]}${i===d?' · today':''}</span><span>${fmt(x[1])} – ${fmt(x[2])}</span></li>`).join('');
// ---- menu
const cart=new Map();
function renderMenu(tab){$('#menuGrid').innerHTML=MENU[tab].map((m,i)=>`<article class="item${cart.has(m[0])?' added':''}" data-name="${m[0]}" data-price="${m[1]}" style="animation-delay:${i*60}ms"><h3>${m[0]}${m[3]?`<em class="tag">${m[3]}</em>`:''}<span>$${m[1].toFixed(2)}</span></h3><p>${m[2]}</p><div class="add">${cart.has(m[0])?'✓':'+'}</div></article>`).join('');bindTilt();}
$$('.tab').forEach(t=>t.onclick=()=>{$$('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');renderMenu(t.dataset.tab);});
$('#menuGrid').addEventListener('click',e=>{const it=e.target.closest('.item');if(!it)return;const n=it.dataset.name;if(cart.has(n))cart.delete(n);else cart.set(n,+it.dataset.price);it.classList.toggle('added');it.querySelector('.add').textContent=cart.has(n)?'✓':'+';});
renderMenu('coffee');
// ---- tilt
function bindTilt(){$$('.item').forEach(el=>{el.onpointermove=e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`rotateY(${x*12}deg) rotateX(${-y*12}deg) translateZ(0)`;};el.onpointerleave=()=>el.style.transform='';});}
// ---- magnetic buttons
$$('.magnetic').forEach(b=>{b.onpointermove=e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.3}px)`;};b.onpointerleave=()=>b.style.transform='';});
// ---- reviews
$('#reviewTrack').innerHTML=REVIEWS.map(r=>`<div class="review reveal"><div class="stars">★★★★★</div><p>“${r[1]}”</p><div class="who"><i>${r[0][0]}</i>${r[0]} · Google review (sample)</div></div>`).join('');
// ---- reveal + counters
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);
  e.target.querySelectorAll('[data-count]').forEach(c=>{const end=+c.dataset.count;const t0=performance.now();const step=t=>{const k=Math.min(1,(t-t0)/1400);c.textContent=Math.round(end*(1-Math.pow(1-k,3))).toLocaleString();if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step);});}}),{threshold:.15});
$$('.reveal').forEach(el=>io.observe(el));
// ---- parallax gallery
const rows=$$('.g-row');addEventListener('scroll',()=>{rows.forEach(r=>{const rect=r.getBoundingClientRect();r.style.transform=`translateX(${(rect.top-innerHeight/2)*+r.dataset.speed}px)`;});},{passive:true});
// ---- booking modal
const modal=$('#bookModal');let type='pickup',day=0,slot=null;
const TITLES={pickup:'Order ahead',table:'Book a table',catering:'Plan catering'};
function days(){const out=[];for(let i=0;i<(type==='catering'?7:4);i++){const dt=new Date();dt.setDate(dt.getDate()+i+(type==='catering'?2:0));out.push(dt);}return out;}
function renderBook(){modal.querySelectorAll('#bookSeg button').forEach(b=>b.classList.toggle('on',b.dataset.type===type));$('#bookTitle').textContent=TITLES[type];
  $('#partyRow').style.display=type==='pickup'?'none':'block';$('#bParty').value=type==='catering'?20:2;
  const items=[...cart.entries()];$('#cartBox').innerHTML=type!=='pickup'?'':items.length?`<ul>${items.map(([n,p])=>`<li><span>${n}</span><span>$${p.toFixed(2)}</span></li>`).join('')}</ul><b>Total $${items.reduce((a,[,p])=>a+p,0).toFixed(2)}</b>`:'Tip: tap menu items to add them. Or just pick a time and we\'ll ask what you want.';
  $('#days').innerHTML=days().map((dt,i)=>`<button class="${i===day?'on':''}" data-i="${i}">${i===0&&type!=='catering'?'Today':dt.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</button>`).join('');
  const base=type==='table'?[8,9,10,11,12,13,14]:type==='catering'?[7,8,9,11,12]:[7,7.5,8,8.5,9,10,11,12,13,14];
  $('#slots').innerHTML=base.map((s,i)=>{const lbl=`${Math.floor(s)%12||12}:${s%1?'30':'00'}${s>=12?'pm':'am'}`;const dis=(day===0&&type!=='catering'&&s<=new Date().getHours())||(i%4===2);return `<button ${dis?'disabled':''} class="${slot===lbl?'on':''}" data-s="${lbl}">${lbl}</button>`}).join('');}
function openBook(t){type=t;day=0;slot=null;modal.classList.remove('done');modal.classList.add('show');modal.setAttribute('aria-hidden','false');renderBook();}
$$('[data-book]').forEach(b=>b.addEventListener('click',()=>openBook(b.dataset.book)));
modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-close]')){modal.classList.remove('show');modal.setAttribute('aria-hidden','true');}
  const sb=e.target.closest('#bookSeg button');if(sb){type=sb.dataset.type;slot=null;day=0;renderBook();}
  const db=e.target.closest('#days button');if(db){day=+db.dataset.i;slot=null;renderBook();}
  const ss=e.target.closest('#slots button');if(ss&&!ss.disabled){slot=ss.dataset.s;renderBook();}});
$('#bConfirm').onclick=()=>{const name=$('#bName').value.trim()||'Jamie';if(!slot){$('#slots').animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:300});return;}
  const dl=$('#days .on').textContent;const what=type==='pickup'?'Your pickup order':type==='table'?`Table for ${$('#bParty').value}`:`Catering for ${$('#bParty').value}`;
  $('#doneText').textContent=`${what} is booked for ${dl} at ${slot}. A confirmation text is on its way to ${$('#bPhone').value||'your phone'}.`;$('#smsName').textContent=name;modal.classList.add('done');};
addEventListener('keydown',e=>{if(e.key==='Escape'){modal.classList.remove('show');chat.classList.remove('show');}});
// ---- chatbot
const chat=$('#chat'),body=$('#chatBody');let greeted=false;
const CHIPS=['Are you open now?','Vegan options?','Order ahead','Catering for 25','Parking?','Dogs allowed?'];
const A=[
 [/open|hour|close|time/i,()=>isOpen?`Yes, we're open right now until ${fmt(cl)} today. ☕`:`We're closed right now. Today's hours are ${fmt(o)}–${fmt(cl)}. Want to order ahead for tomorrow morning?`],
 [/vegan|gluten|gf|vg|dairy|allerg/i,()=>'Yes! Vegan: oat cortado, cold brew, vegan blueberry muffin, roasted veg panini and our sourdough. Gluten-free: olive-oil cake and hot chocolate. Oat and almond milk are free.'],
 [/order|pickup|pick up|ahead/i,()=>'You can order ahead in about 20 seconds. <button class="inline" data-act="pickup">Start a pickup order →</button>'],
 [/cater|office|event|party|group|\d{2}\s*(people|ppl)?/i,()=>'We do pastry boxes, coffee carafes and sandwich platters for 10–80 people, booked 48h ahead. Most offices spend $12–18 a head. <button class="inline" data-act="catering">Plan catering →</button>'],
 [/table|reserv|book|seat/i,()=>'We hold a few tables for groups. <button class="inline" data-act="table">Book a table →</button>'],
 [/park/i,()=>'Street parking on 3rd and 2nd (2-hour meters) and the Bourse garage is 3 minutes away.'],
 [/dog|pet/i,()=>'Dogs are welcome in the back garden, and we keep water bowls and treats out. 🐶'],
 [/wifi|wi-fi|laptop|work/i,()=>'Free wifi and outlets along the window bar. Laptops welcome all day except weekend 10am–1pm.'],
 [/price|cost|how much|\$/i,()=>'Coffee is $3.25–5.50, pastries $4–5.25, lunch $7–12. Full menu is in the Menu section above.'],
 [/where|address|located|direction/i,()=>'We\'re on 3rd St in Old City, two blocks from Independence Hall. <a href="https://www.google.com/maps/search/?api=1&query=Old+City+Philadelphia" target="_blank" rel="noopener">Directions →</a>'],
 [/hi|hello|hey/i,()=>'Hi! 👋 What can I help with?'],
 [/thank/i,()=>'Anytime! See you soon. 🥐']];
function say(html,who='bot'){const m=document.createElement('div');m.className='msg '+who;m.innerHTML=html;body.appendChild(m);body.scrollTop=body.scrollHeight;}
function reply(q){const t=document.createElement('div');t.className='msg bot typing';t.innerHTML='<i></i><i></i><i></i>';body.appendChild(t);body.scrollTop=body.scrollHeight;
  setTimeout(()=>{t.remove();const hit=A.find(([re])=>re.test(q));say(hit?hit[1]():'Good question. I\'ll pass that to the team and they\'ll text you back. Can I get your number? (Demo: on a live site this lead goes straight to the owner\'s phone.)');},650+Math.random()*500);}
function openChat(){chat.classList.add('show');chat.setAttribute('aria-hidden','false');if(!greeted){greeted=true;say('Hi! I\'m the Hearth &amp; Third assistant. I can answer questions about hours, the menu, ordering ahead and catering. 🥐');$('#chips').innerHTML=CHIPS.map(c=>`<button>${c}</button>`).join('');}setTimeout(()=>$('#chatInput').focus({preventScroll:true}),300);}
$('#chatFab').onclick=()=>chat.classList.contains('show')?chat.classList.remove('show'):openChat();
$('#chatClose').onclick=()=>chat.classList.remove('show');
$('#chips').onclick=e=>{if(e.target.tagName==='BUTTON'){say(e.target.textContent,'me');reply(e.target.textContent);}};
$('#chatForm').onsubmit=e=>{e.preventDefault();const v=$('#chatInput').value.trim();if(!v)return;$('#chatInput').value='';say(v.replace(/</g,'&lt;'),'me');reply(v);};
body.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b)openBook(b.dataset.act);});
// nudge
setTimeout(()=>{if(!greeted&&innerWidth>700)openChat();},9000);
})();
