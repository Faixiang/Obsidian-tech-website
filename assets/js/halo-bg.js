/**
 * Obsidian homepage HaloFlux-class background (CIS222 Group Project).
 *
 * Visual engine: HALOFLUX by Ryder191 (RYDER CODE / Ms MAIKEBAIs CAT)
 * https://github.com/Ryder191/haloflux
 * Required Notice: Copyright (c) 2026 Ryder191 (RYDER CODE / Ms MAIKEBAIs CAT) - https://github.com/Ryder191/haloflux
 * Required Notice: Noncommercial use only. Any commercial use is strictly prohibited.
 * License: PolyForm Noncommercial 1.0.0 — see assets/NOTICE-haloflux.txt
 *
 * Kill switch (any one disables the halo and restores #particles when possible):
 *   - window.__OBSIDIAN_HALO__ = false  (set before this file)
 *   - localStorage.obsidian_halo_bg = '0'
 *   - URL query ?halo=0
 *
 * Perf (v3 load-cut): 30fps, DPR≤1, fewer particles / no blur / milder glow;
 * tab Visibility pause only (no off-screen IO).
 */
(function () {
  'use strict';

  var canvas = document.getElementById('halo-bg');
  if (!canvas) return;

  var TARGET_FPS = 30; /* actOff1 */ /* speedCut v1 */
  var MIN_FRAME_MS = 1000 / TARGET_FPS;

  function wantsOff() {
    if (window.__OBSIDIAN_HALO_OFF__ === true) return true;
    if (window.__OBSIDIAN_HALO__ === false) return true;
    try {
      if (localStorage.getItem('obsidian_halo_bg') === '0') return true;
    } catch (e) { /* private mode */ }
    if (/[?&]halo=0(?:&|$)/.test(location.search || '')) return true;
    return false;
  }

  function prefersReduce() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function disableParticlesForHalo() {
    var p = document.getElementById('particles');
    if (!p) return;
    p.id = 'particles-off';
    p.setAttribute('hidden', '');
    p.setAttribute('aria-hidden', 'true');
  }

  function hideHalo() {
    canvas.setAttribute('hidden', '');
    canvas.style.display = 'none';
    document.body.classList.remove('has-halo-bg');
    document.body.classList.add('halo-bg-off');
  }

  function drawStaticGlow(el) {
    var dpr = Math.min(window.devicePixelRatio || 1, 1);
    var w = Math.max(1, window.innerWidth);
    var h = Math.max(1, window.innerHeight);
    el.width = Math.floor(w * dpr);
    el.height = Math.floor(h * dpr);
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    var ctx = el.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5;
    var cy = h * 0.42;
    var R = Math.min(w, h) * 0.28;
    var g = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R * 1.55);
    g.addColorStop(0, 'rgba(0, 212, 184, 0.00)');
    g.addColorStop(0.45, 'rgba(0, 212, 184, 0.06)');
    g.addColorStop(0.72, 'rgba(0, 212, 184, 0.14)');
    g.addColorStop(0.88, 'rgba(123, 47, 255, 0.08)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 212, 184, 0.22)';
    ctx.lineWidth = Math.max(1.5, R * 0.018);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.92, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 212, 184, 0.10)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  if (wantsOff()) {
    hideHalo();
    return;
  }

  document.body.classList.add('has-halo-bg');
  disableParticlesForHalo();

  if (prefersReduce()) {
    canvas.removeAttribute('hidden');
    drawStaticGlow(canvas);
    window.addEventListener('resize', function () { drawStaticGlow(canvas); }, { passive: true });
    return;
  }

  if (typeof HalofluxEngine === 'undefined' || typeof HalofluxEngine.create !== 'function') {
    console.warn('[obsidian-halo] HalofluxEngine missing; leaving background alone.');
    hideHalo();
    var off = document.getElementById('particles-off');
    if (off) {
      off.id = 'particles';
      off.removeAttribute('hidden');
    }
    return;
  }

  var HOST = {
    opacity: 1,
    blend: 'lighter',
    filter: 'sepia(0.45) hue-rotate(170deg) saturate(1.55)'
  };

  canvas.style.opacity = String(HOST.opacity);
  canvas.style.mixBlendMode = HOST.blend;
  canvas.style.filter = HOST.filter;
  canvas.removeAttribute('hidden');

  /* Cap DPR to 1 for smaller offscreen buffers (restore after create/resize). */
  var dprProbe = window.devicePixelRatio;
  var dprForced = false;
  try {
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      get: function () { return 1; }
    });
    dprForced = true;
  } catch (e) { dprForced = false; }

  function restoreDpr() {
    if (!dprForced) return;
    try {
      delete window.devicePixelRatio;
      if (typeof dprProbe === 'number') {
        Object.defineProperty(window, 'devicePixelRatio', {
          configurable: true,
          get: function () { return dprProbe; }
        });
      }
    } catch (e2) { /* leave capped */ }
    dprForced = false;
  }

  /* ~30fps gate around engine RAF only while halo is running */
  var nativeRaf = window.requestAnimationFrame.bind(window);
  var nativeCaf = window.cancelAnimationFrame.bind(window);
  var lastFrameAt = 0;
  var rafPatched = false;
  function patchRaf() {
    if (rafPatched) return;
    rafPatched = true;
    window.requestAnimationFrame = function (cb) {
      return nativeRaf(function gated(now) {
        var elapsed = now - lastFrameAt;
        if (lastFrameAt && elapsed < MIN_FRAME_MS) {
          return nativeRaf(gated);
        }
        lastFrameAt = now;
        cb(now);
      });
    };
    window.cancelAnimationFrame = nativeCaf;
  }
  function unpatchRaf() {
    if (!rafPatched) return;
    window.requestAnimationFrame = nativeRaf;
    window.cancelAnimationFrame = nativeCaf;
    rafPatched = false;
  }

  /* Wallpaper mode: no real agent session — synthesize mild activity so
     ring data panels keep regenerating (actOn is gated on live.activity). */
  var liveT0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  var liveStub = {
    sessionPresent: false,
    running: false,
    get activity() {
      var now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      var t = (now - liveT0) / 1000;
      return 0;
    },
    pullTokens: function () { return null; }
  };

  var engine = HalofluxEngine.create({
    live: liveStub,
    canvas: canvas,
    params: {
      /* slower motion */
      tempo: 0.38,
      camera: 0,
      camZoom: 0,
      glow: 0,
      scan: 0.9,
      ringSpeed: 0.42,
      ringPause: 2.2,
      ringWidth: 1.0,
      rimBright: 2.8,
      rimDensity: 1.6,
      rimWidth: 1.45,
      dataFlicker: 0.9,
      webBright: 1.1,
      /* fewer particles / beams / bursts */
      runnerCount: 20,
      runnerBright: 0.65,
      runnerSpeed: 1.2,
      runnerWidth: 1.35,
      cometPerBeat: 0.1,
      cometBurst: 0.25,
      cometTrickle: 0.05,
      cometBright: 1.05,
      cometSpeed: 0.95,
      cometLines: 1.6,
      cometGlow: 0,
      beamBright: 1.4,
      beamLen: 2.08,
      beamGlow: 0,
      beamWidth: 1.45,
      beamBounce: 1.35,
      dashBright: 1.75,
      hazeCount: 2,
      hazeBright: 1.45,
      flyerCount: 0,
      flyerBright: 0,
      burstRate: 0.1,
      burstBright: 1.1,
      flareRate: 0.2,
      flareBright: 1.2,
      bokeh: 0,
      bokehBright: 0,
      atmos: 0.08,
      ringShadow: 0.2,
      vignette: 0.25,
      depthBlur: 0,
      depthDim: 0.12,
      webBlur: 0,
      parallax: 0.08,

      opacity: 0.85,
      blend: 0,
      idleMotion: 0.28,
      activityGain: 0.05,
      actFx: 0,
      actOff: 1,
      centerX: 0,
      centerY: 0.06,
      scale: 0.936,
      hudOn: 0,
      feedOn: 0,
      dataMode: 0,
      backdrop: 0,
      voidLevel: 0.15,
      runLevel: 0.85,
      attackMs: 400,
      releaseMs: 2800,

      fieldBlur: 0,
      ringData: 0.55,
      guardOn: 1,
      guardStrength: 0.35,
      guardRadius: 0.95,
      guardColW: 0,
      plateAlpha: 0.45,
      fieldBright: 1.9,
      guardBlur: 0,
      motionQuiet: 0.55,
      readFade: 0,

      ctxArc: 0,
      toolBeam: 0,
      errFx: 0,
      stepTicks: 0,
      phaseRing: 0,
      errPin: 0,
      tpsRibbon: 0,
      thinkPulse: 0,

      tintAmount: 0.55,
      tintHue: 170,
      tintSat: 1.45,
      tintFollow: 0,

      adaptQuality: 1,
      /* park when no pointer for 12s — cuts CPU on idle tabs that stay visible */
      idleSleepMs: 0
    }
  });

  restoreDpr();
  patchRaf();
  engine.start();
  window.__obsidianHaloEngine = engine;

  var resizeTimer = 0;
  function onResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeTimer = 0;
      try {
        /* keep buffers small on resize */
        var prev = window.devicePixelRatio;
        try {
          Object.defineProperty(window, 'devicePixelRatio', {
            configurable: true,
            get: function () { return 1; }
          });
          engine.resize();
          delete window.devicePixelRatio;
        } catch (e) {
          engine.resize();
        }
      } catch (e2) { /* ignore */ }
    }, 120);
  }
  window.addEventListener('resize', onResize, { passive: true });

  function onVisibility() {
    if (document.hidden) {
      try { engine.stop(); } catch (e) { /* ignore */ }
      unpatchRaf();
    } else {
      patchRaf();
      lastFrameAt = 0;
      try { engine.start(); } catch (e2) { /* ignore */ }
    }
  }
  document.addEventListener('visibilitychange', onVisibility);

  window.addEventListener('pagehide', function () {
    try { engine.stop(); } catch (e) { /* ignore */ }
    unpatchRaf();
  });
})();

