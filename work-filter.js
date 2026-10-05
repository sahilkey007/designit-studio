/* Work hub filters (blueprint sections 30-31): filtering is client-side only and never changes the URL,
   so filter combinations cannot create indexable URLs. */
(function () {
  'use strict';
  var bar = document.getElementById('workFilters');
  if (!bar) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll('#all-work .work-card'));
  var status = document.getElementById('workFilterStatus');
  var state = { industry: 'all', service: 'all' };
  function apply() {
    var shown = 0;
    cards.forEach(function (c) {
      var okI = state.industry === 'all' || c.getAttribute('data-industry') === state.industry;
      var okS = state.service === 'all' || (' ' + c.getAttribute('data-service') + ' ').indexOf(' ' + state.service + ' ') > -1;
      c.hidden = !(okI && okS); if (!c.hidden) shown++;
    });
    if (status) status.textContent = shown + (shown === 1 ? ' case study' : ' case studies') + ' shown';
  }
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-filter]'); if (!b) return;
    var group = b.getAttribute('data-group');
    state[group] = b.getAttribute('data-filter');
    Array.prototype.forEach.call(bar.querySelectorAll('button[data-group="' + group + '"]'), function (x) {
      x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
    });
    apply();
    if (typeof window.trackEvent === 'function') window.trackEvent('work_filter', { group: group, value: state[group] });
  });
  apply();
})();
