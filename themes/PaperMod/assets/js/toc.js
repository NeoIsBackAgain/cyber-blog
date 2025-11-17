window.addEventListener('DOMContentLoaded', function () {
  const toc = document.querySelector(".toc");
  if (!toc) return;

  const headings = document.querySelectorAll("h1, h2, h3");
  const tocLinks = toc.querySelectorAll("a");

  // --- 🪄 動畫控制 ---
  function openAnimated(details) {
    if (details.classList.contains("open")) return;
    details.open = true;
    const ul = details.querySelector(":scope > ul");
    if (ul) {
      ul.style.maxHeight = ul.scrollHeight + "px";
      details.classList.add("open");
    }
  }

  function closeAnimated(details) {
    const ul = details.querySelector(":scope > ul");
    if (ul && details.classList.contains("open")) {
      ul.style.maxHeight = ul.scrollHeight + "px";
      requestAnimationFrame(() => {
        ul.style.maxHeight = "0";
        details.classList.remove("open");
      });
      setTimeout(() => (details.open = false), 350);
    }
  }

  // --- 🧠 工具：找出 heading level ---
  function getHeadingLevelFromLink(a) {
    const id = a.getAttribute("href").substring(1);
    const target = document.getElementById(id);
    if (!target) return 1;
    const tag = target.tagName.toLowerCase();
    return tag === "h1" ? 1 : tag === "h2" ? 2 : tag === "h3" ? 3 : 1;
  }

  // --- 🕹️ 初始化：H2 永遠展開 ---
  toc.querySelectorAll("details").forEach((d) => {
    const firstLink = d.querySelector("a");
    const level = firstLink ? getHeadingLevelFromLink(firstLink) : 1;
    if (level === 2) {
      openAnimated(d);
    } else {
      closeAnimated(d);
    }
  });

  // --- 👁️ IntersectionObserver 控制高亮與展開 ---
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const link = toc.querySelector(`a[href="#${id}"]`);
        if (!link) return;

        if (entry.isIntersecting) {
          // 高亮
          tocLinks.forEach((a) => a.classList.remove("active"));
          link.classList.add("active");

          const level = getHeadingLevelFromLink(link);
          const currentDetails = link.closest("details");

          // 🎯 若係 H2，就自動展開佢 + 所有上層
          if (level === 2 && currentDetails) {
            openAnimated(currentDetails);
            let parent = currentDetails.parentElement.closest("details");
            while (parent) {
              openAnimated(parent);
              parent = parent.parentElement.closest("details");
            }
          }

          // 📘 若係 H3，展開其上層 H2
          if (level === 3 && currentDetails) {
            const parent = currentDetails.parentElement.closest("details");
            if (parent) openAnimated(parent);
          }

          // 🧹 清理：除咗 active 區塊之外全部收埋（H2 保持開）
          toc.querySelectorAll("details.open").forEach((d) => {
            const firstLink = d.querySelector("a");
            const lvl = firstLink ? getHeadingLevelFromLink(firstLink) : 1;
            if (lvl !== 2 && !d.contains(link)) {
              closeAnimated(d);
            }
          });
        }
      });
    },
    { rootMargin: "0px 0px -60% 0px", threshold: 0.3 }
  );

  headings.forEach((h) => observer.observe(h));

  // --- 🧱 TOC 寬度自動調整 ---
  const main_width = parseInt(getComputedStyle(document.body).getPropertyValue('--main-width') || 800, 10);
  const toc_width = parseInt(getComputedStyle(document.body).getPropertyValue('--toc-width') || 250, 10);
  const gap = parseInt(getComputedStyle(document.body).getPropertyValue('--gap') || 20, 10);
  const post = document.querySelector('article.post-single .post-content');

  function checkTocPosition() {
    const width = document.body.scrollWidth;
    toc.style.setProperty('--post-height', `${post.offsetHeight}px`);
    if (width - main_width - (toc_width * 2) - (gap * 4) > 0) {
      toc.classList.add("wide");
    } else {
      toc.classList.remove("wide");
    }
  }

  checkTocPosition();
  window.addEventListener('resize', checkTocPosition);
});
