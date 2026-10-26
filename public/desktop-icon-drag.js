import {makeIconGrid,cellKey,cellPoint,nearestFreeCell,arrangeIcons} from './desktop-grid.js';
(() => {
  const shell=document.querySelector('.desktop-shell');if(!shell)return;
  const workspace=shell.querySelector('.desktop-workspace'),nav=shell.querySelector('.desktop-icons'),icons=[...nav.querySelectorAll('.desktop-icon')],live=shell.querySelector('.desktop-live-message');
  const mobile=matchMedia('(max-width:640px)'),desktopKey='senergy-icon-grid-desktop',phoneKey='senergy-icon-grid-mobile';
  const HOLD_MS=350,DRAG_DISTANCE=8;
  let gesture=null,blockedClick=null;
  function read(key){
    try{const value=JSON.parse(localStorage.getItem(key)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}
  }
  const layouts={desktop:read(desktopKey),phone:read(phoneKey)};
  const layoutName=()=>mobile.matches?'phone':'desktop';
  let grid,positions={};
  const select=icon=>icons.forEach(i=>i.classList.toggle('is-selected',i===icon));
  const paint=(icon,cell)=>{const p=cellPoint(cell,grid);icon.style.left=p.x+'px';icon.style.top=p.y+'px';};
  function layout(){
    finish(false);
    grid=makeIconGrid(workspace.clientWidth,workspace.clientHeight,icons.length);
    nav.dataset.iconLayout='true';
    positions=arrangeIcons(icons.map(icon=>icon.dataset.openApp),layouts[layoutName()],grid,mobile.matches?3:2);
    icons.forEach(icon=>{
      paint(icon,positions[icon.dataset.openApp]);
      icon.title='Click or tap to open. Hold and drag to an open grid space. Enter opens; Alt + arrow keys moves.';
    });
  }
  function destination(icon,x,y){
    const occupied=new Set(Object.entries(positions).filter(([id])=>id!==icon.dataset.openApp).map(([,cell])=>cellKey(cell)));
    return nearestFreeCell({x,y},occupied,grid);
  }
  function save(icon,x,y){
    const cell=destination(icon,x,y);if(!cell)return;
    positions[icon.dataset.openApp]=cell;paint(icon,cell);
    layouts[layoutName()]={...positions};
    try{localStorage.setItem(mobile.matches?phoneKey:desktopKey,JSON.stringify(positions));}catch{}
  }
  function moveGhost(){
    if(!gesture?.ghost)return;
    const cell=destination(gesture.icon,gesture.left+gesture.dx,gesture.top+gesture.dy);
    if(cell){paint(gesture.ghost,cell);gesture.ghost.style.transform=`translate(${-nav.scrollLeft}px,${-nav.scrollTop}px)`;}
  }
  function pickup(){
    if(!gesture||gesture.ghost)return;
    clearTimeout(gesture.timer);
    const ghost=gesture.icon.cloneNode(true);ghost.className='desktop-icon desktop-icon-ghost';
    ghost.removeAttribute('href');ghost.removeAttribute('data-open-app');ghost.removeAttribute('title');ghost.setAttribute('aria-hidden','true');ghost.tabIndex=-1;
    workspace.append(ghost);gesture.ghost=ghost;gesture.icon.classList.add('is-dragging');shell.dataset.iconDragging='true';
    moveGhost();live.textContent=gesture.icon.textContent.trim()+' picked up. Drag to move; release to snap to the outlined space. Escape cancels.';
  }
  function finish(commit){
    if(!gesture)return;
    const current=gesture;gesture=null;clearTimeout(current.timer);
    if(current.ghost){
      if(commit){save(current.icon,current.left+current.dx,current.top+current.dy);live.textContent=current.icon.textContent.trim()+' snapped to an open grid space.';}
      else live.textContent='Icon move cancelled.';
      current.ghost.remove();
    }
    // Keep the release click blocked until consumed or a new press begins. Touch
    // browsers may send that click after pointer capture has already been lost.
    if(current.ghost||!commit)blockedClick=current.icon;
    current.icon.classList.remove('is-dragging');delete shell.dataset.iconDragging;
    if(current.icon.hasPointerCapture(current.pointerId))current.icon.releasePointerCapture(current.pointerId);
  }
  const open=icon=>shell.dispatchEvent(new CustomEvent('desktop:open',{detail:{id:icon.dataset.openApp}}));
  nav.addEventListener('click',event=>{
    const icon=event.target.closest('.desktop-icon');if(!icon)return;
    if(blockedClick===icon&&event.detail!==0){event.preventDefault();event.stopPropagation();blockedClick=null;return;}
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();event.stopPropagation();select(icon);blockedClick=null;
    if(event.detail<2)open(icon);
  });
  nav.addEventListener('dblclick',event=>{if(event.target.closest('.desktop-icon')){event.preventDefault();event.stopPropagation();}});
  icons.forEach(icon=>{
    icon.draggable=false;icon.addEventListener('dragstart',event=>event.preventDefault());
    icon.addEventListener('contextmenu',event=>{if(gesture?.icon===icon||event.pointerType==='touch')event.preventDefault();});
    icon.addEventListener('pointerdown',event=>{
      if(gesture||event.button!==0||event.isPrimary===false||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
      blockedClick=null;select(icon);icon.focus({preventScroll:true});
      gesture={icon,pointerId:event.pointerId,x:event.clientX,y:event.clientY,left:parseFloat(icon.style.left),top:parseFloat(icon.style.top),scrollTop:nav.scrollTop,scrollLeft:nav.scrollLeft,ghost:null,dx:0,dy:0,timer:setTimeout(pickup,HOLD_MS)};
      icon.setPointerCapture(event.pointerId);
    });
    icon.addEventListener('pointermove',event=>{
      if(!gesture||gesture.icon!==icon||gesture.pointerId!==event.pointerId)return;
      gesture.dx=event.clientX-gesture.x+nav.scrollLeft-gesture.scrollLeft;gesture.dy=event.clientY-gesture.y+nav.scrollTop-gesture.scrollTop;
      // An intentional drag can start immediately; a stationary hold also picks
      // the icon up. Both mouse and touch use the same movement tolerance.
      if(Math.hypot(gesture.dx,gesture.dy)>=DRAG_DISTANCE)pickup();
      if(gesture.ghost){event.preventDefault();moveGhost();}
    });
    for(const type of ['pointerup','pointercancel','lostpointercapture'])icon.addEventListener(type,event=>{
      if(gesture?.icon===icon&&gesture.pointerId===event.pointerId)finish(type==='pointerup');
    });
    icon.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&gesture){event.preventDefault();event.stopPropagation();finish(false);return;}
      if(event.altKey&&event.key.startsWith('Arrow')){
        event.preventDefault();finish(false);select(icon);
        const origin=positions[icon.dataset.openApp],dc=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0,dr=event.key==='ArrowDown'?1:event.key==='ArrowUp'?-1:0;
        const occupied=new Set(Object.entries(positions).filter(([id])=>id!==icon.dataset.openApp).map(([,cell])=>cellKey(cell)));
        for(let cell={col:origin.col+dc,row:origin.row+dr};cell.col>=0&&cell.row>=0&&cell.col<grid.columns&&cell.row<grid.rows;cell={col:cell.col+dc,row:cell.row+dr}){
          if(!occupied.has(cellKey(cell))){const p=cellPoint(cell,grid);save(icon,p.x,p.y);icon.scrollIntoView({block:'nearest'});break;}
        }
      }
    });
  });
  workspace.addEventListener('pointerdown',event=>{if(event.target===workspace||event.target===nav)select(null);});
  window.addEventListener('blur',()=>finish(false));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish(false);});
  shell.addEventListener('desktop:reset-icons',()=>{
    finish(false);layouts.desktop={};layouts.phone={};
    try{localStorage.removeItem(desktopKey);localStorage.removeItem(phoneKey);}catch{}
    layout();
  });
  new ResizeObserver(layout).observe(workspace);layout();
})();
