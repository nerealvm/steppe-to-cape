'use strict';
/* The user enters amounts for one complete shipment, never unit rates. */
function ledger(values) {
  let sum=0, missing=0;
  for (const val of values) {
    const s=String(val??'').trim().replace(/[\u00a0\u202f]/g,' ');
    if (!s) {missing++;continue;}
    if (!/^(?:\d+|\d{1,3}(?: \d{3})+)(?:[.,]\d{1,2})?$/.test(s)) return {sum:null,complete:false,missing,invalid:true};
    const [whole,frac='']=s.replace(/ /g,'').split(/[.,]/);
    if(whole.length>10)return {sum:null,complete:false,missing,invalid:true};
    sum+=Number(whole)*100+Number(frac.padEnd(2,'0'));
  }
  return {sum:missing===values.length?null:sum,complete:!!values.length&&missing===0,missing,invalid:false};
}
function ratio(raw,places) {
  const s=String(raw??'').trim().replace(',','.');
  if (!new RegExp('^\\d{1,8}(?:\\.\\d{1,'+places+'})?$').test(s)) return null;
  const [a,b='']=s.split('.');return [BigInt(a+b),10n**BigInt(b.length)];
}
function rounded(n,d) {return (2n*n+d)/(2n*d);}
function compare(a,b,ca,cb,fx,scope) {
  if (!a.complete||!b.complete) return {state:'incomplete'};
  if (!scope) return {state:'scope'};
  const rate=ca===cb?[1n,1n]:ratio(fx,8);
  if(!rate||!rate[0]) return {state:'fx'};
  const delta=rounded(BigInt(b.sum)*rate[0],rate[1])-BigInt(a.sum);
  return delta>BigInt(Number.MAX_SAFE_INTEGER)?{state:'range'}:{state:'ok',delta:Number(delta)};
}
function split(sum,pct) {
  const p=ratio(pct,2);
  if (sum===null||!p||p[0]>100n*p[1])return null;
  const advance=Number(rounded(BigInt(sum)*p[0],100n*p[1]));return {advance,balance:sum-advance};
}
if (typeof module === 'object' && module.exports) module.exports = {ledger,compare,split};
