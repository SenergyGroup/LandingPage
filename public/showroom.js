(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-demo]').forEach(demo => {
    const q=s=>demo.querySelector(s), chat=q('[data-chat-video]'), alert=q('[data-alert-video]'), goal=q('[data-goal-video]'), scene=q('[data-scene-video]');
    const play=q('[data-play]'), zoom=q('[data-zoom-toggle]'), stage=q('.sg-stage'), caption=q('[data-demo-caption]'), eventStatus=q('[data-event-status]');
    const allVideos=[chat,alert,goal,scene];
    // A paused video surface can disappear after being hidden or backgrounded.
    // Keep an ordinary image above it until frames are actually playing, and
    // capture pauses/completion so a finished goal still shows its final value.
    const previews=new Map([[chat,q('[data-chat-still]')],[goal,q('[data-goal-still]')]].map(([video,image])=>[video,{image,canvas:document.createElement('canvas'),time:null}]));
    const showStill=video=>{
      const preview=previews.get(video);if(!preview?.image)return;
      video.parentElement.classList.remove('sg-media-playing');
      if(video.readyState<2||video.seeking||video.error||!video.videoWidth||preview.time===video.currentTime)return;
      try{
        const {canvas}=preview;
        if(canvas.width!==video.videoWidth||canvas.height!==video.videoHeight){canvas.width=video.videoWidth;canvas.height=video.videoHeight;}
        canvas.getContext('2d').drawImage(video,0,0);
        preview.image.src=canvas.toDataURL('image/png');preview.time=video.currentTime;
      }catch{/* The existing product still remains visible if frame capture is unavailable. */}
    };
    previews.forEach((preview,video)=>{
      video.addEventListener('playing',()=>{if(!video.paused&&!video.ended)video.parentElement.classList.add('sg-media-playing');});
      for(const event of ['pause','ended','waiting','error'])video.addEventListener(event,()=>showStill(video));
    });
    let generation=0, eventSerial=0, playing=false;
    const modes={plain:'Your stream before the Messenger look.',chat:'The Messenger chat window, with your own scene.',alert:'Buddy alerts on your existing scene. Try a follower, subscriber or raid.',goal:'The real file-transfer goal. Watch demonstration followers fill it.',kit:'Chat, alerts, goal and game frame. Try the scene screens below.'};
    const sync=()=>{playing=allVideos.some(v=>!v.paused&&!v.ended);play.textContent=playing?'Ⅱ Pause demo':'▶ Play demo';play.setAttribute('aria-pressed',String(playing));};
    const pause=()=>{generation++;allVideos.forEach(v=>{v.pause();showStill(v);});sync();};
    const start=async video=>{const run=generation;try{await video.play();if(run!==generation)video.pause();}catch(error){if(error.name!=='AbortError')caption.textContent='The still preview is available. This recording could not play.';}sync();};
    allVideos.forEach(video=>{video.addEventListener('play',sync);video.addEventListener('pause',sync);video.addEventListener('ended',sync);video.addEventListener('error',()=>{caption.textContent='A recording could not load. The product stills remain available.';});});
    const setZoom=value=>{stage.dataset.zoom=String(value);zoom.setAttribute('aria-pressed',String(value));zoom.textContent=value?'− Full scene':'＋ Chat close-up';};
    const buttons=()=>{
      const live=demo.dataset.scene==='live',mode=demo.dataset.mode;
      zoom.disabled=!live||!['chat','kit'].includes(mode);
      demo.querySelectorAll('[data-fire-alert]').forEach(b=>b.disabled=!live||!['alert','kit'].includes(mode));
      q('[data-run-goal]').disabled=!live||!['goal','kit'].includes(mode);
      play.disabled=mode==='plain';
    };
    const setScene=(name,animate=false)=>{
      pause();setZoom(false);alert.hidden=true;q('[data-alert-still]').hidden=false;demo.dataset.scene=name;
      demo.querySelectorAll('[data-scene-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sceneChoice===name)));
      scene.hidden=name==='live';eventStatus.textContent='';
      if(name!=='live'){
        demo.dataset.mode='kit';demo.querySelectorAll('[data-mode-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.modeChoice==='kit')));
        scene.poster='/public/showroom/messenger/'+name+'.webp';scene.src='/public/showroom/messenger/'+name+'.mp4';scene.load();
        caption.textContent={starting:'Starting Soon: sign on, settle in, and meet the buddy list.',brb:'Be Right Back: your actual away-message scene.',ending:'Ending: the actual sign-off scene from the kit.'}[name];
        if(animate&&!reduceMotion.matches)start(scene);
      }else caption.textContent=modes[demo.dataset.mode];
      buttons();
    };
    const setMode=mode=>{setScene('live');demo.dataset.mode=mode;demo.querySelectorAll('[data-mode-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.modeChoice===mode)));caption.textContent=modes[mode];buttons();};
    const fireAlert=async kind=>{
      setZoom(false);const serial=++eventSerial;alert.hidden=false;q('[data-alert-still]').hidden=true;
      alert.src='/public/showroom/messenger/'+kind+'.webm';alert.load();eventStatus.textContent={follow:'Demo: PixelPal_98 followed',subscriber:'Demo: RetroFan42 subscribed',raid:'Demo: CozyCrew_TV is raiding'}[kind];
      await start(alert);if(serial!==eventSerial)return;
    };
    alert.addEventListener('ended',()=>{alert.hidden=true;q('[data-alert-still]').hidden=true;if(goal.paused)eventStatus.textContent='';});
    alert.addEventListener('error',()=>{alert.hidden=true;q('[data-alert-still]').hidden=false;});
    const runGoal=()=>{setZoom(false);const preview=previews.get(goal);if(preview?.image){preview.image.src=goal.poster;preview.time=null;}goal.currentTime=0;eventStatus.textContent='Demo: 42 → 50 followers';start(goal);};
    goal.addEventListener('ended',()=>{eventStatus.textContent='Demo goal complete — 50 / 50';});
    play.addEventListener('click',()=>{
      if(playing){pause();return;}
      if(demo.dataset.scene!=='live'){start(scene);return;}
      const mode=demo.dataset.mode;
      if(['chat','kit'].includes(mode))start(chat);
      if(['alert','kit'].includes(mode))fireAlert('follow');
      if(['goal','kit'].includes(mode))runGoal();
    });
    demo.querySelectorAll('[data-mode-choice]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.modeChoice)));
    demo.querySelectorAll('[data-scene-choice]').forEach(b=>b.addEventListener('click',()=>setScene(b.dataset.sceneChoice,true)));
    demo.querySelectorAll('[data-fire-alert]').forEach(b=>b.addEventListener('click',()=>fireAlert(b.dataset.fireAlert)));
    q('[data-run-goal]').addEventListener('click',runGoal);
    zoom.addEventListener('click',()=>setZoom(stage.dataset.zoom!=='true'));
    new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)pause();},{threshold:0.1}).observe(demo);
    const ownerWindow=demo.closest('[data-window]');
    if(ownerWindow)new MutationObserver(()=>{if(ownerWindow.hidden)pause();}).observe(ownerWindow,{attributes:true,attributeFilter:['hidden']});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
    reduceMotion.addEventListener('change',pause);buttons();
  });
  const browser = document.querySelector('[data-component-browser]');
  if (browser) {
    const parts=JSON.parse(document.getElementById('messenger-parts').textContent);
    const tabs=[...browser.querySelectorAll('[role=tab]')];
    const select=tab=>{
      const part=parts.find(p=>p.id===tab.dataset.part);
      tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
      const img=browser.querySelector('[data-part-image]');
      img.src=part.image.startsWith('/')?part.image:`/public/showroom/${part.image}`;
      img.alt=`${part.name} product preview`;
      browser.querySelector('[data-part-image-wrap]').dataset.partKind=part.id;
      ['label','detail','platform','includes'].forEach(key=>browser.querySelector(`[data-part-${key}]`).textContent=part[key]);
      browser.querySelector('[role=tabpanel]').setAttribute('aria-labelledby',tab.id);
    };
    tabs.forEach((tab,index)=>{
      tab.addEventListener('click',()=>select(tab));
      tab.addEventListener('keydown',event=>{
        let target;
        if(['ArrowDown','ArrowRight'].includes(event.key))target=tabs[(index+1)%tabs.length];
        if(['ArrowUp','ArrowLeft'].includes(event.key))target=tabs[(index+tabs.length-1)%tabs.length];
        if(event.key==='Home')target=tabs[0];
        if(event.key==='End')target=tabs.at(-1);
        if(target){event.preventDefault();target.focus();select(target);}
      });
    });
  }
})();
