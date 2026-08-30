/* ===== COOKIE CONSENT BANNER =====
   Purely presentational — all gating logic lives inline in the Meta Pixel
   block on every page (it defines window.__dsnGrantConsent /
   __dsnDenyConsent and reads localStorage 'dsn_consent' before touching
   fbq at all). This file only needs to render the prompt and call those
   two globals; it never has to run before the pixel decision because that
   decision already defaults to "do nothing until consent exists" without it.
*/
(function () {
    'use strict';

    function getConsent() {
        try { return localStorage.getItem('dsn_consent'); } catch (e) { return null; }
    }

    if (getConsent()) return; // already answered, nothing to show

    var bar = document.createElement('div');
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.style.cssText = [
        'position:fixed', 'left:16px', 'right:16px', 'bottom:16px', 'z-index:99999',
        'max-width:640px', 'margin:0 auto',
        'background:#121212', 'color:#EEEEEE',
        'border:1px solid rgba(255,255,255,0.12)', 'border-radius:16px',
        'box-shadow:0px 20px 40px rgba(0,0,0,0.4)',
        'padding:18px 20px', 'font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif',
        'display:flex', 'flex-direction:column', 'gap:12px',
        'opacity:0', 'transform:translateY(12px)', 'transition:opacity .3s ease,transform .3s ease'
    ].join(';');

    bar.innerHTML =
        '<p style="margin:0;font-size:14px;line-height:1.55;color:#CECECE;">' +
            'We use cookies to see how visitors reach us and to measure ad performance. ' +
            'No tracking cookies are set until you choose Accept. ' +
            '<a href="/privacy-policy.html" style="color:#EEEEEE;text-decoration:underline;">Privacy policy</a>' +
        '</p>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
            '<button type="button" id="dsnConsentAccept" style="flex:1;min-width:110px;padding:10px 18px;border-radius:100px;font-size:14px;font-weight:600;background:#fff;color:#000;cursor:pointer;">Accept</button>' +
            '<button type="button" id="dsnConsentDecline" style="flex:1;min-width:110px;padding:10px 18px;border-radius:100px;font-size:14px;font-weight:600;background:transparent;color:#EEEEEE;border:1px solid rgba(255,255,255,0.2);cursor:pointer;">Decline</button>' +
        '</div>';

    document.body.appendChild(bar);
    requestAnimationFrame(function () {
        bar.style.opacity = '1';
        bar.style.transform = 'translateY(0)';
    });

    function dismiss() {
        bar.style.opacity = '0';
        bar.style.transform = 'translateY(12px)';
        setTimeout(function () { bar.remove(); }, 300);
    }

    document.getElementById('dsnConsentAccept').addEventListener('click', function () {
        if (typeof window.__dsnGrantConsent === 'function') window.__dsnGrantConsent();
        dismiss();
    });
    document.getElementById('dsnConsentDecline').addEventListener('click', function () {
        if (typeof window.__dsnDenyConsent === 'function') window.__dsnDenyConsent();
        dismiss();
    });
})();
