(function () {
  "use strict";

  var DATA_URL = "projects.json";
  var OPEN_CLASS = "is-open";

  var list = document.getElementById("project-list");
  var yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (!list) return;


  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function safeUrl(url) {
    if (typeof url !== "string") return null;
    try {
      var parsed = new URL(url, window.location.href);
      return parsed.protocol === "http:" || parsed.protocol === "https:"
        ? parsed.href
        : null;
    } catch (e) {
      return null;
    }
  }

  function makeButton(label, url) {
    var href = safeUrl(url);
    if (!href) return null;
    var a = el("a", "btn", label);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  }


  function buildCard(project, index) {
    var card = el("article", "project-card");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-expanded", "false");

    var detailsId = "project-details-" + index;

    card.appendChild(el("p", "project-category", project.category || "Project"));
    card.appendChild(el("h3", "project-title", project.title || "Untitled"));

    var desc = el("p", "project-desc", project.description || "");
    desc.id = detailsId;
    card.appendChild(desc);
    card.setAttribute("aria-describedby", detailsId);

    var tech = el("ul", "project-tech");
    var stack = Array.isArray(project.techStack) ? project.techStack : [];
    stack.forEach(function (item) {
      tech.appendChild(el("li", null, String(item)));
    });
    card.appendChild(tech);

    var links = el("div", "project-links");
    var demo = makeButton("Live demo", project.demoUrl);
    var repo = makeButton("Source code", project.repoUrl);
    if (demo) links.appendChild(demo);
    if (repo) links.appendChild(repo);
    card.appendChild(links);

    return card;
  }

  function renderProjects(projects) {
    list.textContent = "";

    if (!Array.isArray(projects) || projects.length === 0) {
      list.appendChild(el("p", "status", "No projects yet. Check back soon."));
      return;
    }

    var fragment = document.createDocumentFragment();
    projects.forEach(function (project, i) {
      fragment.appendChild(buildCard(project, i));
    });
    list.appendChild(fragment);
  }

  function renderError() {
    list.textContent = "";
    var msg = el(
      "p",
      "status",
      "Could not load projects.json. Check that the file exists next to index.html and contains valid JSON."
    );
    msg.setAttribute("role", "alert");
    list.appendChild(msg);
  }


  function setOpen(card, open) {
    card.classList.toggle(OPEN_CLASS, open);
    card.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function closeAll(except) {
    list.querySelectorAll(".project-card." + OPEN_CLASS).forEach(function (card) {
      if (card !== except) setOpen(card, false);
    });
  }

  list.addEventListener("click", function (event) {
    if (event.target.closest("a")) return;

    var card = event.target.closest(".project-card");
    if (!card) return;

    var willOpen = !card.classList.contains(OPEN_CLASS);
    closeAll(card);
    setOpen(card, willOpen);
  });

  list.addEventListener("keydown", function (event) {
    var card = event.target.closest(".project-card");
    if (!card || event.target !== card) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      var willOpen = !card.classList.contains(OPEN_CLASS);
      closeAll(card);
      setOpen(card, willOpen);
    } else if (event.key === "Escape") {
      setOpen(card, false);
    }
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".project-card")) {
      closeAll(null);
    }
  });


  fetch(DATA_URL, { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(renderProjects)
    .catch(function (error) {
      console.error("Failed to load projects:", error);
      renderError();
    });
})();