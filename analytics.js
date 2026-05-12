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

    var SESSION_ID = getSessionId();
    var PAGE_START = Date.now();

    /* ---- core send ---- */
    function send(eventName, props) {
        var payload = {
            session_id: SESSION_ID,
            event_name: eventName,
            page_url: location.pathname,
            properties: Object.assign({ referrer: document.referrer || '' }, props || {})
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

    /* ---- forward to PostHog if loaded ---- */
    function sendToPosthog(eventName, props) {
        if (window.posthog && typeof window.posthog.capture === 'function') {
            window.posthog.capture(eventName, props || {});
        }
    }

    /* ---- expose globally for intake-form.js ---- */
    window.trackEvent = function(eventName, props) {
        send(eventName, props);          // Supabase events table
        sendToPosthog(eventName, props); // PostHog
    };

    /* ---- 1. page_view ---- */
    send('page_view', {
        title: document.title,
        utm_source: new URLSearchParams(location.search).get('utm_source') || '',
        utm_medium: new URLSearchParams(location.search).get('utm_medium') || '',
        utm_campaign: new URLSearchParams(location.search).get('utm_campaign') || ''
    });

    /* ---- 2. CTA clicks (event delegation) ---- */
    document.addEventListener('click', function (e) {
        var el = e.target.closest('.btn, .nav-cta, [data-track]');
        if (!el) return;
        send('cta_click', {
            label: el.textContent.trim().slice(0, 80),
            href: el.getAttribute('href') || '',
            classes: el.className
        });
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
