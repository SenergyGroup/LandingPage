import { renderDesktop } from "./desktop-content.mjs";
// Editorial presentation only. Prices and checkout destinations remain in widgets.json.
const A = '/public/showroom';
const escape = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const controls = '<span aria-hidden="true" class="sg-window-controls">_ □ ×</span>';

export const messengerParts = [
  {id:'chat', name:'Chat widget', image:'messenger/chat.webp', label:'That familiar IM window, with your actual chat.', detail:'Viewer messages arrive inside the messenger window. Customize its title, colors and text size.', platform:'Streamlabs or StreamElements → OBS', includes:'Chat only + full kit'},
  {id:'alert', name:'Alerts', image:'messenger/alert.webp', label:'A new buddy has entered the chat.', detail:'Matching popups for follows, subscriptions, tips, cheers and raids. The recorded preview is silent.', platform:'StreamElements → OBS', includes:'Full kit'},
  {id:'starting', name:'Starting Soon', image:'messenger/starting.webp', label:'Give everyone a place to hang out.', detail:'A sign-on scene with an editable screen name, status lines, progress animation and buddy list.', platform:'StreamElements → OBS', includes:'Full kit'},
  {id:'brb', name:'Be Right Back', image:'messenger/brb.webp', label:'Set your away message.', detail:'A coordinated pause screen for the snack break, stretch break, or inevitable doorbell.', platform:'StreamElements → OBS', includes:'Full kit'},
  {id:'ending', name:'Ending scene', image:'messenger/ending.webp', label:'A proper sign-off.', detail:'Close the stream with a matching end scene and your own message.', platform:'StreamElements → OBS', includes:'Full kit'},
  {id:'goal', name:'Goal bar', image:'messenger/goal.webp', label:'Your next goal, downloading.', detail:'A file-transfer-style goal bar with an editable label and target.', platform:'StreamElements → OBS', includes:'Full kit'},
  {id:'frame', name:'Game frame', image:'messenger/frame.webp', label:'Put your game in its own little window.', detail:'A transparent window frame sits around your game or camera source. The stock illustration in our demo is not part of the kit.', platform:'StreamElements → OBS', includes:'Full kit'},
  {id:'panels', name:'Twitch panels', image:'/public/images/panels/retro-messenger/about.png', label:'Carry the look below your stream.', detail:'Personalize matching panels in the existing Panel Maker, then export PNGs for your Twitch About section.', platform:'PNG graphics for Twitch channel panels', includes:'Full kit + available Panel Maker'},
];

const assetPath = part => part.image.startsWith('/') ? part.image : `${A}/${part.image}`;
const checkout = (widgets, id, label, addUtm, content, cls='sg-button') => {
  const product = widgets.find(w => w.id === id);
  // A missing exact offer must not silently turn into a shop-homepage link.
  if (!product?.etsyUrl || product.etsyLinkType === 'shop' || !/^https:\/\/(www\.)?etsy\.com\/listing\/\d+\//.test(product.etsyUrl)) {
    return '<span class="sg-offer-unavailable">This offer is being updated.</span>';
  }
  return `<a class="${cls}" data-product-id="${escape(id)}" href="${escape(addUtm(product.etsyUrl,{slug:id,content}))}" target="_blank" rel="noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>`;
};

export function renderTransformation(id) {
  return `<section class="sg-demo" data-demo data-mode="kit" data-scene="live" aria-label="Retro Messenger stream comparison">
    <div class="sg-demo-intro"><b>Make your stream feel like you.</b><span>Try the pieces. Fire an alert. Find your setup.</span></div>
    <div class="sg-demo-toolbar" role="group" aria-label="Choose a stream appearance">
      ${[['plain','Before'],['chat','Chat only'],['alert','Alerts only'],['goal','Goal only'],['kit','Full kit']].map(([v,l])=>`<button type="button" data-mode-choice="${v}" aria-pressed="${v==='kit'}">${l}</button>`).join('')}
    </div>
    <div class="sg-stage" id="${id}-stage" data-zoom="false">
      <div class="sg-game-area"><img class="sg-landscape" src="${A}/pixabay-pacman-7024232.png" alt="Colorful arcade characters, stock illustration by KoikeYusuke on Pixabay" width="1280" height="640"><img class="sg-frame-layer" src="${A}/messenger/frame.webp" alt="Actual Retro Messenger game frame" width="960" height="540"></div>
      <div class="sg-plain-chat"><span>STREAM CHAT</span><p><b>PixelPal</b> hey everyone!</p><p><b>CozyCrew</b> one more round?</p><p><b>NightOwl</b> famous last words</p><p><b>PixelPal</b> new high score incoming</p></div>
      <div class="sg-product-chat"><img class="sg-preview-still" data-chat-still src="${A}/messenger/chat.webp" alt="Retro Messenger chat preview" width="392" height="652"><video data-chat-video muted loop playsinline preload="none" poster="${A}/messenger/chat.webp" aria-label="Actual Messenger chat recording with fictional messages"><source src="${A}/messenger/chat.mp4" type="video/mp4"></video></div>
      <div class="sg-alert-layer"><img data-alert-still src="${A}/messenger/follow.webp" alt="Buddy sign-on alert preview"><video data-alert-video muted playsinline preload="none" aria-label="Recorded alert popup" hidden></video></div>
      <div class="sg-goal-layer"><img class="sg-preview-still" data-goal-still src="${A}/messenger/goal.webp" alt="Retro Messenger file-transfer goal preview" width="680" height="114"><video data-goal-video muted playsinline preload="none" poster="${A}/messenger/goal.webp" aria-label="Actual goal widget, demonstration followers increase the goal"><source src="${A}/messenger/goal.mp4" type="video/mp4"></video></div>
      <video class="sg-scene-video" data-scene-video muted loop playsinline preload="none" aria-label="Actual kit scene animation" hidden></video>
      <div class="sg-event-indicator" data-event-status role="status" aria-live="polite"></div>
    </div>
    <div class="sg-demo-actions"><button type="button" class="sg-small-button" data-play aria-pressed="false">▶ Play demo</button><button type="button" class="sg-small-button" data-zoom-toggle aria-pressed="false" aria-controls="${id}-stage">＋ Chat close-up</button><button type="button" class="sg-small-button" data-fire-alert="follow">New follower</button><button type="button" class="sg-small-button" data-fire-alert="subscriber">New subscriber</button><button type="button" class="sg-small-button" data-fire-alert="raid">Incoming raid</button><button type="button" class="sg-small-button" data-run-goal>Fill the goal</button></div>
    <div class="sg-scene-controls" role="group" aria-label="Full kit scenes"><span>Kit scenes:</span>${[['live','On stream'],['starting','Starting Soon'],['brb','Be Right Back'],['ending','Ending']].map(([v,l])=>`<button type="button" class="sg-small-button" data-scene-choice="${v}" aria-pressed="${v==='live'}">${l}</button>`).join('')}</div>
    <p class="sg-demo-caption" data-demo-caption aria-live="polite">Chat, alerts, goal and game frame. Try the scene screens below.</p>
    <p class="sg-demo-note">Actual product recordings · fictional events · <a href="https://pixabay.com/illustrations/pacman-video-game-7024232/" target="_blank" rel="noopener noreferrer">stock illustration: KoikeYusuke / Pixabay</a>, not included in the kit.</p>
  </section>`;
}

const desktop = (options, initial) => renderDesktop({
  ...options, initial, parts: messengerParts, transformation: renderTransformation, checkout
});
export const renderShowroomHome = options => desktop(options, options.initial || 'store');
export const renderMessengerLook = options => desktop(options, 'messenger');
