/* ===== INTAKE FORM MODAL ===== */
(function () {
    'use strict';

    var overlayEl = null;
    var currentStep = 0;
    var formData = {
        fullName: '',
        company: '',
        website: '',
        email: '',
        phone: '',
        projectType: '',
        description: '',
        referenceLinks: '',
        budget: '',
        timeline: '',
        source: '',
        anythingElse: ''
    };

    var STEPS = [
        { id: 'welcome', label: '' },
        { id: 'about', label: 'Step 1 of 4' },
        { id: 'project', label: 'Step 2 of 4' },
        { id: 'budget', label: 'Step 3 of 4' },
        { id: 'done', label: '' }
    ];

    var PROJECT_TYPES = ['Landing Page', 'Product Design', 'Design System', 'Website', 'Retainer', 'Consulting', 'Other'];
    var BUDGETS = ['\u20B950K\u2013\u20B91L', '\u20B91L\u2013\u20B92L', '\u20B92L\u2013\u20B95L', '\u20B95L+', 'Not sure yet'];
    var TIMELINES = ['ASAP', '1\u20132 weeks', '2\u20134 weeks', '1\u20132 months', 'Flexible'];
    var SOURCES = ['LinkedIn', 'Referral', 'Google Search', 'Community', 'Other'];

    /* ---------- helpers ---------- */

    function esc(str) {
        var d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function buildGridButtons(items, group) {
        return items.map(function (item) {
            return '<button type="button" data-group="' + esc(group) + '" data-value="' + esc(item) + '">' + esc(item) + '</button>';
        }).join('');
    }

    /* ---------- render ---------- */

    function buildHTML() {
        return '' +
            '<div class="intake-overlay" id="intakeOverlay">' +
                '<div class="intake-card" id="intakeCard">' +
                    '<button class="intake-close" id="intakeClose" aria-label="Close">' +
                        '<svg viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke-linecap="round"/></svg>' +
                    '</button>' +
                    '<div class="intake-progress-track"><div class="intake-progress-bar" id="intakeProgress" style="width:0%"></div></div>' +
                    '<div class="intake-body" id="intakeBody">' +

                        /* Step 0: Welcome */
                        '<div class="intake-step" data-step="0">' +
                            '<div class="intake-welcome">' +
                                '<h2 class="intake-heading">Let\u2019s build something<br>remarkable together.</h2>' +
                                '<p>Tell us about your project and we\u2019ll get back to you within 24 hours with a tailored plan.</p>' +
                                '<button type="button" class="intake-btn-start" id="intakeBtnStart">Start your project brief \u2192</button>' +
                            '</div>' +
                        '</div>' +

                        /* Step 1: About You */
                        '<div class="intake-step" data-step="1">' +
                            '<span class="intake-step-label">Step 1 of 4 \u2014 About You</span>' +
                            '<h2 class="intake-heading">Tell us about yourself</h2>' +
                            '<p class="intake-subheading">We\u2019d love to know who we\u2019re working with.</p>' +
                            '<div class="intake-field" data-field="fullName">' +
                                '<label>Full Name <span class="required">*</span></label>' +
                                '<input type="text" placeholder="John Doe" data-key="fullName">' +
                                '<div class="intake-error-msg">Full name is required.</div>' +
                            '</div>' +
                            '<div class="intake-field-row">' +
                                '<div class="intake-field" data-field="company">' +
                                    '<label>Company</label>' +
                                    '<input type="text" placeholder="Acme Inc." data-key="company">' +
                                '</div>' +
                                '<div class="intake-field" data-field="website">' +
                                    '<label>Website URL</label>' +
                                    '<input type="url" placeholder="https://example.com" data-key="website">' +
                                '</div>' +
                            '</div>' +
                            '<div class="intake-field" data-field="email">' +
                                '<label>Email <span class="required">*</span></label>' +
                                '<input type="email" placeholder="john@company.com" data-key="email">' +
                                '<div class="intake-error-msg">Please enter a valid email address.</div>' +
                            '</div>' +
                            '<div class="intake-field" data-field="phone">' +
                                '<label>Phone</label>' +
                                '<input type="tel" placeholder="10-digit phone number" data-key="phone">' +
                                '<div class="intake-error-msg">Phone must be a 10-digit number.</div>' +
                            '</div>' +
                        '</div>' +

                        /* Step 2: Your Project */
                        '<div class="intake-step" data-step="2">' +
                            '<span class="intake-step-label">Step 2 of 4 \u2014 Your Project</span>' +
                            '<h2 class="intake-heading">What are we building?</h2>' +
                            '<p class="intake-subheading">Help us understand the scope of your project.</p>' +
                            '<div class="intake-grid-group" data-grid="projectType">' +
                                '<span class="intake-grid-label">Project Type <span class="required">*</span></span>' +
                                '<div class="intake-select-grid">' + buildGridButtons(PROJECT_TYPES, 'projectType') + '</div>' +
                                '<div class="intake-error-msg">Please select a project type.</div>' +
                            '</div>' +
                            '<div class="intake-field" data-field="description">' +
                                '<label>Brief Description <span class="required">*</span></label>' +
                                '<textarea placeholder="Tell us about your project, goals, and any specific requirements..." data-key="description"></textarea>' +
                                '<div class="intake-error-msg">A brief description is required.</div>' +
                            '</div>' +
                            '<div class="intake-field" data-field="referenceLinks">' +
                                '<label>Reference Links</label>' +
                                '<input type="text" placeholder="Links to inspiration, competitors, etc." data-key="referenceLinks">' +
                            '</div>' +
                        '</div>' +

                        /* Step 3: Budget & Timeline */
                        '<div class="intake-step" data-step="3">' +
                            '<span class="intake-step-label">Step 3 of 4 \u2014 Budget & Timeline</span>' +
                            '<h2 class="intake-heading">Budget & timeline</h2>' +
                            '<p class="intake-subheading">This helps us recommend the right engagement model.</p>' +
                            '<div class="intake-grid-group" data-grid="budget">' +
                                '<span class="intake-grid-label">Budget Range <span class="required">*</span></span>' +
                                '<div class="intake-select-grid">' + buildGridButtons(BUDGETS, 'budget') + '</div>' +
                                '<div class="intake-error-msg">Please select a budget range.</div>' +
                            '</div>' +
                            '<div class="intake-grid-group" data-grid="timeline">' +
                                '<span class="intake-grid-label">Timeline <span class="required">*</span></span>' +
                                '<div class="intake-select-grid">' + buildGridButtons(TIMELINES, 'timeline') + '</div>' +
                                '<div class="intake-error-msg">Please select a timeline.</div>' +
                            '</div>' +
                            '<div class="intake-grid-group" data-grid="source">' +
                                '<span class="intake-grid-label">How did you find us?</span>' +
                                '<div class="intake-select-grid">' + buildGridButtons(SOURCES, 'source') + '</div>' +
                            '</div>' +
                            '<div class="intake-field" data-field="anythingElse">' +
                                '<label>Anything else?</label>' +
                                '<textarea placeholder="Additional details, questions, or comments..." data-key="anythingElse" style="min-height:70px"></textarea>' +
                            '</div>' +
                        '</div>' +

                        /* Step 4: Done */
                        '<div class="intake-step" data-step="4">' +
                            '<div class="intake-done">' +
                                '<div class="intake-done-icon">' +
                                    '<svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                                '</div>' +
                                '<h2 class="intake-heading">We\u2019ve got your brief.<br>Great things ahead.</h2>' +
                                '<p>Thank you for sharing your project details. Our team will review everything and get back to you within 24 hours.</p>' +
                                '<div class="intake-done-steps">' +
                                    '<h4>What happens next</h4>' +
                                    '<ul>' +
                                        '<li><span class="done-num">1</span>We review your brief in detail</li>' +
                                        '<li><span class="done-num">2</span>A senior designer reaches out within 24h</li>' +
                                        '<li><span class="done-num">3</span>We schedule a free strategy call</li>' +
                                        '<li><span class="done-num">4</span>You receive a tailored proposal</li>' +
                                    '</ul>' +
                                '</div>' +
                                '<button type="button" class="intake-btn-close-done" id="intakeBtnCloseDone">Close</button>' +
                            '</div>' +
                        '</div>' +

                    '</div>' +

                    /* Footer (nav buttons) */
                    '<div class="intake-footer" id="intakeFooter">' +
                        '<button type="button" class="intake-btn-back hidden" id="intakeBtnBack">\u2190 Back</button>' +
                        '<button type="button" class="intake-btn-next" id="intakeBtnNext">Continue \u2192</button>' +
                    '</div>' +

                '</div>' +
            '</div>';
    }

    /* ---------- step navigation ---------- */

    function updateProgress() {
        var bar = document.getElementById('intakeProgress');
        if (!bar) return;
        var pct = 0;
        if (currentStep === 0) pct = 0;
        else if (currentStep === 1) pct = 25;
        else if (currentStep === 2) pct = 50;
        else if (currentStep === 3) pct = 75;
        else if (currentStep === 4) pct = 100;
        bar.style.width = pct + '%';
    }

    function showStep(idx) {
        var steps = overlayEl.querySelectorAll('.intake-step');
        steps.forEach(function (el) { el.classList.remove('active'); });
        var target = overlayEl.querySelector('.intake-step[data-step="' + idx + '"]');
        if (target) target.classList.add('active');

        var footer = document.getElementById('intakeFooter');
        var btnBack = document.getElementById('intakeBtnBack');
        var btnNext = document.getElementById('intakeBtnNext');

        /* Welcome step: hide footer (has its own start button) */
        if (idx === 0) {
            footer.style.display = 'none';
            return;
        }

        /* Done step: hide footer */
        if (idx === 4) {
            footer.style.display = 'none';
            return;
        }

        footer.style.display = 'flex';

        /* Back button visibility */
        if (idx <= 1) {
            btnBack.classList.add('hidden');
        } else {
            btnBack.classList.remove('hidden');
        }

        /* Next button text */
        if (idx === 3) {
            btnNext.textContent = 'Submit \u2192';
            btnNext.className = 'intake-btn-submit';
        } else {
            btnNext.textContent = 'Continue \u2192';
            btnNext.className = 'intake-btn-next';
        }

        updateProgress();
    }

    /* ---------- validation ---------- */

    function clearErrors() {
        overlayEl.querySelectorAll('.intake-field.error').forEach(function (el) {
            el.classList.remove('error');
        });
        overlayEl.querySelectorAll('.intake-grid-group.error').forEach(function (el) {
            el.classList.remove('error');
        });
    }

    function validateStep(idx) {
        clearErrors();
        var valid = true;

        if (idx === 1) {
            /* About You */
            if (!formData.fullName.trim()) {
                setFieldError('fullName');
                valid = false;
            }
            var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!formData.email.trim() || !emailRe.test(formData.email.trim())) {
                setFieldError('email');
                valid = false;
            }
            if (formData.phone.trim()) {
                var phoneClean = formData.phone.trim().replace(/[\s\-\(\)]/g, '');
                if (!/^\d{10}$/.test(phoneClean)) {
                    setFieldError('phone');
                    valid = false;
                }
            }
        }

        if (idx === 2) {
            /* Your Project */
            if (!formData.projectType) {
                setGridError('projectType');
                valid = false;
            }
            if (!formData.description.trim()) {
                setFieldError('description');
                valid = false;
            }
        }

        if (idx === 3) {
            /* Budget & Timeline */
            if (!formData.budget) {
                setGridError('budget');
                valid = false;
            }
            if (!formData.timeline) {
                setGridError('timeline');
                valid = false;
            }
        }

        return valid;
    }

    function setFieldError(key) {
        var field = overlayEl.querySelector('.intake-field[data-field="' + key + '"]');
        if (field) field.classList.add('error');
    }

    function setGridError(key) {
        var group = overlayEl.querySelector('.intake-grid-group[data-grid="' + key + '"]');
        if (group) group.classList.add('error');
    }

    /* ---------- sync form data ---------- */

    function syncInputs() {
        overlayEl.querySelectorAll('input[data-key], textarea[data-key]').forEach(function (el) {
            el.value = formData[el.getAttribute('data-key')] || '';
        });
    }

    function syncGridSelections() {
        overlayEl.querySelectorAll('.intake-select-grid button').forEach(function (btn) {
            var group = btn.getAttribute('data-group');
            var value = btn.getAttribute('data-value');
            if (formData[group] === value) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    /* ---------- submit ---------- */

    var SUPABASE_URL  = 'https://xrrmeuftnhqhwhigztym.supabase.co';
    var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhycm1ldWZ0bmhxaHdoaWd6dHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Njc4NjAsImV4cCI6MjA5NDE0Mzg2MH0.vLZ0prx7vG0zj5AZA8iIerhv2hyJ9eK0lL3NFqCfwQ4';

    var META_PIXEL_ID = '1676816126768459';

    function getCookie(name) {
        var match = document.cookie.match('(?:^|;\\s*)' + name + '=([^;]*)');
        return match ? decodeURIComponent(match[1]) : '';
    }

    function budgetToValue(budget) {
        /* Rough midpoint (INR) per budget bracket, for Meta value optimization */
        var map = {
            '₹50K–₹1L': 75000,
            '₹1L–₹2L': 150000,
            '₹2L–₹5L': 350000,
            '₹5L+': 500000
        };
        return map[budget] || 0;
    }

    function makeEventId() {
        return 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    }

    /* Fires the real Meta Lead conversion once, at the moment of actual
       submission — not on click/open — with Advanced Matching so em/ph
       are hashed client-side by the pixel and tie the event to a real
       person instead of just ip/ua/fbp. Also relays the same event_id to
       our own Conversions API endpoint for server-side dedup. */
    function trackMetaLead() {
        if (typeof fbq !== 'function') return;

        var eventId = makeEventId();
        var phoneDigits = (formData.phone || '').replace(/\D/g, '');
        var nameParts = (formData.fullName || '').trim().split(/\s+/);

        /* Manual Advanced Matching — fbq hashes these client-side (SHA-256)
           before they ever leave the browser. */
        fbq('init', META_PIXEL_ID, {
            em: formData.email || undefined,
            ph: phoneDigits || undefined,
            fn: nameParts[0] || undefined,
            ln: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined
        });

        fbq('track', 'Lead', {
            content_name: formData.projectType || 'General Inquiry',
            content_category: 'Intake Form',
            value: budgetToValue(formData.budget),
            currency: 'INR'
        }, { eventID: eventId });

        /* Server-side Conversions API relay — same event_id for Meta-side
           dedup between the browser and server events. */
        fetch('/api/capi-lead/', {
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName: 'Lead',
                eventId: eventId,
                email: formData.email,
                phone: phoneDigits,
                firstName: nameParts[0] || '',
                lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '',
                projectType: formData.projectType,
                value: budgetToValue(formData.budget),
                pageUrl: location.href,
                clientUserAgent: navigator.userAgent,
                fbp: getCookie('_fbp'),
                fbc: getCookie('_fbc')
            })
        }).catch(function () { /* silent fail — never break UX */ });
    }

    function saveLeadToSupabase() {
        var lead = {
            full_name:       formData.fullName      || null,
            company:         formData.company        || null,
            website:         formData.website        || null,
            email:           formData.email,
            phone:           formData.phone          || null,
            project_type:    formData.projectType    || null,
            description:     formData.description    || null,
            reference_links: formData.referenceLinks || null,
            budget:          formData.budget         || null,
            timeline:        formData.timeline       || null,
            source:          formData.source         || null,
            anything_else:   formData.anythingElse   || null,
            page_url:        location.pathname,
            user_agent:      navigator.userAgent
        };
        fetch(SUPABASE_URL + '/rest/v1/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON,
                'Authorization': 'Bearer ' + SUPABASE_ANON,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(lead)
        }).catch(function (err) { console.error('Supabase lead save failed:', err); });
    }

    function submitForm() {
        /* 1. Save to Supabase leads table */
        saveLeadToSupabase();

        /* 2. Fire analytics event */
        if (typeof window.trackEvent === 'function') {
            window.trackEvent('form_submitted', {
                project_type: formData.projectType,
                budget:       formData.budget,
                timeline:     formData.timeline,
                source:       formData.source
            });
        }

        /* 2b. Fire the real Meta Lead conversion (pixel + Conversions API) */
        trackMetaLead();

        /* 3. Send email via Web3Forms */
        var payload = Object.assign({}, formData, {
            access_key: '47d61ba4-4432-4e45-930e-9888feb0e34f',
            subject: '🚀 New Lead: ' + (formData.fullName || 'Unknown') + ' — ' + (formData.projectType || 'Project Inquiry'),
            from_name: 'Designit Website',
            replyto: formData.email
        });

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) {
                console.log('Lead submitted successfully:', formData.email);
            } else {
                console.error('Web3Forms error:', data.message);
            }
        })
        .catch(function(err) {
            console.error('Form submission failed:', err);
        });
    }

    /* ---------- event binding ---------- */

    function bindEvents() {
        /* Close button */
        document.getElementById('intakeClose').addEventListener('click', function () {
            closeIntakeForm();
        });

        /* Click outside card */
        overlayEl.addEventListener('click', function (e) {
            if (e.target === overlayEl) {
                closeIntakeForm();
            }
        });

        /* Escape key */
        document.addEventListener('keydown', handleEscape);

        /* Start button (welcome) */
        document.getElementById('intakeBtnStart').addEventListener('click', function () {
            currentStep = 1;
            showStep(currentStep);
            if (typeof window.trackEvent === 'function') {
                window.trackEvent('form_started', {});
            }
        });

        /* Close button (done step) */
        document.getElementById('intakeBtnCloseDone').addEventListener('click', function () {
            closeIntakeForm();
        });

        /* Back */
        document.getElementById('intakeBtnBack').addEventListener('click', function () {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        });

        /* Next / Submit */
        document.getElementById('intakeBtnNext').addEventListener('click', function () {
            if (!validateStep(currentStep)) return;
            if (typeof window.trackEvent === 'function') {
                window.trackEvent('form_step_complete', { step: currentStep });
            }
            if (currentStep === 3) {
                submitForm();
                currentStep = 4;
                showStep(currentStep);
            } else {
                currentStep++;
                showStep(currentStep);
            }
        });

        /* Input change tracking */
        overlayEl.addEventListener('input', function (e) {
            var key = e.target.getAttribute('data-key');
            if (key) {
                formData[key] = e.target.value;
                /* Clear error on edit */
                var field = e.target.closest('.intake-field');
                if (field) field.classList.remove('error');
            }
        });

        /* Grid button clicks */
        overlayEl.addEventListener('click', function (e) {
            var btn = e.target.closest('.intake-select-grid button');
            if (!btn) return;
            var group = btn.getAttribute('data-group');
            var value = btn.getAttribute('data-value');

            /* Toggle: deselect if already selected, otherwise select */
            if (formData[group] === value) {
                formData[group] = '';
            } else {
                formData[group] = value;
            }
            syncGridSelections();

            /* Clear error */
            var gridGroup = btn.closest('.intake-grid-group');
            if (gridGroup) gridGroup.classList.remove('error');
        });
    }

    function handleEscape(e) {
        if (e.key === 'Escape') {
            closeIntakeForm();
        }
    }

    /* ---------- open / close ---------- */

    window.openIntakeForm = function () {
        /* Reset state */
        currentStep = 0;
        formData = {
            fullName: '',
            company: '',
            website: '',
            email: '',
            phone: '',
            projectType: '',
            description: '',
            referenceLinks: '',
            budget: '',
            timeline: '',
            source: '',
            anythingElse: ''
        };

        /* Create DOM if not present */
        if (!overlayEl) {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = buildHTML();
            document.body.appendChild(wrapper.firstElementChild);
            overlayEl = document.getElementById('intakeOverlay');
            bindEvents();
        }

        /* Sync & show */
        syncInputs();
        syncGridSelections();
        clearErrors();
        showStep(0);

        /* Track form open */
        if (typeof window.trackEvent === 'function') {
            window.trackEvent('form_opened', { page_url: location.pathname });
        }
        /* Non-conversion funnel signal only — the real Lead event fires on
           actual submission in trackMetaLead(), not here. */
        if (typeof fbq === 'function') {
            fbq('trackCustom', 'IntakeFormOpened', { page_url: location.pathname });
        }

        /* Prevent body scroll */
        document.body.style.overflow = 'hidden';

        /* Animate in (rAF so the transition fires) */
        requestAnimationFrame(function () {
            overlayEl.classList.add('active');
        });
    };

    window.closeIntakeForm = function () {
        if (!overlayEl) return;
        overlayEl.classList.remove('active');
        document.body.style.overflow = '';

        /* Clean up after transition */
        setTimeout(function () {
            if (overlayEl && !overlayEl.classList.contains('active')) {
                overlayEl.remove();
                overlayEl = null;
                document.removeEventListener('keydown', handleEscape);
            }
        }, 400);
    };
})();
