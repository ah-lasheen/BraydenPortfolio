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
const submitBtn = form?.querySelector('button[type="submit"]');

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (formStatus) {
      formStatus.textContent = "Sending...";
      formStatus.classList.remove("success", "error");
    }
    if (submitBtn) submitBtn.disabled = true;

    try {
      const formData = new FormData(form);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      const data = response.ok ? await response.json().catch(() => ({})) : await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = data?.error || "Failed to send.";
        throw new Error(msg);
      }

      form.reset();
      if (formStatus) {
        formStatus.textContent = "Sent. Expect a reply shortly.";
        formStatus.classList.add("success");
      }
    } catch (err) {
      if (formStatus) {
        formStatus.textContent = err.message || "Something went wrong. Please email directly.";
        formStatus.classList.add("error");
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  form.addEventListener("input", () => {
    if (formStatus?.textContent) {
      formStatus.textContent = "";
      formStatus.classList.remove("success", "error");
    }
  });
}
