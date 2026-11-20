'use strict';
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() { nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Menüyü aç'); }
toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded',String(open)); toggle.setAttribute('aria-label',open ? 'Menüyü kapat' : 'Menüyü aç'); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); toggle.focus(); } });
document.addEventListener('click',event => { if (!event.target.closest('header')) closeMenu(); });
const header = document.querySelector('header');
let ticking = false;
function updateHeader() { header.classList.toggle('scrolled',window.scrollY>20); ticking=false; }
window.addEventListener('scroll',()=>{ if(!ticking) { requestAnimationFrame(updateHeader); ticking=true; } },{passive:true}); updateHeader();
const navObserver = new IntersectionObserver(entries => { entries.forEach(entry => { if(entry.isIntersecting) { nav.querySelectorAll('[aria-current]').forEach(a=>a.removeAttribute('aria-current')); const link=nav.querySelector(`[href="#${entry.target.id}"]`); if(link) link.setAttribute('aria-current','location'); } }); },{rootMargin:'-20% 0px -55% 0px'});
document.querySelectorAll('main section[id]').forEach(section=>navObserver.observe(section));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
// Start the entire sequence together so the connecting lines lead each next step.
const processSteps = document.querySelector('.steps');
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
 processSteps.classList.add('sequence-ready');
 const processObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
   if (entry.isIntersecting && entry.intersectionRatio >= 0.35) processSteps.classList.add('sequence-started');
   else if (!entry.isIntersecting) processSteps.classList.remove('sequence-started');
  });
 }, { threshold: [0, 0.35] });
 processObserver.observe(processSteps);
 reducedMotion.addEventListener('change', event => {
  if (event.matches) {
   processSteps.classList.remove('sequence-ready');
   processObserver.disconnect();
  }
 });
}

const serviceDialog = document.querySelector('#service-dialog');
const galleryDialog = document.querySelector('#gallery-dialog');
let returnFocus;
function showDialog(dialog,trigger) { returnFocus=trigger; dialog.showModal(); document.body.classList.add('modal-open'); dialog.querySelector('.dialog-close').focus(); }
document.querySelectorAll('.service-card').forEach(card=>{
 const button=card.querySelector('.service-open');
 function openDetail() { serviceDialog.querySelector('.detail-body').replaceChildren(document.querySelector(`#detail-${button.dataset.detail}`).content.cloneNode(true)); serviceDialog.setAttribute('aria-labelledby',`detail-title-${button.dataset.detail}`); showDialog(serviceDialog,button); }
 button.addEventListener('click',openDetail);
 card.addEventListener('click',event=>{ if(!event.target.closest('a,button')) openDetail(); });
});
const galleryItems = [...document.querySelectorAll('[data-gallery]')];
let galleryIndex = 0;
function displayGallery(index) {
 galleryIndex = (index + galleryItems.length) % galleryItems.length;
 const item = galleryItems[galleryIndex];
 const image = galleryDialog.querySelector('img');
 image.src = item.dataset.gallery;
 image.alt = item.querySelector('img').alt;
 document.querySelector('#gallery-caption').textContent = item.dataset.caption;
 document.querySelector('#gallery-position').textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
}
galleryItems.forEach((button,index)=>button.addEventListener('click',()=>{ displayGallery(index); showDialog(galleryDialog,button); }));
document.querySelector('#gallery-prev').addEventListener('click',()=>displayGallery(galleryIndex-1));
document.querySelector('#gallery-next').addEventListener('click',()=>displayGallery(galleryIndex+1));
galleryDialog.addEventListener('keydown',event=>{
 if(event.key==='ArrowRight'||event.key==='ArrowLeft') { event.preventDefault(); displayGallery(galleryIndex+(event.key==='ArrowRight'?1:-1)); }
});
let swipeStart;
galleryDialog.querySelector('figure').addEventListener('touchstart',event=>{swipeStart={x:event.changedTouches[0].clientX,y:event.changedTouches[0].clientY};},{passive:true});
galleryDialog.querySelector('figure').addEventListener('touchend',event=>{
 if(!swipeStart)return;
 const dx=event.changedTouches[0].clientX-swipeStart.x,dy=event.changedTouches[0].clientY-swipeStart.y;
 if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy))displayGallery(galleryIndex+(dx<0?1:-1));
 swipeStart=null;
},{passive:true});

[serviceDialog,galleryDialog].forEach(dialog=>{
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{ const r=dialog.getBoundingClientRect(); if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)) dialog.close(); });
 dialog.addEventListener('close',()=>{ document.body.classList.remove('modal-open'); returnFocus?.focus(); });
});
function whatsappMessage(name,service,message) { return `Merhaba, Karaşal Hafriyat web sitenizden ulaşıyorum.\n\nAdım: ${name}\nBilgi almak istediğim hizmet: ${service}\nİşin konumu ve detayları: ${message}`; }
document.querySelector('#quote-form').addEventListener('submit',event=>{
 event.preventDefault(); const form=event.currentTarget;
 const name=form.elements.name.value.trim(), message=form.elements.message.value.trim();
 form.elements.name.setCustomValidity(name ? '' : 'Lütfen adınızı yazın.');
 form.elements.message.setCustomValidity(message ? '' : 'Lütfen işin konumunu ve detaylarını yazın.');
 if(!form.reportValidity()) return;
 window.location.assign(`https://wa.me/905356789300?text=${encodeURIComponent(whatsappMessage(name,form.elements.service.value,message))}`);
});
document.querySelectorAll('#quote-form input,#quote-form textarea').forEach(input=>input.addEventListener('input',()=>input.setCustomValidity('')));
document.querySelector('#year').textContent=new Date().getFullYear();

// Type the hero copy without shifting its reserved layout or repeating it to screen readers.
const heroCopy = [...document.querySelectorAll('.hero h1, .hero-content > p')];
let typingTimer;
let stopTyping = false;
const typingJobs = [];
function finishHeroTyping() {
 stopTyping = true;
 clearTimeout(typingTimer);
 typingJobs.forEach(job => {
  job.nodes.forEach((node, i) => { node.textContent = job.texts[i]; });
  job.layer.classList.remove('is-typing');
  job.cursor.remove();
 });
}
if (!reducedMotion.matches) {
 heroCopy.forEach(element => {
  const original = element.innerHTML;
  const accessibleText = element.innerText.replace(/\s+/g, ' ').trim();
  const layout = document.createElement('span');
  layout.className = 'typing-layout';
  layout.setAttribute('aria-hidden', 'true');
  layout.innerHTML = original;
  const layer = document.createElement('span');
  layer.className = 'typing-copy';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = original;
  element.setAttribute('aria-label', accessibleText);
  element.classList.add('typewriter');
  element.replaceChildren(layout, layer);
  const walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const texts = nodes.map(node => node.textContent);
  nodes.forEach(node => { node.textContent = ''; });
  const cursor = document.createElement('span');
  cursor.className = 'typing-caret';
  typingJobs.push({layer, nodes, texts, cursor});
 });
 let jobIndex = 0, nodeIndex = 0, letterIndex = 0;
 function typeNext() {
  if (stopTyping || jobIndex >= typingJobs.length) return;
  const job = typingJobs[jobIndex];
  job.layer.classList.add('is-typing');
  const letters = Array.from(job.texts[nodeIndex]);
  job.nodes[nodeIndex].textContent = letters.slice(0, ++letterIndex).join('');
  job.nodes[nodeIndex].after(job.cursor);
  let delay = jobIndex === 0 ? 36 : 13;
  if (letterIndex >= letters.length) {
   nodeIndex++; letterIndex = 0;
   if (nodeIndex >= job.nodes.length) {
    job.layer.classList.remove('is-typing');
  job.cursor.remove();
    jobIndex++; nodeIndex = 0; delay = 180;
   }
  }
  typingTimer = setTimeout(typeNext, delay);
 }
 typeNext();
 reducedMotion.addEventListener('change', event => { if (event.matches) finishHeroTyping(); });
 // Leaving the introduction never leaves partially written text behind.
 const typingObserver = new IntersectionObserver(entries => {
  if (entries.some(entry => !entry.isIntersecting)) { finishHeroTyping(); typingObserver.disconnect(); }
 });
 typingObserver.observe(document.querySelector('.hero'));
}

const galleryRail = document.querySelector('.gallery-grid');
document.querySelectorAll('[data-rail]').forEach(button => button.addEventListener('click', () => {
 const maxScroll = galleryRail.scrollWidth - galleryRail.clientWidth;
 const next = button.dataset.rail === 'next';
 const atEnd = galleryRail.scrollLeft >= maxScroll - 8;
 const atStart = galleryRail.scrollLeft <= 8;
 const destination = next && atEnd ? 0 : !next && atStart ? maxScroll :
  Math.max(0, Math.min(maxScroll, galleryRail.scrollLeft + galleryRail.clientWidth * (next ? 0.85 : -0.85)));
 galleryRail.scrollTo({left: destination, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
}));

// Keep the floating contact button clear of the mobile introduction controls.
const heroContactObserver = new IntersectionObserver(entries => {
 document.body.classList.toggle('hero-in-view', entries[0].isIntersecting);
});
heroContactObserver.observe(document.querySelector('.hero'));
