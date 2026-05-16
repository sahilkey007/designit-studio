/* ============================================
   MAIN.JS — Designit Website
   Animations, interactions, navigation
   ============================================ */

(function () {
  'use strict';

  // --- Navbar scroll effect ---
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // --- Mobile menu toggle ---
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', function () {
      mobileToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll reveal animations ---
  var revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    // Mark html so CSS hides .reveal items until they intersect (animation enabled)
    document.documentElement.classList.add('js-reveal-active');

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.06,
      rootMargin: '0px 0px 200px 0px'
    });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });

    // Safety net: after 2s, mark any remaining as visible so nothing stays hidden
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
        el.classList.add('visible');
      });
    }, 2000);
  }

  // --- Counter animation ---
  var counterElements = document.querySelectorAll('[data-count]');
  if (counterElements.length > 0 && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterElements.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.textContent.replace(/[0-9]/g, '');
    var duration = 1500;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // --- FAQ Accordion ---
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function () {
        var isActive = item.classList.contains('active');

        // Close all
        faqItems.forEach(function (other) {
          other.classList.remove('active');
        });

        // Open clicked (if it wasn't already open)
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // --- Blog/Project filter ---
  var filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = this.getAttribute('data-filter');

        // Update active button
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        // Filter items
        var items = document.querySelectorAll('[data-category]');
        items.forEach(function (item) {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Contact form help chips ---
  var helpChips = document.querySelectorAll('.help-chip');
  helpChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      this.classList.toggle('selected');
    });
  });

  // --- Contact form basic validation ---
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = contactForm.querySelector('[name="name"]');
      var email = contactForm.querySelector('[name="email"]');
      var isValid = true;

      // Simple validation
      if (name && !name.value.trim()) {
        name.style.borderColor = '#ff4444';
        isValid = false;
      } else if (name) {
        name.style.borderColor = '';
      }

      if (email && !email.value.trim()) {
        email.style.borderColor = '#ff4444';
        isValid = false;
      } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.style.borderColor = '#ff4444';
        isValid = false;
      } else if (email) {
        email.style.borderColor = '';
      }

      if (isValid) {
        // Collect selected chips
        var selectedServices = [];
        document.querySelectorAll('.help-chip.selected').forEach(function (c) {
          selectedServices.push(c.textContent.trim());
        });

        // Show success state
        var submitBtn = contactForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          var originalText = submitBtn.textContent;
          submitBtn.textContent = 'Message Sent!';
          submitBtn.style.opacity = '0.7';
          submitBtn.disabled = true;

          setTimeout(function () {
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = '';
            submitBtn.disabled = false;
            contactForm.reset();
            helpChips.forEach(function (c) { c.classList.remove('selected'); });
          }, 3000);
        }
      }
    });
  }

  // --- Blog TOC active state ---
  var tocLinks = document.querySelectorAll('.blog-toc a');
  if (tocLinks.length > 0) {
    var headings = [];
    tocLinks.forEach(function (link) {
      var id = link.getAttribute('href');
      if (id && id.startsWith('#')) {
        var heading = document.querySelector(id);
        if (heading) headings.push({ el: heading, link: link });
      }
    });

    if (headings.length > 0) {
      var tocObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            tocLinks.forEach(function (l) { l.classList.remove('active'); });
            var match = headings.find(function (h) { return h.el === entry.target; });
            if (match) match.link.classList.add('active');
          }
        });
      }, {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0
      });

      headings.forEach(function (h) {
        tocObserver.observe(h.el);
      });
    }
  }

  // --- Social share ---
  window.shareTwitter = function () {
    var url = encodeURIComponent(window.location.href);
    var title = encodeURIComponent(document.title);
    window.open('https://twitter.com/intent/tweet?url=' + url + '&text=' + title, '_blank', 'width=550,height=420');
  };

  window.shareLinkedIn = function () {
    var url = encodeURIComponent(window.location.href);
    window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + url, '_blank', 'width=550,height=420');
  };

  window.copyLink = function () {
    navigator.clipboard.writeText(window.location.href).then(function () {
      var btn = document.querySelector('.copy-link-btn');
      if (btn) {
        var original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = original; }, 2000);
      }
    });
  };

  // --- Lazy image fade-in ---
  var lazyImages = document.querySelectorAll('img[loading="lazy"]');
  lazyImages.forEach(function (img) {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.4s ease';
    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', function () {
        img.style.opacity = '1';
      });
    }
  });

  // --- Marquee pause on hover ---
  var marqueeRows = document.querySelectorAll('.marquee-row');
  marqueeRows.forEach(function (row) {
    row.addEventListener('mouseenter', function () {
      row.style.animationPlayState = 'paused';
    });
    row.addEventListener('mouseleave', function () {
      row.style.animationPlayState = 'running';
    });
  });

  // --- Rich service card hover effect ---
  var serviceCards = document.querySelectorAll('.rich-service-card');
  serviceCards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      card.style.boxShadow = '0px 20px 40px rgba(0, 0, 0, 0.3)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.boxShadow = '';
    });
  });

  // ============================================
  // Legacy selectors + project-page features
  // (merged from former script.js)
  // ============================================

  // --- Staggered page entrance ([data-entrance]) ---
  window.addEventListener('load', function () {
    document.querySelectorAll('[data-entrance]').forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1) ' + (i * 0.1) + 's, transform 0.7s cubic-bezier(0.16,1,0.3,1) ' + (i * 0.1) + 's';
      requestAnimationFrame(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });

  // --- Magnetic buttons (.btn mouse-follow) ---
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.12) + 'px, ' + (y * 0.12) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
        setTimeout(function () { btn.style.transition = ''; }, 400);
      });
    });

    // --- Card tilt (.svc-full-card, .process-step) ---
    document.querySelectorAll('.svc-full-card, .process-step').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'translateY(-2px) perspective(800px) rotateX(' + (y * -2) + 'deg) rotateY(' + (x * 2) + 'deg)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'all 0.5s cubic-bezier(0.16,1,0.3,1)';
        setTimeout(function () { card.style.transition = ''; }, 500);
      });
    });
  }

  // --- Pricing toggle (.pricing-toggle button) ---
  var pricingBtns = document.querySelectorAll('.pricing-toggle button');
  if (pricingBtns.length) {
    pricingBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        pricingBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });
  }

  // --- Legacy FAQ markup (.faq-q + .open) ---
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  // --- Legacy stat counter (.stat-num parsing text content) ---
  var legacyStatEls = document.querySelectorAll('.stat-num');
  if (legacyStatEls.length && 'IntersectionObserver' in window) {
    var legacyStatObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var match = el.textContent.match(/^([\$₹]?)([\d.]+)(.*)$/);
        if (!match) return;
        var prefix = match[1], num = parseFloat(match[2]), suffix = match[3];
        var duration = 1500;
        var start = performance.now();
        (function update(now) {
          var p = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 4);
          var current = num % 1 !== 0 ? (eased * num).toFixed(1) : Math.round(eased * num);
          el.textContent = prefix + current + suffix;
          if (p < 1) requestAnimationFrame(update);
        })(performance.now());
        legacyStatObs.unobserve(el);
      });
    }, { threshold: 0.3 });
    legacyStatEls.forEach(function (el) { legacyStatObs.observe(el); });
  }

  // --- Legacy project filter (.projects-filter button) ---
  var projectFilterBtns = document.querySelectorAll('.projects-filter button');
  if (projectFilterBtns.length) {
    projectFilterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        projectFilterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cat = btn.dataset.filter;
        document.querySelectorAll('.project-card[data-category]').forEach(function (card) {
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

  // --- Legacy blog filter (.blog-filters button) ---
  var blogFilterBtns = document.querySelectorAll('.blog-filters button');
  if (blogFilterBtns.length) {
    blogFilterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        blogFilterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cat = btn.dataset.filter;
        document.querySelectorAll('.blog-card[data-category]').forEach(function (card) {
          if (cat === 'all' || card.dataset.category === cat) {
            card.style.display = '';
            setTimeout(function () { card.classList.add('visible'); }, 50);
          } else {
            card.style.display = 'none';
            card.classList.remove('visible');
          }
        });
      });
    });
  }

  // --- Legacy form chip toggle (.form-help-chips label) ---
  document.querySelectorAll('.form-help-chips label').forEach(function (label) {
    label.addEventListener('click', function () {
      label.classList.toggle('selected');
    });
  });

  // --- Services Cards Parallax (adapted from Framer Motion stacking demo) ---
  // Each .spc-track is height:100vh (scroll space); the .service-rich-card inside
  // is sticky. JS computes scale per card: card i goes from scale 1 down to
  // targetScale = 1 - (n - i) * 0.04 as the section progresses,
  // starting its animation at rangeStart = i / n of the section's progress.
  (function () {
    var spcTracks = document.querySelectorAll('.spc-track');
    if (!spcTracks.length) return;

    var cards = [];
    spcTracks.forEach(function (track, i) {
      var card = track.querySelector('.service-rich-card');
      if (!card) return;
      // Stagger sticky-top offset for depth — card 0 deepest, last card on top
      card.style.top = (80 + i * 20) + 'px';
      cards.push({ el: card, i: i });
    });

    var n = cards.length;
    var section = document.getElementById('services');
    if (!section || n < 2) return;

    function spcUpdate() {
      var rect  = section.getBoundingClientRect();
      var secH  = section.offsetHeight;
      var winH  = window.innerHeight;
      // progress: 0 = section top just hit viewport top, 1 = section bottom at viewport bottom
      var progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, secH - winH)));

      cards.forEach(function (c) {
        var i           = c.i;
        var targetScale = 1 - (n - i) * 0.04;   // last card stays at 0.96, first at 0.72
        var rangeStart  = i / n;                  // card i starts scaling at this progress
        var p = rangeStart >= 1
          ? 0
          : Math.max(0, Math.min(1, (progress - rangeStart) / (1 - rangeStart)));
        var scale = 1 - (1 - targetScale) * p;
        c.el.style.transform = 'scale(' + scale.toFixed(4) + ')';
      });
    }

    window.addEventListener('scroll', spcUpdate, { passive: true });
    window.addEventListener('resize', spcUpdate, { passive: true });
    spcUpdate();
  })();

  // --- Footer wordmark — Payload-style cursor glow ---
  var wmEl = document.querySelector('.footer-wordmark');
  if (wmEl) {
    wmEl.addEventListener('mousemove', function (e) {
      var r = wmEl.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top)  / r.height) * 100;
      wmEl.style.setProperty('--wm-x', x.toFixed(2) + '%');
      wmEl.style.setProperty('--wm-y', y.toFixed(2) + '%');
    });
    wmEl.addEventListener('mouseleave', function () {
      // Move glow off-element so text returns to dim base state
      wmEl.style.setProperty('--wm-y', '200%');
    });
  }

})();
