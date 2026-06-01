/**
 * Designit — ContentSquare Custom Event Tracking
 * Tracks: CTA clicks, intake form lifecycle, Calendly clicks,
 *         scroll depth, case study views, blog reads, geo page hits
 */
(function () {
  'use strict';

  window._uxa = window._uxa || [];

  /* ── Utility ──────────────────────────────────────────────────── */
  function csEvent(name) {
    window._uxa.push(['trackPageEvent', name]);
  }

  function csVar(index, name, value) {
    window._uxa.push(['setCustomVariable', index, name, value, 'visit']);
  }

  /* ── Custom Variables (fire once on load) ─────────────────────── */
  function setSessionVars() {
    // 1 — Page type
    var path = window.location.pathname;
    var pageType = 'other';
    if (path === '/' || path === '/index.html') pageType = 'homepage';
    else if (path.includes('/about')) pageType = 'about';
    else if (path.includes('/projects')) pageType = 'projects';
    else if (path.includes('/contact')) pageType = 'contact';
    else if (path.includes('/blog')) pageType = 'blog';
    else if (path.includes('/industries')) pageType = 'industries';
    else if (path.includes('/ui-ux-design-agency-usa')) pageType = 'geo-usa';
    else if (path.includes('/ux-design-agency-dubai')) pageType = 'geo-uae';
    else if (path.includes('/ui-ux-design-agency-uk')) pageType = 'geo-uk';
    csVar(1, 'PageType', pageType);

    // 2 — Traffic source
    var ref = document.referrer || 'direct';
    var src = 'direct';
    if (ref.includes('google')) src = 'google';
    else if (ref.includes('linkedin')) src = 'linkedin';
    else if (ref.includes('instagram')) src = 'instagram';
    else if (ref.includes('twitter') || ref.includes('x.com')) src = 'twitter';
    else if (ref !== 'direct') src = 'referral';
    var params = new URLSearchParams(window.location.search);
    if (params.get('utm_source')) src = params.get('utm_source');
    csVar(2, 'TrafficSource', src);

    // 3 — UTM Campaign
    var campaign = params.get('utm_campaign') || 'none';
    csVar(3, 'UTMCampaign', campaign);

    // 4 — UTM Medium
    var medium = params.get('utm_medium') || 'none';
    csVar(4, 'UTMMedium', medium);
  }

  /* ── CTA Click Tracking ───────────────────────────────────────── */
  function trackCTAClicks() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('a, button');
      if (!el) return;

      var href = el.getAttribute('href') || '';
      var text = (el.innerText || el.textContent || '').trim().toLowerCase().replace(/\s+/g, '_').substring(0, 40);
      var classes = el.className || '';

      // Primary CTA buttons
      if (classes.includes('btn-primary')) {
        csEvent('cta_primary_click__' + text);
      }

      // Calendly links
      if (href.includes('calendly')) {
        csEvent('calendly_click__' + text);
      }

      // Email links
      if (href.startsWith('mailto:')) {
        csEvent('email_click');
      }

      // Phone links
      if (href.startsWith('tel:')) {
        csEvent('phone_click');
      }

      // Nav links
      if (el.closest('.nav-links, .navbar')) {
        csEvent('nav_click__' + text);
      }

      // Project / case study links
      if (href.includes('/projects/')) {
        var slug = href.split('/projects/')[1].replace(/\//g, '') || 'unknown';
        csEvent('case_study_click__' + slug);
      }

      // Blog links
      if (href.includes('/blog/') && !href.endsWith('/blog/') && !href.endsWith('/blog')) {
        var blogSlug = href.split('/blog/')[1] ? href.split('/blog/')[1].replace(/\//g, '').substring(0, 30) : 'index';
        csEvent('blog_click__' + blogSlug);
      }

      // Geo page links
      if (href.includes('design-agency-usa') || href.includes('design-agency-dubai') || href.includes('design-agency-uk')) {
        csEvent('geo_page_click__' + (href.split('/').filter(Boolean).pop() || 'geo'));
      }

      // Footer links
      if (el.closest('footer')) {
        csEvent('footer_link_click__' + text);
      }

      // Outline / secondary CTAs
      if (classes.includes('btn-outline') && !classes.includes('btn-primary')) {
        csEvent('cta_secondary_click__' + text);
      }
    });
  }

  /* ── Intake Form Lifecycle ────────────────────────────────────── */
  function trackIntakeForm() {
    // Form open — openIntakeForm is called globally
    var origOpen = window.openIntakeForm;
    if (typeof origOpen === 'function') {
      window.openIntakeForm = function () {
        csEvent('intake_form_opened');
        return origOpen.apply(this, arguments);
      };
    } else {
      // Fallback: intercept via MutationObserver if form renders dynamically
      var formObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          m.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              var form = node.querySelector && (node.querySelector('form') || (node.tagName === 'FORM' ? node : null));
              if (form || (node.id && node.id.toLowerCase().includes('intake'))) {
                csEvent('intake_form_rendered');
              }
            }
          });
        });
      });
      formObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Form submit
    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (form.tagName === 'FORM') {
        var id = form.id || form.className || 'unknown';
        csEvent('form_submit__' + id.toLowerCase().replace(/\s+/g, '_').substring(0, 30));
        csEvent('lead_form_submitted'); // canonical goal event
      }
    });

    // Form close — intercept close button
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[class*="close"], [aria-label*="close"], [id*="close"]');
      if (el && el.closest('[id*="intake"], [class*="intake"], [id*="modal"], [class*="modal"]')) {
        csEvent('intake_form_closed_without_submit');
      }
    });
  }

  /* ── Scroll Depth — Homepage ─────────────────────────────────── */
  function trackScrollDepth() {
    var milestones = { 25: false, 50: false, 75: false, 90: false };
    var pageLabel = window.location.pathname === '/' || window.location.pathname === '/index.html'
      ? 'homepage' : window.location.pathname.replace(/\//g, '_').replace(/^_/, '').substring(0, 20) || 'page';

    function checkScroll() {
      var scrolled = window.scrollY + window.innerHeight;
      var total = document.documentElement.scrollHeight;
      var pct = Math.round((scrolled / total) * 100);

      Object.keys(milestones).forEach(function (m) {
        if (!milestones[m] && pct >= parseInt(m)) {
          milestones[m] = true;
          csEvent('scroll_depth__' + pageLabel + '__' + m + 'pct');
        }
      });
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
  }

  /* ── Time on Page ─────────────────────────────────────────────── */
  function trackTimeOnPage() {
    var path = window.location.pathname;
    var isBlog = path.includes('/blog/') && path.split('/').length > 3;
    if (!isBlog) return; // only track blog post read time

    var slug = path.split('/blog/')[1] ? path.split('/blog/')[1].replace(/\//g, '').substring(0, 30) : 'post';
    var fired = {};

    [30, 60, 120, 180].forEach(function (secs) {
      setTimeout(function () {
        if (!fired[secs] && document.visibilityState !== 'hidden') {
          fired[secs] = true;
          csEvent('blog_read__' + slug + '__' + secs + 's');
          if (secs === 120) csEvent('blog_deep_read'); // canonical — reader likely to convert
        }
      }, secs * 1000);
    });
  }

  /* ── Geo Page Engagement ─────────────────────────────────────── */
  function trackGeoPage() {
    var path = window.location.pathname;
    var geoMap = {
      'ui-ux-design-agency-usa': 'USA',
      'ux-design-agency-dubai': 'UAE',
      'ui-ux-design-agency-uk': 'UK'
    };
    Object.keys(geoMap).forEach(function (slug) {
      if (path.includes(slug)) {
        csEvent('geo_page_view__' + geoMap[slug]);
        csVar(5, 'GeoPage', geoMap[slug]);
      }
    });
  }

  /* ── Case Study Page Tracking ────────────────────────────────── */
  function trackCaseStudy() {
    var path = window.location.pathname;
    if (!path.includes('/projects/')) return;
    var slug = path.split('/projects/')[1] ? path.split('/projects/')[1].replace(/\//g, '') : 'unknown';
    if (slug) {
      csEvent('case_study_view__' + slug);
      csVar(6, 'CaseStudy', slug);
    }
  }

  /* ── Exit Intent ─────────────────────────────────────────────── */
  function trackExitIntent() {
    var fired = false;
    document.addEventListener('mouseleave', function (e) {
      if (!fired && e.clientY <= 0) {
        fired = true;
        csEvent('exit_intent_detected');
      }
    });
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  function init() {
    setSessionVars();
    trackCTAClicks();
    trackIntakeForm();
    trackScrollDepth();
    trackTimeOnPage();
    trackGeoPage();
    trackCaseStudy();
    trackExitIntent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
