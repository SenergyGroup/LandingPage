(() => {
  const shell = document.querySelector('.desktop-shell');
  if (!shell) return;
  const workspace = shell.querySelector('.desktop-workspace');
  const menu = shell.querySelector('.desktop-start-menu');
  const start = shell.querySelector('.desktop-start');
  const running = shell.querySelector('.desktop-running');
  const live = shell.querySelector('.desktop-live-message');
  const mobile = window.matchMedia('(max-width: 640px)');
  const colors = {teal:'#008080',blue:'#253c73',plum:'#614e70',slate:'#506667'};
  let active = null, z = 10, audioContext, pointerOperation = null;
  let preferences = {color:'teal',dither:false,sounds:false};
  try { const saved=JSON.parse(localStorage.getItem('senergy-desktop')||'null');if(saved&&colors[saved.color])preferences={color:saved.color,dither:!!saved.dither,sounds:!!saved.sounds}; } catch {}
  const windows = new Map([...shell.querySelectorAll('[data-window]')].map(element => [element.dataset.window,{element,open:false,minimized:false,maximized:false,rect:null,z:0,task:null}]));
  const dimensions = () => ({width:workspace.clientWidth,height:workspace.clientHeight});
  const clamp = (n,min,max) => Math.max(min,Math.min(n,max));
  function initialRect(id) {
    const {width:w,height:h}=dimensions();
    const sizes = {welcome:[350,550],preview:[900,800],looks:[820,475],messenger:[850,600],store:[940,600],panels:[950,620],custom:[850,590],free:[800,580],display:[385,470],readme:[590,520]};
    let [width,height]=sizes[id]||[650,500];
    let x=190, y=34;
    if (id==='preview') {width=Math.min(width,w>700?w-190:w-20);x=w>700?175:10;y=28;}
    else if(id==='welcome' && w>900){width=w<1050?320:350;x=w<1050?170:195;y=35;}
    else if(id==='display'){x=(w-width)/2;y=60;}
    else {width=Math.min(width,w-195-25);x=180+(id==='messenger'?10:0);y=28;}
    width=Math.min(Math.max(300,width),w-16);height=Math.min(height,h-y-16);
    return {x:clamp(x,0,w-width),y:clamp(y,0,h-height),width,height};
  }
  function fit(rect) {
    const {width:w,height:h}=dimensions();
    const width=clamp(rect.width,Math.min(290,w),w),height=clamp(rect.height,Math.min(220,h),h);
    return {width,height,x:clamp(rect.x,0,w-width),y:clamp(rect.y,0,h-height)};
  }
  function position(state) {
    const {width,height}=dimensions();
    const rect=mobile.matches||state.maximized?{x:mobile.matches?5:0,y:mobile.matches?6:0,width:width-(mobile.matches?10:0),height:height-(mobile.matches?12:0)}:fit(state.rect);
    Object.assign(state.element.style,{left:rect.x+'px',top:rect.y+'px',width:rect.width+'px',height:rect.height+'px',zIndex:String(state.z)});
    state.element.dataset.maximized=String(state.maximized);
    const max=state.element.querySelector('[data-window-action=maximize]');
    max.setAttribute('aria-label',(state.maximized?'Restore ':'Maximize ')+state.element.querySelector('.desktop-drag-handle>span').textContent);
    max.title=state.maximized?'Restore':'Maximize';
    if (!mobile.matches&&!state.maximized)state.rect=rect;
  }
  function sync() {
    shell.querySelector('.desktop-icons').inert=mobile.matches&&active!==null;
    windows.forEach((state,id)=>{
      state.element.hidden=!state.open||state.minimized||(mobile.matches&&id!==active);
      state.element.dataset.active=String(id===active);
      if(!state.element.hidden)position(state);
      if(state.task){state.task.hidden=!state.open;state.task.setAttribute('aria-pressed',String(id===active&&!state.minimized));}
    });
  }
  function sound(force=false) {
    if(!force&&!preferences.sounds)return;
    try {
      audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
      audioContext.resume();
      [523.25,659.25,783.99].forEach((hz,i)=>{
        const osc=audioContext.createOscillator(),gain=audioContext.createGain(),at=audioContext.currentTime+i*.075;
        osc.type='sine';osc.frequency.value=hz;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.035,at+.012);gain.gain.exponentialRampToValueAtTime(.001,at+.18);
        osc.connect(gain);gain.connect(audioContext.destination);osc.start(at);osc.stop(at+.2);
      });
    } catch {live.textContent='Sound is unavailable in this browser.';}
  }
  function activate(id,focus=false) {
    const state=windows.get(id);if(!state||!state.open)return;
    state.minimized=false;active=id;state.z=++z;sync();
    state.task?.scrollIntoView({block:'nearest',inline:'nearest'});
    if(focus)state.element.querySelector('.desktop-drag-handle').focus({preventScroll:true});
  }
  function selectNext() {
    const next=[...windows].filter(([,s])=>s.open&&!s.minimized).sort((a,b)=>b[1].z-a[1].z)[0];
    active=next?.[0]||null;sync();
    next?.[1].task?.scrollIntoView({block:'nearest',inline:'nearest'});
    if(next)next[1].element.querySelector('.desktop-drag-handle').focus({preventScroll:true});
    else start.focus({preventScroll:true});
  }
  function setMenu(open) {
    menu.hidden=!open;start.setAttribute('aria-expanded',String(open));
    if(open)menu.querySelector('a').focus({preventScroll:true});
  }
  function updateRoute(id) {
    let route=id==='messenger'?'/looks/retro-messenger':id==='welcome'||id==='preview'?'/':id==='looks'?'/#looks':null;
    if(['store','panels','custom','free','about'].includes(id)){
      const frame=windows.get(id).element.querySelector('iframe');
      const url=new URL(frame.dataset.currentSrc||frame.getAttribute('src')||frame.dataset.src,location.origin);url.searchParams.delete('embedded');route=url.pathname+url.search+url.hash;
    }
    if(route&&location.pathname+location.search+location.hash!==route)history.pushState({desktopApp:id},'',route);
    if(route)document.title=id==='messenger'?'Retro Messenger | SenergyGroup':'SenergyGroup — Your stream, your desktop';
  }
  function loadFrame(state,src) {
    const frame=state.element.querySelector('iframe');
    if(!frame)return;
    const requested=new URL(src||frame.dataset.src,location.origin);
    if(state===windows.get('store')&&requested.pathname==='/')requested.pathname='/store';
    if(['/store','/claim','/custom','/about','/panels'].includes(requested.pathname)||requested.pathname.startsWith('/panel-maker/'))requested.searchParams.set('embedded','1');
    const wanted=requested.pathname+requested.search+requested.hash;
    const current=frame.dataset.currentSrc||frame.getAttribute('src');
    if(!current || (src&&current!==wanted)){
      frame.dataset.currentSrc=wanted;
      // The desktop owns history. Assigning iframe.src adds a second entry,
      // leaving the outer URL and the visible tool out of sync on Back/Forward.
      frame.contentWindow.location.replace(wanted);
    }
    if(!frame.dataset.currentSrc)frame.dataset.currentSrc=wanted;
  }
  function openApp(id,{focus=true,route=true,url}={}) {
    const state=windows.get(id);if(!state)return;
    const wasClosed=!state.open;
    state.open=true;state.rect ||= initialRect(id);state.minimized=false;
    if(!state.task){
      const task=document.createElement('button');task.type='button';task.className='desktop-task';
      const title=state.element.querySelector('.desktop-drag-handle>span').textContent;
      task.append(state.element.querySelector('.desktop-pixel').cloneNode(true));
      const label=document.createElement('span');label.textContent=title;task.append(label);task.title=title;task.setAttribute('aria-label','Switch to '+title);
      task.addEventListener('click',()=>{if(active===id&&!state.minimized)minimize(id);else {activate(id,true);updateRoute(id);}});
      running.append(task);state.task=task;
    }
    setMenu(false);activate(id,focus);loadFrame(state,url);
    if(route)updateRoute(id);
    if(wasClosed){sound();live.textContent=state.element.querySelector('.desktop-drag-handle>span').textContent+' opened.';}
  }
  function pauseMedia(state){state.element.querySelectorAll('video').forEach(video=>video.pause());}
  function minimize(id) {const state=windows.get(id);state.minimized=true;pauseMedia(state);selectNext();}
  function close(id) {
    const state=windows.get(id);if(!state)return;
    state.open=false;pauseMedia(state);sound();selectNext();
    live.textContent=state.element.querySelector('.desktop-drag-handle>span').textContent+' closed.';
  }
  function maximize(id){const state=windows.get(id);state.maximized=!state.maximized;activate(id,false);}
  function showDesktop(){windows.forEach(s=>{if(s.open)s.minimized=true;pauseMedia(s);});active=null;setMenu(false);sync();shell.querySelector('.desktop-icon').focus({preventScroll:true});}
  function messengerTab(name,{focus=false}={}) {
    const app=windows.get('messenger').element;
    app.querySelectorAll('[data-messenger-tab]').forEach(tab=>{
      const selected=tab.dataset.messengerTab===name;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;
      app.querySelector('#'+tab.getAttribute('aria-controls')).hidden=!selected;
      if(selected&&focus)tab.focus();
    });
    app.querySelector('.desktop-window-body').scrollTop=0;
  }
  shell.addEventListener('desktop:open',event=>openApp(event.detail.id));
  shell.addEventListener('click',event=>{
    const launcher=event.target.closest('[data-open-app]');
    if(launcher){
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();openApp(launcher.dataset.openApp,{url:launcher.dataset.appUrl});
      if(launcher.dataset.messengerView)messengerTab(launcher.dataset.messengerView);return;
    }
    const selection=event.target.closest('[data-select-messenger]');
    if(selection){event.preventDefault();messengerTab(selection.dataset.selectMessenger,{focus:true});return;}
    const tab=event.target.closest('[data-messenger-tab]');
    if(tab){messengerTab(tab.dataset.messengerTab);return;}
    const action=event.target.closest('[data-window-action]');
    if(action){const id=action.closest('[data-window]').dataset.window;({close,minimize,maximize})[action.dataset.windowAction](id);return;}
    if(event.target.closest('[data-show-desktop]'))showDesktop();
  });
  shell.querySelectorAll('[data-messenger-tab]').forEach((tab,index,tabs)=>{
    tab.addEventListener('keydown',event=>{
      const next=event.key==='ArrowRight'?tabs[(index+1)%tabs.length]:event.key==='ArrowLeft'?tabs[(index+tabs.length-1)%tabs.length]:event.key==='Home'?tabs[0]:event.key==='End'?tabs[tabs.length-1]:null;
      if(next){event.preventDefault();messengerTab(next.dataset.messengerTab,{focus:true});}
    });
  });
  start.addEventListener('click',()=>setMenu(menu.hidden));
  document.querySelector('.desktop-skip').addEventListener('click',event=>{
    event.preventDefault();
    if(active)windows.get(active).element.querySelector('.desktop-drag-handle').focus({preventScroll:true});
    else shell.querySelector('.desktop-icon').focus({preventScroll:true});
  });
  document.addEventListener('pointerdown',event=>{if(!menu.hidden&&!menu.contains(event.target)&&!start.contains(event.target))setMenu(false);});
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    if(!menu.hidden){setMenu(false);start.focus();return;}
    if(active&&!event.target.closest('input,textarea,select,[contenteditable=true]')){event.preventDefault();close(active);}
  });
  menu.addEventListener('keydown',event=>{
    const items=[...menu.querySelectorAll('a,button')],index=items.indexOf(document.activeElement);
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();items[(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length].focus();}
  });
  windows.forEach((state,id)=>{
    state.element.addEventListener('pointerdown',()=>{if(active!==id)activate(id);});
    state.element.addEventListener('focusin',()=>{if(active!==id)activate(id);});
    const title=state.element.querySelector('.desktop-drag-handle'),resize=state.element.querySelector('[data-resize]');
    title.addEventListener('dblclick',()=>maximize(id));
    for(const [handle,kind] of [[title,'move'],[resize,'resize']]){
      handle.addEventListener('pointerdown',event=>{
        if(event.button!==0||mobile.matches||state.maximized)return;
        event.preventDefault();activate(id);handle.focus({preventScroll:true});handle.setPointerCapture(event.pointerId);
        pointerOperation={id,kind,startX:event.clientX,startY:event.clientY,rect:{...state.rect}};shell.dataset.dragging='true';
      });
      handle.addEventListener('pointermove',event=>{
        if(!pointerOperation||pointerOperation.id!==id)return;
        const op=pointerOperation,dx=event.clientX-op.startX,dy=event.clientY-op.startY;
        if(kind==='move')state.rect=fit({...op.rect,x:op.rect.x+dx,y:op.rect.y+dy});
        else {const bounds=dimensions();state.rect={...op.rect,width:clamp(op.rect.width+dx,Math.min(300,bounds.width),bounds.width-op.rect.x),height:clamp(op.rect.height+dy,Math.min(220,bounds.height),bounds.height-op.rect.y)};}
        position(state);
      });
      const end=()=>{pointerOperation=null;delete shell.dataset.dragging;};
      handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);handle.addEventListener('lostpointercapture',end);
      handle.addEventListener('keydown',event=>{
        if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)||mobile.matches||state.maximized)return;
        event.preventDefault();const step=event.shiftKey?30:10,dx=event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0,dy=event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0;
        state.rect=fit(kind==='move'?{...state.rect,x:state.rect.x+dx,y:state.rect.y+dy}:{...state.rect,width:state.rect.width+dx,height:state.rect.height+dy});position(state);
      });
    }
    const frame=state.element.querySelector('iframe');
    if(frame)frame.addEventListener('load',()=>{
      try {
        const doc=frame.contentDocument;if(!doc)return;doc.documentElement.classList.add('sg-embedded');
        doc.addEventListener('pointerdown',()=>activate(id,false));
        doc.addEventListener('keydown',event=>{if(event.key==='Escape'&&!event.target.closest('input,textarea,select'))close(id);});
        doc.addEventListener('click',event=>{
          const link=event.target.closest('a');if(!link||link.target==='_blank'||link.hasAttribute('download')||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
          const url=new URL(link.href);if(url.origin!==location.origin)return;
          const target=url.pathname.startsWith('/panel-maker/')?'panels':{'/':'store','/store':'store','/looks/retro-messenger':'messenger','/custom':'custom','/claim':'free','/panels':'panels','/about':'about'}[url.pathname];
          if(target){event.preventDefault();openApp(target,{url:url.pathname+url.search+url.hash});}
        });
      } catch {live.textContent='Open this page in a separate tab to continue.';}
    });
  });
  function applyPreferences() {
    shell.style.setProperty('--desk-color',colors[preferences.color]);shell.dataset.dither=String(preferences.dither);
    shell.querySelector('[name=wallpaper][value='+preferences.color+']').checked=true;
    shell.querySelector('[data-dither]').checked=preferences.dither;shell.querySelector('[data-sounds]').checked=preferences.sounds;
    try{localStorage.setItem('senergy-desktop',JSON.stringify(preferences));}catch{}
  }
  shell.querySelectorAll('[name=wallpaper]').forEach(input=>input.addEventListener('change',()=>{preferences.color=input.value;applyPreferences();}));
  shell.querySelector('[data-dither]').addEventListener('change',event=>{preferences.dither=event.target.checked;applyPreferences();});
  shell.querySelector('[data-sounds]').addEventListener('change',event=>{preferences.sounds=event.target.checked;applyPreferences();if(preferences.sounds)sound();});
  shell.querySelector('[data-test-sound]').addEventListener('click',()=>sound(true));
  shell.querySelector('[data-reset-desktop]').addEventListener('click',()=>{
    preferences={color:'teal',dither:false,sounds:false};applyPreferences();shell.dispatchEvent(new Event('desktop:reset-icons'));
    windows.forEach((state,id)=>{state.rect=initialRect(id);state.maximized=false;});sync();live.textContent='Default desktop colors and window positions restored.';
  });
  const clock=shell.querySelector('[data-desktop-clock]');
  function tick(){const now=new Date();clock.textContent=now.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});clock.dateTime=now.toISOString();clock.title=now.toLocaleDateString(undefined,{dateStyle:'full'});}
  tick();setInterval(tick,15000);applyPreferences();
  const initial=location.hash==='#looks'?'looks':shell.dataset.initialApp;
  openApp(initial,{focus:false,route:false,url:['store','panels','custom','free','about'].includes(initial)?location.pathname+location.search+location.hash:undefined});
  const resizeObserver=new ResizeObserver(()=>{windows.forEach((state,id)=>{if(!state.rect)state.rect=initialRect(id);});sync();});
  resizeObserver.observe(workspace);
  window.addEventListener('popstate',event=>{
    const id=location.pathname==='/looks/retro-messenger'?'messenger':location.pathname==='/store'?'store':location.pathname.startsWith('/panel-maker/')?'panels':location.hash==='#looks'?'looks':({'/claim':'free','/custom':'custom','/about':'about','/panels':'panels'}[location.pathname]||event.state?.desktopApp||'store');
    openApp(id,{route:false,url:['store','panels','custom','free','about'].includes(id)?location.pathname+location.search+location.hash:undefined});
  });
})();
