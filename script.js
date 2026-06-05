
const body = document.body;
const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
if(menuBtn && mobileMenu){
  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    body.classList.toggle('lock', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    body.classList.remove('lock');
    menuBtn.setAttribute('aria-expanded','false');
  }));
}

const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
let lastFocus = null;
document.querySelectorAll('[data-img]').forEach(el => {
  el.addEventListener('click', () => openModal(el.dataset.img, el));
});
function openModal(src, trigger){
  if(!modal || !modalImg) return;
  lastFocus = trigger || document.activeElement;
  modalImg.src = src;
  modal.dataset.redaction = trigger?.dataset.redaction || '';
  requestAnimationFrame(() => modal.classList.add('open'));
  modal.setAttribute('aria-hidden','false');
  body.classList.add('lock');
  const close = modal.querySelector('button');
  if(close) close.focus();
}
function closeModal(){
  if(!modal || !modalImg) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  body.classList.remove('lock');
  window.setTimeout(() => {
    if(!modal.classList.contains('open')){
      modalImg.src = '';
      modal.dataset.redaction = '';
    }
  }, 260);
  if(lastFocus) lastFocus.focus();
}
if(modal){
  modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });
}
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeModal();
  if(e.key === 'Tab' && modal && modal.classList.contains('open')){
    const btn = modal.querySelector('button');
    if(btn){ e.preventDefault(); btn.focus(); }
  }
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const whatsappWidget = document.querySelector('.whatsapp-widget');
const mobileWidgetQuery = window.matchMedia('(max-width: 640px)');
if(whatsappWidget){
  let widgetFrame = null;
  const widgetTargets = '.btn,.nav-cta,.mobile-cta,.footer-links a,a[href^="mailto:"],a[href*="wa.me"]';
  const intersects = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  const updateWhatsAppWidgetPosition = () => {
    widgetFrame = null;
    if(!mobileWidgetQuery.matches){
      whatsappWidget.classList.remove('whatsapp-widget--top');
      return;
    }
    whatsappWidget.classList.remove('whatsapp-widget--top');
    const widgetRect = whatsappWidget.getBoundingClientRect();
    const collides = Array.from(document.querySelectorAll(widgetTargets)).some(el => {
      if(el === whatsappWidget || whatsappWidget.contains(el)) return false;
      const styles = window.getComputedStyle(el);
      if(styles.display === 'none' || styles.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && intersects(widgetRect, rect);
    });
    if(collides) whatsappWidget.classList.add('whatsapp-widget--top');
  };
  const scheduleWhatsAppWidgetPosition = () => {
    if(widgetFrame) return;
    widgetFrame = window.requestAnimationFrame(updateWhatsAppWidgetPosition);
  };
  window.addEventListener('scroll', scheduleWhatsAppWidgetPosition, {passive:true});
  window.addEventListener('resize', scheduleWhatsAppWidgetPosition);
  mobileWidgetQuery.addEventListener?.('change', scheduleWhatsAppWidgetPosition);
  window.setTimeout(scheduleWhatsAppWidgetPosition, 80);
}
const reveals = document.querySelectorAll('section, .card, .hero-panel, .proof, .timeline-item, .callout, .cta-box, .highlight-panel');
reveals.forEach((el, index) => {
  el.classList.add('reveal');
  el.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 45}ms`);
});
if('IntersectionObserver' in window && !prefersReducedMotion){
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.08, rootMargin:'0px 0px -38px 0px'});
  reveals.forEach(el => observer.observe(el));
  window.setTimeout(() => {
    reveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      if(rect.top < window.innerHeight * 1.15) el.classList.add('is-visible');
    });
  }, 160);
}else{
  reveals.forEach(el => el.classList.add('is-visible'));
}


// V4: small interactive tilt on the hero proof panel (desktop only)
const heroPanel = document.querySelector('.hero-panel');
if(heroPanel && !prefersReducedMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
  heroPanel.addEventListener('mousemove', (e) => {
    const r = heroPanel.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    heroPanel.style.transform = `perspective(900px) rotateY(${x*4}deg) rotateX(${-y*4}deg) translateY(-2px)`;
  });
  heroPanel.addEventListener('mouseleave', () => {
    heroPanel.style.transform = '';
  });
}


// V6 count up stats
const countEls = document.querySelectorAll('.count[data-count]');
countEls.forEach(el => {
  const target = parseFloat(el.dataset.count || '0');
  const suffix = el.dataset.suffix || '';
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
  el.textContent = target.toFixed(decimals) + suffix;
});
