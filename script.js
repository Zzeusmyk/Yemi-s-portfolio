/* ============================================================
   Yemi — Portfolio interactions
   ============================================================ */
(function () {
  "use strict";

  /* current year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* nav: shrink on scroll */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  var toggle = document.getElementById("menuToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* reveal on scroll */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* animated stat counters */
  var counted = false;
  function runCounters() {
    if (counted) return;
    counted = true;
    document.querySelectorAll(".stat-num").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-target")) || 0;
      var start = null;
      var dur = 1600;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        // easeOutCubic
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target).toString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toString();
      }
      requestAnimationFrame(step);
    });
  }
  var statsSection = document.querySelector(".stats");
  if (statsSection && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCounters(); so.disconnect(); }
        });
      },
      { threshold: 0.4 }
    );
    so.observe(statsSection);
  } else {
    runCounters();
  }

  /* pointer-reactive sheen on glass buttons */
  document.querySelectorAll(".glass-btn").forEach(function (btn) {
    btn.addEventListener("pointermove", function (ev) {
      var r = btn.getBoundingClientRect();
      var mx = ((ev.clientX - r.left) / r.width) * 100;
      var my = ((ev.clientY - r.top) / r.height) * 100;
      btn.style.setProperty("--mx", mx + "%");
      btn.style.setProperty("--my", my + "%");
    });
  });

  /* ───────── Contact form ───────── */
  (function () {
    var form = document.getElementById("contactForm");
    if (!form) return;

    // ── CONFIG ────────────────────────────────────────────────
    // Paste your Formspree endpoint here to send real emails, e.g.
    //   var ENDPOINT = "https://formspree.io/f/xxxxxxx";
    // Leave it empty ("") to use the mailto fallback instead.
    var ENDPOINT = "";
    var FALLBACK_EMAIL = "yemicharis@gmail.com";
    // ──────────────────────────────────────────────────────────

    var status = document.getElementById("formStatus");
    var success = document.getElementById("formSuccess");
    var submitBtn = form.querySelector(".form-submit");
    var resetBtn = document.getElementById("formReset");

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function fieldOf(input) { return input.closest(".field"); }
    function errEl(input) {
      var f = fieldOf(input);
      return f ? f.querySelector(".field-error") : null;
    }
    function setError(input, msg) {
      var f = fieldOf(input);
      if (!f) return;
      if (msg) {
        f.classList.add("invalid");
        var e = errEl(input); if (e) e.textContent = msg;
      } else {
        f.classList.remove("invalid");
        var e2 = errEl(input); if (e2) e2.textContent = "";
      }
    }

    function validate(input) {
      var v = (input.value || "").trim();
      if (input.name === "name") {
        if (!v) return "Please tell me your name.";
      } else if (input.name === "email") {
        if (!v) return "An email so I can reply.";
        if (!EMAIL_RE.test(v)) return "That email doesn't look right.";
      } else if (input.name === "message") {
        if (!v) return "A quick note on your project.";
        if (v.length < 10) return "A little more detail, please.";
      }
      return "";
    }

    var validated = ["cf-name", "cf-email", "cf-message"].map(function (id) {
      return document.getElementById(id);
    });

    // clear error as the user fixes it
    validated.forEach(function (input) {
      input.addEventListener("input", function () {
        if (fieldOf(input).classList.contains("invalid")) {
          setError(input, validate(input));
        }
      });
    });

    function validateAll() {
      var ok = true, firstBad = null;
      validated.forEach(function (input) {
        var msg = validate(input);
        setError(input, msg);
        if (msg && ok) { ok = false; firstBad = input; }
      });
      if (firstBad) firstBad.focus();
      return ok;
    }

    function showSuccess() {
      success.hidden = false;
      form.reset();
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "";
      status.classList.remove("err");

      // honeypot: silently "succeed" for bots
      if (form.querySelector('[name="_gotcha"]').value) { showSuccess(); return; }

      if (!validateAll()) {
        status.textContent = "Please fix the highlighted fields.";
        status.classList.add("err");
        return;
      }

      var data = {
        name: document.getElementById("cf-name").value.trim(),
        email: document.getElementById("cf-email").value.trim(),
        topic: document.getElementById("cf-topic").value,
        message: document.getElementById("cf-message").value.trim()
      };

      // No endpoint configured → open the user's mail client, pre-filled.
      if (!ENDPOINT) {
        var subject = encodeURIComponent("New project enquiry — " + data.topic);
        var body = encodeURIComponent(
          "Name: " + data.name + "\n" +
          "Email: " + data.email + "\n" +
          "Topic: " + data.topic + "\n\n" +
          data.message
        );
        window.location.href =
          "mailto:" + FALLBACK_EMAIL + "?subject=" + subject + "&body=" + body;
        status.textContent = "Opening your email app…";
        setTimeout(showSuccess, 600);
        return;
      }

      // Endpoint configured → send via fetch (Formspree-compatible).
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;
      status.textContent = "Sending…";

      fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          if (res.ok) { showSuccess(); status.textContent = ""; }
          else { throw new Error("Bad response"); }
        })
        .catch(function () {
          status.textContent =
            "Something went wrong — email me directly at " + FALLBACK_EMAIL + ".";
          status.classList.add("err");
        })
        .finally(function () {
          submitBtn.classList.remove("loading");
          submitBtn.disabled = false;
        });
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        success.hidden = true;
        status.textContent = "";
        document.getElementById("cf-name").focus();
      });
    }
  })();
})();
