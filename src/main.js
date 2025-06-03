// navigation code section
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
let isOpen = false;

menuBtn.addEventListener("click", () => {
  isOpen = !isOpen;

  // Toggle icon
  menuBtn.textContent = isOpen ? "✕" : "☰";

  // Toggle mobile menu classes for height and opacity
  if (isOpen) {
    mobileMenu.classList.remove("h-0", "overflow-hidden", "opacity-0");
    mobileMenu.classList.add("h-screen", "opacity-100");
  } else {
    mobileMenu.classList.remove("h-screen", "opacity-100");
    mobileMenu.classList.add("h-0", "overflow-hidden", "opacity-0");
  }
});


// auto-type section
const autoTypeElement = document.getElementById("auto-type");

if (autoTypeElement) {
  new Typed(autoTypeElement, {
    strings: ["Software Developer", "Full-Stack Developer", "Batman"],
    typeSpeed: 150,
    backSpeed: 150,
    loop: true,
    showCursor: true,
    cursorChar: "_",
  });
} else {
  console.error("Element with ID 'auto-type' not found.");
}
