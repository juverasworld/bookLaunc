const hamburgerBtn = document.getElementById('hamburger-btn');
const navLinks = document.getElementById('nav-links');

hamburgerBtn.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});
  const toggleBookBtn = document.getElementById("toggle-book");
  const bookMore = document.getElementById("book-more");
  let bookExpanded = false;

  toggleBookBtn.addEventListener("click", () => {
    bookExpanded = !bookExpanded;
    bookMore.classList.toggle("hidden");
    toggleBookBtn.textContent = bookExpanded ? "Show Less" : "See More";
  });

  // Toggle for About section
  const toggleAboutBtn = document.getElementById("toggle-about");
  const aboutMore = document.getElementById("about-more");
  let aboutExpanded = false;

  toggleAboutBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent page jump
    aboutExpanded = !aboutExpanded;
    aboutMore.classList.toggle("hidden");
    toggleAboutBtn.textContent = aboutExpanded ? "Show Less" : "About Me";
  });

    function toggleSection(btnId, contentId, textExpanded, textCollapsed) {
      const btn = document.getElementById(btnId);
      const content = document.getElementById(contentId);
      let expanded = false;

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        expanded = !expanded;
        content.classList.toggle("hidden");
        btn.textContent = expanded ? textExpanded : textCollapsed;
      });
    }

    toggleSection("toggle-hero", "hero-more", "Show Less", "See More");
    toggleSection("toggle-about", "about-more", "Show Less", "See More");