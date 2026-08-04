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
