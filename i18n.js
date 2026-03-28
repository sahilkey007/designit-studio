(function() {
    const translations = {
        en: {
            'nav.services': 'Services',
            'nav.casestudies': 'Case studies',
            'nav.pricing': 'Pricing',
            'nav.about': 'About us',
            'nav.blog': 'Blog',
            'nav.contact': 'Contact Us \u2192',
            'hero.title': 'We craft digital experiences that users love and businesses trust',
            'hero.subtitle': 'We design high-conversion digital experiences that drive growth, strengthen retention, and deliver measurable ROI.',
            'hero.cta1': 'View Our Case Studies',
            'hero.cta2': 'Book a Free Strategy Call',
            'sec.services': 'Services',
            'sec.projects': 'Projects',
            'sec.about': 'About Us',
            'sec.faq': 'FAQ',
            'footer.company': 'Company',
            'footer.contact': 'Contact',
            'footer.location': 'Location',
            'footer.email': 'Email',
            'footer.call': 'Call Us',
            'cta.project': 'Have a Project? Let\'s talk!',
            'cta.send': 'Send Message',
            'cta.view': 'View Case Study \u2192',
            'cta.learn': 'Learn More',
            'cta.back': 'Back to Top'
        },
        hi: {
            'nav.services': '\u0938\u0947\u0935\u093E\u090F\u0902',
            'nav.casestudies': '\u0915\u0947\u0938 \u0938\u094D\u091F\u0921\u0940\u091C\u093C',
            'nav.pricing': '\u092E\u0942\u0932\u094D\u092F \u0928\u093F\u0930\u094D\u0927\u093E\u0930\u0923',
            'nav.about': '\u0939\u092E\u093E\u0930\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902',
            'nav.blog': '\u092C\u094D\u0932\u0949\u0917',
            'nav.contact': '\u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902 \u2192',
            'hero.title': '\u0939\u092E \u0921\u093F\u091C\u093F\u091F\u0932 \u0905\u0928\u0941\u092D\u0935 \u092C\u0928\u093E\u0924\u0947 \u0939\u0948\u0902 \u091C\u094B \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u092A\u0938\u0902\u0926 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902 \u0914\u0930 \u0935\u094D\u092F\u0935\u0938\u093E\u092F \u092D\u0930\u094B\u0938\u093E \u0915\u0930\u0924\u0947 \u0939\u0948\u0902',
            'hero.subtitle': '\u0939\u092E \u0909\u091A\u094D\u091A-\u0930\u0942\u092A\u093E\u0902\u0924\u0930\u0923 \u0921\u093F\u091C\u093F\u091F\u0932 \u0905\u0928\u0941\u092D\u0935 \u0921\u093F\u091C\u093C\u093E\u0907\u0928 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902 \u091C\u094B \u0935\u093F\u0915\u093E\u0938 \u0915\u094B \u092C\u0922\u093C\u093E\u0935\u093E \u0926\u0947\u0924\u0947 \u0939\u0948\u0902\u0964',
            'hero.cta1': '\u0939\u092E\u093E\u0930\u0947 \u0915\u0947\u0938 \u0938\u094D\u091F\u0921\u0940\u091C\u093C \u0926\u0947\u0916\u0947\u0902',
            'hero.cta2': '\u092E\u0941\u092B\u093C\u094D\u0924 \u0930\u0923\u0928\u0940\u0924\u093F \u0915\u0949\u0932 \u092C\u0941\u0915 \u0915\u0930\u0947\u0902',
            'sec.services': '\u0938\u0947\u0935\u093E\u090F\u0902',
            'sec.projects': '\u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F\u094D\u0938',
            'sec.about': '\u0939\u092E\u093E\u0930\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902',
            'sec.faq': '\u0905\u0915\u094D\u0938\u0930 \u092A\u0942\u091B\u0947 \u091C\u093E\u0928\u0947 \u0935\u093E\u0932\u0947 \u092A\u094D\u0930\u0936\u094D\u0928',
            'footer.company': '\u0915\u0902\u092A\u0928\u0940',
            'footer.contact': '\u0938\u0902\u092A\u0930\u094D\u0915',
            'footer.location': '\u0938\u094D\u0925\u093E\u0928',
            'footer.email': '\u0908\u092E\u0947\u0932',
            'footer.call': '\u0915\u0949\u0932 \u0915\u0930\u0947\u0902',
            'cta.project': '\u0915\u094B\u0908 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u0939\u0948? \u092C\u093E\u0924 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902!',
            'cta.send': '\u0938\u0902\u0926\u0947\u0936 \u092D\u0947\u091C\u0947\u0902',
            'cta.view': '\u0915\u0947\u0938 \u0938\u094D\u091F\u0921\u0940 \u0926\u0947\u0916\u0947\u0902 \u2192',
            'cta.learn': '\u0914\u0930 \u091C\u093E\u0928\u0947\u0902',
            'cta.back': '\u090A\u092A\u0930 \u091C\u093E\u090F\u0902'
        },
        de: {
            'nav.services': 'Leistungen',
            'nav.casestudies': 'Fallstudien',
            'nav.pricing': 'Preise',
            'nav.about': '\u00DCber uns',
            'nav.blog': 'Blog',
            'nav.contact': 'Kontakt \u2192',
            'hero.title': 'Wir gestalten digitale Erlebnisse, die Nutzer lieben und Unternehmen vertrauen',
            'hero.subtitle': 'Wir gestalten hochkonvertierende digitale Erlebnisse, die Wachstum f\u00F6rdern.',
            'hero.cta1': 'Fallstudien ansehen',
            'hero.cta2': 'Kostenloses Strategiegespr\u00E4ch',
            'sec.services': 'Leistungen',
            'sec.projects': 'Projekte',
            'sec.about': '\u00DCber uns',
            'sec.faq': 'FAQ',
            'footer.company': 'Unternehmen',
            'footer.contact': 'Kontakt',
            'footer.location': 'Standort',
            'footer.email': 'E-Mail',
            'footer.call': 'Anrufen',
            'cta.project': 'Ein Projekt? Lassen Sie uns reden!',
            'cta.send': 'Nachricht senden',
            'cta.view': 'Fallstudie ansehen \u2192',
            'cta.learn': 'Mehr erfahren',
            'cta.back': 'Nach oben'
        },
        fr: {
            'nav.services': 'Services',
            'nav.casestudies': '\u00C9tudes de cas',
            'nav.pricing': 'Tarifs',
            'nav.about': '\u00C0 propos',
            'nav.blog': 'Blog',
            'nav.contact': 'Nous contacter \u2192',
            'hero.title': 'Nous cr\u00E9ons des exp\u00E9riences num\u00E9riques que les utilisateurs adorent et auxquelles les entreprises font confiance',
            'hero.subtitle': 'Nous concevons des exp\u00E9riences num\u00E9riques \u00E0 fort taux de conversion qui stimulent la croissance.',
            'hero.cta1': 'Voir nos \u00E9tudes de cas',
            'hero.cta2': 'R\u00E9server un appel strat\u00E9gique',
            'sec.services': 'Services',
            'sec.projects': 'Projets',
            'sec.about': '\u00C0 propos',
            'sec.faq': 'FAQ',
            'footer.company': 'Entreprise',
            'footer.contact': 'Contact',
            'footer.location': 'Adresse',
            'footer.email': 'Email',
            'footer.call': 'Appeler',
            'cta.project': 'Un projet ? Parlons-en !',
            'cta.send': 'Envoyer le message',
            'cta.view': 'Voir l\'\u00E9tude de cas \u2192',
            'cta.learn': 'En savoir plus',
            'cta.back': 'Haut de page'
        },
        es: {
            'nav.services': 'Servicios',
            'nav.casestudies': 'Casos de \u00E9xito',
            'nav.pricing': 'Precios',
            'nav.about': 'Nosotros',
            'nav.blog': 'Blog',
            'nav.contact': 'Cont\u00E1ctanos \u2192',
            'hero.title': 'Creamos experiencias digitales que los usuarios aman y las empresas conf\u00EDan',
            'hero.subtitle': 'Dise\u00F1amos experiencias digitales de alta conversi\u00F3n que impulsan el crecimiento.',
            'hero.cta1': 'Ver nuestros casos de \u00E9xito',
            'hero.cta2': 'Reservar una llamada estrat\u00E9gica',
            'sec.services': 'Servicios',
            'sec.projects': 'Proyectos',
            'sec.about': 'Nosotros',
            'sec.faq': 'Preguntas frecuentes',
            'footer.company': 'Empresa',
            'footer.contact': 'Contacto',
            'footer.location': 'Ubicaci\u00F3n',
            'footer.email': 'Correo',
            'footer.call': 'Llamar',
            'cta.project': '\u00BFTienes un proyecto? \u00A1Hablemos!',
            'cta.send': 'Enviar mensaje',
            'cta.view': 'Ver caso de \u00E9xito \u2192',
            'cta.learn': 'Saber m\u00E1s',
            'cta.back': 'Ir arriba'
        },
        ar: {
            'nav.services': '\u0627\u0644\u062E\u062F\u0645\u0627\u062A',
            'nav.casestudies': '\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u0629',
            'nav.pricing': '\u0627\u0644\u0623\u0633\u0639\u0627\u0631',
            'nav.about': '\u0645\u0646 \u0646\u062D\u0646',
            'nav.blog': '\u0627\u0644\u0645\u062F\u0648\u0646\u0629',
            'nav.contact': '\u2190 \u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627',
            'hero.title': '\u0646\u0635\u0645\u0645 \u062A\u062C\u0627\u0631\u0628 \u0631\u0642\u0645\u064A\u0629 \u064A\u062D\u0628\u0647\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0648\u0646 \u0648\u062A\u062B\u0642 \u0628\u0647\u0627 \u0627\u0644\u0634\u0631\u0643\u0627\u062A',
            'hero.subtitle': '\u0646\u0635\u0645\u0645 \u062A\u062C\u0627\u0631\u0628 \u0631\u0642\u0645\u064A\u0629 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u062A\u062F\u0641\u0639 \u0627\u0644\u0646\u0645\u0648 \u0648\u062A\u0639\u0632\u0632 \u0627\u0644\u0627\u062D\u062A\u0641\u0627\u0638.',
            'hero.cta1': '\u0639\u0631\u0636 \u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u0629',
            'hero.cta2': '\u0627\u062D\u062C\u0632 \u0645\u0643\u0627\u0644\u0645\u0629 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629',
            'sec.services': '\u0627\u0644\u062E\u062F\u0645\u0627\u062A',
            'sec.projects': '\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639',
            'sec.about': '\u0645\u0646 \u0646\u062D\u0646',
            'sec.faq': '\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629',
            'footer.company': '\u0627\u0644\u0634\u0631\u0643\u0629',
            'footer.contact': '\u0627\u0644\u062A\u0648\u0627\u0635\u0644',
            'footer.location': '\u0627\u0644\u0645\u0648\u0642\u0639',
            'footer.email': '\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A',
            'footer.call': '\u0627\u062A\u0635\u0644 \u0628\u0646\u0627',
            'cta.project': '\u0644\u062F\u064A\u0643 \u0645\u0634\u0631\u0648\u0639\u061F \u062F\u0639\u0646\u0627 \u0646\u062A\u062D\u062F\u062B!',
            'cta.send': '\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629',
            'cta.view': '\u2190 \u0639\u0631\u0636 \u062F\u0631\u0627\u0633\u0629 \u0627\u0644\u062D\u0627\u0644\u0629',
            'cta.learn': '\u0627\u0639\u0631\u0641 \u0627\u0644\u0645\u0632\u064A\u062F',
            'cta.back': '\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0623\u0639\u0644\u0649'
        }
    };

    function detectLanguage() {
        const saved = localStorage.getItem('designit-lang');
        if (saved && translations[saved]) return saved;
        const browserLang = (navigator.language || navigator.userLanguage || 'en').slice(0, 2);
        return translations[browserLang] ? browserLang : 'en';
    }

    function applyTranslations(lang) {
        const t = translations[lang];
        if (!t) return;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = t[key];
                } else {
                    el.textContent = t[key];
                }
            }
        });
        // RTL support
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        // Update selector
        const select = document.getElementById('langSelect');
        if (select) select.value = lang;
        localStorage.setItem('designit-lang', lang);
    }

    window.addEventListener('DOMContentLoaded', () => {
        const lang = detectLanguage();
        applyTranslations(lang);
        const select = document.getElementById('langSelect');
        if (select) {
            select.addEventListener('change', (e) => {
                applyTranslations(e.target.value);
            });
        }
    });

    window.setLanguage = applyTranslations;
})();
