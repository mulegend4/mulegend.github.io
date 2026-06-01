(function () {
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-pill, .mobile-nav-link"));
  var skillButtons = Array.prototype.slice.call(document.querySelectorAll("[data-skill]"));
  var projectCards = Array.prototype.slice.call(document.querySelectorAll(".project-card[data-skills]"));
  var filterBanner = document.getElementById("project-filter-banner");
  var filterLabel = document.getElementById("project-filter-label");
  var clearFilterButton = document.getElementById("clear-project-filter");
  var modal = document.getElementById("project-modal");
  var modalClose = document.getElementById("modal-close");
  var modalBackToTop = document.getElementById("modal-back-to-top");
  var projectButtons = Array.prototype.slice.call(document.querySelectorAll(".project-card[data-project]"));
  var modalContents = Array.prototype.slice.call(document.querySelectorAll("[data-modal-content]"));
  var backToTopButton = document.querySelector(".back-to-top-float");
  var homeSection = document.getElementById("home");
  var homeHintBubble = document.querySelector(".home-hover-zone span");
  var themeToggle = document.getElementById("theme-toggle");
  var mobileThemeToggle = document.getElementById("mobile-theme-toggle");
  var themeToggles = [themeToggle, mobileThemeToggle].filter(Boolean);
  var mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  var mobileNavPanel = document.getElementById("mobile-nav-panel");
  var mobileNavBackdrop = document.getElementById("mobile-nav-backdrop");
  var colorSchemeQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var timelineButtons = Array.prototype.slice.call(document.querySelectorAll("[data-experience-target]"));
  var experienceItems = Array.prototype.slice.call(document.querySelectorAll(".experience-item[id]"));
  var activeProjectTrigger = null;
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.indexOf("#") === 0 ? document.querySelector(id) : null;
    })
    .filter(Boolean);
  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function setActive(id) {
    navLinks.forEach(function (link) {
      var active = link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function updateActiveFromScroll() {
    var current = sections[0] ? sections[0].id : "";
    var targetLine = window.scrollY + Math.min(180, window.innerHeight * 0.28);

    sections.forEach(function (section) {
      if (section.offsetTop <= targetLine) {
        current = section.id;
      }
    });

    if (current) {
      setActive(current);
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getStoredTheme() {
    try {
      var saved = localStorage.getItem("portfolio-theme");
      return saved === "light" || saved === "dark" ? saved : "";
    } catch (error) {
      return "";
    }
  }

  function getSystemTheme() {
    return colorSchemeQuery && colorSchemeQuery.matches ? "dark" : "light";
  }

  function getPreferredTheme() {
    return getStoredTheme() || getSystemTheme();
  }

  function setTheme(theme, persist) {
    var lightMode = theme === "light";
    if (lightMode) {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    themeToggles.forEach(function (toggle) {
      var label = lightMode ? "Switch to dark mode" : "Switch to light mode";
      toggle.setAttribute("aria-label", label);
      toggle.setAttribute("aria-pressed", lightMode ? "true" : "false");
      toggle.setAttribute("data-tooltip", label);

      var visibleLabel = toggle.querySelector("span");
      if (visibleLabel) {
        visibleLabel.textContent = label;
      }
    });

    if (persist) {
      try {
        localStorage.setItem("portfolio-theme", lightMode ? "light" : "dark");
      } catch (error) {}
    }
  }

  function getCurrentTheme() {
    return document.documentElement.hasAttribute("data-theme") ? "light" : "dark";
  }

  function syncThemeFromSystem() {
    if (!getStoredTheme()) {
      setTheme(getSystemTheme(), false);
    }
  }

  function setMobileNavOpen(open) {
    document.documentElement.classList.toggle("mobile-nav-open", open);
    document.body.classList.toggle("mobile-nav-open", open);
    if (mobileMenuToggle) {
      mobileMenuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      mobileMenuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    }
    if (mobileNavPanel) {
      mobileNavPanel.setAttribute("aria-hidden", open ? "false" : "true");
    }
  }

  function canShowHomeHoverHint() {
    if (window.innerWidth <= 920) {
      return false;
    }
    return !window.matchMedia || window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function updateTimelineActive(activeId) {
    timelineButtons.forEach(function (button) {
      button.classList.toggle("timeline-active", button.getAttribute("data-experience-target") === activeId);
    });
  }

  function updateTimelineRelated(relatedId) {
    timelineButtons.forEach(function (button) {
      button.classList.toggle("timeline-related", button.getAttribute("data-experience-target") === relatedId);
    });
  }

  function openExperienceFromTimeline(targetId) {
    var target = document.getElementById(targetId);
    if (!target) return;

    experienceItems.forEach(function (item) {
      item.open = item === target;
    });

    updateTimelineActive(targetId);
    updateTimelineRelated("");
    target.scrollIntoView({ behavior: "smooth", block: "center" });

    var summary = target.querySelector("summary");
    if (summary) {
      window.setTimeout(function () {
        summary.focus({ preventScroll: true });
      }, 280);
    }
  }

  function updateScrollChrome() {
    var aboutSection = document.getElementById("about");
    var shrinkDistance = aboutSection ? Math.max(120, aboutSection.offsetTop * 0.25) : 240;
    var navProgress = clamp(window.scrollY / shrinkDistance, 0, 1);
    var cueProgress = clamp(window.scrollY / 90, 0, 1);
    var nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 120;

    document.documentElement.style.setProperty("--nav-progress", navProgress.toFixed(3));
    document.documentElement.style.setProperty("--scroll-cue-progress", cueProgress.toFixed(3));
    document.body.classList.toggle("has-scrolled", window.scrollY > 8);
    document.body.classList.toggle("at-page-end", nearBottom);
    if (window.scrollY > 8) {
      setHomeHintVisible(false);
    }
  }

  function updateModalBackToTop() {
    if (!modal) return;
    var active = !modal.hidden && modal.scrollTop > 260;
    modal.classList.toggle("modal-scrolled", active);
    document.body.classList.toggle("modal-project-scrolled", active);
  }

  function setHomeHintVisible(visible) {
    document.body.classList.toggle("home-lower-hover", visible);
    if (homeHintBubble) {
      homeHintBubble.style.opacity = visible ? "1" : "";
      homeHintBubble.style.transform = visible ? "translateY(0)" : "";
    }
  }

  function updateHomeHoverHint(event) {
    if (!homeSection || window.scrollY > 8 || !canShowHomeHoverHint()) {
      setHomeHintVisible(false);
      return;
    }

    var rect = homeSection.getBoundingClientRect();
    var hoveringLowerHome = event.clientY >= rect.top + rect.height * 0.75 && event.clientY <= rect.bottom;
    setHomeHintVisible(hoveringLowerHome);
  }

  function applySkillFilter(skill, label) {
    projectCards.forEach(function (card) {
      var skills = (card.getAttribute("data-skills") || "").split(/\s+/);
      card.classList.toggle("filtered-out", skills.indexOf(skill) === -1);
    });

    skillButtons.forEach(function (button) {
      button.classList.toggle("skill-active", button.getAttribute("data-skill") === skill);
    });

    if (filterBanner && filterLabel) {
      filterLabel.textContent = label;
      filterBanner.hidden = false;
    }

    document.getElementById("projects").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearSkillFilter() {
    projectCards.forEach(function (card) {
      card.classList.remove("filtered-out");
    });
    skillButtons.forEach(function (button) {
      button.classList.remove("skill-active");
    });
    if (filterBanner) {
      filterBanner.hidden = true;
    }
  }

  function setProjectModalContent(projectKey) {
    var activeContent = null;

    modalContents.forEach(function (content) {
      var active = content.getAttribute("data-modal-content") === projectKey;
      content.hidden = !active;
      if (active) {
        activeContent = content;
      }
    });

    if (modal && activeContent) {
      var title = activeContent.querySelector("h2");
      if (title && title.id) {
        modal.querySelector(".project-modal").setAttribute("aria-labelledby", title.id);
      }
    }

    return activeContent;
  }

  function activateProjectMedia(container) {
    Array.prototype.slice.call(container.querySelectorAll("[data-lazy-src]")).forEach(function (item) {
      if (!item.getAttribute("src")) {
        item.setAttribute("src", item.getAttribute("data-lazy-src"));
      }
    });
  }

  function resetProjectMedia() {
    modalContents.forEach(function (content) {
      Array.prototype.slice.call(content.querySelectorAll("[data-reset-on-close]")).forEach(function (item) {
        item.removeAttribute("src");
      });
    });
  }

  function openProjectModal(trigger) {
    if (!modal) return;
    var projectKey = trigger.getAttribute("data-project");
    var activeContent = setProjectModalContent(projectKey);
    if (!activeContent) return;
    activateProjectMedia(activeContent);
    activeProjectTrigger = trigger;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modal.scrollTop = 0;
    updateModalBackToTop();
    if (modalClose) {
      modalClose.focus();
    }
  }

  function closeProjectModal() {
    if (!modal) return;
    modal.hidden = true;
    modal.classList.remove("modal-scrolled");
    document.body.classList.remove("modal-project-scrolled");
    document.body.classList.remove("modal-open");
    resetProjectMedia();
    if (activeProjectTrigger) {
      activeProjectTrigger.focus();
    }
  }

  function revealVisibleItems() {
    revealItems.forEach(function (item) {
      var rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
        item.classList.add("visible");
      }
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      var id = link.getAttribute("href").slice(1);
      setActive(id);
      setMobileNavOpen(false);
      window.setTimeout(updateActiveFromScroll, 650);
    });
  });

  skillButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      applySkillFilter(button.getAttribute("data-skill"), button.getAttribute("data-skill-label"));
    });
  });

  if (clearFilterButton) {
    clearFilterButton.addEventListener("click", clearSkillFilter);
  }

  projectButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      openProjectModal(button);
    });
    button.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProjectModal(button);
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener("click", closeProjectModal);
  }

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeProjectModal();
      }
    });
    modal.addEventListener(
      "scroll",
      function () {
        window.requestAnimationFrame(updateModalBackToTop);
      },
      { passive: true }
    );
  }

  if (backToTopButton) {
    backToTopButton.addEventListener("click", function () {
      document.getElementById("home").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (homeSection) {
    homeSection.addEventListener("mousemove", updateHomeHoverHint);
    homeSection.addEventListener("mouseleave", function () {
      setHomeHintVisible(false);
    });
  }

  if (themeToggles.length) {
    setTheme(getPreferredTheme(), false);
    themeToggles.forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        setTheme(getCurrentTheme() === "light" ? "dark" : "light", true);
      });
    });
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", function () {
      setMobileNavOpen(!document.body.classList.contains("mobile-nav-open"));
    });
  }

  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener("click", function () {
      setMobileNavOpen(false);
    });
  }

  if (colorSchemeQuery) {
    if (colorSchemeQuery.addEventListener) {
      colorSchemeQuery.addEventListener("change", syncThemeFromSystem);
    } else if (colorSchemeQuery.addListener) {
      colorSchemeQuery.addListener(syncThemeFromSystem);
    }
  }

  timelineButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      openExperienceFromTimeline(button.getAttribute("data-experience-target"));
    });
  });

  experienceItems.forEach(function (item) {
    item.addEventListener("mouseenter", function () {
      updateTimelineRelated(item.id);
    });

    item.addEventListener("mouseleave", function () {
      updateTimelineRelated("");
    });

    item.addEventListener("focusin", function () {
      updateTimelineRelated(item.id);
    });

    item.addEventListener("focusout", function (event) {
      if (!item.contains(event.relatedTarget)) {
        updateTimelineRelated("");
      }
    });

    item.addEventListener("toggle", function () {
      if (item.open) {
        updateTimelineActive(item.id);
      } else {
        var activeTimeline = timelineButtons.find(function (button) {
          return button.classList.contains("timeline-active");
        });
        var activeId = activeTimeline ? activeTimeline.getAttribute("data-experience-target") : "";
        if (activeId === item.id) {
          var openItem = experienceItems.find(function (candidate) { return candidate.open; });
          updateTimelineActive(openItem ? openItem.id : "");
          updateTimelineRelated("");
        }
      }
    });
  });

  if (modalBackToTop && modal) {
    modalBackToTop.addEventListener("click", function () {
      modal.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && !modal.hidden) {
      closeProjectModal();
    }
    if (event.key === "Escape" && document.body.classList.contains("mobile-nav-open")) {
      setMobileNavOpen(false);
      if (mobileMenuToggle) {
        mobileMenuToggle.focus();
      }
    }
  });

  if ("IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        var visible = entries
          .filter(function (entry) {
            return entry.isIntersecting;
          })
          .sort(function (a, b) {
            return b.intersectionRatio - a.intersectionRatio;
          });

        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -66% 0px",
        threshold: [0.12, 0.28, 0.5]
      }
    );

    sections.forEach(function (section) {
      navObserver.observe(section);
    });

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.1
      }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });

    window.requestAnimationFrame(revealVisibleItems);
    window.addEventListener("load", revealVisibleItems);
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("visible");
    });
  }

  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateActiveFromScroll();
          updateScrollChrome();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  updateActiveFromScroll();
  updateScrollChrome();
  window.addEventListener("resize", function () {
    updateScrollChrome();
    if (window.innerWidth > 920) {
      setMobileNavOpen(false);
    }
  });
  window.addEventListener("load", updateScrollChrome);
})();
