(() => {
  'use strict';
  const q = (selector) => document.querySelector(selector);
  const ru = document.documentElement.lang === 'ru';
  const t = (a, b) => ru ? a : b;
  const burger = q('.burger'), nav = q('#mobile-nav');
  const setMenu = open => { burger.setAttribute('aria-expanded', String(open)); nav.hidden = !open; };
  burger.addEventListener('click', () => setMenu(nav.hidden));
  nav.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !nav.hidden) { setMenu(false); burger.focus(); } });
  matchMedia('(min-width:801px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
  const language = q('.language'); const other = language.getAttribute('href');
  function setLanguageLink() { language.setAttribute('href', other + (document.getElementById(location.hash.slice(1)) ? location.hash : '')); }
  setLanguageLink(); addEventListener('hashchange', setLanguageLink);
  const motion = q('.motion'), article = q('.hero-art'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function animate(on) { article.classList.toggle('stopped', !on); motion.setAttribute('aria-pressed', String(on)); motion.firstElementChild.textContent = on ? 'Ⅱ' : '▷'; }
  function motionPreference() { motion.hidden = reduced.matches; animate(!reduced.matches); }
  motionPreference(); reduced.addEventListener('change', motionPreference);
  motion.addEventListener('click', () => animate(motion.getAttribute('aria-pressed') !== 'true'));
  const dirs = [...document.querySelectorAll('.dir')], origin = q('#orig'), destination = q('#dest'), form = q('#brief');
  dirs.forEach(btn => btn.addEventListener('click', () => {
    const d = btn.dataset.dir;
    dirs.forEach(item => item.setAttribute('aria-pressed', String(item === btn)));
    origin.textContent = origin.dataset[d]; destination.textContent = destination.dataset[d];
    q('.chartfoot span:last-child').textContent = d === 'south' ? t('Юг ↘','South ↘') : t('Север ↖','North ↖');
  }));
  q('.chartfoot span:last-child').textContent = t('Юг ↘','South ↘');
  q('.routequote').addEventListener('click', () => { form.elements.origin.value = origin.textContent; form.elements.destination.value = destination.textContent; form.dispatchEvent(new Event('input')); });
  const fallback = q('.fallback'), info = fallback.querySelector('[role=status]'), result = q('.result');
  let enquiry = '';
  form.addEventListener('input', () => { fallback.hidden = true; result.hidden = true; enquiry = ''; });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const get = key => form.elements[key].value.trim();
    for (const key of ['origin','destination','goods']) { if (!get(key)) { form.elements[key].value = ''; form.elements[key].reportValidity(); return; } }
    const subject = `${t('Запрос ставки','Freight enquiry')}: ${get('origin')} → ${get('destination')}`;
    const body = `${t('Добрый день! Прошу рассчитать перевозку.','Hello, please quote the following shipment.')}\n\n${t('Откуда','Origin')}: ${get('origin')}\n${t('Куда','Destination')}: ${get('destination')}\n${t('Груз и условия','Cargo and terms')}: ${get('goods')}`;
    enquiry = `${subject}\n\n${body}`;
    result.value = enquiry; result.hidden = false; fallback.hidden = false;
    info.textContent = t('Черновик готов. Ничего не отправлено.', 'Your brief is ready. Nothing has been sent.');
    result.focus({preventScroll: true});
  });
  q('.download').addEventListener('click', () => {
    if (!enquiry) return;
    const blob = new Blob(['\uFEFF', enquiry], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = 'steppe-to-cape-freight-brief.txt'; document.body.append(link);
    link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  q('.copy').addEventListener('click', async () => {
    if (!enquiry) return;
    try { await navigator.clipboard.writeText(enquiry); info.textContent = t('Текст запроса скопирован.', 'Enquiry copied.'); }
    catch { result.hidden = false; result.focus(); result.select(); info.textContent = t('Скопируйте выделенный текст.', 'Copy the selected text.'); }
  });
  document.documentElement.classList.add('enhanced');
})();
