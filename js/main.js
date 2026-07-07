/* ============================================================
   おえかきくるま LP
   - ヒーロー: タイマー/きょり カウンター
   - デモ: お絵描き → 描いた絵に車輪がついて走る
   ============================================================ */
(function () {
  'use strict';

  /* ---------- ヒーローのタイマー & きょり ---------- */
  var timerNum = document.getElementById('timerNum');
  var distNum = document.getElementById('distNum');
  if (timerNum && distNum) {
    var t = 20, dist = 0;
    setInterval(function () {
      t -= 1;
      dist += 6 + Math.floor(Math.random() * 5);
      if (t < 0) { t = 20; dist = 0; }
      timerNum.textContent = t;
      distNum.textContent = dist;
    }, 1000);
  }

  /* ---------- お絵描きデモ ---------- */
  var canvas = document.getElementById('drawCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  // アプリ本体と同じ基本8色
  var COLORS = [
    { name: 'あか',     hex: '#E53935' },
    { name: 'オレンジ', hex: '#FB8C00' },
    { name: 'きいろ',   hex: '#FDD835' },
    { name: 'みどり',   hex: '#43A047' },
    { name: 'あお',     hex: '#1E88E5' },
    { name: 'むらさき', hex: '#8E24AA' },
    { name: 'ちゃいろ', hex: '#6D4C41' },
    { name: 'くろ',     hex: '#212121' }
  ];
  var currentColor = COLORS[0].hex;
  var strokes = [];      // { color, points: [{x,y}] }
  var drawing = null;    // 描画中ストローク

  // パレット生成
  var palette = document.getElementById('palette');
  COLORS.forEach(function (c, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch' + (i === 0 ? ' active' : '');
    b.style.background = c.hex;
    b.setAttribute('aria-label', c.name);
    b.title = c.name;
    b.addEventListener('click', function () {
      currentColor = c.hex;
      palette.querySelectorAll('.swatch').forEach(function (s) { s.classList.remove('active'); });
      b.classList.add('active');
    });
    palette.appendChild(b);
  });

  function shade(hex, f) { // 色を暗くする(縁取り用)
    var n = parseInt(hex.slice(1), 16);
    var r = Math.round(((n >> 16) & 255) * f);
    var g = Math.round(((n >> 8) & 255) * f);
    var b = Math.round((n & 255) * f);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function pos(e) {
    var r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height)
    };
  }

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var all = drawing ? strokes.concat([drawing]) : strokes;
    // アプリと同じく「濃い縁取り + 本体色」の2度描きでクレヨン風に
    [{ w: 16, dark: true }, { w: 10, dark: false }].forEach(function (pass) {
      all.forEach(function (s) {
        if (s.points.length === 0) return;
        ctx.strokeStyle = pass.dark ? shade(s.color, 0.6) : s.color;
        ctx.lineWidth = pass.w;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);
        if (s.points.length === 1) {
          ctx.lineTo(s.points[0].x + 0.1, s.points[0].y);
        } else {
          for (var i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
        }
        ctx.stroke();
      });
    });
  }

  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* 合成イベント等では失敗してよい */ }
    drawing = { color: currentColor, points: [pos(e)] };
    redraw();
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!drawing) return;
    drawing.points.push(pos(e));
    redraw();
  });
  function endStroke() {
    if (drawing) { strokes.push(drawing); drawing = null; }
  }
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);

  document.getElementById('btnClear').addEventListener('click', function () {
    strokes = []; drawing = null; redraw();
  });

  /* ---------- 走らせる ---------- */
  var demoDraw = document.getElementById('demoDraw');
  var demoRun = document.getElementById('demoRun');
  var runStage = document.getElementById('runStage');
  var runCar = document.getElementById('runCar');
  var runGoal = document.getElementById('runGoal');
  var goBtn = document.getElementById('btnGo');
  var rafId = null;

  function bbox() {
    var minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    strokes.forEach(function (s) {
      s.points.forEach(function (p) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      });
    });
    var pad = 14;
    return { x: minX - pad, y: minY - pad, w: (maxX - minX) + pad * 2, h: (maxY - minY) + pad * 2 };
  }

  function buildCar() {
    var b = bbox();
    var crop = document.createElement('canvas');
    crop.width = Math.max(1, Math.round(b.w));
    crop.height = Math.max(1, Math.round(b.h));
    crop.getContext('2d').drawImage(canvas, b.x, b.y, b.w, b.h, 0, 0, crop.width, crop.height);

    // 表示サイズ(ステージに収まるように)
    var maxW = Math.min(180, runStage.clientWidth * 0.4);
    var scale = Math.min(maxW / crop.width, 130 / crop.height);
    var w = Math.max(60, crop.width * scale);
    var h = crop.height * scale;

    var wheelD = Math.max(26, Math.min(40, w * 0.28));
    runCar.innerHTML = '';
    var img = document.createElement('img');
    img.src = crop.toDataURL();
    img.width = w; img.height = h;
    img.alt = 'かいたくるま';
    runCar.appendChild(img);

    [0.18, 0.82].forEach(function (fx) {
      var wheel = document.createElement('div');
      wheel.className = 'demo-wheel';
      wheel.style.width = wheelD + 'px';
      wheel.style.height = wheelD + 'px';
      wheel.style.left = (w * fx - wheelD / 2) + 'px';
      wheel.style.top = (h - wheelD * 0.45) + 'px';
      runCar.appendChild(wheel);
    });
    runCar.style.width = w + 'px';
    runCar.style.height = (h + wheelD * 0.55) + 'px';
    return { w: w };
  }

  function runCarAnim() {
    if (rafId) cancelAnimationFrame(rafId);
    runGoal.hidden = true;
    var car = buildCar();
    var stageW = runStage.clientWidth;
    var duration = window.__demoDuration || 3800; // __demoDuration: テスト用の上書きフック
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var x = -car.w + p * (stageW + car.w * 2);
      var bob = Math.sin(p * 40) * 3;
      runCar.style.transform = 'translateX(' + x + 'px) translateY(' + bob + 'px)';
      if (p < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        runGoal.hidden = false;
      }
    }
    rafId = requestAnimationFrame(frame);
  }

  goBtn.addEventListener('click', function () {
    if (strokes.length === 0) {
      goBtn.textContent = '🖍️ まずは かいてみてね！';
      setTimeout(function () { goBtn.textContent = '🚗 はしらせる！'; }, 1600);
      return;
    }
    demoDraw.hidden = true;
    demoRun.hidden = false;
    runCarAnim();
  });

  document.getElementById('btnBack').addEventListener('click', function () {
    if (rafId) cancelAnimationFrame(rafId);
    demoRun.hidden = true;
    demoDraw.hidden = false;
  });
  document.getElementById('btnAgain').addEventListener('click', runCarAnim);

  redraw();
})();
