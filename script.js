  window.addEventListener("DOMContentLoaded", (event) => {
  
    // ✅ Lazy load all <video> elements with data-src
    const videos = document.querySelectorAll("video[data-src]");

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target;
          const src = video.getAttribute("data-src");
          if (src) {
            video.setAttribute("src", src);
            video.load();
            observer.unobserve(video);
          }
        }
      });
    });

    videos.forEach(video => {
      observer.observe(video);
    });
    
    // ✅ Populate hidden form fields (works for multiple forms on the page)
    document.querySelectorAll('.page-url-field').forEach(function(field) {
      field.value = window.location.href;
    });

    document.querySelectorAll('.page-title-field').forEach(function(field) {
      field.value = document.title;
    });
  
  	// ✅ NAV
    let navButton = $(".m_nav_button");
    let menuWrap = $(".m_nav_menu");
    let menuPanels = $(".menu_panel");
    let content = $(".m_menu_categories");
    let lines = $(".nav_button_line");
    let backButton = $(".go-back");
    let opensMore = $(".opens-more");
    let previouslyFocused;
    let activeSubPanel;
    let mm = gsap.matchMedia();

    mm.add("(max-width: 991px)", () => {
      let showSubMenu = gsap.timeline({
        paused: true,
        onComplete: () => {
          activeSubPanel.find("a").first().focus();
        },
        onReverseComplete: () => {
          previouslyFocused.focus();
        }
      });
      showSubMenu.to(menuPanels, {
        x: "-100%",
        ease: "power1.inOut",
        duration: 0.4
      });

      let showMainMenu = gsap.timeline({
        paused: true,
        defaults: { duration: 0.3 },
        onReverseComplete: () => {
          showSubMenu.progress(0);
          showSubMenu.pause();
          navButton.attr("aria-label", "Open Main Menu");
        },
        onComplete: () => {
          menuWrap.find("button").first().focus();
          navButton.attr("aria-label", "Close Main Menu");
        }
      });
      showMainMenu.set(menuWrap, { display: "flex" });
      showMainMenu.from(menuWrap, { x: "100%" });
      showMainMenu.to(lines.eq(0), { y: 3, rotate: 45 }, "<");
      showMainMenu.to(lines.eq(1), { y: -4, rotate: -45 }, "<");

      navButton.on("click", function () {
        if (showMainMenu.progress() === 0) {
          showMainMenu.play();
        } else {
          showMainMenu.reverse();
          navButton.attr("aria-label", "Open Main Menu");
        }
      });

      $(document).on("keydown", function (e) {
        if (e.key === "Escape") showMainMenu.reverse();
      });

      opensMore.on("click", function () {
        previouslyFocused = $(this);
        let linkIndex = $(this).index();
        showSubMenu.play();
        content.hide();
        activeSubPanel = content.eq(linkIndex).show();
      });

      backButton.on("click", function () {
        showSubMenu.reverse();
      });

      backButton.on("keydown", function (e) {
        if (e.key === "Tab" && e.shiftKey) {
          e.preventDefault();
          activeSubPanel.find("a, button").last().focus();
        }
      });

      $("[trap-focus]").each(function () {
        let focusBack = $(this).attr("focus-back");
        let lastItem = $(this).find("a, button").last();
        lastItem.on("keydown", function (e) {
          if (e.key === "Tab" && !e.shiftKey) {
            e.preventDefault();
            if (focusBack === "true") {
              backButton.focus();
            } else {
              navButton.focus();
            }
          }
        });
      });
    });

    // Header scroll animation
    gsap.registerPlugin(ScrollTrigger);

    const nav = document.querySelector(".nav_wrap");
    const styles = getComputedStyle(document.documentElement);
    const bg60 = styles.getPropertyValue("--swatch--60-black").trim();
    const bg80 = styles.getPropertyValue("--swatch--80-black").trim();

    // Ensure header is visible immediately
    gsap.set(nav, {
      opacity: 1,
      backgroundColor: bg60
    });

    // Scroll-based background change
    ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: ({ progress }) => {
        gsap.to(nav, {
          backgroundColor: progress < 0.02 ? bg60 : bg80,
          duration: 0.4,
          overwrite: "auto"
        });
      }
    });

    // Force recalculation (Webflow-safe)
    setTimeout(() => {
      ScrollTrigger.refresh();
      ScrollTrigger.update();
    }, 50);


    // Current page nav link highlight
    window.Webflow ||= [];
    window.Webflow.push(() => {
      // Slight delay to wait for DOM updates
      requestAnimationFrame(() => {
        setTimeout(() => {
          const currentPath = window.location.pathname.replace(/\/$/, "");
          const firstSegment = currentPath.split("/")[1];

          document.querySelectorAll(".nav_menu_text[href]").forEach(link => {
            const href = link.getAttribute("href").replace(/\/$/, "");
            if (currentPath === href || currentPath.startsWith(href + "/")) {
              link.classList.add("w--current");
            } else {
              link.classList.remove("w--current"); // Optional: clean up
            }
          });

          const hubFolders = [
            "hub", "aftersales", "case-studies", "brands", "about",
            "ait", "josam", "truckcam", "rehobot", "cattini", "treadreader"
          ];
          if (hubFolders.includes(firstSegment)) {
            const hubNav = document.querySelector(".nav_menu_text.nav-hub");
            if (hubNav) {
              hubNav.classList.add("w--current");
            }
          }
        }, 50); // 50ms delay to allow Webflow DOM updates
      });
    });

    // ✅ Touch hover support for Webflow hover interactions
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
      document.querySelectorAll('.ge_product_card, .d_nav_card, .hub_card, .info_card').forEach(card => {
        let isHovered = false;

        card.addEventListener('touchstart', () => {
          if (!isHovered) {
            isHovered = true;
            card.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
          }
        });

        card.addEventListener('touchend', () => {
          if (isHovered) {
            isHovered = false;
            card.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
          }
        });
      });
    }

    // ✅ Optional cleanup placeholder
    return () => {
      // Optional: clean up logic here if needed
    };
  });
