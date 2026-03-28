(function() {
    'use strict';

    // ===== STAGGERED PAGE ENTRANCE =====
    window.addEventListener('load', () => {
        document.querySelectorAll('[data-entrance]').forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(24px)';
            el.style.transition = `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`;
            requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
        });
    });

    // ===== MOBILE MENU =====
    const toggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => { navLinks.classList.toggle('active'); toggle.classList.toggle('active'); });
        navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => { navLinks.classList.remove('active'); toggle.classList.remove('active'); }));
    }

    // ===== NAVBAR SCROLL =====
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 50); }, { passive: true });
    }

    // ===== SCROLL REVEAL =====
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.project-card, .stat-card, .svc-full-card, .review-card, .faq-item, .team-card, .price-card, .process-step, .blog-card, .sec-label, .sec-title, .sec-desc, [data-anim]').forEach(el => {
        el.classList.add('anim');
        revealObs.observe(el);
    });

    // ===== COUNTER ANIMATION =====
    const counterObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            const text = el.textContent;
            const match = text.match(/^([\$₹]?)([\d.]+)(.*)$/);
            if (!match) return;
            const prefix = match[1];
            const num = parseFloat(match[2]);
            const suffix = match[3];
            const duration = 1500;
            const start = performance.now();
            function update(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 4);
                const current = num % 1 !== 0 ? (eased * num).toFixed(1) : Math.round(eased * num);
                el.textContent = prefix + current + suffix;
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
            counterObs.unobserve(el);
        });
    }, { threshold: 0.3 });
    document.querySelectorAll('.stat-num').forEach(el => counterObs.observe(el));

    // ===== FAQ ACCORDION =====
    document.querySelectorAll('.faq-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const href = anchor.getAttribute('href');
            if (href === '#') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
            const target = document.querySelector(href);
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
    });

    // ===== MAGNETIC BUTTONS =====
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => { btn.style.transition = ''; }, 400);
        });
    });

    // ===== CARD TILT =====
    document.querySelectorAll('.svc-full-card, .process-step').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `translateY(-2px) perspective(800px) rotateX(${y * -2}deg) rotateY(${x * 2}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => { card.style.transition = ''; }, 500);
        });
    });

    // ===== FORM HANDLING =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
            input.addEventListener('blur', () => input.parentElement.classList.remove('focused'));
        });
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const original = btn.textContent;
            btn.textContent = 'Sent!';
            btn.classList.add('btn-success');
            setTimeout(() => { btn.textContent = original; btn.classList.remove('btn-success'); contactForm.reset(); }, 3000);
        });
    }

    // ===== FORM CHIP TOGGLE =====
    document.querySelectorAll('.form-help-chips label').forEach(label => {
        label.addEventListener('click', () => {
            label.classList.toggle('selected');
        });
    });

    // ===== PROJECT FILTER (Projects page) =====
    const filterBtns = document.querySelectorAll('.projects-filter button');
    if (filterBtns.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Filter logic
                const cat = btn.dataset.filter;
                document.querySelectorAll('.project-card[data-category]').forEach(card => {
                    if (cat === 'all' || card.dataset.category === cat) {
                        card.style.display = '';
                        card.classList.add('visible');
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // ===== PRICING TOGGLE =====
    const pricingBtns = document.querySelectorAll('.pricing-toggle button');
    if (pricingBtns.length) {
        pricingBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                pricingBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // ===== BLOG FILTER =====
    const blogFilterBtns = document.querySelectorAll('.blog-filters button');
    if (blogFilterBtns.length) {
        blogFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                blogFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const cat = btn.dataset.filter;
                document.querySelectorAll('.blog-card[data-category]').forEach(card => {
                    if (cat === 'all' || card.dataset.category === cat) {
                        card.style.display = '';
                        setTimeout(() => card.classList.add('visible'), 50);
                    } else {
                        card.style.display = 'none';
                        card.classList.remove('visible');
                    }
                });
            });
        });
    }

    // ===== IMAGE LAZY LOAD FADE =====
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.6s ease';
        if (img.complete) { img.style.opacity = '1'; }
        else { img.addEventListener('load', () => { img.style.opacity = '1'; }); }
    });

})();
