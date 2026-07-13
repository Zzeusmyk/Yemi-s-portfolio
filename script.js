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
})();
