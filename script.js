// Healtea Weekbites — interaksi halaman
// 1. Navbar: bayangan saat di-scroll, menu mobile, tombol WhatsApp melayang
// 2. FAQ: buka-tutup jawaban
// 3. Animasi: muncul saat di-scroll, parallax, putar, dan efek miring kartu

// ---------- 1. Navbar ----------
const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const scrim = document.querySelector(".nav-scrim");
const fab = document.querySelector(".fab");

function setMenu(open) {
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", open);
  toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  mobileMenu.inert = !open;
  document.body.style.overflow = open ? "hidden" : "";
  updateFab();
}

function updateFab() {
  const show = window.scrollY > 640 && !nav.classList.contains("is-open");
  fab.classList.toggle("is-visible", show);
  fab.tabIndex = show ? 0 : -1;
}

function onNavScroll() {
  nav.classList.toggle("is-scrolled", window.scrollY > 12);
  updateFab();
}

toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
scrim.addEventListener("click", () => setMenu(false));
mobileMenu.querySelectorAll("nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
window.addEventListener("scroll", onNavScroll, { passive: true });
mobileMenu.inert = true;
onNavScroll();

// ---------- 2. FAQ ----------
const faqItems = document.querySelectorAll(".acc-item");
faqItems.forEach((item) => {
  const button = item.querySelector("button");
  const panel = item.querySelector(".acc-panel");
  panel.inert = !item.classList.contains("is-open");

  button.addEventListener("click", () => {
    const wasOpen = item.classList.contains("is-open");
    faqItems.forEach((other) => {
      other.classList.remove("is-open");
      other.querySelector("button").setAttribute("aria-expanded", "false");
      other.querySelector(".acc-panel").inert = true;
    });
    if (!wasOpen) {
      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      panel.inert = false;
    }
  });
});

// ---------- 3. Animasi ----------
// Elemen .reveal muncul pelan-pelan saat masuk layar
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    });
  },
  { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Sisanya dimatikan kalau pengunjung memilih "kurangi animasi" di HP/laptopnya
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const drift = [...document.querySelectorAll("[data-speed]")];
  const spin = [...document.querySelectorAll("[data-spin]")];
  let frame = 0;

  function updateMotion() {
    frame = 0;
    const vh = window.innerHeight;
    drift.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const offset = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.speed);
      el.style.translate = `0 ${offset.toFixed(1)}px`;
    });
    spin.forEach((el) => {
      el.style.rotate = `${(window.scrollY * Number(el.dataset.spin)).toFixed(1)}deg`;
    });
  }

  const requestUpdate = () => {
    if (!frame) frame = requestAnimationFrame(updateMotion);
  };
  updateMotion();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  // Kartu sedikit miring mengikuti kursor (hanya di laptop/PC)
  if (matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  }
}

// ---------- 4. Jingle ----------
// Browser memblokir suara otomatis, jadi kalau diblokir lagu diputar
// begitu pengunjung pertama kali klik/tap/tekan tombol di halaman.
const jingle = document.getElementById("jingle");
const soundBtn = document.querySelector(".sound-toggle");
const unlockEvents = ["pointerdown", "keydown", "touchstart"];

function unlock(e) {
  if (e.target.closest(".sound-toggle")) return; // tombol suara punya aturannya sendiri
  unlockEvents.forEach((ev) => document.removeEventListener(ev, unlock));
  if (!jingle.muted) jingle.play().catch(() => {});
}
jingle.play().catch(() => unlockEvents.forEach((ev) => document.addEventListener(ev, unlock)));

soundBtn.addEventListener("click", () => {
  if (jingle.paused) {
    jingle.muted = false;
    jingle.play().catch(() => {});
  } else {
    jingle.muted = !jingle.muted;
  }
  soundBtn.textContent = jingle.muted ? "🔇" : "🔊";
  soundBtn.setAttribute("aria-label", jingle.muted ? "Nyalakan suara" : "Matikan suara");
});

// ---------- 5. Lightbox gallery ----------
// Klik foto gallery: dibuka besar di halaman yang sama (Esc / klik luar untuk tutup).
const lightbox = document.querySelector(".lightbox");
if (lightbox && lightbox.showModal) {
  const lbImg = lightbox.querySelector("img");
  document.querySelectorAll(".gallery-item").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      lbImg.src = a.href;
      lbImg.alt = a.querySelector("img").alt;
      lightbox.showModal();
    })
  );
  lightbox.addEventListener("click", (e) => e.target !== lbImg && lightbox.close());
}
