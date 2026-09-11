  /* ───────────────────────── pixel art (Luna palette) ─────────── */
  var PAL = {
    k: '#00138c', w: '#ffffff', b: '#3f8cf3', n: '#245edb', r: '#e8462f', g: '#7f9db9',
    e: '#3c9e33', E: '#5bc146', p: '#c8d4e8', y: '#f7c631', Y: '#c9930a', d: '#1c1c1c',
    f: '#fde68a', F: '#e9b64a', o: '#f28c28'
  };
  // The first five are the Windows XP kit's own panel icons (widgets/sku-xp-06-panels/panels.json),
  // transcribed pixel for pixel; the rest were drawn for this maker in the same 16x16 Luna style.
  var ICONS = {
    about: [
      '................',
      '.kkkkkkkkkkkkkk.',
      '.kbbbbbbbbbbbbk.',
      '.knnnnnnnnnnrnk.',
      '.knnnnnnnnnnnnk.',
      '.kwwwwwwwwwwwwk.',
      '.kwwwwwwwwwwwwk.',
      '.kwwggggggggwwk.',
      '.kwwwwwwwwwwwwk.',
      '.kwwggggggwwwwk.',
      '.kwwwwwwwwwwwwk.',
      '.kwwggggwwwwwwk.',
      '.kwwwwwwwwwwwwk.',
      '.kkkkkkkkkkkkkk.',
      '................',
      '................'
    ],
    schedule: [
      '................',
      '....gg....gg....',
      '....gg....gg....',
      '..kkkkkkkkkkkk..',
      '..kbbbbbbbbbbk..',
      '..knnnnnnnnnnk..',
      '..knnnnnnnnnnk..',
      '..kwwwwwwwwwwk..',
      '..kwggwggwrrwk..',
      '..kwggwggwrrwk..',
      '..kwwwwwwwwwwk..',
      '..kwggweewwwwk..',
      '..kwggweewwwwk..',
      '..kkkkkkkkkkkk..',
      '................',
      '................'
    ],
    rules: [   // solid shield: dark rim, blue body with a lighter left highlight, white tick
      '................',
      '....kkkkkkkk....',
      '...kbbbnnnnnk...',
      '..kbbbnnnnnnnk..',
      '..kbbnnnnnnnnk..',
      '..kbbnnnnnwnnk..',
      '..kbbwnnnwnnnk..',
      '..kbbnwnwnnnnk..',
      '..kbbnnwnnnnnk..',
      '...kbbnnnnnnk...',
      '...kbbnnnnnnk...',
      '....kbnnnnnk....',
      '....kbnnnnnk....',
      '.....kbnnnk.....',
      '......kkkk......',
      '................'
    ],
    socials: [
      '................',
      '.kkkkkkkk.......',
      '.kbbbbbbk.......',
      '.kbwbbbbk.......',
      '.kbbbbbbk.......',
      '.kbbbbbkkkkkkkk.',
      '.kbbbbbkEEEEEEk.',
      '.kkkkkkkEwEEEEk.',
      '....gg.kEEEEEEk.',
      '...ggggkEEEEEEk.',
      '.......kEEEEEEk.',
      '.......kkkkkkkk.',
      '..........gg....',
      '.........gggg...',
      '................',
      '................'
    ],
    donate: [
      '................',
      '.....kkkkkkkkk..',
      '.....kwwwwwppk..',
      '.....kwwwwwppk..',
      '.gg..kwggggwwk..',
      '.....kwwwwwwwk..',
      '.....kwgggggwk..',
      'ggg..kwwwwwwwk..',
      '.....kwgggwwwk..',
      '.....kwwwwwwwk..',
      '.gg..kwrrwrrwk..',
      '.....kwrrrrrwk..',
      '.....kwwrrrwwk..',
      '.....kwwwrwwwk..',
      '.....kkkkkkkkk..',
      '................'
    ],
    chat: [
      '................',
      '.kkkkkkkkkk.....',
      '.kbbbbbbbbbk....',
      '.kbbwbwbwbbk....',
      '.kbbbbbbbbbk....',
      '.kbbbbbbbbbk....',
      '.kkkbbkkkkkkkkk.',
      '...kbbkEEEEEEEk.',
      '...kkkkEEEEEEEk.',
      '.......kEEwEwEk.',
      '.......kEEEEEEk.',
      '.......kEEEEEEk.',
      '.......kkkkkkEk.',
      '............kEk.',
      '............kk..',
      '................'
    ],
    star: [
      '................',
      '.......YY.......',
      '......YyyY......',
      '......YyyY......',
      '.....YyyyyY.....',
      'YYYYYYyyyyYYYYYY',
      'YyyyyyyyyyyyyyyY',
      '.YyyyyyyyyyyyyY.',
      '..YyyyyyyyyyyY..',
      '...YyyyyyyyyY...',
      '...YyyyyyyyyY...',
      '..YyyyyYYyyyyY..',
      '..YyyYY..YYyyY..',
      '.YyYY......YYyY.',
      '.YY..........YY.',
      '................'
    ],
    cmd: [
      '................',
      '.kkkkkkkkkkkkkk.',
      '.kbbbbbbbbbbbbk.',
      '.knnnnnnnnnnrnk.',
      '.kddddddddddddk.',
      '.kdwwdddddddddk.',
      '.kddwwddddddddk.',
      '.kdddwwdddddddk.',
      '.kddwwddwwwwddk.',
      '.kdwwdddddddddk.',
      '.kddddddddddddk.',
      '.kddddddddddddk.',
      '.kddddddddddddk.',
      '.kkkkkkkkkkkkkk.',
      '................',
      '................'
    ],
    pc: [
      '................',
      '..kkkkkkkkkkkk..',
      '..kppppppppppk..',
      '..kpkkkkkkkkpk..',
      '..kpkbbbbbbkpk..',
      '..kpkbwbbbbkpk..',
      '..kpkbbbbbbkpk..',
      '..kpkbbbbbbkpk..',
      '..kpkkkkkkkkpk..',
      '..kppppppppppk..',
      '..kkkkkkkkkkkk..',
      '......kkkk......',
      '....kkppppkk....',
      '....kppppppk....',
      '....kkkkkkkk....',
      '................'
    ],
    folder: [
      '................',
      '.YYYYYY.........',
      'YffffffY........',
      'YffffffYYYYYYYY.',
      'YffffffffffffffY',
      'YFFFFFFFFFFFFFFY',
      'YfffffffffffffFY',
      'YfffffffffffffFY',
      'YfffffffffffffFY',
      'YfffffffffffffFY',
      'YfffffffffffffFY',
      'YfffffffffffffFY',
      'YFFFFFFFFFFFFFFY',
      '.YYYYYYYYYYYYYY.',
      '................',
      '................'
    ],
    cart: [   // solid basket with a highlight band, two wheels
      '................',
      'kk..............',
      '.kk.............',
      '..kkkkkkkkkkkk..',
      '..kbbbbbbbbbbk..',
      '..knnwnnwnnwnk..',
      '...knnnnnnnnk...',
      '...knnwnnwnnk...',
      '....knnnnnnk....',
      '....kkkkkkkk....',
      '....k......k....',
      '...kkk....kkk...',
      '...kwk....kwk...',
      '...kkk....kkk...',
      '................',
      '................'
    ],
    help: [
      '................',
      '.....kkkkkk.....',
      '...kkbbbbbbkk...',
      '..kbbbbbbbbbbk..',
      '.kbbbbwwwwbbbbk.',
      '.kbbbwwbbwwbbbk.',
      'kbbbbbbbbbwwbbbk',
      'kbbbbbbbbwwbbbbk',
      'kbbbbbbbwwbbbbbk',
      'kbbbbbbbwwbbbbbk',
      '.kbbbbbbbbbbbbk.',
      '.kbbbbbbwwbbbbk.',
      '..kbbbbbwwbbbk..',
      '...kkbbbbbbkk...',
      '.....kkkkkk.....',
      '................'
    ],
    user: [   // the stock user picture: a rubber duck on a sky tile
      'pppppppppppppppp',
      'pppppppppppppppp',
      'ppppppYYYYpppppp',
      'pppppYyyyyYppppp',
      'ppppYyyyyyyYpppp',
      'ppppYyydyyyYpppp',
      'pppoooyyyyyYpppp',
      'ppoooooyyyyYpppp',
      'pppoooYyyyyYYYpp',
      'ppppppYyyyyyyyYp',
      'pppppYyyyyyyyyYp',
      'ppppYyyyyyyyyyYp',
      'ppppYyyyyyyyyYpp',
      'pppppYyyyyyyYppp',
      'ppppppYYYYYYpppp',
      'pppppppppppppppp'
    ]
  };
  var ICON_KEYS = ['about', 'schedule', 'rules', 'socials', 'chat', 'star', 'donate', 'cmd', 'pc', 'folder', 'cart', 'help'];
  var ICON_NAMES = { about: 'Document', schedule: 'Calendar', rules: 'Shield', socials: 'Network', chat: 'Chat', star: 'Star', donate: 'File copy', cmd: 'Command prompt', pc: 'My computer', folder: 'Folder', cart: 'Cart', help: 'Help' };

  /* ───────────────────────── 16px icon shading ───────────────── */
  // The 16x16 grids above are flat 16-colour art; XP's small icons were gradient-lit with outlines in
  // a dark tone of whatever they wrap. smallIcon() does that at load: every fill gets a top-left →
  // bottom-right light ramp inside its own colour region, and each navy 'k' outline pixel takes a dark
  // shade of the fill it touches (grey for pages, green for green, gold for gold...).
  function hx2(c) { var n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function tone(rgb, f) {   // f > 0 lightens toward white, f < 0 darkens toward black
    return rgb.map(function (v) { return Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)); });
  }
  var smallCache = {};
  function smallIcon(key, rows) {
    rows = rows || ICONS[key]; if (!rows) return null;
    var ck = key || rows.join('');
    if (smallCache[ck]) return smallCache[ck];
    var N = rows.length, M = rows[0].length, i, j;
    var cv = document.createElement('canvas'); cv.width = M; cv.height = N;
    var c = cv.getContext('2d'), img = c.createImageData(M, N), d = img.data;
    // colour regions (4-connected runs of the same fill letter) → each gets its own light ramp
    var reg = [], box = [], id = 0;
    for (i = 0; i < N; i++) { reg.push([]); for (j = 0; j < M; j++) reg[i].push(-1); }
    for (i = 0; i < N; i++) for (j = 0; j < M; j++) {
      var ch = rows[i][j]; if (ch === '.' || ch === 'k' || reg[i][j] >= 0) continue;
      var st = [[i, j]], b = [i, j, i, j]; reg[i][j] = id;
      while (st.length) {
        var p = st.pop();
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (o) {
          var y = p[0] + o[0], x = p[1] + o[1];
          if (y < 0 || x < 0 || y >= N || x >= M || reg[y][x] >= 0 || rows[y][x] !== ch) return;
          reg[y][x] = id; st.push([y, x]);
          b[0] = Math.min(b[0], y); b[1] = Math.min(b[1], x); b[2] = Math.max(b[2], y); b[3] = Math.max(b[3], x);
        });
      }
      box.push(b); id++;
    }
    for (i = 0; i < N; i++) for (j = 0; j < M; j++) {
      var ch2 = rows[i][j], rgb, o4 = (i * M + j) * 4;
      if (ch2 === '.') continue;
      if (ch2 === 'k') {   // outline: dark tone of the most common neighbouring fill
        var cnt = {}, best = null, bn = 0;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          var yy = i + dy, xx = j + dx; if (yy < 0 || xx < 0 || yy >= N || xx >= M) continue;
          var n = rows[yy][xx]; if (n === '.' || n === 'k') continue;
          cnt[n] = (cnt[n] || 0) + 1; if (cnt[n] > bn) { bn = cnt[n]; best = n; }
        }
        var base = best ? hx2(PAL[best]) : [0, 19, 140];
        var lumv = (base[0] * 0.3 + base[1] * 0.59 + base[2] * 0.11) / 255;
        rgb = best === 'w' || best === 'p' || best === 'g' || best === 'd' ? [0x4a, 0x5a, 0x78]   // pages, grey + black things: slate outline
          : tone(base, lumv > 0.6 ? -0.55 : -0.5);
        if (best === 'b' || best === 'n') rgb = [0x10, 0x32, 0x8c];                                  // blue things keep a deep-blue rim
      } else {
        var bb = box[reg[i][j]], h = Math.max(1, bb[2] - bb[0]), w = Math.max(1, bb[3] - bb[1]);
        var t = ((i - bb[0]) / h + (j - bb[1]) / w) / 2;          // 0 = top-left of its region, 1 = bottom-right
        var base2 = hx2(PAL[ch2] || '#ff00ff');
        var big = (bb[2] - bb[0]) >= 2 && (bb[3] - bb[1]) >= 2;   // one-pixel details (ticks, dots, lines) stay flat
        rgb = !big ? base2 : ch2 === 'w' ? tone(base2, -0.16 * t) : ch2 === 'd' ? tone(hx2('#3a3a3a'), -0.9 * t) : tone(base2, t < 0.5 ? 0.34 * (0.5 - t) * 2 : -0.2 * (t - 0.5) * 2);
      }
      d[o4] = rgb[0]; d[o4 + 1] = rgb[1]; d[o4 + 2] = rgb[2]; d[o4 + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    smallCache[ck] = cv;
    return cv;
  }

  /* ───────────────────────── 32-bit icons (tile size) ─────────── */
  // XP drew its 32x32 icons as soft, anti-aliased art: light from the top-left, a darker tone of the
  // fill as the outline (never one navy line round everything), a glossy highlight and a soft drop
  // shadow to the bottom-right. These are drawn in a 32-unit box with canvas paths, rendered ONCE at
  // 1x (so Twitch's 320px column gets exactly these pixels) and blitted at 2x like the text.
  // The 16x16 pixel grids above stay for the title bar and the maker's buttons (XP had separate
  // small-size art too).
  function lgr(c, x0, y0, x1, y1, stops) {
    var g = c.createLinearGradient(x0, y0, x1, y1);
    for (var i = 0; i < stops.length; i += 2) g.addColorStop(stops[i], stops[i + 1]);
    return g;
  }
  function rgr(c, x, y, r0, x1, y1, r1, stops) {
    var g = c.createRadialGradient(x, y, r0, x1, y1, r1);
    for (var i = 0; i < stops.length; i += 2) g.addColorStop(stops[i], stops[i + 1]);
    return g;
  }
  function rrp(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function fs(c, fill, stroke, lw) { c.fillStyle = fill; c.fill(); if (stroke) { c.lineWidth = lw || 1; c.strokeStyle = stroke; c.stroke(); } }
  function gloss(c, x, y, w, h, a) {   // the soft white sheen across the top of a glossy shape
    c.save(); c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    c.fillStyle = lgr(c, 0, y, 0, y + h, [0, 'rgba(255,255,255,' + a + ')', 1, 'rgba(255,255,255,0)']); c.fill(); c.restore();
  }
  // a small Luna window (blue caption, beige menu, white client) — shared by Document and Command prompt
  function vWindow(c, client) {
    rrp(c, 3.5, 4.5, 25, 22, 2.5); fs(c, '#ffffff', '#1d4ab8');
    c.save(); rrp(c, 3.5, 4.5, 25, 22, 2.5); c.clip();
    c.fillStyle = lgr(c, 0, 4.5, 0, 10.5, [0, '#5c9dff', 0.3, '#2b6ee8', 1, '#1f55c9']); c.fillRect(3, 4, 26, 6.5);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(4, 5, 24, 1.2);
    c.fillStyle = client; c.fillRect(4, 10.5, 24, 16);
    c.restore();
    rrp(c, 23, 6, 4, 3.5, 0.8); fs(c, lgr(c, 0, 6, 0, 9.5, [0, '#ff9c86', 1, '#d8351f']));   // the red close button
  }
  var VEC = {
    about: function (c) {
      vWindow(c, lgr(c, 0, 10, 0, 27, [0, '#ffffff', 1, '#e9eef7']));
      c.fillStyle = '#ece9d8'; c.fillRect(4, 10.5, 24, 2.5);
      c.fillStyle = '#b9c3d3'; c.fillRect(4, 13, 24, 0.8);
      c.fillStyle = '#2f64d6'; c.fillRect(7, 15.5, 9, 2);                     // a bold heading line
      c.fillStyle = '#8ea3c4'; c.fillRect(7, 19, 17, 1.4); c.fillRect(7, 21.6, 14, 1.4); c.fillRect(7, 24.2, 16, 1.4);
    },
    cmd: function (c) {
      vWindow(c, lgr(c, 0, 10, 0, 27, [0, '#2a2a2a', 1, '#050505']));
      c.strokeStyle = '#e8e8e8'; c.lineWidth = 1.8; c.lineCap = 'square';
      c.beginPath(); c.moveTo(7.5, 14.5); c.lineTo(11, 17.5); c.lineTo(7.5, 20.5); c.stroke();
      c.fillStyle = '#e8e8e8'; c.fillRect(12.5, 20, 7, 1.8);
      c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(4, 10.5, 24, 5);
    },
    schedule: function (c) {
      rrp(c, 4.5, 6.5, 23, 21, 2.5); fs(c, lgr(c, 0, 6, 0, 28, [0, '#ffffff', 1, '#e3e8f1']), '#6d7f9c');
      c.save(); rrp(c, 4.5, 6.5, 23, 21, 2.5); c.clip();
      c.fillStyle = lgr(c, 0, 6.5, 0, 12.5, [0, '#ff8c73', 0.45, '#e8462f', 1, '#bf2e1a']); c.fillRect(4, 6, 24, 6.5);
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(5, 7, 22, 1.3);
      c.restore();
      c.strokeStyle = '#6d7f9c'; c.lineWidth = 1; c.beginPath(); c.moveTo(5, 12.5); c.lineTo(27, 12.5); c.stroke();
      [[10, 3], [22, 3]].forEach(function (p) {   // binder rings
        rrp(c, p[0] - 1.5, p[1], 3, 7, 1.5); fs(c, lgr(c, p[0] - 1.5, 0, p[0] + 1.5, 0, [0, '#8a93a3', 0.45, '#ffffff', 1, '#7a8394']), '#59606d', 0.8);
      });
      for (var r = 0; r < 3; r++) for (var q = 0; q < 4; q++) {
        var x = 7 + q * 5, y = 14.5 + r * 4.2, on = r === 1 && q === 2;
        c.fillStyle = on ? '#2f64d6' : '#c6d2e6'; c.fillRect(x, y, 3.6, 3);
      }
    },
    rules: function (c) {
      c.beginPath(); c.moveTo(16, 2.5); c.bezierCurveTo(20, 4.8, 24, 5.6, 27.5, 5.8);
      c.bezierCurveTo(27.8, 17, 24, 25, 16, 29.5); c.bezierCurveTo(8, 25, 4.2, 17, 4.5, 5.8);
      c.bezierCurveTo(8, 5.6, 12, 4.8, 16, 2.5); c.closePath();
      fs(c, lgr(c, 6, 4, 26, 28, [0, '#8cc0ff', 0.4, '#3b7cf0', 1, '#163f9e']), '#133a8f', 1.2);
      c.save(); c.clip();
      c.beginPath(); c.moveTo(16, 2.5); c.lineTo(16, 30); c.lineTo(3, 30); c.lineTo(3, 2); c.closePath();
      c.fillStyle = 'rgba(255,255,255,0.14)'; c.fill();   // the lit left half
      gloss(c, 6, 3, 20, 10, 0.55);
      c.restore();
      c.strokeStyle = 'rgba(8,30,90,0.45)'; c.lineWidth = 3.6; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(10.5, 16.5); c.lineTo(14.5, 20.8); c.lineTo(22, 11.8); c.stroke();
      c.strokeStyle = '#ffffff'; c.lineWidth = 2.6;
      c.beginPath(); c.moveTo(10, 16); c.lineTo(14, 20.2); c.lineTo(21.5, 11.2); c.stroke();
    },
    socials: function (c) {
      function mon(x, y, scr) {
        rrp(c, x + 0.5, y + 0.5, 15, 12, 1.5); fs(c, lgr(c, 0, y, 0, y + 13, [0, '#fbfbf8', 1, '#c9c9c0']), '#7c7f86');
        rrp(c, x + 2.5, y + 2.5, 11, 8, 0.8); fs(c, scr, '#4a5363', 0.8);
        c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x + 3, y + 3, 10, 2.2);
        c.fillStyle = lgr(c, 0, y + 13, 0, y + 16, [0, '#dcdcd4', 1, '#a9a9a0']); c.fillRect(x + 5, y + 13, 6, 2.2);
        c.fillStyle = '#8b8e95'; c.fillRect(x + 4, y + 15, 8, 1);
      }
      c.strokeStyle = '#6f7a8c'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(9, 18); c.bezierCurveTo(9, 26, 22, 22, 22, 28); c.stroke();
      mon(1, 2, lgr(c, 0, 4, 0, 12, [0, '#7fb4ff', 1, '#1f55c9']));
      mon(15, 13, lgr(c, 0, 15, 0, 23, [0, '#9be58c', 1, '#2f9b2f']));
    },
    chat: function (c) {
      function bub(x, y, w, h, tailL, a, b, rim) {
        c.beginPath(); rrp(c, x, y, w, h, 4);
        fs(c, lgr(c, 0, y, 0, y + h, [0, a, 1, b]), rim, 1.1);
        c.beginPath();
        if (tailL) { c.moveTo(x + 4, y + h - 0.6); c.lineTo(x + 3, y + h + 4.5); c.lineTo(x + 9, y + h - 0.6); }
        else { c.moveTo(x + w - 9, y + h - 0.6); c.lineTo(x + w - 3, y + h + 4.5); c.lineTo(x + w - 4, y + h - 0.6); }
        c.fillStyle = b; c.fill(); c.strokeStyle = rim; c.lineWidth = 1.1; c.stroke();
        c.fillStyle = b; c.fillRect(tailL ? x + 4.6 : x + w - 8.4, y + h - 1.6, 3.8, 1.6);
        gloss(c, x + 2, y + 1, w - 4, h * 0.55, 0.6);
        c.fillStyle = '#ffffff'; for (var i = 0; i < 3; i++) { c.beginPath(); c.arc(x + w / 2 - 4 + i * 4, y + h / 2 + 0.5, 1.2, 0, Math.PI * 2); c.fill(); }
      }
      bub(2.5, 3.5, 18, 12, true, '#7fb4ff', '#2463d8', '#15409e');
      bub(11.5, 13.5, 18, 11, false, '#a7ec95', '#36a834', '#1f7a1f');
    },
    star: function (c) {
      var pts = [], i;
      for (i = 0; i < 10; i++) { var ang = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? 6.4 : 14; pts.push([16 + rad * Math.cos(ang), 17 + rad * Math.sin(ang)]); }
      c.beginPath(); pts.forEach(function (p, k) { k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.closePath();
      c.lineJoin = 'round';
      fs(c, rgr(c, 12, 10, 1, 16, 17, 16, [0, '#fff6c2', 0.35, '#ffd84a', 1, '#e39a06']), '#b27405', 1.2);
      c.save(); c.clip();
      c.beginPath(); c.moveTo(16, 3); c.lineTo(16, 17); c.lineTo(2, 12); c.closePath(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fill();   // lit facets
      c.beginPath(); c.moveTo(16, 17); c.lineTo(30, 12); c.lineTo(26, 31); c.closePath(); c.fillStyle = 'rgba(160,90,0,0.18)'; c.fill();     // shaded facet
      c.restore();
    },
    donate: function (c) {
      c.beginPath(); c.moveTo(5.5, 2.5); c.lineTo(18.5, 2.5); c.lineTo(24.5, 8.5); c.lineTo(24.5, 28.5); c.lineTo(5.5, 28.5); c.closePath();
      fs(c, lgr(c, 5, 2, 25, 29, [0, '#ffffff', 1, '#dfe6f1']), '#6d7f9c');
      c.beginPath(); c.moveTo(18.5, 2.5); c.lineTo(18.5, 8.5); c.lineTo(24.5, 8.5); c.closePath(); fs(c, lgr(c, 18, 2, 25, 9, [0, '#ffffff', 1, '#b9c7de']), '#6d7f9c');
      c.fillStyle = '#9fb1cf'; c.fillRect(8.5, 8, 7, 1.4); c.fillRect(8.5, 11, 12, 1.4); c.fillRect(8.5, 14, 10, 1.4);
      c.save(); c.translate(19, 21);   // the heart, glossy red, over the page corner
      c.beginPath(); c.moveTo(0, 8); c.bezierCurveTo(-9, 2, -8.5, -6, -3.8, -6); c.bezierCurveTo(-1.6, -6, -0.4, -4.4, 0, -3);
      c.bezierCurveTo(0.4, -4.4, 1.6, -6, 3.8, -6); c.bezierCurveTo(8.5, -6, 9, 2, 0, 8); c.closePath();
      fs(c, rgr(c, -3, -3, 0.5, 0, 0, 10, [0, '#ff9c8c', 0.5, '#e8382a', 1, '#a81c12']), '#8f150d', 1.1);
      gloss(c, -6, -5.5, 6, 4, 0.7);
      c.restore();
    },
    pc: function (c) {
      rrp(c, 3.5, 2.5, 25, 19, 2); fs(c, lgr(c, 0, 2, 0, 22, [0, '#fbfbf8', 1, '#c6c6bc']), '#7c7f86');
      rrp(c, 6.5, 5.5, 19, 13, 1); fs(c, lgr(c, 0, 6, 0, 18, [0, '#5ea0ff', 0.62, '#9fcfff', 0.63, '#57b84a', 1, '#2d8a2a']), '#4a5363', 0.9);
      c.beginPath(); c.moveTo(7, 15); c.bezierCurveTo(12, 11.5, 18, 12, 25, 14); c.lineTo(25, 18); c.lineTo(7, 18); c.closePath(); c.fillStyle = '#48a83c'; c.fill();   // the green hill
      c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(7, 6, 18, 3);
      c.fillStyle = lgr(c, 0, 21, 0, 25, [0, '#dcdcd4', 1, '#a9a9a0']); c.fillRect(12, 21.5, 8, 3.5);
      rrp(c, 6.5, 24.5, 19, 4, 1.5); fs(c, lgr(c, 0, 24, 0, 29, [0, '#f2f2ec', 1, '#b8b8ae']), '#7c7f86');
      c.fillStyle = '#39b54a'; c.fillRect(22, 19.2, 2, 1.2);   // power light
    },
    folder: function (c) {
      c.beginPath(); c.moveTo(2.5, 7.5); c.lineTo(2.5, 5.5); c.quadraticCurveTo(2.5, 4.5, 3.5, 4.5); c.lineTo(11, 4.5); c.lineTo(13.5, 7.5); c.lineTo(27.5, 7.5);
      c.lineTo(27.5, 26.5); c.lineTo(2.5, 26.5); c.closePath();
      fs(c, lgr(c, 0, 4, 0, 26, [0, '#f7d977', 1, '#d9a638']), '#b88a1e');
      c.fillStyle = '#ffffff'; c.fillRect(5, 9, 19, 12); c.fillStyle = '#d5dbe6'; c.fillRect(5, 9, 19, 1);   // a sheet peeking out
      c.beginPath(); c.moveTo(1.5, 12.5); c.lineTo(28.5, 12.5); c.lineTo(27.5, 27.5); c.lineTo(2.5, 27.5); c.closePath();
      fs(c, lgr(c, 0, 12, 0, 28, [0, '#fff0b0', 0.5, '#f8d665', 1, '#e8b53c']), '#b88a1e');
      c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(2.5, 13.3, 25, 1.1);
    },
    cart: function (c) {
      c.strokeStyle = '#4a5363'; c.lineWidth = 1.8; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(2.5, 5); c.lineTo(6.5, 5); c.lineTo(10, 21); c.lineTo(25, 21); c.stroke();   // handle + frame
      c.beginPath(); c.moveTo(7.5, 8.5); c.lineTo(28.5, 8.5); c.lineTo(26, 18.5); c.lineTo(9.6, 18.5); c.closePath();
      fs(c, lgr(c, 0, 8, 0, 19, [0, '#8cc0ff', 1, '#2463d8']), '#15409e', 1.1);
      c.save(); c.clip(); c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 0.9;
      [13, 18, 23].forEach(function (x) { c.beginPath(); c.moveTo(x, 8); c.lineTo(x - 0.8, 19); c.stroke(); });
      c.beginPath(); c.moveTo(7, 13.5); c.lineTo(29, 13.5); c.stroke(); gloss(c, 8, 8.5, 20, 5, 0.5); c.restore();
      [[12, 25.5], [23, 25.5]].forEach(function (p) {
        c.beginPath(); c.arc(p[0], p[1], 2.6, 0, Math.PI * 2); fs(c, rgr(c, p[0] - 1, p[1] - 1, 0.3, p[0], p[1], 3, [0, '#9aa3b3', 1, '#2d333d']), '#1c2028', 0.8);
      });
    },
    help: function (c) {
      c.beginPath(); c.arc(16, 16, 12.5, 0, Math.PI * 2);
      fs(c, rgr(c, 11, 9, 1, 16, 16, 14, [0, '#a9d0ff', 0.45, '#3b7cf0', 1, '#163f9e']), '#133a8f', 1.2);
      gloss(c, 7, 4.5, 18, 10, 0.6);
      c.strokeStyle = 'rgba(8,30,90,0.4)'; c.lineWidth = 3.4; c.lineCap = 'round';
      c.beginPath(); c.arc(16.6, 12.6, 4.2, Math.PI * 1.05, Math.PI * 0.35); c.quadraticCurveTo(16.6, 16.6, 16.6, 19); c.stroke();
      c.strokeStyle = '#ffffff'; c.lineWidth = 3;
      c.beginPath(); c.arc(16, 12, 4.2, Math.PI * 1.05, Math.PI * 0.35); c.quadraticCurveTo(16, 16, 16, 18.4); c.stroke();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(16, 23, 1.9, 0, Math.PI * 2); c.fill();
    },
    user: function (c) {   // the stock account picture: a rubber duck on a sky tile (XP shipped one)
      c.fillStyle = lgr(c, 0, 0, 0, 32, [0, '#8fc6ff', 0.62, '#cfe7ff', 0.63, '#4f9be0', 1, '#2f78c8']); c.fillRect(0, 0, 32, 32);
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(0, 20, 32, 0.8); c.fillRect(3, 23, 7, 0.7); c.fillRect(22, 26, 8, 0.7);
      c.beginPath(); c.ellipse(17.5, 21, 10, 6.2, 0, 0, Math.PI * 2);   // body
      fs(c, rgr(c, 14, 17, 1, 17, 21, 12, [0, '#fff4a6', 0.5, '#ffd21f', 1, '#e0a200']), '#b98300', 1);
      c.beginPath(); c.moveTo(22, 17); c.quadraticCurveTo(30, 12, 28.5, 19.5); c.quadraticCurveTo(26, 19, 22, 20); c.closePath();   // tail
      fs(c, lgr(c, 0, 13, 0, 21, [0, '#ffe56a', 1, '#e8ad05']), '#b98300', 1);
      c.beginPath(); c.arc(12.5, 11.5, 6, 0, Math.PI * 2);   // head
      fs(c, rgr(c, 10.5, 9, 0.5, 12.5, 11.5, 7, [0, '#fff6b8', 0.55, '#ffd21f', 1, '#e3a500']), '#b98300', 1);
      c.beginPath(); c.moveTo(6.8, 11.6); c.quadraticCurveTo(2, 12, 2.4, 14.4); c.quadraticCurveTo(5, 15.6, 8, 14.2); c.closePath();   // beak
      fs(c, lgr(c, 0, 11, 0, 15, [0, '#ffb35c', 1, '#e8661a']), '#b54d0c', 0.9);
      c.fillStyle = '#1c1c1c'; c.beginPath(); c.arc(11.2, 10.2, 1.25, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffffff'; c.fillRect(11.2, 9.3, 0.7, 0.7);
      c.beginPath(); c.ellipse(19, 20, 5, 2.6, -0.35, 0, Math.PI * 2); c.fillStyle = 'rgba(200,130,0,0.35)'; c.fill();   // the wing
    }
  };
  var vecCache = {};
  function iconCanvas(key, S) {   // key's 32-bit icon at S px (1x), with XP's soft bottom-right shadow
    var ck = key + '@' + S;
    if (vecCache[ck]) return vecCache[ck];
    var fn = VEC[key]; if (!fn) return null;
    var art = document.createElement('canvas'); art.width = S; art.height = S;
    var a = art.getContext('2d'); a.scale(S / 32, S / 32); fn(a);
    var out = document.createElement('canvas'); out.width = S; out.height = S;
    var o = out.getContext('2d');
    if (key !== 'user') { o.shadowColor = 'rgba(0,0,0,0.32)'; o.shadowOffsetX = 1; o.shadowOffsetY = 1; o.shadowBlur = S >= 32 ? 1.5 : 0.5; }
    o.drawImage(art, 0, 0);
    vecCache[ck] = out;
    return out;
  }
  // draw a 32-bit icon onto the 2x panel canvas: s2 = its size there (64 = a 32px icon on Twitch)
  function drawIcon(ctx, key, x, y, s2) {
    var ic = iconCanvas(key, s2 / 2);
    if (!ic) return drawPixels(ctx, key, x, y, s2 / 16);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(ic, 0, 0, ic.width, ic.height, x, y, s2, s2);
  }
