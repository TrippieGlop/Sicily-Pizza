(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  /* Newsletter: paste the shop's Web3Forms access key here (free at web3forms.com). */
  var WEB3FORMS_KEY = "YOUR_WEB3FORMS_ACCESS_KEY";

  /* Hours in minutes after midnight, Bethlehem time. 0 = Sunday. */
  var HOURS = {
    0: [630, 1260], 1: [600, 1260], 2: [600, 1260], 3: [600, 1260],
    4: [600, 1260], 5: [600, 1320], 6: [600, 1320]
  };

  function bethlehemNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var h = parseInt(map.hour, 10) % 24;
      return { day: days[map.weekday], mins: h * 60 + parseInt(map.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function fmt(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    var ap = h >= 12 ? "pm" : "am";
    var hh = h % 12 || 12;
    return hh + (m ? ":" + (m < 10 ? "0" : "") + m : "") + ap;
  }

  function updateStatus() {
    var now = bethlehemNow();
    var today = HOURS[now.day];
    var open = now.mins >= today[0] && now.mins < today[1];
    var text;
    if (open) {
      var left = today[1] - now.mins;
      text = left <= 45 ? "Open, closing soon at " + fmt(today[1]) : "Open now until " + fmt(today[1]);
    } else if (now.mins < today[0]) {
      text = "Closed, opens today at " + fmt(today[0]);
    } else {
      var next = HOURS[(now.day + 1) % 7];
      text = "Closed, opens tomorrow at " + fmt(next[0]);
    }
    document.querySelectorAll("[data-status]").forEach(function (el) {
      el.classList.toggle("is-open", open);
      el.classList.toggle("is-closed", !open);
      var t = el.querySelector("[data-status-text]");
      if (t) t.textContent = text;
    });
    document.querySelectorAll("[data-day]").forEach(function (row) {
      var on = row.getAttribute("data-day").split(",").indexOf(String(now.day)) > -1;
      row.classList.toggle("is-today", on);
    });
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* Header shadow */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  var backdrop = document.querySelector(".nav-backdrop");
  function setNav(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    if (backdrop) backdrop.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { var f = nav.querySelector("a"); if (f) f.focus(); }
  }
  if (toggle) toggle.addEventListener("click", function () { setNav(toggle.getAttribute("aria-expanded") !== "true"); });
  if (backdrop) backdrop.addEventListener("click", function () { setNav(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle && toggle.getAttribute("aria-expanded") === "true") { setNav(false); toggle.focus(); }
  });

  /* Reveal on scroll */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Map loads only when asked, so nothing goes to Google until then */
  document.querySelectorAll("[data-load-map]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var frame = btn.closest(".map-frame");
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.google.com/maps?q=Sicily+Pizza+III,+4460+Easton+Ave,+Bethlehem,+PA+18020&output=embed";
      iframe.title = "Map to Sicily III at 4460 Easton Ave, Bethlehem PA";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      frame.appendChild(iframe);
      var consent = frame.querySelector(".map-consent");
      if (consent) consent.remove();
    });
  });

  /* Menu search + section highlighting */
  var search = document.getElementById("menu-search");
  if (search) {
    var items = Array.prototype.slice.call(document.querySelectorAll(".menu-item"));
    var sections = Array.prototype.slice.call(document.querySelectorAll(".menu-section"));
    var groups = Array.prototype.slice.call(document.querySelectorAll(".menu-group-title"));
    var empty = document.getElementById("no-results");
    var live = document.getElementById("search-live");
    var timer;
    search.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var q = search.value.trim().toLowerCase();
        var shown = 0;
        items.forEach(function (it) {
          var hit = !q || it.textContent.toLowerCase().indexOf(q) > -1;
          it.hidden = !hit;
          if (hit) shown++;
        });
        sections.forEach(function (sec) {
          var any = sec.querySelector(".menu-item:not([hidden])");
          var titleHit = q && sec.querySelector("h2").textContent.toLowerCase().indexOf(q) > -1;
          if (titleHit) { sec.querySelectorAll(".menu-item").forEach(function (i) { i.hidden = false; }); any = true; }
          sec.hidden = !any;
        });
        groups.forEach(function (g) {
          var id = g.getAttribute("data-group");
          g.hidden = !document.querySelector('.menu-section[data-group="' + id + '"]:not([hidden])');
        });
        var visible = document.querySelectorAll(".menu-item:not([hidden])").length;
        if (empty) empty.hidden = visible > 0;
        if (live) live.textContent = q ? visible + " dishes match “" + search.value.trim() + "”" : "";
      }, 120);
    });

    var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[href^='#']"));
    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = en.target.id;
          chips.forEach(function (c) {
            var on = c.getAttribute("href") === "#" + id;
            c.classList.toggle("is-active", on);
            if (on) {
              var bar = c.parentElement;
              var left = c.offsetLeft - bar.clientWidth / 2 + c.clientWidth / 2;
              bar.scrollTo({ left: left, behavior: reduce ? "auto" : "smooth" });
            }
          });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  /* Newsletter + catering request forms */
  document.querySelectorAll("form[data-web3]").forEach(function (form) {
    var msg = form.querySelector(".form-msg");
    var btn = form.querySelector("button[type=submit]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (msg) { msg.textContent = ""; msg.className = "form-msg"; }
      var bad = null;
      form.querySelectorAll("[required]").forEach(function (f) {
        var ok = f.type === "checkbox" ? f.checked : f.value.trim() !== "" && (!f.validity || f.validity.valid);
        f.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok && !bad) bad = f;
      });
      if (bad) {
        if (msg) { msg.textContent = bad.type === "email" ? "That email doesn't look quite right." : "Please fill in the highlighted field."; msg.classList.add("err"); }
        bad.focus();
        return;
      }
      if (form.querySelector(".hp input") && form.querySelector(".hp input").checked) return;
      if (WEB3FORMS_KEY.indexOf("YOUR_") === 0) {
        if (msg) { msg.textContent = "Sign up is almost ready. For now, give us a call at 610-694-9112."; msg.classList.add("err"); }
        return;
      }
      var data = new FormData(form);
      data.append("access_key", WEB3FORMS_KEY);
      var label = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
      fetch("https://api.web3forms.com/submit", { method: "POST", headers: { Accept: "application/json" }, body: data })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.success) {
            form.reset();
            if (msg) { msg.textContent = form.getAttribute("data-ok") || "Thanks! You're on the list."; msg.classList.add("ok"); }
          } else { throw new Error("fail"); }
        })
        .catch(function () {
          if (msg) { msg.textContent = "Something went wrong on our end. Try again, or call 610-694-9112."; msg.classList.add("err"); }
        })
        .finally(function () { if (btn) { btn.disabled = false; btn.innerHTML = label; } });
    });
  });

  var y = document.querySelectorAll("[data-year]");
  y.forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
