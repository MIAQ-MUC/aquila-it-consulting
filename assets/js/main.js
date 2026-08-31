/* ==========================================================================
   Aquila IT Consulting – main.js
   Wird mit "defer" geladen. Ohne JavaScript bleiben alle Inhalte,
   Links und Rechtstexte vollstaendig erreichbar.
   ========================================================================== */
(function () {
  "use strict";

  var EMAIL = "m.aquila@aquila-it-consulting.de";

  /* ----------------------------------------------------------------------
     1. Farbschema umschalten
     Die Auswahl wird in localStorage unter "aic-theme" gespeichert.
     Dieser Punkt ist in der Datenschutzerklaerung beschrieben.
     ---------------------------------------------------------------------- */
  var themeToggle = document.querySelector("[data-theme-toggle]");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";

      document.documentElement.setAttribute("data-theme", next);
      themeToggle.setAttribute(
        "aria-label",
        next === "dark" ? "Zur hellen Ansicht wechseln" : "Zur dunklen Ansicht wechseln"
      );

      try {
        localStorage.setItem("aic-theme", next);
      } catch (e) {
        /* Speicher nicht verfuegbar - Auswahl gilt nur fuer diese Sitzung. */
      }
    });
  }

  /* ----------------------------------------------------------------------
     2. Mobile Navigation
     ---------------------------------------------------------------------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.getElementById("primary-navigation");

  function isMobileLayout() {
    return window.matchMedia("(max-width: 860px)").matches;
  }

  function setNavState(open) {
    if (!navToggle || !nav) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    if (open) {
      nav.removeAttribute("hidden");
    } else {
      nav.setAttribute("hidden", "");
    }
  }

  function syncNavForViewport() {
    if (!nav || !navToggle) return;
    if (isMobileLayout()) {
      setNavState(navToggle.getAttribute("aria-expanded") === "true");
    } else {
      nav.removeAttribute("hidden");
      navToggle.setAttribute("aria-expanded", "false");
    }
  }

  if (navToggle && nav) {
    setNavState(false);
    syncNavForViewport();

    navToggle.addEventListener("click", function () {
      setNavState(navToggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a") && isMobileLayout()) {
        setNavState(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (
        event.key === "Escape" &&
        isMobileLayout() &&
        navToggle.getAttribute("aria-expanded") === "true"
      ) {
        setNavState(false);
        navToggle.focus();
      }
    });

    window.addEventListener("resize", syncNavForViewport);
  }

  /* ----------------------------------------------------------------------
     3. Aktiven Navigationspunkt markieren
     ---------------------------------------------------------------------- */
  var sections = Array.prototype.slice.call(
    document.querySelectorAll("main section[id]")
  );
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav__link[href^="#"]')
  );

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            var active = link.getAttribute("href") === "#" + entry.target.id;
            if (active) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ----------------------------------------------------------------------
     4. Thema im Formular vorauswaehlen
     ---------------------------------------------------------------------- */
  var topicField = document.getElementById("thema");

  document.querySelectorAll("[data-preset-topic]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      if (!topicField) return;
      var wanted = trigger.getAttribute("data-preset-topic");
      Array.prototype.slice.call(topicField.options).forEach(function (option) {
        if (option.value === wanted) topicField.value = wanted;
      });
    });
  });

  /* ----------------------------------------------------------------------
     5. Kontaktformular: bereitet eine E-Mail im lokalen Programm vor.
     Es werden keine Daten an einen Server dieser Website uebertragen.
     ---------------------------------------------------------------------- */
  var form = document.getElementById("kontaktformular");

  function showFieldError(input, message) {
    var target = document.getElementById(input.id + "-error");
    if (target) target.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  if (form) {
    form.setAttribute("novalidate", "");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var vorname = document.getElementById("vorname");
      var nachname = document.getElementById("nachname");
      var unternehmen = document.getElementById("unternehmen");
      var email = document.getElementById("email");
      var thema = document.getElementById("thema");
      var nachricht = document.getElementById("nachricht");

      var firstInvalid = null;

      [vorname, nachname, email].forEach(function (input) {
        showFieldError(input, "");
        if (!input.value.trim()) {
          showFieldError(input, "Bitte ausfüllen.");
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        showFieldError(email, "Bitte eine gültige E-Mail-Adresse angeben.");
        if (!firstInvalid) firstInvalid = email;
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var subject =
        "Anfrage über aquila-it-consulting.de: " + thema.value;

      var bodyLines = [
        "Name: " + vorname.value.trim() + " " + nachname.value.trim(),
        "Unternehmen: " + (unternehmen.value.trim() || "-"),
        "E-Mail: " + email.value.trim(),
        "Thema: " + thema.value,
        "",
        "Beschreibung:",
        nachricht.value.trim() || "-"
      ];

      window.location.href =
        "mailto:" +
        EMAIL +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(bodyLines.join("\r\n"));
    });
  }

  /* ----------------------------------------------------------------------
     6. E-Mail-Adresse kopieren
     ---------------------------------------------------------------------- */
  var copyButton = document.querySelector("[data-copy-email]");
  var copyStatus = document.getElementById("copy-status");

  function setCopyStatus(message, state) {
    if (!copyStatus) return;
    copyStatus.textContent = message;
    copyStatus.setAttribute("data-state", state);
  }

  function legacyCopy(text) {
    var helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "absolute";
    helper.style.left = "-9999px";
    document.body.appendChild(helper);
    helper.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(helper);
    return ok;
  }

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(EMAIL).then(
          function () {
            setCopyStatus("E-Mail-Adresse wurde kopiert.", "ok");
          },
          function () {
            if (legacyCopy(EMAIL)) {
              setCopyStatus("E-Mail-Adresse wurde kopiert.", "ok");
            } else {
              setCopyStatus(
                "Kopieren nicht möglich. Bitte die Adresse " + EMAIL + " manuell übernehmen.",
                "error"
              );
            }
          }
        );
        return;
      }

      if (legacyCopy(EMAIL)) {
        setCopyStatus("E-Mail-Adresse wurde kopiert.", "ok");
      } else {
        setCopyStatus(
          "Kopieren nicht möglich. Bitte die Adresse " + EMAIL + " manuell übernehmen.",
          "error"
        );
      }
    });
  }
})();
