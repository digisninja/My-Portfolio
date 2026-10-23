(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");

  /* ------------------------------------------------------------------
     Split headings into words for the staggered reveal.
     Text nodes are split on spaces; inline elements (e.g. <em class="mark">)
     stay intact as a single word so their styling is preserved.
     ------------------------------------------------------------------ */
  function wrapWord(content, index) {
    var word = document.createElement("span");
    word.className = "word";
    var inner = document.createElement("span");
    inner.className = "word-inner";
    inner.style.setProperty("--i", index);
    if (typeof content === "string") inner.textContent = content;
    else inner.appendChild(content);
    word.appendChild(inner);
    return word;
  }

  document.querySelectorAll(".split").forEach(function (el) {
    var label = el.textContent.replace(/\s+/g, " ").trim();
    var nodes = Array.prototype.slice.call(el.childNodes);
    var frag = document.createDocumentFragment();
    var i = 0;

    nodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(" "));
          else frag.appendChild(wrapWord(part, i++));
        });
      } else if (node.nodeName === "BR") {
        frag.appendChild(node); /* keep intentional line breaks */
      } else {
        frag.appendChild(wrapWord(node, i++));
      }
    });

    el.textContent = "";
    el.appendChild(frag);
    el.setAttribute("aria-label", label);
    Array.prototype.forEach.call(el.children, function (c) { c.setAttribute("aria-hidden", "true"); });
  });

  /* ------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------ */
  var targets = document.querySelectorAll(".split, .reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add("is-in"); });
  }

  /* ------------------------------------------------------------------
     Hero portrait leans toward the pointer
     ------------------------------------------------------------------ */
  var photo = document.querySelector(".hero-photo");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (photo && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    var frame = null;
    window.addEventListener("pointermove", function (e) {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = null;
        var r = photo.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        var dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        photo.style.setProperty("--tilt-y", (dx * 30).toFixed(2) + "deg");
        photo.style.setProperty("--tilt-x", (dy * -30).toFixed(2) + "deg");
      });
    });
  }

  /* ------------------------------------------------------------------
     Highlight the nav link for the section in view
     ------------------------------------------------------------------ */
  var navLinks = document.querySelectorAll(".site-nav a");
  if (navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove("is-active"); });
        var link = byId[entry.target.id];
        if (link) link.classList.add("is-active"); /* the hero clears it */
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(byId).concat("top").forEach(function (id) {
      var section = document.getElementById(id);
      if (section) navIo.observe(section);
    });
  }

  /* ------------------------------------------------------------------
     Live local clock
     ------------------------------------------------------------------ */
  var clock = document.getElementById("clock");
  if (clock) {
    var tz = clock.dataset.timezone;
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz, timeZoneName: "short" });
    } catch (e) {
      fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
    }
    var tick = function () { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 15000);
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     Theme toggle (preference saved per browser)
     ------------------------------------------------------------------ */
  document.querySelectorAll("[data-theme-toggle]").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.dataset.theme ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  });

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  var menuBtn = document.getElementById("menu-toggle");
  var header = document.querySelector(".site-header");
  if (menuBtn && header) {
    var setMenu = function (open) {
      header.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuBtn.addEventListener("click", function () {
      setMenu(!header.classList.contains("menu-open"));
    });
    /* Close after choosing a section, on Escape, on outside click, or when widening to desktop */
    document.querySelectorAll(".site-nav a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("menu-open")) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (header.classList.contains("menu-open") && !header.contains(e.target)) setMenu(false);
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ------------------------------------------------------------------
     Drag-to-scroll work strip (mouse/pen; touch uses native scrolling)
     ------------------------------------------------------------------ */
  var strip = document.querySelector(".work-strip");
  if (strip) {
    var startX = 0;
    var startScroll = 0;
    var pointerId = null;
    var moved = false;

    strip.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch" || e.button !== 0) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startScroll = strip.scrollLeft;
      moved = false;
    });

    strip.addEventListener("pointermove", function (e) {
      if (pointerId !== e.pointerId) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        strip.classList.add("is-dragging");
        strip.setPointerCapture(e.pointerId);
      }
      if (moved) strip.scrollLeft = startScroll - dx;
    });

    var end = function (e) {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      strip.classList.remove("is-dragging");
    };
    strip.addEventListener("pointerup", end);
    strip.addEventListener("pointercancel", end);

    /* Swallow the click that follows a drag */
    strip.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    /* Keyboard: arrow keys scroll by one card */
    strip.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var card = strip.querySelector(".work-card");
      var step = card ? card.getBoundingClientRect().width + 20 : 300;
      strip.scrollBy({ left: e.key === "ArrowRight" ? step : -step, behavior: "smooth" });
    });
  }
})();
