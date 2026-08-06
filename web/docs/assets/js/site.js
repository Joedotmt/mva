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
})();
