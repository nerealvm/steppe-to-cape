(() => {
  'use strict';
  const root=document.getElementById('quote-lab'); if(!root)return;
  const ru=document.documentElement.lang==='ru',t=(a,b)=>ru?a:b;
  const one=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
  const by=(d,k)=>one(`[data-${d}="${k}"]`), entries=k=>all(`[data-money="${k}"]`);
  const fmt=(n,c)=>new Intl.NumberFormat(ru?'ru-RU':'en-GB',{minimumFractionDigits:0,maximumFractionDigits:2}).format(n/100)+' '+c;
  const money=k=>ledger(entries(k).map(x=>x.value)),cur=k=>by('cur',k).value;
  const fx=one('[data-fx]'),scope=one('[data-scope]'),verdict=one('[data-verdict]'),note=one('[data-example]');
  const missing=t('Нет суммы','Missing amount'), invalid=t('Проверьте число: например, 1250,50.','Check the amount, e.g. 1250.50.');
  function refresh(){
    for(const k of 'AB') {
      const a=money(k),c=cur(k),pct=by('pct',k),p=split(a.complete?a.sum:null,pct.value);
      entries(k).forEach(el=>el.setAttribute('aria-invalid',String(ledger([el.value]).invalid)));
      by('total',k).textContent=a.invalid?t('Ошибка ввода','Check entry'):a.sum===null?'—':fmt(a.sum,c)+(a.missing?t(' · неполная',' · partial'):'');
      const badPct=pct.value.trim()!==''&&split(0,pct.value)===null;pct.setAttribute('aria-invalid',String(badPct));
      by('split',k).textContent=badPct?t('Введите 0–100 %.','Enter 0–100%.'):p?t(`Аванс ${fmt(p.advance,c)} · остаток ${fmt(p.balance,c)}`,`Upfront ${fmt(p.advance,c)} · balance ${fmt(p.balance,c)}`):t('Нужны полная смета и доля аванса.','Enter the full quote and advance percentage.');
    }
    const a=money('A'),b=money('B'),ca=cur('A'),cb=cur('B');
    one('[data-exchange]').hidden=ca===cb; one('[data-fxlabel]').textContent=`1 ${cb} = ? ${ca}`;
    const rate=ratio(fx.value,8);fx.setAttribute('aria-invalid',String(ca!==cb&&!!fx.value.trim()&&(!rate||rate[0]===0n)));
    const r=compare(a,b,ca,cb,fx.value,scope.checked);
    const states={incomplete:a.invalid||b.invalid?invalid:(a.sum===null&&b.sum===null?t('Введите свои ставки или откройте пример.','Enter your quotes or try the example.'):t('Не все расходы известны. Заполните пустые строки, чтобы увидеть разницу.','Some charges are unknown. Fill the blank rows to compare totals.')),scope:t('Суммы готовы. Сверьте условия и поставьте отметку выше.','Totals ready. Check both quotes cover the same scope, then tick the box.'),fx:t('Для сравнения введите положительный курс в указанном направлении.','Enter a positive conversion rate in the direction shown.'),range:t('Слишком большой результат: проверьте суммы и курс.','Result out of range: check amounts and rate.')};
    verdict.textContent=r.state==='ok'?(r.delta===0?t('Суммы равны. Сравните условия оплаты.','Totals are equal. Compare payment terms.'):r.delta<0?t(`B дешевле A на ${fmt(-r.delta,ca)}.`,`B costs ${fmt(-r.delta,ca)} less than A.`):t(`A дешевле B на ${fmt(r.delta,ca)}.`,`A costs ${fmt(r.delta,ca)} less than B.`)):states[r.state];
    one('[data-export]').disabled=all('[data-money]').every(el=>!el.value.trim());
  }
  const userData=()=>all('[data-money],[data-pct],[data-fx]').some(el=>el.value.trim())||scope.checked;
  function clear(){all('[data-money],[data-pct],[data-fx]').forEach(el=>el.value='');for(const k of 'AB')by('cur',k).value='USD';scope.checked=false;note.hidden=true;}
  root.addEventListener('input',e=>{if(e.target.matches('[data-cur]'))fx.value='';refresh();});
  root.addEventListener('change',refresh);
  one('[data-demo]').addEventListener('click',()=>{
    if(userData()&&!window.confirm(t('Заменить текущие цифры учебным примером?','Replace the current figures with the worked example?')))return;
    clear(); const values={A:['180','1200','260','0'],B:['200','1050','','50']};for(const k of 'AB')entries(k).forEach((el,i)=>{el.value=values[k][i];});note.hidden=false;refresh();
  });
  one('[data-reset]').addEventListener('click',()=>{if(userData()&&!window.confirm(t('Очистить обе сметы?','Clear both quotes?')))return;clear();refresh();});
  one('[data-export]').addEventListener('click',()=>{
    const out=[t('Steppe to Cape · Сверка двух смет','Steppe to Cape · Freight quote comparison')];if(!note.hidden)out.push(note.textContent);
    for(const k of 'AB'){out.push('',`${t('Смета','Quote')} ${k} · ${cur(k)}`);entries(k).forEach(el=>out.push(`${el.closest('tr').querySelector('th').firstChild.textContent}: ${el.value.trim()||missing}`));out.push(`${t('Сумма строк','Sum of entries')}: ${by('total',k).textContent}`);if(by('pct',k).value)out.push(`${t('Аванс','Advance')} ${by('pct',k).value}%: ${by('split',k).textContent}`);}
    if(cur('A')!==cur('B'))out.push(`1 ${cur('B')} = ${fx.value.trim()||'—'} ${cur('A')}`);
    out.push('',scope.checked?t('Одинаковые условия отмечены пользователем.','User marked scopes as matching.'):t('Одинаковые условия не подтверждены.','Matching scopes not confirmed.'),verdict.textContent,t('Рабочий лист. Не оферта.','Working sheet. Not an offer.'));
    const url=URL.createObjectURL(new Blob(['\uFEFF'+out.join('\n')],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='steppe-to-cape-quote-comparison.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });refresh();one('[data-workbook]').hidden=false;
})();
