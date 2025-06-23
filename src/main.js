import gsap from "gsap";
AOS.init();

// navigation code section
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
let isOpen = false;

const toggleMenu = () => {
  isOpen = !isOpen;
  menuBtn.textContent = isOpen ? "✕" : "☰";

  if (isOpen) {
    mobileMenu.classList.remove("h-0", "overflow-hidden", "opacity-0");
    mobileMenu.classList.add("h-screen", "opacity-100");
  } else {
    mobileMenu.classList.remove("h-screen", "opacity-100");
    mobileMenu.classList.add("h-0", "overflow-hidden", "opacity-0");
  }
};

menuBtn.addEventListener("click", toggleMenu);

// Automatically close menu when a link is clicked
document.querySelectorAll("#mobile-menu a").forEach(link => {
  link.addEventListener("click", () => {
    if (isOpen) toggleMenu();
  });
});



// auto-type section
const autoTypeElement = document.getElementById("auto-type");
const autoTypeElementDup = document.getElementById("auto-type-dup");

if (autoTypeElement && autoTypeElementDup) {
  new Typed("#auto-type", {
    strings: ["Software Developer", "Full-Stack Developer"],
    typeSpeed: 150,
    backSpeed: 150,
    loop: true,
    showCursor: true,
    cursorChar: "_",
  });

  new Typed("#auto-type-dup", {
    strings: ["Software Development", "Full-Stack Development", "Web Development"],
    typeSpeed: 150,
    backSpeed: 150,
    loop: true,
    showCursor: true,
    cursorChar: "_",
  });
} else {
  console.error("Element(s) with ID 'auto-type' or 'auto-type-dup' not found.");
}

// Gsap Image on Hover Effect
//
document.addEventListener("DOMContentLoaded", () => {
  window.revealImage = (element) => {
    const img = element.querySelector(".preview-image");
    if (img) {
      gsap.to(img, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  window.hideImage = (element) => {
    const img = element.querySelector(".preview-image");
    if (img) {
      gsap.to(img, {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  };
});