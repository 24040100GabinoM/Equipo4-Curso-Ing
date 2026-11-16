// ============================================================
// EQUIPO 4 · Timed Card Opening — versión fiel al video del pin
// El video dura 18 s: abajo hay tarjetas verticales pequeñas;
// una a una, de forma temporizada, una se ensancha y su foto
// pasa a ser la imagen principal a pantalla completa, mientras
// las demás quedan como miniaturas. Abajo en el centro van
// flechas y puntos de paginación, y abajo a la derecha el
// número de escena (01, 05).
// - Cada 4 segundos se abre sola la siguiente tarjeta (18 s / 5).
// - Haz clic en una tarjeta, en un punto o usa ← → para abrirla tú.
// - Al pasar el mouse sobre las tarjetas, el autoplay se pausa.
// ============================================================

const cards = Array.from(document.querySelectorAll(".card"));
const hero = document.querySelector(".hero");
const heroNumber = document.getElementById("heroNumber");
const heroName = document.getElementById("heroName");
const heroRole = document.getElementById("heroRole");
const heroDesc = document.getElementById("heroDesc");
const heroBtn = document.getElementById("heroBtn");
const progressBar = document.getElementById("progressBar");
const pauseBtn = document.getElementById("pauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dotsWrap = document.getElementById("dots");
const heroBgA = document.getElementById("heroBgA");
const heroBgB = document.getElementById("heroBgB");

const DURATION = 4000; // 4 segundos por tarjeta (igual que --time en style.css)
let current = 0;
let timer = null;
let paused = false;
let showingA = true;

// Puntos de paginación (uno por tarjeta, como en el video)
const dots = cards.map((_, i) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("role", "tab");
  dot.setAttribute("aria-label", `Ir a la tarjeta ${i + 1}`);
  dot.addEventListener("click", () => activate(i));
  dotsWrap.appendChild(dot);
  return dot;
});

// Foto inicial del fondo grande (la de la primera tarjeta)
heroBgA.style.backgroundImage = `url("${cards[0].dataset.img}")`;
heroBgA.classList.add("is-visible");

// Reinicia la barra de progreso (truco: quitar y volver a poner la clase)
function restartProgress() {
  progressBar.classList.remove("run");
  void progressBar.offsetWidth; // fuerza al navegador a reiniciar la animación
  if (!paused) progressBar.classList.add("run");
}

// Cambia el fondo grande con fundido, alternando las dos capas
function swapBackground(img) {
  const show = showingA ? heroBgB : heroBgA;
  const hide = showingA ? heroBgA : heroBgB;
  show.style.backgroundImage = `url("${img}")`;
  show.classList.add("is-visible");
  hide.classList.remove("is-visible");
  showingA = !showingA;
}

// Activa la tarjeta número `index`: abre la tarjeta, actualiza el hero y reinicia el tiempo
function activate(index, restartTimer = true) {
  current = (index + cards.length) % cards.length;
  const card = cards[current];

  cards.forEach((c) => c.classList.remove("is-active"));
  card.classList.add("is-active");
  dots.forEach((d, i) => d.classList.toggle("is-active", i === current));

  // Datos del hero desde la tarjeta activa (data-name, data-role, data-desc, data-img)
  heroNumber.textContent = String(current + 1).padStart(2, "0");
  heroName.textContent = card.dataset.name;
  heroRole.textContent = card.dataset.role;
  heroDesc.textContent = card.dataset.desc;
  // El botón grande del hero apunta a la misma página que el botón de la tarjeta
  heroBtn.href = card.querySelector(".card-btn").href;

  swapBackground(card.dataset.img);

  // Reproduce la animación de entrada del texto del hero
  hero.classList.remove("swap");
  void hero.offsetWidth;
  hero.classList.add("swap");

  restartProgress();
  if (restartTimer) startAutoplay();
}

function startAutoplay() {
  clearInterval(timer);
  if (paused) return;
  timer = setInterval(() => activate(current + 1), DURATION);
}

function setPaused(value) {
  paused = value;
  pauseBtn.textContent = paused ? "▶ Reanudar" : "⏸ Pausar";
  clearInterval(timer);
  if (paused) {
    progressBar.classList.remove("run");
  } else {
    restartProgress();
    startAutoplay();
  }
}

// Clic en una tarjeta: se abre y el tiempo vuelve a empezar
cards.forEach((card, i) => {
  card.addEventListener("click", (e) => {
    // Si el clic fue en el botón "Ver mi página", deja que el enlace funcione normal
    if (e.target.closest(".card-btn")) return;
    activate(i);
  });
  // Teclado: Enter o Espacio sobre una tarjeta también la abre
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate(i);
    }
  });
});

// Controles: flechas, pausa y teclado
prevBtn.addEventListener("click", () => activate(current - 1));
nextBtn.addEventListener("click", () => activate(current + 1));
pauseBtn.addEventListener("click", () => setPaused(!paused));

// Flechas del teclado para cambiar de tarjeta
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") activate(current + 1);
  if (e.key === "ArrowLeft") activate(current - 1);
});

// Pausa el autoplay mientras el mouse está sobre las tarjetas
const cardsWrap = document.getElementById("cards");
cardsWrap.addEventListener("mouseenter", () => {
  clearInterval(timer);
  progressBar.classList.remove("run");
});
cardsWrap.addEventListener("mouseleave", () => {
  if (!paused) {
    restartProgress();
    startAutoplay();
  }
});

// Arranque: activa la primera tarjeta y empieza el temporizador
activate(0);
