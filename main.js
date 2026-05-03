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
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.06,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
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

})();
