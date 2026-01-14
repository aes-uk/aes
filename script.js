window.Webflow ||= [];
window.Webflow.push(function () {

  // ✅ Lazy load all <video> elements with data-src
  const videos = document.querySelectorAll("video[data-src]");
  if (videos.length) {
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
    videos.forEach(video => observer.observe(video));
  }

  // ✅ Populate hidden form fields
  document.querySelectorAll('.page-url-field').forEach(field => field.value = window.location.href);
  document.querySelectorAll('.page-title-field').forEach(field => field.value = document.title);

  // ✅ NAV (guard jQuery + GSAP)
  if (typeof window.jQuery === "undefined") {
    console.warn("jQuery not found (Webflow usually provides it).");
    return;
  }
  if (typeof window.gsap === "undefined") {
    console.warn("GSAP not found.");
    return;
  }

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

  // 🔥 IMPORTANT: remove previous handlers (prevents double-binding if code runs twice)
  navButton.off("click.aesnav");
  opensMore.off("click.aesnav");
  backButton.off("click.aesnav");
  $(document).off("keydown.aesnav");

  mm.add("(max-width: 991px)", () => {

    let showSubMenu = gsap.timeline({
      paused: true,
      onComplete: () => { if (activeSubPanel) activeSubPanel.find("a").first().focus(); },
      onReverseComplete: () => { if (previouslyFocused) previouslyFocused.focus(); }
    }).to(menuPanels, { x: "-100%", ease: "power1.inOut", duration: 0.4 });

    let showMainMenu = gsap.timeline({
      paused: true,
      defaults: { duration: 0.3 },
      onReverseComplete: () => {
        showSubMenu.progress(0).pause();
        navButton.attr("aria-label", "Open Main Menu");
      },
      onComplete: () => {
        menuWrap.find("button, a").first().focus();
        navButton.attr("aria-label", "Close Main Menu");
      }
    });

    showMainMenu.set(menuWrap, { display: "flex" })
      .from(menuWrap, { x: "100%" })
      .to(lines.eq(0), { y: 3, rotate: 45 }, "<")
      .to(lines.eq(1), { y: -4, rotate: -45 }, "<");

    navButton.on("click.aesnav", function () {
      if (showMainMenu.progress() === 0) showMainMenu.play();
      else showMainMenu.reverse();
    });

    $(document).on("keydown.aesnav", function (e) {
      if (e.key === "Escape") showMainMenu.reverse();
    });

    opensMore.on("click.aesnav", function () {
      previouslyFocused = $(this);

      // ✅ correct index
      let linkIndex = opensMore.index(this);

      content.hide();
      activeSubPanel = content.eq(linkIndex).show();
      showSubMenu.play();
    });

    backButton.on("click.aesnav", function () {
      showSubMenu.reverse();
    });

    backButton.on("keydown", function (e) {
      if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        if (activeSubPanel) activeSubPanel.find("a, button").last().focus();
      }
    });

    $("[trap-focus]").each(function () {
      let focusBack = $(this).attr("focus-back");
      let lastItem = $(this).find("a, button").last();
      lastItem.off("keydown.aestrap").on("keydown.aestrap", function (e) {
        if (e.key === "Tab" && !e.shiftKey) {
          e.preventDefault();
          if (focusBack === "true") backButton.focus();
          else navButton.focus();
        }
      });
    });
  });

  // Header scroll animation (guard ScrollTrigger)
  if (typeof window.ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const nav = document.querySelector(".nav_wrap");
    if (nav) {
      const styles = getComputedStyle(document.documentElement);
      const bg60 = styles.getPropertyValue("--swatch--60-black").trim();
      const bg80 = styles.getPropertyValue("--swatch--80-black").trim();

      gsap.set(nav, { opacity: 1, backgroundColor: bg60 });

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

      setTimeout(() => {
        ScrollTrigger.refresh();
        ScrollTrigger.update();
      }, 50);
    }
  }

  // Current page nav highlight (can live here; no need for nested Webflow.push)
  requestAnimationFrame(() => {
    setTimeout(() => {
      const currentPath = window.location.pathname.replace(/\/$/, "");
      const firstSegment = currentPath.split("/")[1];

      document.querySelectorAll(".nav_menu_text[href]").forEach(link => {
        const href = link.getAttribute("href").replace(/\/$/, "");
        if (currentPath === href || currentPath.startsWith(href + "/")) link.classList.add("w--current");
        else link.classList.remove("w--current");
      });

      const hubFolders = ["hub","aftersales","case-studies","brands","about","ait","josam","truckcam","rehobot","cattini","treadreader"];
      if (hubFolders.includes(firstSegment)) {
        const hubNav = document.querySelector(".nav_menu_text.nav-hub");
        if (hubNav) hubNav.classList.add("w--current");
      }
    }, 50);
  });

  // Touch hover support
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

});
