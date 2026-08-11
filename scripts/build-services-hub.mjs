#!/usr/bin/env node
/** Builds /services/ — the hub that gives the six service pages a crawlable parent. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const tpl = readFileSync(join(ROOT, "ui-ux-design-agency-usa", "index.html"), "utf8");
const services = ["services.json", "services-2.json"].reduce(
  (acc, f) => Object.assign(acc, JSON.parse(readFileSync(join(ROOT, "scripts", f), "utf8"))),
  {},
);

const url = "https://designit.co.in/services/";
const ORDER = [
  "saas-product-design", "ux-audit", "product-design",
  "ui-ux-design", "design-systems", "ux-research",
];
const BLURB = {
  "saas-product-design": "Dashboards, onboarding and design systems for B2B software — the work where usability turns into retention.",
  "ux-audit": "A fixed-scope, two-week diagnostic that ranks every issue by revenue impact against build effort.",
  "product-design": "End to end, from defining what should be built through to supporting the team that builds it.",
  "ui-ux-design": "Interface and interaction design for software people use all day, grounded in research rather than taste.",
  "design-systems": "Tokens, components and documentation built so engineering adopts the system instead of working around it.",
  "ux-research": "Interviews, usability testing and synthesis aimed at a specific decision you are stuck on.",
};

const title = "Product Design Services — UX Audit, Design Systems & SaaS Design | Designit";
const description =
  "Six services across the product design lifecycle: SaaS product design, UX audits, product design, UI/UX design, design systems and UX research. Senior designers, research-led, developer-ready.";

let head = tpl.slice(0, tpl.indexOf("<body>"));
head = head.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
head = head.replace(/<meta name="description" content="[^"]*">/,
  `<meta name="description" content="${description}">`);
head = head.replace(/<meta name="keywords" content="[^"]*">/,
  `<meta name="keywords" content="product design services, ux design services, design agency services, ui ux design services">`);
head = head.replace(/https:\/\/designit\.co\.in\/ui-ux-design-agency-usa\//g, url);
head = head.replace(/<meta property="og:title" content="[^"]*">/,
  `<meta property="og:title" content="Product Design Services | Designit">`);
head = head.replace(/<meta property="og:description" content="[^"]*">/,
  `<meta property="og:description" content="${description}">`);
head = head.replace(/<meta property="twitter:title" content="[^"]*">/,
  `<meta property="twitter:title" content="Product Design Services | Designit">`);
head = head.replace(/<meta property="twitter:description" content="[^"]*">/,
  `<meta property="twitter:description" content="${description}">`);

const jsonld = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url, name: title, description,
      isPartOf: { "@id": "https://designit.co.in/#website" },
      about: { "@id": "https://designit.co.in/#organization" },
    },
    {
      "@type": "ItemList",
      "@id": `${url}#services`,
      itemListElement: ORDER.map((slug, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: services[slug].schemaName,
        url: `https://designit.co.in/services/${slug}/`,
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://designit.co.in/" },
        { "@type": "ListItem", position: 2, name: "Services", item: url },
      ],
    },
  ],
};
head = head.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n    </script>`);

const nav = tpl.slice(tpl.indexOf('    <header class="navbar"'), tpl.indexOf("</header>") + 9);
const footer = tpl.slice(tpl.indexOf('    <footer class="footer"'), tpl.indexOf("</body>"));

const cards = ORDER.map((slug) => `
                <div class="svc-full-card reveal">
                    <div class="svc-icon">&#9679;</div>
                    <h3><a href="/services/${slug}/">${services[slug].schemaName}</a></h3>
                    <p>${BLURB[slug]}</p>
                    <p><a href="/services/${slug}/">Read more &rarr;</a></p>
                </div>`).join("");

const main = `<main>
    <section class="geo-hero">
        <div class="container">
            <div class="hero-pills reveal">
                <span class="tag">Research-led</span>
                <span class="tag">Senior designers only</span>
                <span class="tag">Developer-ready</span>
            </div>
            <h1 class="gradient-text reveal">Six services, one discipline.</h1>
            <p class="subtitle reveal">We design digital products for teams building software people depend on. Every engagement starts with research and is run by senior designers from kickoff to handover — whether that is a two-week audit or a twelve-week product build.</p>
            <div class="hero-ctas reveal">
                <a href="#" onclick="openIntakeForm(); return false;" class="btn btn-primary btn-lg">Book a 30-minute call</a>
                <a href="/projects/" class="btn btn-outline btn-lg">See the work</a>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <h2 class="section-title reveal">What we do</h2>
            <div class="why-grid">${cards}
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <h2 class="section-title reveal">Not sure which you need?</h2>
            <div class="why-grid">
                <div class="svc-full-card reveal">
                    <div class="svc-icon">&#9906;</div>
                    <h3>You have a product and something is wrong</h3>
                    <p>Start with a <a href="/services/ux-audit/">UX audit</a>. Two weeks, fixed price, and you get a ranked fix list whether or not you continue with us. It is the cheapest way to find out what is actually costing you conversions.</p>
                </div>
                <div class="svc-full-card reveal">
                    <div class="svc-icon">&#9638;</div>
                    <h3>You know the outcome, not the product</h3>
                    <p><a href="/services/product-design/">Product design</a> starts before the wireframe — research, problem definition and architecture. Discovery can run standalone for 2–3 weeks if you want to de-risk before committing.</p>
                </div>
                <div class="svc-full-card reveal">
                    <div class="svc-icon">&#9707;</div>
                    <h3>Shipping is getting slower every quarter</h3>
                    <p>That is usually a systems problem. A <a href="/services/design-systems/">design system</a> turns each new feature into an assembly job rather than a fresh set of decisions.</p>
                </div>
                <div class="svc-full-card reveal">
                    <div class="svc-icon">&#8635;</div>
                    <h3>The team disagrees and nobody can win</h3>
                    <p><a href="/services/ux-research/">UX research</a> settles it. We frame the study around the specific decision you are stuck on — and we will tell you if research is not the right spend.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <h2 class="section-title reveal">Industries we know well</h2>
            <div class="why-grid">
                <div class="svc-full-card reveal">
                    <div class="svc-icon">&#9636;</div>
                    <h3>Where we have depth</h3>
                    <p>B2B SaaS, fintech, edtech, PropTech, e-commerce and automotive HMI. Each has its own conventions, regulatory constraints and metrics — see the <a href="/industries/">industries overview</a> for how we approach them.</p>
                </div>
                <div class="svc-full-card reveal">
                    <div class="svc-icon">&#9733;</div>
                    <h3>Proof, not adjectives</h3>
                    <p>45% higher onboarding completion at <a href="/projects/adda247/">Adda247</a>. 40% faster onboarding at <a href="/projects/kelp-global/">Kelp Global</a>. 30% less driver distraction at <a href="/projects/tata-elxsi/">Tata Elxsi</a>. All client-measured.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="geo-cta-section">
        <div class="container">
            <h2 class="gradient-text reveal">Start with a conversation, not a proposal.</h2>
            <p class="reveal">Thirty minutes. Tell us what you are building and we will tell you what we would tackle first — including when we think we are not the right partner.</p>
            <div class="reveal">
                <a href="#" onclick="openIntakeForm(); return false;" class="btn btn-primary btn-lg">Book a 30-minute call</a>
            </div>
        </div>
    </section>
</main>

`;

const out = `${head}<body>\n${nav}\n${main}${footer}</body>\n</html>\n`;
mkdirSync(join(ROOT, "services"), { recursive: true });
writeFileSync(join(ROOT, "services", "index.html"), out, "utf8");
console.log(`wrote services/index.html  (${out.length.toLocaleString()} bytes)`);
