(() => {
  const panel=document.querySelector('.panel-maker-app #cv');
  if(panel){
    const button=document.createElement('button');button.type='button';button.className='panel-enlarge';button.textContent='＋ Enlarge preview';button.dataset.panelPreview='';
    panel.closest('.pvbox').after(button);
  }
  if(!panel&&!document.querySelector('[data-image-preview]'))return;
  const dialog=document.createElement('dialog');dialog.className='product-image-viewer';
  dialog.innerHTML='<div class="image-viewer-title"><b id="image-viewer-title">Image preview</b><button type="button" data-image-close aria-label="Close image preview">×</button></div><div class="image-viewer-tools" role="group" aria-label="Image zoom"><button type="button" data-image-zoom="fit">Fit</button><button type="button" data-image-zoom="2">2×</button><button type="button" data-image-zoom="native">100% pixels</button><span>Scroll or swipe to inspect.</span></div><div class="image-viewer-scroll" tabindex="0" aria-label="Image detail, scroll to pan"><img alt=""></div>';
  dialog.setAttribute('aria-labelledby','image-viewer-title');document.body.append(dialog);
  const image=dialog.querySelector('img'),scroll=dialog.querySelector('.image-viewer-scroll'),title=dialog.querySelector('b');let trigger=null,mode='fit';
  function size(next){
    mode=next;const fit=Math.max(1,Math.min(image.naturalWidth||640,scroll.clientWidth-16));
    image.style.width=(mode==='native'?image.naturalWidth:mode==='2'?fit*2:fit)+'px';image.style.maxWidth='none';
    dialog.querySelectorAll('[data-image-zoom]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.imageZoom===mode)));
    scroll.scrollTop=0;scroll.scrollLeft=0;
  }
  function close(){dialog.close();trigger?.focus({preventScroll:true});}
  document.addEventListener('click',event=>{
    const link=event.target.closest('[data-image-preview],[data-panel-preview]');if(!link)return;
    event.preventDefault();trigger=link;const isPanel=link.hasAttribute('data-panel-preview');
    const source=isPanel?panel:link.querySelector('img');
    image.src=isPanel?source.toDataURL('image/png'):source.currentSrc||source.src;
    image.alt=isPanel?'Current panel at full export resolution':source.alt;
    title.textContent=isPanel?'Panel preview — 640 × 200 PNG':source.alt;
    dialog.classList.toggle('pixel-preview',isPanel);dialog.showModal();size('fit');
  });
  image.addEventListener('load',()=>size(mode));
  dialog.querySelector('[data-image-close]').addEventListener('click',close);
  dialog.querySelectorAll('[data-image-zoom]').forEach(button=>button.addEventListener('click',()=>size(button.dataset.imageZoom)));
  dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}});
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
})();
