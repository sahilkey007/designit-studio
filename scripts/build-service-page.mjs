#!/usr/bin/env node
/**
 * Generates a service page from the live location-page template so the design
 * system, nav, footer and script tags stay byte-identical to the rest of the
 * site. Only the head metadata, JSON-LD and <main> are authored per service.
 *
 * Usage: node scripts/build-service-page.mjs <slug>
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const TEMPLATE = join(ROOT, "ui-ux-design-agency-usa", "index.html");
// Service definitions are split across files purely to keep each readable.
// `--section industries` writes to /industries/<slug>/ and reads industries.json.
const sectionIdx = process.argv.indexOf("--section");
const SECTION = sectionIdx > -1 ? process.argv[sectionIdx + 1] : "services";
const SOURCES = SECTION === "industries"
  ? ["industries.json", "industries-2.json"]
  : SECTION === "root"
  ? ["locations.json"]
  : SECTION === "blog"
  ? ["guides.json"]
  : ["services.json", "services-2.json"];
// "root" pages live at /<slug>/ rather than under a section directory.
const PREFIX = SECTION === "root" ? "" : `${SECTION}/`;
const services = SOURCES.reduce(
  (acc, f) => Object.assign(acc, JSON.parse(readFileSync(join(ROOT, "scripts", f), "utf8"))),
  {},
);

const slug = process.argv[2];
const svc = services[slug];
if (!svc) {
  console.error(`Unknown service "${slug}". Known: ${Object.keys(services).join(", ")}`);
  process.exit(1);
}

const url = `https://designit.co.in/${PREFIX}${slug}/`;
const tpl = readFileSync(TEMPLATE, "utf8");

// --- 1. head: everything before <body>, with metadata swapped -----------------
let head = tpl.slice(0, tpl.indexOf("<body>"));

const replaceTag = (src, pattern, next) => {
  if (!pattern.test(src)) throw new Error(`template tag not found: ${pattern}`);
  return src.replace(pattern, next);
};

head = replaceTag(head, /<title>[^<]*<\/title>/, `<title>${svc.title}</title>`);
head = replaceTag(
  head,
  /<meta name="description" content="[^"]*">/,
  `<meta name="description" content="${svc.description}">`,
);
head = replaceTag(
  head,
  /<meta name="keywords" content="[^"]*">/,
  `<meta name="keywords" content="${svc.keywords}">`,
);
// og:/twitter:/canonical/hreflang all point at the old URL — retarget them all.
head = head.replace(/https:\/\/designit\.co\.in\/ui-ux-design-agency-usa\//g, url);
head = replaceTag(head, /<meta property="og:title" content="[^"]*">/,
  `<meta property="og:title" content="${svc.ogTitle}">`);
head = replaceTag(head, /<meta property="og:description" content="[^"]*">/,
  `<meta property="og:description" content="${svc.description}">`);
head = replaceTag(head, /<meta property="twitter:title" content="[^"]*">/,
  `<meta property="twitter:title" content="${svc.ogTitle}">`);
head = replaceTag(head, /<meta property="twitter:description" content="[^"]*">/,
  `<meta property="twitter:description" content="${svc.description}">`);

// Swap the template's ProfessionalService block for Service + FAQPage + breadcrumbs.
const jsonld = {
  "@context": "https://schema.org",
  "@graph": [
    // Editorial pages are Articles, not Services — Service markup on a guide
    // misrepresents the page and is not eligible for the same treatment.
    SECTION === "blog"
      ? {
          "@type": "Article",
          "@id": `${url}#article`,
          headline: svc.h1.replace(/\.$/, ""),
          description: svc.schemaDescription,
          url,
          mainEntityOfPage: url,
          author: { "@id": "https://designit.co.in/#organization" },
          publisher: { "@id": "https://designit.co.in/#organization" },
          datePublished: "2026-08-11",
          dateModified: "2026-08-11",
          about: svc.serviceType,
          audience: { "@type": "BusinessAudience", audienceType: svc.audience },
        }
      : {
          "@type": "Service",
          "@id": `${url}#service`,
          name: svc.schemaName,
          url,
          description: svc.schemaDescription,
          serviceType: svc.serviceType,
          provider: { "@id": "https://designit.co.in/#organization" },
          areaServed: ["US", "GB", "AE", "IN"].map((c) => ({ "@type": "Country", name: c })),
          audience: { "@type": "BusinessAudience", audienceType: svc.audience },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `${svc.schemaName} deliverables`,
            itemListElement: svc.deliverables.map((d) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: d.name, description: d.body },
            })),
          },
        },
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: svc.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: SECTION === "root"
        ? [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://designit.co.in/" },
            { "@type": "ListItem", position: 2, name: svc.breadcrumb, item: url },
          ]
        : [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://designit.co.in/" },
            { "@type": "ListItem", position: 2, name: SECTION === "industries" ? "Industries" : SECTION === "blog" ? "Blog" : "Services", item: `https://designit.co.in/${SECTION}/` },
            { "@type": "ListItem", position: 3, name: svc.breadcrumb, item: url },
          ],
    },
  ],
};

head = head.replace(
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n    </script>`,
);

// --- 2. nav + footer lifted verbatim ----------------------------------------
const nav = tpl.slice(tpl.indexOf('    <header class="navbar"'), tpl.indexOf("</header>") + 9);
const footer = tpl.slice(tpl.indexOf('    <footer class="footer"'), tpl.indexOf("</body>"));

// --- 3. body authored per service -------------------------------------------
const card = (d) => `
                <div class="svc-full-card reveal">
                    <div class="svc-icon">${d.icon}</div>
                    <h3>${d.name}</h3>
                    <p>${d.body}</p>
                </div>`;

const step = (s, i) => `
                <div class="svc-full-card reveal">
                    <div class="svc-icon">${String(i + 1).padStart(2, "0")}</div>
                    <h3>${s.name}</h3>
                    <p>${s.body}</p>
                </div>`;

const faq = (f) => `
            <div class="faq-item reveal">
                <button class="faq-q">${f.q} <span class="faq-chevron">&#8964;</span></button>
                <div class="faq-a"><p>${f.a}</p></div>
            </div>`;

const stat = (s) => `
                <div class="geo-stat reveal">
                    <div class="geo-stat-num">${s.num}</div>
                    <div class="geo-stat-label">${s.label}</div>
                </div>`;

const main = `<main>
    <section class="geo-hero">
        <div class="container">
            <div class="hero-pills reveal">
                ${svc.pills.map((p) => `<span class="tag">${p}</span>`).join("\n                ")}
            </div>
            <h1 class="gradient-text reveal">${svc.h1}</h1>
            <p class="subtitle reveal">${svc.subtitle}</p>
            <div class="hero-ctas reveal">
                <a href="#" onclick="openIntakeForm(); return false;" class="btn btn-primary btn-lg">${svc.cta}</a>
                <a href="${svc.proofHref}" class="btn btn-outline btn-lg">${svc.proofCta ?? `See the ${svc.proofLabel} case study`}</a>
            </div>
            <div class="geo-stats">${svc.stats.map(stat).join("")}
            </div>
        </div>
    </section>

    <!-- The problem, in the buyer's words -->
    <section class="section">
        <div class="container">
            <h2 class="section-title reveal">${svc.problemHeading}</h2>
            <div class="why-grid">${svc.problems.map(card).join("")}
            </div>
        </div>
    </section>

    <!-- What you actually get -->
    <section class="section">
        <div class="container">
            <h2 class="section-title reveal">What you actually get</h2>
            <div class="why-grid">${svc.deliverables.map(card).join("")}
            </div>
        </div>
    </section>

    <!-- Process with real timeframes -->
    <section class="section">
        <div class="container">
            <h2 class="section-title reveal">How the engagement runs</h2>
            <div class="why-grid">${svc.process.map(step).join("")}
            </div>
        </div>
    </section>

    <!-- Proof -->
    <section class="section">
        <div class="container">
            <h2 class="section-title reveal">Proof</h2>
            <div class="why-grid">
                <div class="svc-full-card reveal">
                    <div class="svc-icon">&#9733;</div>
                    <h3>${svc.proof.title}</h3>
                    <p>${svc.proof.body} <a href="${svc.proofHref}">Read the full case study &rarr;</a></p>
                </div>
                <div class="svc-full-card reveal">
                    <div class="svc-icon">&#8599;</div>
                    <h3>Related work</h3>
                    <p>${svc.proof.related}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing signal -->
    <section class="section">
        <div class="container">
            <h2 class="section-title reveal">What it costs</h2>
            <div class="why-grid">
                <div class="svc-full-card reveal">
                    <div class="svc-icon">&#8377;</div>
                    <h3>${svc.pricing.title}</h3>
                    <p>${svc.pricing.body}</p>
                </div>
                <div class="svc-full-card reveal">
                    <div class="svc-icon">&#8986;</div>
                    <h3>Typical timeline</h3>
                    <p>${svc.pricing.timeline}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ / AEO surface -->
    <section class="section">
        <div class="container">
            <h2 class="section-title reveal">Common questions</h2>
            <div class="faq-list">${svc.faqs.map(faq).join("")}
            </div>
        </div>
    </section>

    <section class="geo-cta-section">
        <div class="container">
            <h2 class="gradient-text reveal">${svc.ctaHeading}</h2>
            <p class="reveal">${svc.ctaBody}</p>
            <div class="reveal">
                <a href="#" onclick="openIntakeForm(); return false;" class="btn btn-primary btn-lg">${svc.cta}</a>
            </div>
        </div>
    </section>
</main>

`;

const out = `${head}<body>\n${nav}\n${main}${footer}</body>\n</html>\n`;
const dest = SECTION === "root" ? join(ROOT, slug, "index.html") : join(ROOT, SECTION, slug, "index.html");
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, out, "utf8");
console.log(`wrote ${PREFIX}${slug}/index.html  (${out.length.toLocaleString()} bytes)`);
