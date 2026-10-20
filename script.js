"use strict";

const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);
const bookingDate = document.querySelector("#bookingDate");
bookingDate.min = localToday;

document.querySelector("#copyrightYear").textContent = new Date().getFullYear();

const navbar = document.querySelector(".site-nav");
const backToTop = document.querySelector(".back-to-top");
const updateScrollControls = () => {
  const scrolled = window.scrollY > 50;
  navbar.classList.toggle("scrolled", scrolled);
  backToTop.classList.toggle("visible", window.scrollY > 500);
};
window.addEventListener("scroll", updateScrollControls, { passive: true });
updateScrollControls();

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const navCollapse = document.querySelector("#primaryNav");
navCollapse.querySelectorAll("a[href^='#']").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 991.98px)").matches) {
      bootstrap.Collapse.getOrCreateInstance(navCollapse, { toggle: false }).hide();
    }
  });
});

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const counterElements = document.querySelectorAll(".counter");
const animateCounter = (element) => {
  const target = Number(element.dataset.count);
  const duration = 1400;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased).toLocaleString();
    if (progress < 1) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
};
if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.65 });
  counterElements.forEach((counter) => counterObserver.observe(counter));
} else {
  counterElements.forEach((counter) => animateCounter(counter));
}

const galleryItems = [...document.querySelectorAll(".gallery-item")];
const galleryEmpty = document.querySelector("#galleryEmpty");
document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const selectedCategory = button.dataset.filter;
    document.querySelectorAll(".filter-btn").forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    let visibleCount = 0;
    galleryItems.forEach((item) => {
      const isVisible = selectedCategory === "all" || item.dataset.category === selectedCategory;
      item.classList.toggle("is-hidden", !isVisible);
      if (isVisible) visibleCount += 1;
    });
    galleryEmpty.classList.toggle("d-none", visibleCount !== 0);
  });
});

const imageModalElement = document.querySelector("#imageModal");
const imageModal = bootstrap.Modal.getOrCreateInstance(imageModalElement);
const lightboxImage = document.querySelector("#lightboxImage");
const imageModalLabel = document.querySelector("#imageModalLabel");
document.querySelectorAll(".gallery-image, .portfolio-tile").forEach((button) => {
  button.addEventListener("click", () => {
    const imageUrl = button.dataset.image;
    const imageAlt = button.querySelector("img")?.alt || button.dataset.caption || "Selected studio photograph";
    lightboxImage.src = imageUrl;
    lightboxImage.alt = imageAlt;
    imageModalLabel.textContent = button.dataset.caption || imageAlt;
    imageModal.show();
  });
});
imageModalElement.addEventListener("hidden.bs.modal", () => {
  lightboxImage.removeAttribute("src");
  lightboxImage.alt = "";
  imageModalLabel.textContent = "";
});

const serviceSelect = document.querySelector("#bookingService");
const packageSelect = document.querySelector("#bookingPackage");
document.querySelectorAll(".service-link").forEach((button) => {
  button.addEventListener("click", () => {
    serviceSelect.value = button.dataset.service;
    document.querySelector("#booking").scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => serviceSelect.focus({ preventScroll: true }), 450);
  });
});
document.querySelectorAll(".choose-package").forEach((button) => {
  button.addEventListener("click", () => {
    packageSelect.value = button.dataset.package;
    document.querySelector("#booking").scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => packageSelect.focus({ preventScroll: true }), 450);
  });
});

const bookingForm = document.querySelector("#bookingForm");
const bookingFeedback = document.querySelector("#bookingFeedback");
const bookingReviewModal = bootstrap.Modal.getOrCreateInstance(document.querySelector("#bookingReviewModal"));
const bookingSummary = document.querySelector("#bookingSummary");
const confirmEnquiry = document.querySelector("#confirmEnquiry");
const formLabels = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  service: "Service",
  date: "Preferred date",
  time: "Preferred time",
  package: "Package",
  location: "Location",
  notes: "Additional requirements"
};

const showFeedback = (element, message, isError = false) => {
  element.textContent = message;
  element.classList.remove("d-none", "error");
  if (isError) element.classList.add("error");
};

const validateForm = (form) => {
  let valid = true;
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.classList.remove("is-invalid");
    if (field.type === "date" && field.value && field.value < localToday) {
      field.setCustomValidity("Choose today or a future date.");
    } else if (field.type === "tel" && field.value) {
      const normalizedPhone = field.value.replace(/[\s().-]/g, "");
      field.setCustomValidity(/^\+?\d{8,15}$/.test(normalizedPhone) ? "" : "Enter a valid phone number with 8–15 digits.");
    } else {
      field.setCustomValidity("");
    }
    if (!field.checkValidity()) {
      field.classList.add("is-invalid");
      valid = false;
    }
  });
  if (!valid) {
    form.querySelector(".is-invalid")?.focus();
    form.reportValidity();
  }
  return valid;
};

bookingForm.addEventListener("input", (event) => {
  event.target.classList.remove("is-invalid");
  if (event.target.type === "date" && event.target.value && event.target.value < localToday) {
    event.target.setCustomValidity("Choose today or a future date.");
  } else {
    event.target.setCustomValidity("");
  }
  bookingFeedback.classList.add("d-none");
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateForm(bookingForm)) {
    showFeedback(bookingFeedback, "Please check the highlighted fields and try again.", true);
    return;
  }

  const data = new FormData(bookingForm);
  bookingSummary.replaceChildren();
  Object.entries(formLabels).forEach(([key, label]) => {
    const value = String(data.get(key) || "").trim();
    if (!value) return;
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    row.append(term, description);
    bookingSummary.append(row);
  });
  bookingFeedback.classList.add("d-none");
  bookingReviewModal.show();
});

document.querySelector(".booking-whatsapp").addEventListener("click", (event) => {
  if (!validateForm(bookingForm)) {
    event.preventDefault();
    showFeedback(bookingFeedback, "Please complete the required booking details before opening WhatsApp.", true);
    return;
  }
  event.currentTarget.href = bookingWhatsAppUrl(new FormData(bookingForm));
  bookingFeedback.classList.add("d-none");
});

const bookingWhatsAppUrl = (data) => {
  const message = [
    "Hello Bhanu Photography Studio, I'd like to enquire about a photoshoot.",
    `Name: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Phone: ${data.get("phone")}`,
    `Service: ${data.get("service")}`,
    `Preferred date: ${data.get("date")}`,
    `Preferred time: ${data.get("time")}`,
    data.get("package") ? `Package: ${data.get("package")}` : "",
    data.get("location") ? `Location: ${data.get("location")}` : "",
    data.get("notes") ? `Requirements: ${data.get("notes")}` : ""
  ].filter(Boolean).join("\n");
  return `https://wa.me/917396598210?text=${encodeURIComponent(message)}`;
};

const whatsappOpenedMessage = "WhatsApp opened with your message. Press Send there to contact the studio.";

confirmEnquiry.addEventListener("click", () => {
  if (!validateForm(bookingForm) || confirmEnquiry.disabled) return;

  const data = new FormData(bookingForm);
  window.open(bookingWhatsAppUrl(data), "_blank", "noopener,noreferrer");
  bookingReviewModal.hide();
  showFeedback(bookingFeedback, whatsappOpenedMessage);
  bookingFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

const contactForm = document.querySelector("#contactForm");
const contactFeedback = document.querySelector("#contactFeedback");
contactForm.addEventListener("input", (event) => {
  event.target.classList.remove("is-invalid");
  contactFeedback.classList.add("d-none");
});
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateForm(contactForm)) {
    showFeedback(contactFeedback, "Please check the highlighted fields and try again.", true);
    return;
  }
  const data = new FormData(contactForm);
  const message = [
    "Hello Bhanu Photography Studio,",
    `Name: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    "",
    String(data.get("message") || "")
  ].join("\n");
  window.open(`https://wa.me/917396598210?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  showFeedback(contactFeedback, whatsappOpenedMessage);
});
