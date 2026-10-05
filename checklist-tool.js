/* Interactive self-assessment checklists (/resources/*). Markup comes from build_pages.py (r_tool): every question
   is already in the HTML, so this file only adds scoring, a "start here" list, copy / print / reset and
   browser-only saving. Yes = 2, Partly = 1, No = 0, N/A is excluded from the score.
   Analytics (blueprint section 91): calculator_start on the first answer, calculator_complete when every
   question is answered. Both go through analytics.js, which sends nothing without cookie consent. */
(function () {
    'use strict';
    var form = document.querySelector('form.ct');
    if (!form) return;
    var tool = form.getAttribute('data-tool');
    var name = form.getAttribute('data-name');
    var bands = [];
    try { bands = JSON.parse(form.getAttribute('data-bands')) || []; } catch (e) {}
    var key = 'dsn_tool_' + tool;
    var items = [].slice.call(form.querySelectorAll('.ct-item'));
    var progress = form.querySelector('.ct-progress');
    var result = form.querySelector('.ct-result');
    var actions = form.querySelector('.ct-actions');
    var barP = form.querySelector('.ct-bar-p');
    var barS = form.querySelector('.ct-bar-s');
    var started = false, completed = false;

    function track(ev, props) {
        if (typeof window.trackEvent === 'function') window.trackEvent(ev, Object.assign({ tool: tool }, props || {}));
    }
    function answers() {
        var out = {};
        items.forEach(function (it) {
            var c = it.querySelector('input:checked');
            if (c) out[it.getAttribute('data-q')] = c.value;
        });
        return out;
    }
    function qText(it) { return it.querySelector('.ct-q').textContent.trim(); }
    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    function compute() {
        var a = answers(), n = 0, pts = 0, scored = 0, nos = [], partly = [];
        items.forEach(function (it) {
            var v = a[it.getAttribute('data-q')];
            if (v === undefined) return;
            n++;
            if (v === 'na') return;
            scored++; pts += +v;
            if (v === '0') nos.push(qText(it)); else if (v === '1') partly.push(qText(it));
        });
        var pct = scored ? Math.round(pts / (2 * scored) * 100) : null;
        var band = null;
        if (pct !== null) for (var i = 0; i < bands.length; i++) { if (pct >= bands[i].min) { band = bands[i]; break; } }
        return { answered: n, total: items.length, pct: pct, band: band, start: nos.concat(partly).slice(0, 5) };
    }

    function render() {
        var r = compute();
        progress.textContent = r.answered + ' of ' + r.total + ' answered' + (r.answered < r.total ? '. Your score updates as you go.' : '.');
        barP.textContent = r.answered + ' of ' + r.total + ' answered';
        barS.textContent = r.pct === null ? '' : 'Score ' + r.pct + '%';
        if (r.pct === null) { result.hidden = true; actions.hidden = r.answered === 0; return r; }
        var html = '<div class="ct-score">' + r.pct + '%</div>';
        if (r.band) html += '<p class="ct-band">' + esc(r.band.title) + '</p><p class="ct-band-body">' + esc(r.band.body) + '</p>';
        if (r.start.length) html += '<p class="ct-band-body"><strong>Start here:</strong></p><ol class="ct-start">' +
            r.start.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>';
        result.innerHTML = html;
        result.hidden = false;
        actions.hidden = false;
        return r;
    }

    function save() { try { localStorage.setItem(key, JSON.stringify(answers())); } catch (e) {} }
    function restore() {
        var a = null;
        try { a = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
        if (!a) return;
        Object.keys(a).forEach(function (q) {
            var inp = form.querySelector('input[name="q' + q + '"][value="' + a[q] + '"]');
            if (inp) inp.checked = true;
        });
        started = Object.keys(a).length > 0;
    }

    form.addEventListener('change', function () {
        if (!started) { started = true; track('calculator_start'); }
        var r = render();
        save();
        if (!completed && r.answered === r.total) {
            completed = true;
            track('calculator_complete', { score: r.pct, answered: r.answered });
        }
    });

    actions.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-act]');
        if (!btn) return;
        var act = btn.getAttribute('data-act');
        if (act === 'print') { window.print(); return; }
        if (act === 'reset') {
            [].forEach.call(form.querySelectorAll('input:checked'), function (i) { i.checked = false; });
            try { localStorage.removeItem(key); } catch (err) {}
            completed = false; render(); return;
        }
        if (act === 'copy') {
            var r = compute();
            var lines = [name + ' (Designit)', 'Score: ' + (r.pct === null ? 'n/a' : r.pct + '%') + ', ' + r.answered + ' of ' + r.total + ' answered'];
            if (r.band) lines.push(r.band.title);
            if (r.start.length) { lines.push('', 'Start here:'); r.start.forEach(function (q) { lines.push('- ' + q); }); }
            lines.push('', location.href.split('#')[0]);
            var text = lines.join('\n');
            var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy results'; }, 1800); };
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
        }
    });

    restore();
    render();
})();
