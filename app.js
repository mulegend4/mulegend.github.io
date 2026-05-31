(function () {
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-pill"));
  var skillButtons = Array.prototype.slice.call(document.querySelectorAll("[data-skill]"));
  var projectCards = Array.prototype.slice.call(document.querySelectorAll(".project-card[data-skills]"));
  var filterBanner = document.getElementById("project-filter-banner");
  var filterLabel = document.getElementById("project-filter-label");
  var clearFilterButton = document.getElementById("clear-project-filter");
  var modal = document.getElementById("project-modal");
  var modalClose = document.getElementById("modal-close");
  var projectButtons = Array.prototype.slice.call(document.querySelectorAll(".project-card[data-project]"));
  var modalContents = Array.prototype.slice.call(document.querySelectorAll("[data-modal-content]"));
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

  function openProjectModal(trigger) {
    if (!modal) return;
    var projectKey = trigger.getAttribute("data-project");
    if (!setProjectModalContent(projectKey)) return;
    activeProjectTrigger = trigger;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modal.scrollTop = 0;
    if (modalClose) {
      modalClose.focus();
    }
  }

  function closeProjectModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
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
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && !modal.hidden) {
      closeProjectModal();
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
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  updateActiveFromScroll();
})();
