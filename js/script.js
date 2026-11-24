/* ==========================================================================
   MINDTRACK — Vanilla JavaScript Interactions & APK Download Configuration
   ========================================================================== */

/**
 * APK DOWNLOAD CONFIGURATION
 * Replace the placeholder below with your direct, permanent public APK download URL
 * (for example, a GitHub Releases .apk asset URL or direct file hosting link).
 *
 * IMPORTANT: Do NOT use an Expo build-details page URL here.
 */
const APK_DOWNLOAD_URL =
  "https://github.com/ayush-yadav-4/MindTrack/releases/download/v1/application-0e5f962b-5fa2-4f74-99e3-ec6492785e02.apk";

/**
 * GOOGLE SHEETS FEEDBACK CONFIGURATION
 * Paste your deployed Google Apps Script Web App URL below.
 * See google-apps-script/Code.gs and README.md for step-by-step setup.
 *
 * IMPORTANT: Never place a Google Spreadsheet ID or secret in this file.
 */
const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzSQg7whqnNug7Stxp-rXgL3dKeMTdYyCrdvQaEdN_8RbzGKoyl9wr4e8DUbCVhbOb-/exec";

(function () {
  "use strict";

  const PLACEHOLDER_URL = "YOUR_DIRECT_APK_DOWNLOAD_URL";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------- 1. Dynamic Copyright Year -------------------- */
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* -------------------- 2. APK Download Configuration -------------------- */
  function validateApkUrl(rawUrl) {
    if (typeof rawUrl !== "string") {
      return { valid: false, reason: "placeholder" };
    }

    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed === PLACEHOLDER_URL) {
      return { valid: false, reason: "placeholder" };
    }

    let parsed;
    try {
      parsed = new URL(trimmed);
    } catch {
      return { valid: false, reason: "invalid" };
    }

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { valid: false, reason: "invalid" };
    }

    // Guard against accidentally using an Expo build details page URL
    const isExpoBuildPage =
      parsed.hostname.includes("expo.dev") && /\/builds\//.test(parsed.pathname);
    if (isExpoBuildPage) {
      return { valid: false, reason: "expo-page" };
    }

    return { valid: true, url: parsed.href };
  }

  function configureDownloadButtons() {
    const downloadButtons = document.querySelectorAll("[data-apk-download]");
    const noticeEl = document.getElementById("download-config-notice");
    const result = validateApkUrl(APK_DOWNLOAD_URL);

    if (result.valid) {
      downloadButtons.forEach((btn) => {
        btn.setAttribute("href", result.url);
        btn.setAttribute("download", "");
        btn.setAttribute("rel", "noopener noreferrer");
        btn.removeAttribute("aria-disabled");
        btn.classList.remove("is-disabled");
      });

      if (noticeEl) {
        noticeEl.hidden = true;
        noticeEl.textContent = "";
      }
      return;
    }

    // URL is still a placeholder or invalid — prevent broken navigation
    downloadButtons.forEach((btn) => {
      btn.setAttribute("href", "#download");
      btn.setAttribute("aria-disabled", "true");
      btn.classList.add("is-disabled");

      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const downloadSection = document.getElementById("download");
        if (downloadSection) {
          downloadSection.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "center",
          });
        }
      });
    });

    if (noticeEl) {
      noticeEl.hidden = false;
      if (result.reason === "expo-page") {
        noticeEl.innerHTML =
          "<strong>Configuration notice:</strong> An Expo build-details page URL was detected in <code>js/script.js</code>. Please replace <code>APK_DOWNLOAD_URL</code> with a direct downloadable APK link.";
      } else {
        noticeEl.innerHTML =
          "<strong>APK link not configured yet:</strong> Set <code>APK_DOWNLOAD_URL</code> in <code>js/script.js</code> to your direct Android APK URL to enable downloads.";
      }
    }
  }

  configureDownloadButtons();

  /* -------------------- 3. Mobile Hamburger Menu -------------------- */
  const navToggle = document.getElementById("nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  function setMobileMenuOpen(isOpen) {
    if (!navToggle || !mobileMenu) return;
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileMenu.hidden = !isOpen;
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const currentlyOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMobileMenuOpen(!currentlyOpen);
    });

    // Close menu when clicking any mobile navigation link
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMobileMenuOpen(false));
    });

    // Close on Escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileMenu.hidden) {
        setMobileMenuOpen(false);
        navToggle.focus();
      }
    });

    // Close on outside click
    document.addEventListener("click", (event) => {
      if (
        !mobileMenu.hidden &&
        !mobileMenu.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    });

    // Close if resized to desktop width
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860 && !mobileMenu.hidden) {
        setMobileMenuOpen(false);
      }
    });
  }

  /* -------------------- 4. Smooth Anchor Scrolling -------------------- */
  const navbar = document.getElementById("navbar");

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      if (anchor.hasAttribute("data-apk-download") && anchor.classList.contains("is-disabled")) {
        return;
      }

      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      event.preventDefault();
      const navOffset = navbar ? navbar.offsetHeight : 72;
      const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navOffset;

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  });

  /* -------------------- 5. Navbar Scroll State & Back to Top -------------------- */
  const backToTopBtn = document.getElementById("back-to-top");

  function handleScroll() {
    const scrollY = window.scrollY;

    if (navbar) {
      navbar.classList.toggle("is-scrolled", scrollY > 16);
    }

    if (backToTopBtn) {
      backToTopBtn.hidden = scrollY < 480;
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  /* -------------------- 6. Active Navigation Highlighting -------------------- */
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));
  const trackedSections = ["home", "features", "how-it-works", "about"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (navLinks.length > 0 && trackedSections.length > 0 && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const activeId = entry.target.id;
          navLinks.forEach((link) => {
            const matches = link.getAttribute("href") === `#${activeId}`;
            link.classList.toggle("is-active", matches);
          });
        });
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: 0,
      }
    );

    trackedSections.forEach((section) => sectionObserver.observe(section));
  }

  /* -------------------- 7. Scroll Reveal Animations -------------------- */
  const revealElements = document.querySelectorAll(".reveal");

  if (revealElements.length > 0) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach((el) => el.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -32px 0px",
        }
      );

      revealElements.forEach((el) => revealObserver.observe(el));
    }
  }

  /* -------------------- 8. Interactive Feature Slider / Tabs -------------------- */
  const featureTabs = Array.from(document.querySelectorAll("[data-feature-tab]"));
  const featurePanels = Array.from(document.querySelectorAll("[data-feature-panel]"));
  const featurePrevBtn = document.getElementById("feature-prev");
  const featureNextBtn = document.getElementById("feature-next");

  function activateFeatureTab(featureKey, options = {}) {
    const { focusTab = false } = options;
    const targetTab = featureTabs.find((tab) => tab.dataset.featureTab === featureKey);
    const targetPanel = featurePanels.find((panel) => panel.dataset.featurePanel === featureKey);
    if (!targetTab || !targetPanel) return;

    featureTabs.forEach((tab) => {
      const isSelected = tab === targetTab;
      tab.classList.toggle("is-active", isSelected);
      tab.setAttribute("aria-selected", String(isSelected));
      tab.setAttribute("tabindex", isSelected ? "0" : "-1");
    });

    featurePanels.forEach((panel) => {
      const isSelected = panel === targetPanel;
      panel.hidden = !isSelected;
      panel.classList.toggle("is-active", isSelected);
    });

    if (focusTab) {
      targetTab.focus();
    }

    targetTab.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }

  if (featureTabs.length > 0 && featurePanels.length > 0) {
    featureTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        activateFeatureTab(tab.dataset.featureTab);
      });

      tab.addEventListener("keydown", (event) => {
        let nextIndex = null;
        if (event.key === "ArrowRight") {
          nextIndex = (index + 1) % featureTabs.length;
        } else if (event.key === "ArrowLeft") {
          nextIndex = (index - 1 + featureTabs.length) % featureTabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = featureTabs.length - 1;
        }

        if (nextIndex !== null) {
          event.preventDefault();
          activateFeatureTab(featureTabs[nextIndex].dataset.featureTab, { focusTab: true });
        }
      });
    });

    function stepFeature(delta) {
      const currentIndex = featureTabs.findIndex((t) => t.classList.contains("is-active"));
      const safeIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex = (safeIndex + delta + featureTabs.length) % featureTabs.length;
      activateFeatureTab(featureTabs[nextIndex].dataset.featureTab);
    }

    if (featurePrevBtn) {
      featurePrevBtn.addEventListener("click", () => stepFeature(-1));
    }
    if (featureNextBtn) {
      featureNextBtn.addEventListener("click", () => stepFeature(1));
    }

    // Footer feature links activate the matching tab smoothly
    document.querySelectorAll("[data-select-feature]").forEach((link) => {
      link.addEventListener("click", () => {
        activateFeatureTab(link.dataset.selectFeature);
      });
    });
  }

  /* -------------------- 9. Feedback Form & Google Sheets Integration -------------------- */
  const FEEDBACK_PLACEHOLDER = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
  const ALLOWED_FEEDBACK_TYPES = [
    "General Feedback",
    "Bug Report",
    "Feature Request",
    "UI/UX Suggestion",
    "Other",
  ];
  const MAX_MESSAGE_LENGTH = 2000;

  const feedbackForm = document.getElementById("feedback-form");
  const nameInput = document.getElementById("feedback-name");
  const emailInput = document.getElementById("feedback-email");
  const typeSelect = document.getElementById("feedback-type");
  const ratingInput = document.getElementById("feedback-rating");
  const ratingText = document.getElementById("rating-text");
  const starButtons = Array.from(document.querySelectorAll(".star-btn"));
  const messageInput = document.getElementById("feedback-message");
  const charCountEl = document.getElementById("feedback-char-count");
  const honeypotInput = document.getElementById("feedback-website");
  const submitBtn = document.getElementById("feedback-submit-btn");
  const statusEl = document.getElementById("feedback-status");

  const emailErrorEl = document.getElementById("feedback-email-error");
  const typeErrorEl = document.getElementById("feedback-type-error");
  const messageErrorEl = document.getElementById("feedback-message-error");

  function isLocalDevEnvironment() {
    const host = window.location.hostname;
    return (
      window.location.protocol === "file:" ||
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === ""
    );
  }

  function isValidFeedbackEndpoint(rawUrl) {
    if (typeof rawUrl !== "string") return false;
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed === FEEDBACK_PLACEHOLDER) return false;
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  }

  function isValidEmailAddress(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function setFieldError(inputEl, errorEl, message) {
    if (!inputEl || !errorEl) return;
    if (message) {
      inputEl.classList.add("is-invalid");
      inputEl.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      inputEl.classList.remove("is-invalid");
      inputEl.removeAttribute("aria-invalid");
      errorEl.textContent = "";
      errorEl.hidden = true;
    }
  }

  function setFeedbackStatus(type, htmlOrText, isHtml = false) {
    if (!statusEl) return;
    statusEl.className = "feedback-status";
    if (!type) {
      statusEl.hidden = true;
      statusEl.textContent = "";
      return;
    }
    statusEl.classList.add(`is-${type}`);
    if (isHtml) {
      statusEl.innerHTML = htmlOrText;
    } else {
      statusEl.textContent = htmlOrText;
    }
    statusEl.hidden = false;
  }

  // Star rating interaction (optional 1-5 stars)
  let selectedRating = 0;

  function renderStars(hoverValue = 0) {
    starButtons.forEach((btn) => {
      const val = Number(btn.dataset.star);
      btn.classList.toggle("is-active", selectedRating > 0 && val <= selectedRating);
      btn.classList.toggle("is-hovered", hoverValue > 0 && val <= hoverValue);
      btn.setAttribute("aria-checked", String(val === selectedRating));
    });
    if (ratingInput) {
      ratingInput.value = selectedRating > 0 ? String(selectedRating) : "";
    }
    if (ratingText) {
      ratingText.textContent =
        selectedRating > 0
          ? `${selectedRating} / 5 ${selectedRating === 1 ? "star" : "stars"}`
          : "Not rated";
    }
  }

  if (starButtons.length > 0) {
    starButtons.forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        const val = Number(btn.dataset.star);
        selectedRating = selectedRating === val ? 0 : val;
        renderStars();
      });

      btn.addEventListener("mouseenter", () => renderStars(Number(btn.dataset.star)));
      btn.addEventListener("mouseleave", () => renderStars(0));

      btn.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          const next = Math.min(starButtons.length - 1, idx + 1);
          selectedRating = Number(starButtons[next].dataset.star);
          renderStars();
          starButtons[next].focus();
        } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          const prev = Math.max(0, idx - 1);
          selectedRating = Number(starButtons[prev].dataset.star);
          renderStars();
          starButtons[prev].focus();
        }
      });
    });
  }

  // Live character counter for message
  if (messageInput && charCountEl) {
    const updateCounter = () => {
      const len = messageInput.value.length;
      charCountEl.textContent = `${len.toLocaleString()} / ${MAX_MESSAGE_LENGTH.toLocaleString()}`;
    };
    messageInput.addEventListener("input", updateCounter);
    updateCounter();
  }

  // Clear inline errors while editing
  if (emailInput) {
    emailInput.addEventListener("input", () => setFieldError(emailInput, emailErrorEl, ""));
  }
  if (typeSelect) {
    typeSelect.addEventListener("change", () => setFieldError(typeSelect, typeErrorEl, ""));
  }
  if (messageInput) {
    messageInput.addEventListener("input", () => setFieldError(messageInput, messageErrorEl, ""));
  }

  if (feedbackForm) {
    let isSubmitting = false;

    feedbackForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isSubmitting) return;

      setFeedbackStatus(null, "");

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const feedbackType = typeSelect ? typeSelect.value.trim() : "";
      const message = messageInput ? messageInput.value.trim() : "";
      const rating = ratingInput ? ratingInput.value.trim() : "";
      const honeypot = honeypotInput ? honeypotInput.value.trim() : "";

      let isValid = true;
      let firstInvalidField = null;

      // Validate optional email only when provided
      if (email && !isValidEmailAddress(email)) {
        setFieldError(emailInput, emailErrorEl, "Please enter a valid email address or leave this field blank.");
        isValid = false;
        firstInvalidField = firstInvalidField || emailInput;
      } else {
        setFieldError(emailInput, emailErrorEl, "");
      }

      // Validate required feedback type
      if (!feedbackType || !ALLOWED_FEEDBACK_TYPES.includes(feedbackType)) {
        setFieldError(typeSelect, typeErrorEl, "Please select a feedback type.");
        isValid = false;
        firstInvalidField = firstInvalidField || typeSelect;
      } else {
        setFieldError(typeSelect, typeErrorEl, "");
      }

      // Validate required feedback message
      if (!message) {
        setFieldError(messageInput, messageErrorEl, "Please enter your feedback message.");
        isValid = false;
        firstInvalidField = firstInvalidField || messageInput;
      } else if (message.length > MAX_MESSAGE_LENGTH) {
        setFieldError(
          messageInput,
          messageErrorEl,
          `Feedback message must be ${MAX_MESSAGE_LENGTH.toLocaleString()} characters or fewer.`
        );
        isValid = false;
        firstInvalidField = firstInvalidField || messageInput;
      } else {
        setFieldError(messageInput, messageErrorEl, "");
      }

      if (!isValid) {
        if (firstInvalidField) firstInvalidField.focus();
        return;
      }

      // Honeypot triggered — silently accept without sending
      if (honeypot) {
        setFeedbackStatus("success", "Thank you! Your feedback has been submitted.");
        feedbackForm.reset();
        selectedRating = 0;
        renderStars();
        return;
      }

      // Check Google Apps Script endpoint configuration before sending
      if (!isValidFeedbackEndpoint(GOOGLE_SHEETS_WEB_APP_URL)) {
        if (isLocalDevEnvironment()) {
          setFeedbackStatus(
            "warning",
            "<strong>Feedback endpoint not configured yet:</strong> Deploy <code>google-apps-script/Code.gs</code> and paste your Web App URL into <code>GOOGLE_SHEETS_WEB_APP_URL</code> in <code>js/script.js</code>. No data was sent.",
            true
          );
        } else {
          setFeedbackStatus(
            "warning",
            "Feedback submissions are temporarily unavailable while the form is being configured. No data was sent."
          );
        }
        return;
      }

      // Submit via simple URL-encoded POST (no custom headers -> no CORS preflight)
      isSubmitting = true;
      const submitTextEl = submitBtn ? submitBtn.querySelector(".feedback-submit__text") : null;
      if (submitBtn) submitBtn.disabled = true;
      if (submitTextEl) submitTextEl.textContent = "Submitting...";

      const payload = new URLSearchParams({
        name,
        email,
        feedbackType,
        rating,
        message,
        website: honeypot,
      });

      try {
        const response = await fetch(GOOGLE_SHEETS_WEB_APP_URL.trim(), {
          method: "POST",
          mode: "no-cors",
          body: payload,
        });

        // In no-cors mode, response.type is "opaque" and the browser cannot inspect status/body.
        if (response.type === "opaque") {
          setFeedbackStatus(
            "success",
            "Your feedback has been sent. Thank you for helping improve MINDTRACK! (Note: because this static site posts directly to Google Apps Script in no-cors mode, the browser cannot independently confirm server-side storage.)"
          );
        } else if (response.ok) {
          setFeedbackStatus("success", "Thank you! Your feedback was received and saved.");
        } else {
          throw new Error("Unexpected server response");
        }

        feedbackForm.reset();
        selectedRating = 0;
        renderStars();
        if (charCountEl) {
          charCountEl.textContent = `0 / ${MAX_MESSAGE_LENGTH.toLocaleString()}`;
        }
      } catch {
        setFeedbackStatus(
          "error",
          "Could not send your feedback right now. Please check your internet connection and try again."
        );
      } finally {
        isSubmitting = false;
        if (submitBtn) submitBtn.disabled = false;
        if (submitTextEl) submitTextEl.textContent = "Submit Feedback";
      }
    });
  }
})();
