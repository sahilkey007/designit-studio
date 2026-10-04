/* Start a Project: 10-step qualification flow (blueprint section 90).
   Classifies the enquiry into a recommended engagement and submits through the same lead pipeline
   as the intake modal (window.designitSubmitLead in intake-form.js). Analytics: start_project,
   form_start, form_step_complete, recommendation_shown; form_submitted fires inside submitForm(). */
(function () {
  'use strict';
  var form = document.getElementById('spForm');
  if (!form) return;
  var steps = Array.prototype.slice.call(form.querySelectorAll('.sp-step'));
  var total = steps.length, current = 0, started = false;
  var progress = document.getElementById('spProgress');
  var bar = document.getElementById('spBar');
  var back = document.getElementById('spBack');
  var next = document.getElementById('spNext');
  var status = document.getElementById('spStatus');

  function track(name, props) { if (typeof window.trackEvent === 'function') window.trackEvent(name, props || {}); }
  track('start_project', { landing: document.referrer ? 'internal_or_referral' : 'direct' });

  var ENGAGEMENTS = {
    audit:    { name: 'UX Audit', href: '/services/ux-audit/', why: 'You have a live product and need to know what to fix first. A two-week, fixed-scope audit ranks every issue by impact and effort.' },
    discovery:{ name: 'Product Discovery', href: '/services/product-design/#discovery', why: 'You are deciding what to build. Discovery defines the problem, the users and how success is measured before design or engineering commit.' },
    mvp:      { name: 'MVP Design', href: '/solutions/mvp-design/', why: 'You know your users and need a first release that proves the point, designed properly and tested before build.' },
    redesign: { name: 'Product Redesign', href: '/solutions/product-redesign/', why: 'Your product has outgrown its structure. We start with an audit of where users struggle, then restructure before restyling.' },
    saas:     { name: 'SaaS Product Design', href: '/services/saas-product-design/', why: 'A B2B SaaS product with dense workflows: onboarding, dashboards and the system that keeps them consistent.' },
    ai:       { name: 'AI Product Design', href: '/services/ai-product-design/', why: 'AI features need design for uncertainty, approvals and recovery, not just a prompt box.' },
    system:   { name: 'Design System', href: '/services/design-systems/', why: 'Inconsistency and slow shipping usually mean a systems problem: tokens, components and governance your engineers will adopt.' },
    website:  { name: 'Website Design', href: '/services/website-design/', why: 'Your website needs to explain what you do and convert the right visitors, starting from architecture and messaging.' },
    branding: { name: 'Branding', href: '/services/branding/', why: 'Positioning and a brand system that carries into your website and product.' },
    modern:   { name: 'Legacy Product Modernization', href: '/solutions/legacy-product-modernization/', why: 'Map real workflows first, then modernise in slices without stopping the business.' }
  };

  function val(name) { var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ''; }
  function vals(name) { return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (e) { return e.value; }); }
  function text(name) { var el = form.elements[name]; return el ? (el.value || '').trim() : ''; }

  function recommend() {
    var goal = val('goal'), what = val('what'), stage = val('stage'), pain = vals('pain'), need = vals('need');
    if (goal === 'ai' || what === 'ai') return 'ai';
    if (goal === 'brand') return 'branding';
    if (goal === 'website' || (what === 'website' && goal !== 'conversion')) return 'website';
    if (goal === 'scale' || (pain.indexOf('inconsistent') > -1 && need.indexOf('system') > -1)) return 'system';
    if (goal === 'modernise') return 'modern';
    if (goal === 'launch') return stage === 'idea' ? 'discovery' : 'mvp';
    if (goal === 'conversion') return 'audit';
    if (goal === 'fix') {
      if (stage === 'growing' || stage === 'mature') return what === 'saas' ? 'redesign' : 'audit';
      return 'audit';
    }
    if (what === 'saas') return 'saas';
    return 'discovery';
  }

  function showRecommendation() {
    var key = recommend(), e = ENGAGEMENTS[key];
    document.getElementById('spRecName').textContent = e.name;
    document.getElementById('spRecWhy').textContent = e.why;
    var link = document.getElementById('spRecLink'); link.href = e.href; link.textContent = 'Read about ' + e.name;
    form.elements['recommendation'].value = e.name;
    track('recommendation_shown', { recommendation: e.name });
  }

  function validStep(i) {
    var step = steps[i], ok = true, msg = '';
    var required = step.getAttribute('data-required');
    if (required === 'radio') { ok = !!step.querySelector('input[type=radio]:checked'); msg = 'Choose one option to continue.'; }
    if (required === 'check') { ok = !!step.querySelector('input[type=checkbox]:checked'); msg = 'Choose at least one option to continue.'; }
    if (required === 'contact') {
      var email = text('email'), name = text('fullName');
      ok = !!name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      msg = 'Add your name and a valid email address.';
    }
    var err = step.querySelector('.sp-error');
    if (err) err.textContent = ok ? '' : msg;
    return ok;
  }

  function show(i) {
    steps.forEach(function (s, n) { s.hidden = n !== i; });
    current = i;
    progress.textContent = 'Step ' + (i + 1) + ' of ' + total;
    bar.style.width = Math.round(((i + 1) / total) * 100) + '%';
    back.hidden = i === 0;
    next.textContent = i === total - 1 ? 'Send' : 'Next';
    if (i === total - 2) showRecommendation();
    var legend = steps[i].querySelector('legend, h2');
    if (legend && started) { legend.setAttribute('tabindex', '-1'); legend.focus(); }
  }

  form.addEventListener('change', function () {
    if (!started) { started = true; track('form_start', { first_step: current + 1 }); }
  });
  back.addEventListener('click', function () { if (current > 0) show(current - 1); });
  next.addEventListener('click', function () {
    if (!validStep(current)) return;
    track('form_step_complete', { step: current + 1 });
    if (current < total - 1) { show(current + 1); return; }
    submit();
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); next.click(); });

  function submit() {
    var answers = {
      goal: val('goal'), working_on: val('what'), stage: val('stage'), not_working: vals('pain').join(', '),
      needs: vals('need').join(', '), team_size: val('team'), timeline: val('timeline'), budget: val('budget')
    };
    var rec = form.elements['recommendation'].value;
    var description = 'Goal: ' + answers.goal + ' | Working on: ' + answers.working_on + ' | Stage: ' + answers.stage +
      ' | Not working: ' + answers.not_working + ' | Needs: ' + answers.needs + ' | Team: ' + answers.team_size;
    var ok = typeof window.designitSubmitLead === 'function' && window.designitSubmitLead({
      fullName: text('fullName'), company: text('company'), website: text('website'), email: text('email'), phone: text('phone'),
      projectType: rec, description: description, budget: answers.budget, timeline: answers.timeline,
      source: 'start-a-project', anythingElse: 'Recommended engagement: ' + rec + (text('notes') ? ' | Notes: ' + text('notes') : '')
    });
    if (ok) {
      form.hidden = true;
      document.getElementById('spDone').hidden = false;
      document.getElementById('spDoneRec').textContent = rec;
      status.textContent = 'Thank you. Your project details have been sent.';
      track('form_submit', { recommendation: rec, timeline: answers.timeline, budget: answers.budget });
    } else {
      status.textContent = 'Something went wrong sending the form. Please email contact@designit.co.in.';
    }
  }

  show(0);
})();
