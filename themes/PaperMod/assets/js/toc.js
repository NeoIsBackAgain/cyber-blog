window.addEventListener('DOMContentLoaded', function () {
  const toc = document.querySelector(".toc");
  if (!toc) return;

  const tocLinks = toc.querySelectorAll("a");
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

  // --- 1. Helper: Find Link by ID (Safe for Special Chars) ---
  function getLinkByHeading(heading) {
    const id = heading.id;
    if (!id) return null;
    // Compare href attributes directly to avoid querySelector errors with ".", ":", etc.
    for (const link of tocLinks) {
      const href = link.getAttribute("href");
      if (href === `#${id}` || href === `#${encodeURIComponent(id)}`) {
        return link;
      }
    }
    return null;
  }

  // --- 2. Action: Set Active Path & Accordion ---
  function setActive(link) {
    if (!link) return;

    // A. Clear previous active states
    // This is what causes the "Collapse" effect for non-active items
    toc.querySelectorAll(".active").forEach(el => el.classList.remove("active"));
    toc.querySelectorAll(".active-parent").forEach(el => el.classList.remove("active-parent"));

    // B. Activate the current link
    link.classList.add("active");

    // C. Walk UP the tree and open parents
    // We add 'active-parent' to the LI, which your CSS uses to show the nested UL
    let parent = link.closest("li");
    while (parent) {
      parent.classList.add("active-parent");
      // Move to the next parent LI
      // We have to skip the UL to find the grandparent LI
      const parentUl = parent.closest("ul");
      if (parentUl && parentUl.parentElement) {
        parent = parentUl.parentElement.closest("li");
        // Stop if we went too far (outside TOC)
        if (parent && !toc.contains(parent)) parent = null;
      } else {
        parent = null;
      }
    }
  }

  // --- 3. Initial State: Expand All First ---
  // Per your request: "Assume it all expand first"
  // We manually add the class to ALL parents so everything is visible on load/refresh.
  function expandAll() {
    toc.querySelectorAll("li").forEach(li => {
      if (li.querySelector("ul")) {
        li.classList.add("active-parent");
      }
    });
    // Ensure the main <details> is open if it exists
    const rootDetails = toc.querySelector("details");
    if (rootDetails) rootDetails.open = true;
  }

  // Run immediately
  expandAll();


  // --- 4. IntersectionObserver (Live Updates) ---
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const heading = entry.target;
          const link = getLinkByHeading(heading);
          
          if (link) {
            // Once we scroll and hit a heading, we switch to Accordion mode
            // (The setActive function automatically closes unrelated paths)
            setActive(link);
          }
        }
      });
    },
    { 
      // Trigger when heading is near top of screen
      rootMargin: "0px 0px -70% 0px", 
      threshold: 0 
    }
  );

  headings.forEach((h) => observer.observe(h));


  // --- 5. Manual Sync (Fix for Refresh / Hash Links) ---
  // If the URL has #recon, we want to jump straight to that state
  setTimeout(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1); // Remove #
      // Find heading by ID (handling encoding)
      let targetHeading = document.getElementById(id) || document.getElementById(decodeURIComponent(id));
      
      if (targetHeading) {
        const link = getLinkByHeading(targetHeading);
        if (link) setActive(link);
      }
    }
  }, 100);

  
  // --- 6. Width/Resize Logic (Preserved) ---
  const main_width = parseInt(getComputedStyle(document.body).getPropertyValue('--main-width') || 800, 10);
  const toc_width = parseInt(getComputedStyle(document.body).getPropertyValue('--toc-width') || 250, 10);
  const gap = parseInt(getComputedStyle(document.body).getPropertyValue('--gap') || 20, 10);
  const post = document.querySelector('article.post-single .post-content');

  function checkTocPosition() {
    const tocContainer = document.querySelector(".toc-container");
    if (!post || !tocContainer) return;

    const width = document.body.scrollWidth;
    // Just setting the class; CSS handles the fixed position
    if (width - main_width - (toc_width * 2) - (gap * 4) > 0) {
      tocContainer.classList.add("wide");
    } else {
      tocContainer.classList.remove("wide");
    }
  }

  checkTocPosition();
  window.addEventListener('resize', checkTocPosition);
});