(() => {
  'use strict';
  const $ = s => document.querySelector(s), all = s => Array.from(document.querySelectorAll(s));
  const ru = document.documentElement.lang === 'ru', t = (r,e) => ru ? r : e;
  const form = $('#brief'), list = $('#port-list'), role = $('#role'), add = $('#add-port');
  const roles = ['origin','via','destination'];
  const field = name => form.elements.namedItem(name), val = name => field(name).value.trim();
  const ports = new Map(all('.port-card').map(card => {
    const d = card.dataset;
    return [d.code,{...d, x:+d.x, y:+d.y, card, pin:$(`[data-port="${d.code}"]`)}];
  }));
  const known = name => [...ports.values()].find(p => p.name.toLowerCase() === name.trim().toLowerCase());
  const labelOf = name => field(name).labels[0].childNodes[0].textContent.trim().replace(/\s*\*$/,'');
  const chosen = () => ports.get(list.value);
  const status = $('#atlas-status'), draftStatus = $('#draft-status'), draft = $('#draft'), body = $('#draft-body');
  const svg = $('#chart-svg'), land = $('#land'), plot = $('.plot');
  // Same equirectangular transform for land, anchors and graticule. Labels stay in CSS pixels.
  let zoom = 1, cx = 32, cy = 14, scale = 1, drag = null;
  const clamp = (n,a,b) => Math.min(b,Math.max(a,n));
  function draw() {
    const w = plot.clientWidth, h = plot.clientHeight;
    if (!w || !h) return;
    scale = Math.min(h/110,w/81)*zoom;
    const x = lon => w/2+(lon-cx)*scale, y = lat => h/2-(lat-cy)*scale;
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    for (const [k,v] of Object.entries({x:x(-180),y:y(90),width:360*scale,height:180*scale})) land.setAttribute(k,v);
    all('.geo-label').forEach(el => {el.setAttribute('x',x(+el.dataset.lon));el.setAttribute('y',y(+el.dataset.lat));});
    // Opposite banks of labels separate the close pairs (EA ports and the two UAE ports).
    const left = new Set(['RULED','RUNVS','AEJEA','TZDAR','MZBEW','ZADUR']);
    for (const p of ports.values()) {
      const pin=p.pin, px=x(p.x), py=y(p.y), visible=px>=3&&px<=w-3&&py>=3&&py<=h-3;
      pin.style.display=visible?'':'none'; if(!visible) continue;
      const length=Math.ceil(pin.querySelector('text').getComputedTextLength())+14;
      const gap=w<480?9:13, lift=({AEJEA:13,AEKLF:-14,KZAAU:7,KEMBA:-10,TZDAR:13})[p.code] || 0;
      const dx=clamp(px+(left.has(p.code)?-length-gap:gap),3,w-length-3)-px;
      const dy=clamp(py+lift,15,h-15)-py;
      pin.setAttribute('transform',`translate(${px} ${py})`);
      pin.querySelector('.caption').setAttribute('transform',`translate(${dx} ${dy})`);
      pin.querySelector('.leader').setAttribute('d',`M0 0 L${dx+(dx<0?length:0)} ${dy}`);
      for(const [sel,height] of [['.badge',22],['.hit',42]]){
        const r=pin.querySelector(sel);r.setAttribute('y',-height/2);r.setAttribute('height',height);r.setAttribute('width',length);
      }
    }
    plot.classList.toggle('zoomed',zoom>1);
    $('[data-zoom="out"]').disabled=zoom<=1;$('[data-zoom="in"]').disabled=zoom>=8;
  }
  function centre(p) {cx=p.x;cy=p.y;}
  all('[data-zoom]').forEach(btn => btn.addEventListener('click',()=>{
    const mode=btn.dataset.zoom;
    if(mode==='in'&&zoom===1) centre(chosen());
    zoom=mode==='reset'?1:clamp(zoom*(mode==='in'?2:0.5),1,8);
    if(zoom===1){cx=32;cy=14;} draw();
  }));
  svg.addEventListener('pointerdown',e=>{
    if(zoom===1||e.button!==0||e.target.closest('.pin'))return;
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,cx,cy};svg.setPointerCapture(e.pointerId);plot.classList.add('dragging');
  });
  svg.addEventListener('pointermove',e=>{
    if(!drag || drag.id!==e.pointerId)return;
    cx=clamp(drag.cx-(e.clientX-drag.x)/scale,-45,95);cy=clamp(drag.cy+(e.clientY-drag.y)/scale,-45,72);draw();
  });
  svg.addEventListener('lostpointercapture',()=>{drag=null;plot.classList.remove('dragging');});
  function sync() {
    for(const k of roles){
      $(`[data-slot="${k}"]`).textContent=val(k)||t(k==='via'?'Не задана':'Не задано',k==='via'?'Optional':'Not set');
      $(`[data-remove="${k}"]`).hidden=!val(k);
    }
    const selected=new Set(roles.map(k=>known(val(k))?.code));
    for(const p of ports.values()){
      const included=selected.has(p.code);p.pin.classList.toggle('inbrief',included);
      let square=p.pin.querySelector('.insquare');
      if(!square){square=document.createElementNS('http://www.w3.org/2000/svg','rect');square.setAttribute('class','insquare');for(const [k,v] of Object.entries({x:-4.5,y:-4.5,width:9,height:9,fill:'#102f32'}))square.setAttribute(k,v);p.pin.insertBefore(square,p.pin.querySelector('.caption'));}
      square.style.display=included?'':'none';
      p.pin.setAttribute('aria-label',p.name+' · '+p.card.querySelector('.source-tag').textContent.trim()+(included?' · '+t('В запросе','In brief'):''));
    }
    const duplicate=roles.find(k=>known(val(k))?.code===list.value);
    add.disabled=Boolean(duplicate);
    add.textContent=duplicate?t('Уже в запросе','Already added'):val(role.value)?t('Заменить','Replace'):t('Добавить ＋','Add port ＋');
    if(!duplicate&&val(role.value))add.title=t('Заменить: ','Replace: ')+val(role.value);else add.removeAttribute('title');
  }
  function inspect(code,recenter=false,announce=false) {
    if(!ports.has(code))return;list.value=code;
    for(const p of ports.values()){const active=p.code===code;p.card.hidden=!active;p.pin.setAttribute('aria-pressed',String(active));}
    if(recenter&&zoom>1)centre(chosen());
    status.textContent=announce?t('Открыта карточка: ','Port record: ')+chosen().name+'.':'';
    draw();sync();
  }
  list.addEventListener('change',()=>inspect(list.value,true,true));
  for(const p of ports.values()){
    p.pin.addEventListener('click',()=>inspect(p.code,false,true));
    p.pin.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect(p.code,false,true);}});
  }
  role.addEventListener('change',()=>{status.textContent='';sync();});
  function invalidate(){draft.hidden=true;body.value='';draftStatus.textContent='';for(const k of roles)field(k).setCustomValidity('');}
  add.addEventListener('click',()=>{
    if(add.disabled)return;
    field(role.value).value=chosen().name;invalidate();sync();
    status.textContent=t('В запросе: ','Added to brief: ')+role.selectedOptions[0].text+' — '+chosen().name+'.';
  });
  all('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{
    const k=btn.dataset.remove, name=val(k);field(k).value='';invalidate();sync();role.value=k;sync();
    status.textContent=t('Убрано из запроса: ','Removed from brief: ')+name+'.';role.focus();
  }));
  form.addEventListener('input',()=>{invalidate();sync();});
  form.addEventListener('submit',e=>{
    e.preventDefault();
    for(const k of ['origin','destination','goods'])if(!val(k)){field(k).value='';field(k).reportValidity();return;}
    const seen=new Set();for(const k of roles){const v=val(k).toLowerCase();if(v&&seen.has(v)){field(k).setCustomValidity(t('Эта точка уже указана. Уточните разные точки передачи.','This point already appears in the brief. Specify distinct handover points.'));field(k).reportValidity();return;}seen.add(v);}
    const line=k=>labelOf(k)+': '+(field(k).tagName==='SELECT'?field(k).selectedOptions[0].text:val(k));
    const lines=[t('Запрос ставки','Request for quotation')+' / Steppe to Cape',val('origin')+' → '+val('destination'),'',...['scope',...roles,'type','goods','places','ready','currency'].filter(k=>val(k)).map(line)];
    lines.push('',t('Прошу указать в предложении:','Please specify in your quotation:'),
      t('• Сумму, единицу расчёта и валюту каждой строки: забор, портовые расходы с обоих концов, фрахт, перевалка, доставка. Что включено, что исключено и что ещё не подтверждено?','• Amount, unit and currency per item: pickup, handling at both ends, freight, transfer and delivery. Mark inclusions, exclusions and unconfirmed items.'),
      t('• Страхование, оформление, пошлины и налоги: кто отвечает и кто платит.','• Insurance, clearance, duties and taxes: who arranges each item and who pays.'),
      t('• Валюту счёта и платежа, курс и дату пересчёта, комиссии, срок и условия оплаты. Возможность платежа требует подтверждения банка.','• Invoice and payment currencies, FX source and date, fees, payment terms and deadline. The bank must confirm payment feasibility.'),
      t('• Срок действия ставки, окно отправки, наличие места и оборудования, срок доставки, бесплатные дни хранения и возврата, расходы после их истечения. Где и кому переходит ответственность за груз?','• Rate validity, sailing window, space and equipment availability, time to delivery, storage and return free time, and charges after expiry. Where and to whom does responsibility for the cargo pass?'));
    for(const k of roles){const p=known(val(k));if(p)lines.push(p.name+': '+p.card.querySelector('.card-note p').textContent);}
    body.value=lines.join('\n');draft.hidden=false;draftStatus.textContent=t('Черновик готов. Ничего не отправлено.','Brief ready. Nothing has been sent.');body.focus();
  });
  $('#copy').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(body.value);draftStatus.textContent=t('Текст скопирован.','Enquiry copied.');}
    catch{body.focus();body.select();draftStatus.textContent=t('Скопируйте выделенный текст.','Copy the selected text.');}
  });
  $('#download').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob(['\uFEFF',body.value],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=`steppe-to-cape-rfq-${ru?'ru':'en'}.txt`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  // Only an explicit language switch transfers the brief. No URL parameters, network or persistent storage.
  const stash='stc:language-transfer:v2';
  $('.language').addEventListener('click',e=>{
    if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    try{const values=Object.fromEntries(new FormData(form));for(const k of roles)values[k]=known(val(k))?.other??val(k);
      sessionStorage.setItem(stash,JSON.stringify({lang:ru?'en':'ru',values,port:list.value,role:role.value,time:Date.now()}));}catch{/* Storage may be disabled. */}
  });
  try{const data=JSON.parse(sessionStorage.getItem(stash));sessionStorage.removeItem(stash);
    if(data?.lang===document.documentElement.lang&&Date.now()-data.time<60000){for(const [k,v] of Object.entries(data.values)){const el=field(k);if(el&&typeof v==='string')el.value=v;}if(ports.has(data.port))list.value=data.port;if(roles.includes(data.role))role.value=data.role;}
  }catch{/* Blank local brief is still usable. */}
  for(const img of all('.portrait img')){const hideBroken=()=>{img.hidden=true;};img.addEventListener('error',hideBroken);if(img.complete&&!img.naturalWidth)hideBroken();}
  document.documentElement.classList.add('js');inspect(list.value);new ResizeObserver(draw).observe(plot);document.fonts?.ready.then(draw);
})();
