/* AKWEBSEC — Shared Scripts */
/* Fixed per K3 Swarm Critique: XSS-safe, a11y, POPIA cookie consent */

(function() {
  "use strict";

  // --- Mobile Menu ---
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const navMenu = document.getElementById("nav-menu");
  if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", function() {
      const expanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", String(!expanded));
      navMenu.classList.toggle("open");
    });
    // Dropdown toggles on mobile
    document.querySelectorAll(".nav-item-dropdown > button").forEach(btn => {
      btn.addEventListener("click", function(e) {
        if (window.innerWidth <= 900) {
          e.preventDefault();
          const parent = this.closest(".nav-item-dropdown");
          const expanded = this.getAttribute("aria-expanded") === "true";
          this.setAttribute("aria-expanded", String(!expanded));
          parent.classList.toggle("open");
        }
      });
    });
  }

  // --- Cookie Consent (POPIA) ---
  const cookieBanner = document.getElementById("cookie-banner");
  const cookieAccept = document.getElementById("cookie-accept");
  const cookieDecline = document.getElementById("cookie-decline");
  const COOKIE_KEY = "akwebsec_cookies_consented";

  function showCookieBanner() {
    if (cookieBanner && !localStorage.getItem(COOKIE_KEY)) {
      setTimeout(() => cookieBanner.classList.add("show"), 800);
    }
  }

  if (cookieAccept) {
    cookieAccept.addEventListener("click", function() {
      localStorage.setItem(COOKIE_KEY, "true");
      if (cookieBanner) cookieBanner.classList.remove("show");
    });
  }
  if (cookieDecline) {
    cookieDecline.addEventListener("click", function() {
      localStorage.setItem(COOKIE_KEY, "false");
      if (cookieBanner) cookieBanner.classList.remove("show");
    });
  }
  showCookieBanner();

  // --- FAQ Accordion ---
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", function() {
      const expanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", String(!expanded));
      const answer = this.nextElementSibling;
      if (answer) answer.classList.toggle("open");
    });
  });

  // --- Terminal Typewriter (Homepage only) ---
  const terminalBody = document.getElementById("terminal-body");
  if (terminalBody) {
    const lines = [
      { text: "Initializing security monitor...", cls: "", delay: 0 },
      { text: "Loading threat intelligence feeds...", cls: "", delay: 600 },
      { text: "[OK] CVE database synced (186,432 entries)", cls: "success", delay: 1200 },
      { text: "[OK] OWASP Top 10 rules loaded", cls: "success", delay: 1800 },
      { text: "Scanning target: client-portal.co.za...", cls: "", delay: 2400 },
      { text: "[WARN] Outdated jQuery 1.11.0 detected", cls: "warn", delay: 3200 },
      { text: "[WARN] Missing Content-Security-Policy header", cls: "warn", delay: 3800 },
      { text: "[CRIT] SQL injection vulnerability in /api/search", cls: "error", delay: 4500 },
      { text: "[CRIT] Exposed .env file at /config/.env", cls: "error", delay: 5200 },
      { text: "Generating report...", cls: "", delay: 6000 },
      { text: "[DONE] 2 critical, 2 warnings, 0 info", cls: "success", delay: 6800 },
      { text: "Alert sent to: security@akwebsec.co.za", cls: "", delay: 7400 },
    ];

    // Respect reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    lines.forEach(({ text, cls, delay }) => {
      const show = () => {
        const div = document.createElement("div");
        div.className = "terminal-line" + (cls ? " " + cls : "");
        div.textContent = "> " + text;
        terminalBody.appendChild(div);
        terminalBody.scrollTop = terminalBody.scrollHeight;
      };
      if (prefersReduced) {
        show();
      } else {
        setTimeout(show, delay);
      }
    });
  }

  // --- Demo Scanner (XSS-Safe) ---
  const scanBtn = document.getElementById("scan-btn");
  const scanUrl = document.getElementById("scan-url");
  const scanResults = document.getElementById("scan-results");

  if (scanBtn && scanUrl && scanResults) {
    scanBtn.addEventListener("click", function() {
      const url = scanUrl.value.trim();
      if (!url) {
        scanResults.style.display = "block";
        scanResults.classList.add("active");
        scanResults.innerHTML = "";
        const p = document.createElement("p");
        p.style.color = "var(--yellow)";
        p.textContent = "Please enter a URL to scan.";
        scanResults.appendChild(p);
        return;
      }

      // Validate URL contains a real domain (not just a number)
      const hasValidDomain = /\.(com|co\.za|co\.uk|net|org|io|app|dev|za)/i.test(url);
      if (!hasValidDomain) {
        scanResults.style.display = "block";
        scanResults.classList.add("active");
        scanResults.innerHTML = "";
        const p = document.createElement("p");
        p.style.color = "var(--yellow)";
        p.textContent = "Please enter a valid URL with a domain (e.g., example.com or example.co.za).";
        scanResults.appendChild(p);
        return;
      }

      // Sanitize display — never inject raw URL into HTML
      const safeUrl = url.replace(/[<>&"']/g, "");
      scanResults.style.display = "block";
      scanResults.classList.add("active");
      scanResults.innerHTML = "";

      const scenarios = [
        {
          checks: ["dns", "ssl", "headers", "ports"],
          findings: [
            { text: "[OK] DNS records healthy", type: "success" },
            { text: "[OK] SSL certificate valid (expires 2027-03-15)", type: "success" },
            { text: "[WARN] X-Frame-Options header missing", type: "warn" },
            { text: "[WARN] Server banner exposes version", type: "warn" },
          ]
        },
        {
          checks: ["dns", "ssl", "headers", "ports", "wp"],
          findings: [
            { text: "[OK] DNS records healthy", type: "success" },
            { text: "[OK] SSL certificate valid", type: "success" },
            { text: "[WARN] WordPress version exposed in meta generator", type: "warn" },
            { text: "[CRIT] /wp-admin accessible without IP restriction", type: "error" },
            { text: "[CRIT] Plugin 'contact-form-7' v5.4.1 has known CVE", type: "error" },
          ]
        },
        {
          checks: ["dns", "ssl", "headers", "ports", "shop"],
          findings: [
            { text: "[OK] DNS records healthy", type: "success" },
            { text: "[OK] SSL certificate valid", type: "success" },
            { text: "[OK] HSTS header present", type: "success" },
            { text: "[WARN] Payment gateway test mode enabled", type: "warn" },
            { text: "[WARN] Admin panel on default URL", type: "warn" },
          ]
        }
      ];

      // Deterministic "random" based on URL char codes so same URL = same result
      let hash = 0;
      for (let i = 0; i < safeUrl.length; i++) hash = ((hash << 5) - hash) + safeUrl.charCodeAt(i);
      const scenario = scenarios[Math.abs(hash) % scenarios.length];

      const header = document.createElement("div");
      header.style.marginBottom = "12px";
      header.style.color = "var(--green)";
      header.textContent = "akasec@scanner:~$ scan " + safeUrl;
      scanResults.appendChild(header);

      let delay = 0;
      scenario.checks.forEach(check => {
        setTimeout(() => {
          const div = document.createElement("div");
          div.textContent = "[*] Running " + check + " check...";
          scanResults.appendChild(div);
          scanResults.scrollTop = scanResults.scrollHeight;
        }, delay);
        delay += 400;
      });

      setTimeout(() => {
        const sep = document.createElement("div");
        sep.style.margin = "8px 0";
        sep.style.borderTop = "1px solid var(--border)";
        scanResults.appendChild(sep);

        scenario.findings.forEach(f => {
          const div = document.createElement("div");
          div.className = "terminal-line" + (f.type ? " " + f.type : "");
          div.textContent = f.text;
          scanResults.appendChild(div);
        });

        const summary = document.createElement("div");
        summary.style.marginTop = "12px";
        summary.style.color = "var(--text-dim)";
        summary.textContent = "Demo complete. This was a simulated scan using fictional data.";
        scanResults.appendChild(summary);
        scanResults.scrollTop = scanResults.scrollHeight;
      }, delay + 300);
    });
  }

  // --- Form plan pre-select from URL param ---
  const params = new URLSearchParams(window.location.search);
  const planSelect = document.getElementById("service");
  if (planSelect && params.has("plan")) {
    const plan = params.get("plan");
    const options = Array.from(planSelect.options);
    const match = options.find(o => o.value === plan);
    if (match) planSelect.value = plan;
  }
})();

/* --- AKWEBSEC 2026: scroll reveal, service preselect, install as app --- */
(function() {
  "use strict";

  // Scroll reveal
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      revealEls.forEach(function(el) { el.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      revealEls.forEach(function(el) { io.observe(el); });
    }
  }

  // Pre-select service / plan on forms from URL params
  var params = new URLSearchParams(window.location.search);
  var wanted = params.get("service") || params.get("plan");
  if (wanted) {
    var map = {
      "web-pentest": "Penetration Testing",
      "api-pentest": "Penetration Testing",
      "complete-pentest": "Penetration Testing",
      "pentest": "Penetration Testing",
      "monitoring": "Security Monitoring",
      "snapshot": "Security Monitoring",
      "web-dev": "Secure Web Development",
      "web-demo": "Secure Web Development",
      "app-dev": "Secure App Development",
      "app-demo": "Secure App Development"
    };
    var select = document.getElementById("service");
    if (select) {
      var target = map[wanted] || wanted;
      Array.prototype.forEach.call(select.options, function(opt) {
        if (opt.value === target || opt.textContent.trim() === target) select.value = opt.value;
      });
    }
    var pkg = document.getElementById("package");
    if (pkg) {
      Array.prototype.forEach.call(pkg.options, function(opt) {
        if (opt.value === wanted) pkg.value = opt.value;
      });
    }
    var demoNote = document.getElementById("message");
    if (demoNote && !demoNote.value && (wanted === "web-demo" || wanted === "app-demo")) {
      demoNote.value = wanted === "web-demo"
        ? "I would like to request the free website demo."
        : "I would like to request the free app demo.";
    }
  }

  // Install as app (PWA)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker.register("/sw.js").catch(function() {});
    });
  }

  var installBanner = document.getElementById("install-banner");
  var installBtn = document.getElementById("install-accept");
  var installClose = document.getElementById("install-dismiss");
  var installHint = document.getElementById("install-hint");
  var INSTALL_KEY = "akwebsec_install_dismissed";
  var deferredPrompt = null;
  var standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  function showInstall() {
    if (!installBanner || standalone || localStorage.getItem(INSTALL_KEY)) return;
    installBanner.classList.add("show");
  }

  window.addEventListener("beforeinstallprompt", function(e) {
    e.preventDefault();
    deferredPrompt = e;
    showInstall();
  });

  if (installBtn) {
    installBtn.addEventListener("click", function() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function() {
          deferredPrompt = null;
          if (installBanner) installBanner.classList.remove("show");
        });
      } else if (installHint) {
        installHint.hidden = false;
      }
    });
  }
  if (installClose) {
    installClose.addEventListener("click", function() {
      localStorage.setItem(INSTALL_KEY, "1");
      if (installBanner) installBanner.classList.remove("show");
    });
  }

  // iOS / browsers without beforeinstallprompt: still offer instructions on mobile
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS && !standalone) setTimeout(showInstall, 2500);
})();
