(function () {
  "use strict";

  var MOBILE_QUERY = "(max-width: 899px)";
  var FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  function directChild(parent, selector) {
    if (!parent) {
      return null;
    }

    try {
      return parent.querySelector(":scope > " + selector);
    } catch (error) {
      return Array.prototype.find.call(parent.children, function (child) {
        return child.matches(selector);
      }) || null;
    }
  }

  function visibleFocusableElements(container) {
    if (!container) {
      return [];
    }

    return Array.prototype.filter.call(
      container.querySelectorAll(FOCUSABLE_SELECTOR),
      function (element) {
        return !element.hidden &&
          element.getAttribute("aria-hidden") !== "true" &&
          element.getClientRects().length > 0;
      }
    );
  }

  onReady(function () {
    var root = document.documentElement;
    var body = document.body;
    var nav = document.querySelector(".site-nav");
    var navToggle = document.querySelector("[data-nav-toggle], .nav-toggle");
    var mobileQuery = window.matchMedia(MOBILE_QUERY);
    var dropdowns = [];
    var navIsOpen = false;
    var dropdownIndex = 0;

    root.classList.remove("no-js");
    root.classList.add("js");

    function setInert(element, value) {
      if (element && "inert" in element) {
        element.inert = value;
      }
    }

    function setDropdownState(dropdown, open, focusTarget) {
      if (!dropdown) {
        return;
      }

      dropdown.open = open;
      dropdown.item.classList.toggle("is-open", open);
      dropdown.menu.classList.toggle("is-open", open);
      dropdown.trigger.setAttribute("aria-expanded", String(open));
      dropdown.menu.setAttribute("aria-hidden", String(!open));
      setInert(dropdown.menu, !open);

      if (open) {
        dropdowns.forEach(function (otherDropdown) {
          if (otherDropdown !== dropdown && !dropdown.item.contains(otherDropdown.item)) {
            setDropdownState(otherDropdown, false);
          }
        });
      }

      if (open && focusTarget) {
        var items = visibleFocusableElements(dropdown.menu);
        var target = focusTarget === "last" ? items[items.length - 1] : items[0];

        if (target) {
          target.focus();
        }
      }
    }

    function closeAllDropdowns(except) {
      dropdowns.forEach(function (dropdown) {
        if (dropdown !== except) {
          setDropdownState(dropdown, false);
        }
      });
    }

    function syncNavAccessibility() {
      if (!nav) {
        return;
      }

      if (mobileQuery.matches) {
        nav.setAttribute("aria-hidden", String(!navIsOpen));
        setInert(nav, !navIsOpen);
      } else {
        nav.removeAttribute("aria-hidden");
        setInert(nav, false);
      }
    }

    function openNav() {
      if (!nav || !navToggle || !mobileQuery.matches) {
        return;
      }

      navIsOpen = true;
      body.classList.add("nav-open");
      nav.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close navigation menu");
      syncNavAccessibility();

      window.setTimeout(function () {
        var firstLink = visibleFocusableElements(nav)[0];
        if (firstLink) {
          firstLink.focus();
        }
      }, 0);
    }

    function closeNav(restoreFocus) {
      if (!nav || !navToggle) {
        return;
      }

      navIsOpen = false;
      body.classList.remove("nav-open");
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation menu");
      closeAllDropdowns();
      syncNavAccessibility();

      if (restoreFocus) {
        navToggle.focus();
      }
    }

    function toggleNav() {
      if (navIsOpen) {
        closeNav(true);
      } else {
        openNav();
      }
    }

    if (nav && navToggle) {
      if (!nav.id) {
        nav.id = "primary-navigation";
      }

      navToggle.type = "button";
      navToggle.setAttribute("aria-controls", nav.id);
      navToggle.setAttribute("aria-expanded", "false");

      if (!navToggle.getAttribute("aria-label")) {
        navToggle.setAttribute("aria-label", "Open navigation menu");
      }

      navToggle.addEventListener("click", toggleNav);
      syncNavAccessibility();
    }

    Array.prototype.forEach.call(
      document.querySelectorAll(".has-dropdown"),
      function (item) {
        var trigger = directChild(
          item,
          ".dropdown-toggle, button, a[aria-haspopup='true']"
        );
        var menu = directChild(item, ".dropdown, .dropdown-menu, ul");

        if (!trigger || !menu) {
          return;
        }

        dropdownIndex += 1;

        if (!menu.id) {
          menu.id = "nav-dropdown-" + dropdownIndex;
        }

        if (trigger.tagName === "BUTTON") {
          trigger.type = "button";
        }

        trigger.setAttribute("aria-haspopup", "true");
        trigger.setAttribute("aria-controls", menu.id);
        trigger.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
        setInert(menu, true);

        var dropdown = {
          item: item,
          trigger: trigger,
          menu: menu,
          open: false
        };

        dropdowns.push(dropdown);

        trigger.addEventListener("click", function (event) {
          event.preventDefault();
          setDropdownState(dropdown, !dropdown.open);
        });

        trigger.addEventListener("keydown", function (event) {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setDropdownState(dropdown, true, "first");
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setDropdownState(dropdown, true, "last");
          } else if (event.key === "Escape" && dropdown.open) {
            event.preventDefault();
            event.stopPropagation();
            setDropdownState(dropdown, false);
          }
        });

        menu.addEventListener("keydown", function (event) {
          var items = visibleFocusableElements(menu);
          var currentIndex = items.indexOf(document.activeElement);
          var nextIndex;

          if (!items.length) {
            return;
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            items[nextIndex].focus();
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            items[nextIndex].focus();
          } else if (event.key === "Home") {
            event.preventDefault();
            items[0].focus();
          } else if (event.key === "End") {
            event.preventDefault();
            items[items.length - 1].focus();
          } else if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            setDropdownState(dropdown, false);
            trigger.focus();
          }
        });

        item.addEventListener("pointerenter", function (event) {
          if (!mobileQuery.matches && event.pointerType !== "touch") {
            setDropdownState(dropdown, true);
          }
        });

        item.addEventListener("pointerleave", function (event) {
          if (!mobileQuery.matches &&
              event.pointerType !== "touch" &&
              !item.contains(document.activeElement)) {
            setDropdownState(dropdown, false);
          }
        });

        item.addEventListener("focusout", function (event) {
          if (!item.contains(event.relatedTarget)) {
            setDropdownState(dropdown, false);
          }
        });
      }
    );

    document.addEventListener("click", function (event) {
      var clickedDropdown = event.target.closest(".has-dropdown");

      if (!clickedDropdown) {
        closeAllDropdowns();
      }

      if (navIsOpen && nav && navToggle &&
          !nav.contains(event.target) &&
          !navToggle.contains(event.target)) {
        closeNav(false);
      }
    });

    if (nav) {
      nav.addEventListener("click", function (event) {
        var link = event.target.closest("a[href]");

        if (link && !link.classList.contains("dropdown-toggle") && mobileQuery.matches) {
          closeNav(false);
        }
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        var focusedDropdown = dropdowns.find(function (dropdown) {
          return dropdown.open && dropdown.item.contains(document.activeElement);
        });
        var openDropdown = focusedDropdown || dropdowns.find(function (dropdown) {
          return dropdown.open;
        });

        if (openDropdown) {
          event.preventDefault();
          setDropdownState(openDropdown, false);
          openDropdown.trigger.focus();
        } else if (navIsOpen) {
          event.preventDefault();
          closeNav(true);
        }
      }

      if (event.key === "Tab" && navIsOpen && mobileQuery.matches && nav && navToggle) {
        var focusables = [navToggle].concat(visibleFocusableElements(nav));
        var first = focusables[0];
        var last = focusables[focusables.length - 1];

        if (!focusables.length) {
          return;
        }

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    function handleViewportChange() {
      if (!mobileQuery.matches) {
        closeNav(false);
      } else {
        navIsOpen = false;
        if (nav) {
          nav.classList.remove("is-open");
        }
        if (navToggle) {
          navToggle.setAttribute("aria-expanded", "false");
        }
        body.classList.remove("nav-open");
        closeAllDropdowns();
        syncNavAccessibility();
      }
    }

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", handleViewportChange);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(handleViewportChange);
    }
  });

  onReady(function () {
    var entries = document.querySelectorAll(".page-events .event-entry");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function element(tagName, className, textContent) {
      var node = document.createElement(tagName);

      if (className) {
        node.className = className;
      }

      if (textContent) {
        node.textContent = textContent;
      }

      return node;
    }

    function imageRecord(figure) {
      var image = figure.querySelector("img");

      return {
        figure: figure,
        image: image,
        src: image.getAttribute("src"),
        alt: image.getAttribute("alt") || "Event photograph",
        width: parseInt(image.getAttribute("width"), 10) || 0,
        height: parseInt(image.getAttribute("height"), 10) || 0
      };
    }

    function automaticFeaturedIndex(records) {
      var bestIndex = 0;
      var bestScore = -Infinity;

      records.forEach(function (record, index) {
        var ratio = record.height ? record.width / record.height : 1;
        var area = record.width * record.height;
        var landscapeBonus = ratio >= 1.15 && ratio <= 2 ? 4 : 0;
        var balancedBonus = ratio >= 0.75 && ratio < 1.15 ? 2 : 0;
        var resolutionBonus = Math.min(area / 1000000, 4);
        var score = landscapeBonus + balancedBonus + resolutionBonus;

        if (score > bestScore) {
          bestIndex = index;
          bestScore = score;
        }
      });

      return bestIndex;
    }

    Array.prototype.forEach.call(entries, function (entry, entryIndex) {
      var photos = Array.prototype.filter.call(
        entry.querySelectorAll(".event-photo"),
        function (photo) {
          return Boolean(photo.querySelector("img"));
        }
      );

      if (photos.length < 5) {
        return;
      }

      var records = photos.map(imageRecord);
      var heading = entry.querySelector(".event-entry__title, h3");
      var eventName = heading ? heading.textContent.trim() : "this event";
      var entryContent = entry.querySelector(".event-entry__content") || entry;
      var requestedIndex = parseInt(entry.getAttribute("data-featured-photo"), 10) - 1;
      var startingIndex = requestedIndex >= 0 && requestedIndex < records.length
        ? requestedIndex
        : automaticFeaturedIndex(records);
      var baseId = heading && heading.id
        ? heading.id
        : "event-photo-story-" + (entryIndex + 1);
      var galleryTitleId = baseId + "-gallery-title";
      var galleryStatusId = baseId + "-gallery-status";
      var stageImageId = baseId + "-gallery-image";
      var showcase = element("section", "event-showcase");
      var showcaseHeader = element("div", "event-showcase__header");
      var showcaseTitle = element("h4", "event-showcase__title", "Moments from the event");
      var status = element("p", "event-showcase__status");
      var stage = element("div", "event-showcase__stage");
      var backdrop = element("img", "event-showcase__backdrop");
      var stageImage = element("img", "event-showcase__image");
      var previous = element("button", "event-showcase__control event-showcase__control--previous");
      var next = element("button", "event-showcase__control event-showcase__control--next");
      var previousIcon = element("span", "", "‹");
      var nextIcon = element("span", "", "›");
      var track = element("div", "event-carousel__track");
      var thumbnails = [];
      var sourceLayouts = [];
      var activeIndex = startingIndex;
      var pointerStartX = null;
      var pointerStartY = null;
      var changeTimer = null;

      entry.classList.add("event-entry--carousel");
      showcase.setAttribute("aria-labelledby", galleryTitleId);
      showcaseTitle.id = galleryTitleId;
      status.id = galleryStatusId;
      status.setAttribute("aria-live", "polite");
      status.setAttribute("aria-atomic", "true");
      stage.setAttribute("aria-describedby", galleryStatusId);
      stageImage.id = stageImageId;
      stageImage.loading = "lazy";
      stageImage.decoding = "async";
      stageImage.draggable = false;
      backdrop.alt = "";
      backdrop.loading = "lazy";
      backdrop.decoding = "async";
      backdrop.draggable = false;
      backdrop.setAttribute("aria-hidden", "true");
      previous.type = "button";
      previous.setAttribute("aria-label", "Previous photograph from " + eventName);
      previous.setAttribute("aria-controls", stageImageId);
      next.type = "button";
      next.setAttribute("aria-label", "Next photograph from " + eventName);
      next.setAttribute("aria-controls", stageImageId);
      previousIcon.setAttribute("aria-hidden", "true");
      nextIcon.setAttribute("aria-hidden", "true");
      previous.appendChild(previousIcon);
      next.appendChild(nextIcon);
      track.setAttribute("aria-label", "Choose a photograph from " + eventName);

      records.forEach(function (record, index) {
        var layout = record.figure.closest(".event-layout");
        var thumbnail = element("button", "event-carousel__thumbnail");
        var number = element("span", "event-carousel__number", String(index + 1));

        if (layout && sourceLayouts.indexOf(layout) === -1) {
          sourceLayouts.push(layout);
        }

        record.figure.className = "event-carousel__item";
        record.image.className = "event-carousel__thumbnail-image";
        record.image.alt = "";
        record.image.setAttribute("aria-hidden", "true");
        thumbnail.type = "button";
        thumbnail.setAttribute(
          "aria-label",
          "Show photograph " + (index + 1) + " of " + records.length + " from " + eventName
        );
        thumbnail.setAttribute("aria-controls", stageImageId);
        thumbnail.setAttribute("data-carousel-index", String(index));
        thumbnail.appendChild(record.image);
        thumbnail.appendChild(number);
        record.figure.appendChild(thumbnail);
        track.appendChild(record.figure);
        thumbnails.push(thumbnail);
      });

      sourceLayouts.forEach(function (layout) {
        Array.prototype.forEach.call(
          layout.children,
          function (emptyItem) {
            if (emptyItem.classList.contains("event-layout__item--empty")) {
              emptyItem.remove();
            }
          }
        );

        if (!layout.children.length) {
          layout.remove();
        } else {
          layout.classList.add("event-layout--content-only");
        }
      });

      showcaseHeader.appendChild(showcaseTitle);
      showcaseHeader.appendChild(status);
      stage.appendChild(backdrop);
      stage.appendChild(stageImage);
      stage.appendChild(previous);
      stage.appendChild(next);
      showcase.appendChild(showcaseHeader);
      showcase.appendChild(stage);
      showcase.appendChild(track);
      entryContent.appendChild(showcase);

      function centerThumbnail(thumbnail) {
        var left = thumbnail.offsetLeft - ((track.clientWidth - thumbnail.offsetWidth) / 2);
        var behavior = reducedMotion.matches ? "auto" : "smooth";

        if (typeof track.scrollTo === "function") {
          track.scrollTo({ left: Math.max(0, left), behavior: behavior });
        } else {
          track.scrollLeft = Math.max(0, left);
        }
      }

      function updateDimension(attribute, value) {
        if (value) {
          stageImage.setAttribute(attribute, String(value));
          backdrop.setAttribute(attribute, String(value));
        } else {
          stageImage.removeAttribute(attribute);
          backdrop.removeAttribute(attribute);
        }
      }

      function showPhoto(index, options) {
        var settings = options || {};
        var normalizedIndex = (index + records.length) % records.length;
        var record = records[normalizedIndex];

        if (settings.animate !== false) {
          stage.classList.add("is-changing");
          window.clearTimeout(changeTimer);
        }

        activeIndex = normalizedIndex;
        stageImage.src = record.src;
        stageImage.alt = record.alt;
        backdrop.src = record.src;
        updateDimension("width", record.width);
        updateDimension("height", record.height);
        status.textContent = "Photo " + (normalizedIndex + 1) + " of " + records.length;

        thumbnails.forEach(function (thumbnail, thumbnailIndex) {
          var isCurrent = thumbnailIndex === normalizedIndex;

          thumbnail.tabIndex = isCurrent ? 0 : -1;

          if (isCurrent) {
            thumbnail.setAttribute("aria-current", "true");
          } else {
            thumbnail.removeAttribute("aria-current");
          }
        });

        if (settings.scroll !== false) {
          centerThumbnail(thumbnails[normalizedIndex]);
        }

        if (settings.focusThumbnail) {
          thumbnails[normalizedIndex].focus();
        }

        changeTimer = window.setTimeout(function () {
          stage.classList.remove("is-changing");
        }, settings.animate === false ? 0 : 180);
      }

      thumbnails.forEach(function (thumbnail, index) {
        thumbnail.addEventListener("click", function () {
          showPhoto(index, { scroll: false });
        });

        thumbnail.addEventListener("keydown", function (event) {
          var nextIndex;

          if (event.key === "ArrowRight") {
            nextIndex = index + 1;
          } else if (event.key === "ArrowLeft") {
            nextIndex = index - 1;
          } else if (event.key === "Home") {
            nextIndex = 0;
          } else if (event.key === "End") {
            nextIndex = records.length - 1;
          } else {
            return;
          }

          event.preventDefault();
          showPhoto(nextIndex, { focusThumbnail: true });
        });
      });

      previous.addEventListener("click", function () {
        showPhoto(activeIndex - 1);
      });

      next.addEventListener("click", function () {
        showPhoto(activeIndex + 1);
      });

      stage.addEventListener("pointerdown", function (event) {
        if (!event.isPrimary || event.target.closest("button")) {
          return;
        }

        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
      });

      stage.addEventListener("pointerup", function (event) {
        if (pointerStartX === null || pointerStartY === null) {
          return;
        }

        var distanceX = event.clientX - pointerStartX;
        var distanceY = event.clientY - pointerStartY;

        pointerStartX = null;
        pointerStartY = null;

        if (Math.abs(distanceX) >= 48 && Math.abs(distanceX) > Math.abs(distanceY) * 1.2) {
          showPhoto(activeIndex + (distanceX < 0 ? 1 : -1));
        }
      });

      stage.addEventListener("pointercancel", function () {
        pointerStartX = null;
        pointerStartY = null;
      });

      showPhoto(startingIndex, { animate: false, scroll: false });
    });
  });
})();
