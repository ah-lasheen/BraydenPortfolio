const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

const revealTargets = document.querySelectorAll(".section, .hero, .media-card, .service-card");
revealTargets.forEach((el) => el.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.2 }
);

revealTargets.forEach((el) => observer.observe(el));

const glow = document.querySelector(".page-glow");
window.addEventListener("scroll", () => {
  const offset = window.scrollY * 0.2;
  if (glow) {
    glow.style.backgroundPosition = `0 ${offset}px`;
  }
});

const form = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (formStatus) formStatus.textContent = "Sending...";

    try {
      const formData = new FormData(form);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      if (!response.ok) {
        throw new Error("Failed to send.");
      }

      form.reset();
      if (formStatus) formStatus.textContent = "Sent. Expect a reply shortly.";
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = "Something went wrong. Please email directly.";
      }
    }
  });
}
