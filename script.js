const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".scroll-anim").forEach((elem) => {
  observer.observe(elem);
});

const canvas = document.getElementById("constellation-bg");
const ctx = canvas.getContext("2d");
const heroSection = document.querySelector(".hero");

let width, height;
let stars = [];

const mouse = {
  x: null,
  y: null,
  radius: 120, // How far the mouse repels stars
};

window.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

window.addEventListener("mouseout", () => {
  mouse.x = null;
  mouse.y = null;
});

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = heroSection.offsetHeight;
}
window.addEventListener("resize", resize);
resize();

class Star {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;

    this.originX = this.x;
    this.originY = this.y;

    this.vx = 0;
    this.vy = 0;

    this.friction = 0.6;
    this.spring = 0.03;

    this.radius = Math.random() * 3 + 0.2;
    this.baseAlpha = Math.random() * 0.6 + 0.1;
    this.twinkleSpeed = Math.random() * 0.03 + 0.005;
    this.time = Math.random() * Math.PI * 2;
  }

  update() {
    const dxOrigin = this.originX - this.x;
    const dyOrigin = this.originY - this.y;
    this.vx += dxOrigin * this.spring;
    this.vy += dyOrigin * this.spring;

    if (mouse.x !== null && mouse.y !== null) {
      const dxMouse = this.x - mouse.x;
      const dyMouse = this.y - mouse.y;
      const distance = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        this.vx += (dxMouse / distance) * force * 1.5;
        this.vy += (dyMouse / distance) * force * 1.5;
      }
    }

    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;

    this.time += this.twinkleSpeed;
  }

  draw() {
    let alpha = this.baseAlpha + Math.sin(this.time) * 0.4;
    alpha = Math.max(0, Math.min(1, alpha));

    let ratio = this.x / width;
    ratio = Math.max(0, Math.min(1, ratio));

    // Color 1 (Left): Light Yellow (Hoshi)
    const r1 = 255,
      g1 = 240,
      b1 = 150;
    // Color 2 (Right): Light Blue (Kai)
    const r2 = 137,
      g2 = 207,
      b2 = 240;

    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.fill();
  }
}

function initParticles() {
  stars = [];
  const particleCount = Math.min(Math.floor(window.innerWidth / 5), 400);
  for (let i = 0; i < particleCount; i++) {
    stars.push(new Star());
  }
}
initParticles();

function animate() {
  ctx.clearRect(0, 0, width, height);

  stars.forEach((star) => {
    star.update();
    star.draw();
  });

  requestAnimationFrame(animate);
}
animate();

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    initParticles();
  }, 200);
});

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  if (scrollY <= heroSection.offsetHeight) {
    canvas.style.transform = `translateY(${scrollY * 0.4}px)`;
    canvas.style.opacity = 1 - scrollY / heroSection.offsetHeight;
  }
});

const featureTabs = document.querySelectorAll(".feature-tab");
const showcaseItems = document.querySelectorAll(".showcase-item");
const tabsContainer = document.querySelector(".feature-tabs");

let currentTabIndex = 0;
let autoProgressInterval;
const CYCLE_DELAY = 5000;

function activateTab(index) {
  featureTabs.forEach((t) => t.classList.remove("active"));
  showcaseItems.forEach((item) => item.classList.remove("active"));

  const tab = featureTabs[index];
  tab.classList.add("active");

  const targetId = tab.getAttribute("data-target");
  const targetItem = document.getElementById(targetId);

  if (targetItem) {
    targetItem.classList.add("active");
  }
}

function nextTab() {
  currentTabIndex = (currentTabIndex + 1) % featureTabs.length;
  activateTab(currentTabIndex);
}

autoProgressInterval = setInterval(nextTab, CYCLE_DELAY);

featureTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    clearInterval(autoProgressInterval);
    tabsContainer.classList.add("user-interacted");
    if (tab.classList.contains("active")) return;
    currentTabIndex = index;
    activateTab(currentTabIndex);
  });
});
