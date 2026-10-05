/* ============================================
   UI.JS: interaction layer (see ui.css for the pattern sources and licences)
   Progressive enhancement only: every page is complete without this file. Nothing here changes copy or
   layout; it adds smooth scroll, the hero shader, spotlight cards, reveal-on-scroll and small controls.
   Reduced motion: no smooth scroll, no reveal, no tilt, and a single still frame of the shader.
   ============================================ */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var vh = window.innerHeight;

  function $$(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- Smooth scroll (Lenis) ---------- */
  if (!reduced && typeof window.Lenis === 'function') {
    window.lenis = new window.Lenis({
      autoRaf: true,
      lerp: 0.11,
      wheelMultiplier: 1,
      // keep native scrolling inside the mobile menu, dialogs, wide tables and form fields
      prevent: function (node) {
        return !!(node.closest && node.closest('.nav-links, [role="dialog"], .table-wrap, textarea, select, [data-lenis-prevent]'));
      }
    });
  }

  /* ---------- Reading progress on articles, case studies and tools ---------- */
  if (/^\/(blog|projects|resources)\/[^/]+\/?$/.test(location.pathname)) {
    var bar = document.createElement('div');
    bar.className = 'ui-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false;
    var setBar = function () {
      ticking = false;
      var max = doc.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(setBar); } }, { passive: true });
    setBar();
  }

  /* ---------- Shader gradient (hero and closing CTA) ---------- */
  var FRAG = [
    'precision mediump float;',
    'uniform vec2 r;uniform float t;uniform float k;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int j=0;j<4;j++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/r;vec2 p=uv;p.x*=r.x/r.y;',
    ' float s=t*.045;',
    ' vec2 q=vec2(fbm(p*1.3+vec2(s,0.)),fbm(p*1.3+vec2(3.1,-s)));',
    ' float f=fbm(p*1.1+q*1.8+vec2(s*.7,-s*.5));',
    ' vec3 pink=vec3(.925,.282,.6),indigo=vec3(.388,.4,.945),violet=vec3(.66,.33,.97),blue=vec3(.231,.51,.965);',
    ' vec3 c=mix(indigo,pink,smoothstep(.3,.8,q.x));',
    ' c=mix(c,blue,smoothstep(.45,.85,q.y));',
    ' c=mix(c,violet,smoothstep(.5,.75,f));',
    // k = 0: hero, glow sits high (behind the eyebrow and headline) and fades before the body copy
    // k = 1: closing CTA, a horizon rising from the bottom edge, so the copy above stays on near-black
    ' vec2 o=mix(vec2(.5,1.08),vec2(.5,-.06),k);',
    ' vec2 d=(uv-o)*vec2(r.x/r.y*mix(.42,.3,k),1.);',
    ' float m=1.-smoothstep(.0,mix(.78,.7,k),length(d));',
    // portrait screens put the headline closer to the glow, so the hero glow is weaker there
    ' float a=(.4+.6*smoothstep(.2,.8,f))*m*mix(.85*mix(.6,1.,smoothstep(.7,1.5,r.x/r.y)),.75,k);',
    ' vec3 col=vec3(.039)+c*a;',
    ' col+=(h(gl_FragCoord.xy+fract(t))-.5)*.03;',
    ' gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');
  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

  function shader(host, kind) {
    host.classList.add('ui-stage');
    var cv = document.createElement('canvas');
    cv.className = 'ui-shader';
    cv.setAttribute('aria-hidden', 'true');
    var gl = null;
    try { gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' }); } catch (e) {}
    if (!gl) { host.classList.add('ui-noshader'); return; }
    function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { host.classList.add('ui-noshader'); return; }
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uK = gl.getUniformLocation(pr, 'k');
    gl.uniform1f(uK, kind);
    host.insertBefore(cv, host.firstChild);

    // Half resolution: the gradient is soft, so this is invisible and keeps the GPU cost tiny.
    function size() {
      var w = Math.max(1, Math.round(host.clientWidth * 0.5)), hgt = Math.max(1, Math.round(host.clientHeight * 0.5));
      if (cv.width !== w || cv.height !== hgt) { cv.width = w; cv.height = hgt; gl.viewport(0, 0, w, hgt); gl.uniform2f(uR, w, hgt); }
    }
    var t0 = performance.now() - 20000, raf = 0, last = 0, visible = false;
    function draw(now) {
      size();
      gl.uniform1f(uT, (now - t0) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return; // ~30fps is plenty for a slow gradient
      last = now; draw(now);
    }
    function start() { if (!raf && !reduced && visible && !document.hidden) raf = requestAnimationFrame(loop); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    draw(performance.now());
    requestAnimationFrame(function () { cv.classList.add('on'); });
    if (reduced) return;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; visible ? start() : stop(); }).observe(host);
    } else { visible = true; start(); }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    if ('ResizeObserver' in window) new ResizeObserver(function () { draw(performance.now()); }).observe(host);
  }
  // ui.css loads async. The canvas is only inserted once it has landed, so it can never sit in the flow.
  function whenStyled(cb) {
    var ok = function () { return getComputedStyle(doc).getPropertyValue('--ui-ease').trim() !== ''; };
    if (ok()) return cb();
    var tries = 0;
    (function wait() { if (ok()) cb(); else if (++tries < 40) setTimeout(wait, 150); })();
  }
  whenStyled(function () {
    // Articles stay calm for reading: no hero gradient under /blog/<post>/.
    var hero = /^\/blog\/[^/]+\/?$/.test(location.pathname) ? null :
      document.querySelector('main .geo-hero, main .page-hero, main .blog-hero, .geo-hero, .page-hero, .blog-hero');
    if (hero) shader(hero, 0);
    $$('.geo-cta-section').forEach(function (el) { shader(el, 1); });
  });

  /* ---------- Spotlight cards + tilt ---------- */
  var CARDS = '.card, .work-card, .problem-row, .stage, .step, .quote, .cluster, .blog-card, .blog-related-card, .about-stat-card, .prefooter-item';
  if (finePointer) {
    $$(CARDS).forEach(function (el) {
      if (el.closest('.navbar, .footer')) return;
      el.classList.add('ui-spot-host');
      var spot = document.createElement('span');
      spot.className = 'ui-spot';
      spot.setAttribute('aria-hidden', 'true');
      el.appendChild(spot);
      var tilt = !reduced && el.classList.contains('work-card');
      var frame = 0, ev = null;
      function apply() {
        frame = 0;
        var b = el.getBoundingClientRect();
        var x = ev.clientX - b.left, y = ev.clientY - b.top;
        el.style.setProperty('--mx', x + 'px');
        el.style.setProperty('--my', y + 'px');
        if (tilt) {
          var rx = ((y / b.height) - 0.5) * -4, ry = ((x / b.width) - 0.5) * 5;
          el.style.transform = 'perspective(1100px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-3px)';
        }
      }
      el.addEventListener('pointermove', function (e) { ev = e; if (!frame) frame = requestAnimationFrame(apply); });
      if (tilt) {
        el.addEventListener('pointerenter', function () { el.classList.add('ui-tilt'); });
        el.addEventListener('pointerleave', function () {
          if (frame) { cancelAnimationFrame(frame); frame = 0; }
          el.classList.remove('ui-tilt');
          el.style.transform = '';
        });
      }
    });
  }

  /* ---------- Blur-fade reveal for content below the fold ---------- */
  if (!reduced && 'IntersectionObserver' in window) {
    var REVEAL = '.pg-h2, .pg-intro, .answer-block, .prose, .facts, .table-wrap, .compare, .check-grid, ' + CARDS + ', .faq-list .faq-item, .logo-marquee';
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.classList.add('ui-in');
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    var perParent = new Map();
    $$(REVEAL).forEach(function (el) {
      if (el.classList.contains('reveal') || el.closest('.reveal, .navbar, .footer, .ui-pre')) return;
      if (el.getBoundingClientRect().top < vh) return; // never hide anything already on screen
      var i = perParent.get(el.parentNode) || 0;
      perParent.set(el.parentNode, i + 1);
      el.style.setProperty('--ui-i', Math.min(i, 5));
      el.classList.add('ui-pre');
      el.addEventListener('transitionend', function done(e) {
        if (e.target !== el || e.propertyName !== 'opacity') return;
        el.removeEventListener('transitionend', done);
        el.classList.remove('ui-pre', 'ui-in');
        el.style.removeProperty('--ui-i');
      });
      io.observe(el);
    });
  }

  /* ---------- Process timelines: highlight the stage in the middle of the screen ---------- */
  if ('IntersectionObserver' in window) {
    var stages = $$('.stage, .step');
    if (stages.length) {
      var sio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.target.classList.toggle('ui-active', e.isIntersecting); });
      }, { rootMargin: '-42% 0px -48% 0px' });
      stages.forEach(function (s) { sio.observe(s); });
    }
  }

  /* ---------- Logo marquee pause / play (WCAG 2.2.2) ---------- */
  $$('.logo-pause').forEach(function (btn) {
    var m = btn.parentNode.querySelector('.logo-marquee');
    if (!m) return;
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var paused = m.classList.toggle('paused');
      btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      btn.querySelector('.sr-only').textContent = paused ? 'Play logo animation' : 'Pause logo animation';
    });
  });
})();
