#!/usr/bin/env node
/**
 * Static blog generator for Designit Studio Landing Page
 * Reads markdown files from SEO_Blog_App/content/blogs/
 * Generates blog/index.html and blog/[slug]/index.html
 */

const fs = require('fs');
const path = require('path');

const BLOG_CONTENT_DIR = path.resolve(
  __dirname,
  '../../03_Marketing_and_Content/SEO_Blog_App/content/blogs'
);
const GRAY_MATTER_PATH = path.resolve(
  __dirname,
  '../../03_Marketing_and_Content/SEO_Blog_App/node_modules/gray-matter'
);

const matter = require(GRAY_MATTER_PATH);

// ─── Category assignment ──────────────────────────────────────────────────────
const CATEGORY_MAP = {
  'ai-driven-website-design-services-india': 'AI & Design',
  'b2b-saas-ui-ux-design-services-india': 'SaaS',
  'b2b-website-redesign-services-india': 'Strategy',
  'best-ai-tools-ui-ux-designers-2026': 'AI & Design',
  'best-branding-agency-tech-startups-india': 'Branding',
  'branding-services-for-startups-india-cost': 'Branding',
  'cost-ui-ux-design-mobile-app-india': 'UI/UX',
  'cro-strategies-for-b2b-saas-india': 'CRO',
  'custom-website-vs-template-roi-india': 'Strategy',
  'generative-ai-website-personalization': 'AI & Design',
  'hire-ui-ux-designer-vs-agency-india': 'UI/UX',
  'how-ai-is-changing-ux-design-india': 'AI & Design',
  'how-to-improve-website-conversion-rate-india': 'CRO',
  'landing-page-conversion-audit-services-india': 'CRO',
  'landing-page-design-lead-generation-india': 'Strategy',
  'signs-your-company-needs-a-rebrand-india': 'Branding',
  'ui-ux-audit-for-website-india': 'UI/UX',
  'visual-identity-vs-branding-startups': 'Branding',
  'why-ecommerce-bounce-rate-so-high-india': 'CRO',
  'why-website-not-converting-visitors-india': 'CRO',
};

// Curated Unsplash thumbnails for each slug
const THUMBNAIL_MAP = {
  'ai-driven-website-design-services-india': 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=800',
  'b2b-saas-ui-ux-design-services-india': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
  'b2b-website-redesign-services-india': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800',
  'best-ai-tools-ui-ux-designers-2026': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
  'best-branding-agency-tech-startups-india': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800',
  'branding-services-for-startups-india-cost': 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&q=80&w=800',
  'cost-ui-ux-design-mobile-app-india': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800',
  'cro-strategies-for-b2b-saas-india': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
  'custom-website-vs-template-roi-india': 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=800',
  'generative-ai-website-personalization': 'https://images.unsplash.com/photo-1655720845083-801f4f63ae3b?auto=format&fit=crop&q=80&w=800',
  'hire-ui-ux-designer-vs-agency-india': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800',
  'how-ai-is-changing-ux-design-india': 'https://images.unsplash.com/photo-1678995632928-298d05d41671?auto=format&fit=crop&q=80&w=800',
  'how-to-improve-website-conversion-rate-india': 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=800',
  'landing-page-conversion-audit-services-india': 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=800',
  'landing-page-design-lead-generation-india': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800',
  'signs-your-company-needs-a-rebrand-india': 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=800',
  'ui-ux-audit-for-website-india': 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=800',
  'visual-identity-vs-branding-startups': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
  'why-ecommerce-bounce-rate-so-high-india': 'https://images.unsplash.com/photo-1563986768609-322da13575f2?auto=format&fit=crop&q=80&w=800',
  'why-website-not-converting-visitors-india': 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&q=80&w=800',
};

// ─── Markdown → HTML converter ────────────────────────────────────────────────
function parseInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="blog-link">$1</a>');
}

function markdownToHtml(md) {
  const lines = md.split('\n');
  const html = [];
  let inList = false;
  let listType = '';
  let inBlockquote = false;

  function closeList() {
    if (inList) {
      html.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
    }
  }

  function closeBlockquote() {
    if (inBlockquote) {
      html.push('</blockquote>');
      inBlockquote = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    // Horizontal rule
    if (/^---+$/.test(line) || /^\*\*\*+$/.test(line)) {
      closeList();
      closeBlockquote();
      html.push('<hr class="blog-hr">');
      continue;
    }

    // Headings
    if (line.startsWith('#### ')) {
      closeList(); closeBlockquote();
      html.push(`<h4 class="blog-h4">${parseInline(line.slice(5))}</h4>`);
      continue;
    }
    if (line.startsWith('### ')) {
      closeList(); closeBlockquote();
      html.push(`<h3 class="blog-h3">${parseInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      closeList(); closeBlockquote();
      html.push(`<h2 class="blog-h2">${parseInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      closeList(); closeBlockquote();
      html.push(`<h1 class="blog-h1">${parseInline(line.slice(2))}</h1>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      closeList();
      if (!inBlockquote) { html.push('<blockquote class="blog-blockquote">'); inBlockquote = true; }
      html.push(`<p>${parseInline(line.slice(2))}</p>`);
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      closeBlockquote();
      if (!inList || listType !== 'ul') {
        closeList();
        html.push('<ul class="blog-ul">');
        inList = true; listType = 'ul';
      }
      html.push(`<li>${parseInline(line.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      closeBlockquote();
      if (!inList || listType !== 'ol') {
        closeList();
        html.push('<ol class="blog-ol">');
        inList = true; listType = 'ol';
      }
      html.push(`<li>${parseInline(line.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }

    // Empty line
    if (line === '') {
      closeList();
      closeBlockquote();
      continue;
    }

    // Regular paragraph
    closeList();
    closeBlockquote();
    html.push(`<p class="blog-p">${parseInline(line)}</p>`);
  }

  closeList();
  closeBlockquote();
  return html.join('\n');
}

// ─── Parse FAQs from markdown body ───────────────────────────────────────────
function parseFaqsFromMarkdown(md) {
  const faqHeadingRe = /^## Frequently Asked Questions.*$/im;
  const match = md.match(faqHeadingRe);
  if (!match) return { bodyMd: md, faqs: [] };

  const faqStart = md.indexOf(match[0]);
  const bodyMd = md.slice(0, faqStart).trimEnd();
  const faqSection = md.slice(faqStart + match[0].length);

  const faqs = [];
  const lines = faqSection.split('\n');
  let currentQuestion = null;
  let answerLines = [];

  function flush() {
    if (currentQuestion && answerLines.length) {
      faqs.push({ question: currentQuestion, answer: answerLines.join(' ').trim() });
    }
    currentQuestion = null;
    answerLines = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#{1,2}\s/.test(trimmed) || /^---+$/.test(trimmed)) {
      // H1/H2 heading or HR ends the FAQ block
      flush();
      break;
    } else if (trimmed.startsWith('### ')) {
      flush();
      currentQuestion = trimmed.slice(4).trim();
    } else if (currentQuestion && trimmed !== '') {
      answerLines.push(trimmed);
    }
  }
  flush();

  return { bodyMd, faqs };
}

// ─── Load all posts ───────────────────────────────────────────────────────────
function loadPosts() {
  const files = fs.readdirSync(BLOG_CONTENT_DIR).filter(f => f.endsWith('.md'));
  return files.map(file => {
    const fullPath = path.join(BLOG_CONTENT_DIR, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(raw);
    const slug = data.slug || file.replace(/\.md$/, '');

    const { bodyMd, faqs: parsedFaqs } = parseFaqsFromMarkdown(content);
    const faqs = parsedFaqs.length > 0 ? parsedFaqs : [
      { question: 'How can Designit help my business?', answer: 'We provide end-to-end UI/UX design services tailored to your business goals — from strategy and wireframes to pixel-perfect UI and design systems.' },
      { question: 'What is your typical turnaround time?', answer: 'Depending on the scope, most projects are completed within 2–6 weeks. We also offer sprint-based engagements for faster delivery.' },
      { question: 'Do you work with international clients?', answer: 'Yes, we work with clients across India, UAE, USA, UK and beyond.' }
    ];

    return {
      slug,
      title: data.title || '',
      metaTitle: data.meta_title || data.title,
      metaDescription: data.meta_description || '',
      date: data.date || '2026-01-15',
      author: data.author || 'Designit Team',
      category: CATEGORY_MAP[slug] || 'Design & Strategy',
      thumbnail: THUMBNAIL_MAP[slug] || 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=800',
      readTime: '5 min read',
      contentHtml: markdownToHtml(bodyMd),
      faqs,
      cta: data.cta || {
        heading: 'Ready to transform your product?',
        text: "Let's design something that converts, retains, and grows with your business.",
        buttonText: 'Start Your Project',
        buttonLink: '/contact.html'
      }
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ─── Shared HTML parts ────────────────────────────────────────────────────────
function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return d; }
}

function navbar(activePage) {
  const links = [
    { href: '/index.html', label: 'Home' },
    { href: '/about.html', label: 'About' },
    { href: '/projects.html', label: 'Projects' },
    { href: '/pricing.html', label: 'Pricing' },
    { href: '/blog/index.html', label: 'Blog' },
    { href: '/contact.html', label: 'Contact' },
  ];
  return `<header class="navbar" id="navbar">
    <a href="/index.html" class="logo"><img src="/logo.svg" alt="Designit" height="28"></a>
    <nav class="nav-links" id="navLinks">
      ${links.map(l => `<a href="${l.href}"${l.label === activePage ? ' class="active"' : ''}>${l.label}</a>`).join('\n      ')}
    </nav>
    <a href="/contact.html" class="btn btn-primary btn-sm nav-cta">Let's Chat!</a>
    <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
  </header>`;
}

function footer() {
  return `<footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/index.html"><img src="/logo.svg" alt="Designit" height="28"></a>
          <p>End-to-end product design partner. We design high-conversion digital experiences that drive growth and deliver measurable ROI.</p>
        </div>
        <div>
          <p class="footer-col-title">Services</p>
          <div class="footer-links">
            <a href="/index.html#services">UI/UX Design</a>
            <a href="/index.html#services">Design Systems</a>
            <a href="/index.html#services">SaaS Strategy</a>
            <a href="/index.html#services">UX Research</a>
            <a href="/index.html#services">Prototyping</a>
          </div>
        </div>
        <div>
          <p class="footer-col-title">Company</p>
          <div class="footer-links">
            <a href="/about.html">About</a>
            <a href="/projects.html">Projects</a>
            <a href="/pricing.html">Pricing</a>
            <a href="/blog/index.html">Blog</a>
            <a href="/careers.html">Careers</a>
            <a href="/contact.html">Contact</a>
          </div>
        </div>
        <div>
          <p class="footer-col-title">Contact</p>
          <div class="footer-links">
            <a href="mailto:contact@designit.co.in">contact@designit.co.in</a>
            <a href="tel:+918564948954">+91 85649 48954</a>
          </div>
          <p style="color:var(--text-faint);font-size:0.875rem;margin-top:0.5rem;">Noida Sector 45, UP, India</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2025 Designit. All rights reserved.</span>
        <div class="footer-social">
          <a href="#" aria-label="X / Twitter">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" aria-label="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="#" aria-label="Dribbble">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.81zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855z"/></svg>
          </a>
        </div>
      </div>
    </div>
  </footer>`;
}

const BLOG_CSS = `
<style>
/* ── Blog Index ─────────────────────────────────────── */
.blog-hero { padding: 140px 0 60px; text-align: center; }
.blog-hero .section-label { margin-bottom: 1rem; }
.blog-hero h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 700; letter-spacing: -2px; line-height: 1.1; margin-bottom: 1.25rem; }
.blog-hero p { font-size: 1.125rem; color: var(--text-tertiary); max-width: 560px; margin: 0 auto; }

.blog-filters { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin: 2.5rem 0 3rem; }
.blog-filter-btn { padding: 0.45rem 1.1rem; border-radius: 100px; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-tertiary); font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.blog-filter-btn:hover, .blog-filter-btn.active { background: #fff; color: #000; border-color: #fff; }

.blog-featured { margin-bottom: 3rem; }
.blog-featured-card { display: grid; grid-template-columns: 1fr 1fr; border-radius: 20px; overflow: hidden; border: 1px solid var(--border-subtle); background: var(--bg-card); transition: border-color 0.3s, transform 0.2s; text-decoration: none; color: inherit; }
.blog-featured-card:hover { border-color: var(--border-medium); transform: translateY(-3px); }
.blog-featured-img { position: relative; min-height: 340px; overflow: hidden; }
.blog-featured-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
.blog-featured-card:hover .blog-featured-img img { transform: scale(1.04); }
.blog-featured-body { padding: 3rem; display: flex; flex-direction: column; justify-content: center; }
.blog-featured-tag { display: inline-flex; align-items: center; gap: 0.4rem; }

.blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.blog-card { border-radius: 16px; overflow: hidden; border: 1px solid var(--border-subtle); background: var(--bg-card); transition: border-color 0.3s, transform 0.2s; text-decoration: none; color: inherit; display: flex; flex-direction: column; }
.blog-card:hover { border-color: var(--border-medium); transform: translateY(-3px); }
.blog-card[data-hidden="true"] { display: none; }
.blog-card-img { position: relative; height: 200px; overflow: hidden; }
.blog-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
.blog-card:hover .blog-card-img img { transform: scale(1.05); }
.blog-card-body { padding: 1.5rem; display: flex; flex-direction: column; flex: 1; }
.blog-card-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
.blog-card-title { font-size: 1.05rem; font-weight: 700; color: #fff; line-height: 1.4; margin-bottom: 0.75rem; flex: 1; }
.blog-card-excerpt { font-size: 0.875rem; color: var(--text-tertiary); line-height: 1.6; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.blog-card-footer { margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; }
.blog-card-author { font-size: 0.8rem; color: var(--text-ghost); }
.blog-card-date { font-size: 0.8rem; color: var(--text-ghost); }
.blog-read-more { font-size: 0.8rem; font-weight: 600; color: #fff; display: flex; align-items: center; gap: 0.3rem; opacity: 0; transition: opacity 0.2s; }
.blog-card:hover .blog-read-more { opacity: 1; }

/* ── Blog Post ──────────────────────────────────────── */
.blog-post-hero { padding: 140px 0 0; }
.blog-post-header { max-width: 760px; margin: 0 auto; padding: 0 1.5rem 3rem; }
.blog-breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-ghost); margin-bottom: 2rem; }
.blog-breadcrumb a { color: var(--text-tertiary); transition: color 0.2s; }
.blog-breadcrumb a:hover { color: #fff; }
.blog-post-meta { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.blog-post-title { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 1.25rem; color: #fff; }
.blog-post-desc { font-size: 1.125rem; color: var(--text-tertiary); line-height: 1.7; }
.blog-post-divider { max-width: 760px; margin: 0 auto; padding: 0 1.5rem; border-top: 1px solid var(--border-subtle); }
.blog-post-body { max-width: 760px; margin: 0 auto; padding: 3rem 1.5rem; }

/* Content styles */
.blog-h1 { font-size: 2rem; font-weight: 800; color: #fff; margin: 2.5rem 0 1rem; letter-spacing: -0.5px; line-height: 1.2; }
.blog-h2 { font-size: 1.5rem; font-weight: 700; color: #fff; margin: 2.5rem 0 0.75rem; letter-spacing: -0.3px; line-height: 1.3; }
.blog-h3 { font-size: 1.2rem; font-weight: 700; color: var(--text-light); margin: 2rem 0 0.5rem; line-height: 1.4; }
.blog-h4 { font-size: 1.05rem; font-weight: 600; color: var(--text-secondary); margin: 1.5rem 0 0.5rem; }
.blog-p { color: var(--text-secondary); line-height: 1.8; margin-bottom: 1.25rem; font-size: 1rem; }
.blog-ul, .blog-ol { margin: 0 0 1.25rem 1.5rem; }
.blog-ul li, .blog-ol li { color: var(--text-secondary); line-height: 1.7; margin-bottom: 0.5rem; font-size: 1rem; }
.blog-ul li { list-style: disc; }
.blog-ol li { list-style: decimal; }
.blog-hr { border: none; border-top: 1px solid var(--border-subtle); margin: 2.5rem 0; }
.blog-blockquote { border-left: 3px solid rgba(255,255,255,0.2); margin: 1.5rem 0; padding: 1rem 1.5rem; background: var(--bg-card); border-radius: 0 8px 8px 0; }
.blog-blockquote p { color: var(--text-secondary); font-style: italic; margin: 0; }
.blog-link { color: #fff; text-decoration: underline; text-underline-offset: 3px; opacity: 0.8; transition: opacity 0.2s; }
.blog-link:hover { opacity: 1; }
.blog-post-body code { background: var(--bg-surface); padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; color: var(--text-muted); }

/* FAQ */
.blog-faq { max-width: 760px; margin: 0 auto; padding: 0 1.5rem 4rem; }
.blog-faq-box { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 2.5rem; }
.blog-faq-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 2rem; }
.faq-item { border: 1px solid var(--border-subtle); border-radius: 12px; overflow: hidden; margin-bottom: 0.75rem; }
.faq-item summary { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.25rem; cursor: pointer; list-style: none; color: #fff; font-weight: 600; font-size: 0.95rem; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-icon { font-size: 1.25rem; color: var(--text-ghost); transition: transform 0.3s; }
.faq-item[open] .faq-icon { transform: rotate(45deg); }
.faq-answer { padding: 0 1.25rem 1.1rem; color: var(--text-tertiary); font-size: 0.9rem; line-height: 1.7; }

/* CTA */
.blog-cta { max-width: 900px; margin: 0 auto; padding: 0 1.5rem 5rem; }
.blog-cta-box { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 24px; padding: 3.5rem; text-align: center; position: relative; overflow: hidden; }
.blog-cta-box::before { content:''; position:absolute;top:0;inset-x:0;height:200px;background:linear-gradient(to bottom, rgba(255,200,96,0.06), transparent);pointer-events:none; }
.blog-cta-box h2 { font-size: clamp(1.5rem, 4vw, 2.25rem); font-weight: 800; margin-bottom: 0.75rem; letter-spacing: -0.5px; }
.blog-cta-box p { color: var(--text-tertiary); font-size: 1rem; line-height: 1.7; max-width: 500px; margin: 0 auto 2rem; }
.blog-cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

/* Related */
.blog-related { max-width: 760px; margin: 0 auto; padding: 0 1.5rem 4rem; }
.blog-related h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 1.25rem; }
.blog-related-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.blog-related-card { border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.25rem; background: var(--bg-card); text-decoration: none; color: inherit; transition: border-color 0.2s; display: block; }
.blog-related-card:hover { border-color: var(--border-medium); }
.blog-related-card .cat { font-size: 0.75rem; color: var(--text-ghost); margin-bottom: 0.5rem; }
.blog-related-card h4 { font-size: 0.9rem; font-weight: 700; color: #fff; line-height: 1.4; }

/* Responsive */
@media (max-width: 900px) {
  .blog-grid { grid-template-columns: repeat(2, 1fr); }
  .blog-featured-card { grid-template-columns: 1fr; }
  .blog-featured-img { min-height: 220px; }
}
@media (max-width: 600px) {
  .blog-grid { grid-template-columns: 1fr; }
  .blog-related-grid { grid-template-columns: 1fr; }
  .blog-featured-body { padding: 1.75rem; }
  .blog-post-title { font-size: 2rem; }
}
</style>`;

// ─── Generate blog/index.html ─────────────────────────────────────────────────
function generateBlogIndex(posts) {
  const categories = ['All', ...new Set(posts.map(p => p.category))].sort((a, b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b));
  const featured = posts[0];
  const rest = posts.slice(1);

  const featuredCard = `
  <div class="blog-featured">
    <a href="/blog/${featured.slug}/index.html" class="blog-featured-card" data-category="${featured.category}">
      <div class="blog-featured-img">
        <img src="${featured.thumbnail}" alt="${featured.title}" loading="lazy">
      </div>
      <div class="blog-featured-body">
        <div class="blog-post-meta" style="margin-bottom:1.25rem;">
          <span class="tag tag-sm">${featured.category}</span>
          <span style="color:var(--text-ghost);font-size:0.8rem;">${formatDate(featured.date)}</span>
          <span style="color:var(--text-ghost);font-size:0.8rem;">· ${featured.readTime}</span>
        </div>
        <h2 style="font-size:1.75rem;font-weight:800;color:#fff;margin-bottom:1rem;letter-spacing:-0.5px;line-height:1.2;">${featured.title}</h2>
        <p style="color:var(--text-tertiary);line-height:1.7;margin-bottom:1.5rem;font-size:0.95rem;">${featured.metaDescription}</p>
        <span style="font-size:0.875rem;font-weight:700;color:#fff;display:flex;align-items:center;gap:0.4rem;">
          Read Article
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </span>
      </div>
    </a>
  </div>`;

  const gridCards = rest.map(post => `
    <a href="/blog/${post.slug}/index.html" class="blog-card" data-category="${post.category}">
      <div class="blog-card-img">
        <img src="${post.thumbnail}" alt="${post.title}" loading="lazy">
      </div>
      <div class="blog-card-body">
        <div class="blog-card-meta">
          <span class="tag tag-sm">${post.category}</span>
        </div>
        <h3 class="blog-card-title">${post.title}</h3>
        <p class="blog-card-excerpt">${post.metaDescription}</p>
        <div class="blog-card-footer">
          <span class="blog-card-date">${formatDate(post.date)}</span>
          <span class="blog-read-more">Read
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </span>
        </div>
      </div>
    </a>`).join('\n');

  const filterBtns = categories.map(cat =>
    `<button class="blog-filter-btn${cat === 'All' ? ' active' : ''}" data-filter="${cat}">${cat}</button>`
  ).join('\n    ');

  const filterScript = `
  <script>
    const filterBtns = document.querySelectorAll('.blog-filter-btn');
    const blogCards = document.querySelectorAll('.blog-card, .blog-featured-card');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        blogCards.forEach(card => {
          if (filter === 'All' || card.dataset.category === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
        const featured = document.querySelector('.blog-featured');
        if (featured) {
          const fc = featured.querySelector('.blog-featured-card');
          featured.style.display = fc && fc.style.display === 'none' ? 'none' : '';
        }
      });
    });
  </script>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog | Designit — UI/UX Insights for Startup Founders</title>
  <meta name="description" content="Actionable design insights for startup founders, product managers, and CTOs. Conversion optimization, hiring guides, product design process, and more.">
  <meta property="og:title" content="Blog | Designit">
  <meta property="og:description" content="Actionable design insights for startup founders, product managers, and CTOs.">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/design-system.css">
  <link rel="stylesheet" href="/pages.css">
  <link rel="icon" type="image/svg+xml" href="/logo.svg">
  ${BLOG_CSS}
</head>
<body>

${navbar('Blog')}

<main>
  <!-- Blog Hero -->
  <section class="blog-hero">
    <div class="container">
      <p class="section-label">Blog</p>
      <h1 class="gradient-text">Insights for Founders<br>Who Ship.</h1>
      <p>No fluff, no jargon. Practical guides on conversion, branding, UI/UX design, and building products users actually want.</p>
    </div>
  </section>

  <!-- Category Filters -->
  <div class="container">
    <div class="blog-filters">
      ${filterBtns}
    </div>
  </div>

  <!-- Featured Post -->
  <div class="container">
    ${featuredCard}
  </div>

  <!-- Blog Grid -->
  <div class="container" style="margin-bottom:5rem;">
    <div class="blog-grid">
      ${gridCards}
    </div>
  </div>

  <!-- CTA Section -->
  <section class="section" style="padding-bottom:5rem;">
    <div class="container">
      <div class="blog-cta-box" style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:24px;padding:3.5rem;text-align:center;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;inset-x:0;height:200px;background:linear-gradient(to bottom, rgba(255,200,96,0.06), transparent);pointer-events:none;"></div>
        <p class="section-label" style="position:relative;">Work With Us</p>
        <h2 class="section-title gradient-text" style="position:relative;">Need Design Help,<br>Not Just Advice?</h2>
        <p style="color:var(--text-tertiary);font-size:1rem;max-width:500px;margin:0 auto 2rem;line-height:1.7;position:relative;">We design landing pages, products, and design systems for startups. Transparent pricing, direct designer access, 5-day delivery.</p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;position:relative;">
          <a href="/pricing.html" class="btn btn-primary btn-md">View Pricing</a>
          <a href="https://calendly.com/sahilnsharma77/new-meeting" target="_blank" rel="noopener" class="btn btn-outline btn-md">Book a Free Call</a>
        </div>
      </div>
    </div>
  </section>
</main>

${footer()}

<script src="/main.js"></script>
<script src="/script.js"></script>
${filterScript}
</body>
</html>`;
}

// ─── Generate blog post page ──────────────────────────────────────────────────
function generateBlogPost(post, relatedPosts) {
  const faqs = post.faqs.map((faq, i) => `
    <details class="faq-item" ${i === 0 ? 'open' : ''}>
      <summary>${faq.question}<span class="faq-icon">+</span></summary>
      <p class="faq-answer">${faq.answer}</p>
    </details>`).join('\n');

  const related = relatedPosts.map(p => `
    <a href="/blog/${p.slug}/index.html" class="blog-related-card">
      <p class="cat">${p.category} · ${p.readTime}</p>
      <h4>${p.title}</h4>
    </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.metaTitle} | Designit</title>
  <meta name="description" content="${post.metaDescription}">
  <meta property="og:title" content="${post.metaTitle}">
  <meta property="og:description" content="${post.metaDescription}">
  <meta property="og:type" content="article">
  <link rel="canonical" href="https://designit.co.in/blog/${post.slug}/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/design-system.css">
  <link rel="stylesheet" href="/pages.css">
  <link rel="icon" type="image/svg+xml" href="/logo.svg">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${post.title.replace(/"/g, '\\"')}",
    "description": "${post.metaDescription.replace(/"/g, '\\"')}",
    "datePublished": "${post.date}",
    "author": { "@type": "Organization", "name": "Designit" },
    "publisher": { "@type": "Organization", "name": "Designit" }
  }
  </script>
  ${BLOG_CSS}
</head>
<body>

${navbar('Blog')}

<main>
  <div class="blog-post-hero">
    <div class="blog-post-header">
      <!-- Breadcrumb -->
      <nav class="blog-breadcrumb">
        <a href="/index.html">Home</a>
        <span>/</span>
        <a href="/blog/index.html">Blog</a>
        <span>/</span>
        <span style="color:var(--text-subtle);">${post.title}</span>
      </nav>

      <!-- Meta -->
      <div class="blog-post-meta">
        <span class="tag tag-sm">${post.category}</span>
        <span style="color:var(--text-ghost);font-size:0.85rem;">${formatDate(post.date)}</span>
        <span style="color:var(--text-ghost);font-size:0.85rem;">·</span>
        <span style="color:var(--text-ghost);font-size:0.85rem;">${post.readTime}</span>
      </div>

      <!-- Title & Desc -->
      <h1 class="blog-post-title">${post.title}</h1>
      <p class="blog-post-desc">${post.metaDescription}</p>
    </div>

    <!-- Hero Image -->
    <div style="max-width:900px;margin:2rem auto 0;padding:0 1.5rem;">
      <div style="border-radius:20px;overflow:hidden;height:420px;">
        <img src="${post.thumbnail}" alt="${post.title}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
      </div>
    </div>

    <!-- Divider -->
    <div class="blog-post-divider" style="margin-top:3rem;"></div>

    <!-- Article Body -->
    <article class="blog-post-body">
      ${post.contentHtml}
    </article>
  </div>

  <!-- FAQ -->
  <section class="blog-faq">
    <div class="blog-faq-box">
      <h2 class="blog-faq-title">Frequently Asked Questions</h2>
      ${faqs}
    </div>
  </section>

  <!-- CTA -->
  <section class="blog-cta">
    <div class="blog-cta-box">
      <h2>${post.cta.heading}</h2>
      <p>${post.cta.text}</p>
      <div class="blog-cta-btns">
        <a href="${post.cta.buttonLink}" class="btn btn-primary btn-md">${post.cta.buttonText} →</a>
        <a href="https://calendly.com/sahilnsharma77/new-meeting" target="_blank" rel="noopener" class="btn btn-outline btn-md">Book a Free Call</a>
      </div>
    </div>
  </section>

  <!-- Related Posts -->
  <section class="blog-related">
    <h3>Keep Reading</h3>
    <div class="blog-related-grid">
      ${related}
    </div>
  </section>
</main>

${footer()}

<script src="/main.js"></script>
<script src="/script.js"></script>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const posts = loadPosts();
console.log(`Loaded ${posts.length} posts`);

const BLOG_DIR = path.join(__dirname, 'blog');

// Write blog/index.html
const indexHtml = generateBlogIndex(posts);
fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), indexHtml, 'utf8');
console.log('✓ blog/index.html');

// Write each blog post page
posts.forEach((post, i) => {
  const postDir = path.join(BLOG_DIR, post.slug);
  if (!fs.existsSync(postDir)) fs.mkdirSync(postDir, { recursive: true });

  // Related = 2 other posts (different category preferred, else just next)
  const related = posts
    .filter(p => p.slug !== post.slug)
    .sort((a, b) => (a.category !== post.category ? -1 : 1))
    .slice(0, 2);

  const postHtml = generateBlogPost(post, related);
  fs.writeFileSync(path.join(postDir, 'index.html'), postHtml, 'utf8');
  console.log(`✓ blog/${post.slug}/index.html`);
});

console.log('\nDone! Blog pages generated successfully.');
