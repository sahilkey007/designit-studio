/* ===== DESIGNIT ANALYTICS — Supabase behaviour tracking ===== */
(function () {
    'use strict';

    var SUPABASE_URL = 'https://xrrmeuftnhqhwhigztym.supabase.co';
    var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhycm1ldWZ0bmhxaHdoaWd6dHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Njc4NjAsImV4cCI6MjA5NDE0Mzg2MH0.vLZ0prx7vG0zj5AZA8iIerhv2hyJ9eK0lL3NFqCfwQ4';

    /* ---- session ID (persists for browser tab session) ---- */
    function getSessionId() {
        var key = 'dsn_sid';
        var sid = sessionStorage.getItem(key);
        if (!sid) {
            sid = 'sid_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
            sessionStorage.setItem(key, sid);
        }
        return sid;
    }

    var PAGE_START = Date.now();

    /* ---- consent gate: nothing is stored or sent until the visitor accepts ---- */
    function hasConsent() {
        try { return localStorage.getItem('dsn_consent') === 'granted'; } catch (e) { return false; }
    }

    /* ---- attribution + page context (blueprint section 91) ----
       First touch (landing page, UTMs, referrer) is kept in sessionStorage, only after consent, so a lead
       submitted later in the session can be attributed to where the visit started. */
    function qp(k) { try { return new URLSearchParams(location.search).get(k) || ''; } catch (e) { return ''; } }
    function rememberFirstTouch() {
        try {
            if (!sessionStorage.getItem('dsn_landing')) {
                sessionStorage.setItem('dsn_landing', location.pathname);
                sessionStorage.setItem('dsn_utm', JSON.stringify({ source: qp('utm_source'), medium: qp('utm_medium'), campaign: qp('utm_campaign'), referrer: document.referrer || '' }));
            }
        } catch (e) {}
    }
    function pageContext() {
        var m = location.pathname.match(/^\/(services|industries|solutions|projects|blog)\/([^\/]+)/);
        var main = document.querySelector('main[data-cluster]');
        return {
            page_type: m ? m[1] : (location.pathname === '/' ? 'home' : 'other'),
            service: m && m[1] === 'services' ? m[2] : '',
            industry: m && m[1] === 'industries' ? m[2] : '',
            content_cluster: main ? main.getAttribute('data-cluster') : ''
        };
    }
    function context() {
        var c = pageContext(), utm = {};
        try { c.landing_page = sessionStorage.getItem('dsn_landing') || ''; utm = JSON.parse(sessionStorage.getItem('dsn_utm') || '{}'); } catch (e) {}
        c.utm_source = utm.source || ''; c.utm_medium = utm.medium || ''; c.utm_campaign = utm.campaign || '';
        return c;
    }

    /* ---- core send ---- */
    function send(eventName, props) {
        if (!hasConsent()) return;
        var payload = {
            session_id: getSessionId(),
            event_name: eventName,
            page_url: location.pathname,
            properties: Object.assign({ referrer: document.referrer || '' }, context(), props || {})
        };
        // Use sendBeacon for unload events, fetch for all others
        var body = JSON.stringify(payload);
        var url = SUPABASE_URL + '/rest/v1/events';
        var headers = {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON,
            'Authorization': 'Bearer ' + SUPABASE_ANON,
            'Prefer': 'return=minimal'
        };

        if (eventName === 'session_end' && navigator.sendBeacon) {
            var blob = new Blob([body], { type: 'application/json' });
            // sendBeacon can't set headers — use fetch with keepalive instead
        }
        fetch(url, { method: 'POST', headers: headers, body: body, keepalive: true })
            .catch(function () { /* silent fail — never break UX */ });
    }

    /* ---- expose globally for intake-form.js ---- */
    window.trackEvent = function(eventName, props) {
        send(eventName, props);          // Supabase events table
    };

    /* ---- 1. page_view (sent on load if already consented, else right after the visitor accepts) ---- */
    var pageViewSent = false;
    function sendPageView() {
        if (pageViewSent || !hasConsent()) return;
        pageViewSent = true;
        rememberFirstTouch();
        var type = pageContext().page_type;
        var typed = { services: 'view_service', projects: 'view_case_study', blog: 'view_article', industries: 'view_industry', solutions: 'view_solution' }[type];
        if (typed && !/^\/(services|projects|blog|industries|solutions)\/?$/.test(location.pathname)) send(typed, { title: document.title });
        send('page_view', {
            title: document.title,
            utm_source: new URLSearchParams(location.search).get('utm_source') || '',
            utm_medium: new URLSearchParams(location.search).get('utm_medium') || '',
            utm_campaign: new URLSearchParams(location.search).get('utm_campaign') || ''
        });
    }
    sendPageView();
    var prevOnConsent = window.__dsnOnConsentGranted;
    window.__dsnOnConsentGranted = function () {
        if (typeof prevOnConsent === 'function') prevOnConsent();
        sendPageView();
    };

    /* ---- 2. CTA clicks (event delegation) ---- */
    document.addEventListener('click', function (e) {
        var el = e.target.closest('.btn, .nav-cta, [data-track]');
        if (!el) return;
        send('cta_click', {
            track: el.getAttribute('data-track') || '',
            label: el.textContent.trim().slice(0, 80),
            href: el.getAttribute('href') || '',
            classes: el.className
        });
    });

    /* ---- 2b. booking and asset clicks ---- */
    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href') || '';
        if (/calendly\.com/.test(href)) send('schedule_call', { href: href, label: (a.textContent || '').trim().slice(0, 80) });
        if (/\.pdf($|\?)/i.test(href) || a.hasAttribute('download')) send('asset_download', { href: href });
    });

    /* ---- 3. scroll depth ---- */
    var scrollMilestones = { 25: false, 50: false, 75: false, 90: false };
    function onScroll() {
        var scrolled = window.scrollY + window.innerHeight;
        var total = document.documentElement.scrollHeight;
        var pct = Math.round((scrolled / total) * 100);
        [25, 50, 75, 90].forEach(function (m) {
            if (!scrollMilestones[m] && pct >= m) {
                scrollMilestones[m] = true;
                send('scroll_depth', { percent: m });
            }
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---- 4. session duration on leave ---- */
    window.addEventListener('beforeunload', function () {
        send('session_end', { duration_ms: Date.now() - PAGE_START });
    });

    /* ---- 5. outbound link clicks ---- */
    document.addEventListener('click', function (e) {
        var a = e.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href');
        if (href && href.startsWith('http') && !href.includes(location.hostname)) {
            send('outbound_click', { url: href });
        }
    });

})();
