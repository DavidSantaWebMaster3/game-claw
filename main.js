const prizeMessages = {
  fiveExtra:
    "¡Tu compra acaba de mejorar! Disfruta 5% OFF EXTRA en toda la tienda con el cupón:",
  tenExtra:
    "¡WOW! La suerte está de tu lado. Obtén 10% OFF EXTRA en toda la tienda con el cupón:",
  freeShipping: "¡Excelente! Llévate ENVÍO GRATIS en tu compra con el cupón:",
  again:
    "¡Esta vez no fue... pero aún puedes volver a intentarlo y ganar beneficios EXTRA!",
};

const prizeCoupons = {
  fiveExtra: "W5SALE",
  tenExtra: "S10WOW",
  freeShipping: "FWSHIP",
  again: "",
};

const PRIZES = Object.keys(prizeMessages);

const GIFT_STYLES = [
  { box: "#ef2d6e", dark: "#c2185b", ribbon: "#fde4ec", ribbonDark: "#f5b6c9" },
  { box: "#f06292", dark: "#d81b60", ribbon: "#ffffff", ribbonDark: "#f8c9d8" },
  { box: "#d81b60", dark: "#a3134a", ribbon: "#f9c6d6", ribbonDark: "#ec97b1" },
  { box: "#fbc4d6", dark: "#f191b0", ribbon: "#e91e63", ribbonDark: "#b8124d" },
  { box: "#e83f76", dark: "#b91c55", ribbon: "#ffd6e3", ribbonDark: "#f3a5bf" },
];

// count es el número de regalos en la fila,
// bottom es la distancia desde el fondo del cristal,
// size es el tamaño base del regalo,
// cls es la clase CSS (back o front),
// z es el índice z para superposición
// y pad es el espacio de relleno a los lados.

const ROWS = [
  { count: 13, bottom: 44, size: 42, cls: "back", z: 1, pad: 5 },
  { count: 12, bottom: 22, size: 48, cls: "back", z: 2, pad: 7 },
  { count: 12, bottom: 2, size: 54, cls: "front", z: 3, pad: 5 },
];

// speed es la velocidad de movimiento de la garra (px/s)
// y ropeRest es la altura de la cuerda cuando está en reposo (px)

const SPEED = 200;
const ROPE_REST = 26;

const machine = document.getElementById("machine");
const glass = document.getElementById("glass");
const giftsBox = document.getElementById("gifts");
const claw = document.getElementById("claw");
const clawRope = document.getElementById("clawRope");
const clawBody = document.getElementById("clawBody");
const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");
const dropBtn = document.getElementById("drop-btn");

const overlay = document.getElementById("modalOverlay");
const prizeScreen = document.getElementById("prizeScreen");
const prizeGift = document.getElementById("prizeGift");
const wonPrizeText = document.getElementById("wonPrize");
const couponCode = document.getElementById("couponCode");
const copyBtn = document.getElementById("copyBtn");
const closeBtn = document.getElementById("closeBtn");

// x = posición horizontal de la garra (px)
// dir = -1 (izquierda), 0 (quieto), 1 (derecha)
// busy = true cuando la garra está ocupada (bajando, subiendo o mostrando premio)

let x = 0;
let dir = 0;
let busy = false;

// rand para obtener un número aleatorio entre 0 y n-1
// wait para esperar ms milisegundos

const rand = (n) => Math.floor(Math.random() * n);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// gradId es un identificador único para cada gradiente SVG

let gradId = 0;

//función para generar el SVG de un regalo con un estilo dado

function giftSVG(s) {
  const id = `gg${gradId++}`;
  return `
  <svg viewBox="0 0 60 60" aria-hidden="true">
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${s.box}"/>
        <stop offset="1" stop-color="${s.dark}"/>
      </linearGradient>
    </defs>
    <path d="M30 17 C24 4 9 5 13 13 C15.5 18 24 18.5 30 17Z" fill="${s.ribbon}" stroke="${s.ribbonDark}" stroke-width="1.5"/>
    <path d="M30 17 C36 4 51 5 47 13 C44.5 18 36 18.5 30 17Z" fill="${s.ribbon}" stroke="${s.ribbonDark}" stroke-width="1.5"/>
    <path d="M18 12.5 C21 12 25 14 27.5 16" fill="none" stroke="${s.ribbonDark}" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M42 12.5 C39 12 35 14 32.5 16" fill="none" stroke="${s.ribbonDark}" stroke-width="1.2" stroke-linecap="round"/>
    <rect x="9" y="26" width="42" height="31" rx="3" fill="url(#${id})"/>
    <rect x="9" y="26" width="42" height="4" fill="#000" opacity=".12"/>
    <rect x="13" y="32" width="4" height="21" rx="2" fill="#fff" opacity=".22"/>
    <rect x="6" y="18" width="48" height="10" rx="3" fill="url(#${id})"/>
    <rect x="8" y="19.5" width="44" height="2.5" rx="1.2" fill="#fff" opacity=".25"/>
    <rect x="26" y="18" width="8" height="39" fill="${s.ribbon}"/>
    <rect x="32" y="18" width="2" height="39" fill="${s.ribbonDark}" opacity=".8"/>
    <ellipse cx="30" cy="17.5" rx="4.5" ry="3.6" fill="${s.ribbonDark}"/>
    <ellipse cx="29" cy="16.6" rx="2" ry="1.4" fill="#fff" opacity=".45"/>
  </svg>`;
}

//función para construir los regalos en el área de juego

function buildGifts() {
  ROWS.forEach((row) => {
    for (let i = 0; i < row.count; i++) {
      const size = row.size + rand(9) - 4;
      const left =
        row.pad +
        i * ((100 - row.pad * 2) / (row.count - 1)) +
        Math.random() * 3 -
        1.9;
      const styleIndex = rand(GIFT_STYLES.length);

      const gift = document.createElement("div");
      gift.className = `gift ${row.cls}`;
      gift.innerHTML = giftSVG(GIFT_STYLES[styleIndex]);
      gift.dataset.style = styleIndex;
      gift.dataset.prize = PRIZES[rand(PRIZES.length)];

      gift.style.width = `${size}px`;
      gift.style.marginLeft = `${-size / 2}px`;
      gift.style.left = `${left}%`;
      gift.style.bottom = `${row.bottom + rand(7)}px`;
      gift.style.zIndex = row.z;
      gift.style.setProperty("--r", `${rand(37) - 18}deg`);
      giftsBox.appendChild(gift);
    }
  });
}

// last es para calcular el tiempo transcurrido
// entre frames y limitar la actualización de
// la posición de la garra a 30 fps

let last = performance.now();

// loop es una función para actualizar la
// posición de la garra y dibujarla en cada frame

function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  if (!busy) {
    x = Math.max(32, Math.min(glass.clientWidth - 32, x + dir * SPEED * dt));
  }
  claw.style.transform = `translateX(${x}px) translateX(-50%)`;
  requestAnimationFrame(loop);
}

// hold es una función para manejar los eventos de
// presionar y soltar los botones de movimiento de la garra

function hold(btn, direction) {
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    dir = direction;
    btn.classList.add("pressed");
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) =>
    btn.addEventListener(ev, () => {
      if (dir === direction) dir = 0;
      btn.classList.remove("pressed");
    }),
  );
}

// -1 para izquierda, 1 para derecha

hold(leftBtn, -1);
hold(rightBtn, 1);

// drop es una función para manejar el evento de
// presionar el botón de soltar la garra

dropBtn.addEventListener("click", drop);

// eventos de teclado para mover la garra y soltarla

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") dir = -1;
  if (e.key === "ArrowRight") dir = 1;
  if (e.key === "ArrowDown" || e.key === " ") drop();
  if (e.key.startsWith("Arrow") || e.key === " ") e.preventDefault();
});

// cuando se suelta la tecla de flecha
// izquierda o derecha, detener el movimiento

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") dir = 0;
});

// moveRope es una función para animar
// la altura de la cuerda de la garra

async function moveRope(to, ms) {
  clawRope.style.transition = `height ${ms}ms ease-in-out`;
  clawRope.style.height = `${to}px`;
  await wait(ms);
}

// findTarget es una función para
// encontrar el regalo más cercano a la garra

function findTarget() {
  const box = glass.getBoundingClientRect();
  const gifts = [...giftsBox.children].map((el) => {
    const r = el.getBoundingClientRect();
    return {
      el,
      cx: r.left + r.width / 2 - box.left,
      top: r.top - box.top - glass.clientTop,
    };
  });
  const under = gifts.filter((g) => Math.abs(g.cx - x) < 22);
  return under.length
    ? under.sort((a, b) => a.top - b.top)[0]
    : gifts.sort((a, b) => Math.abs(a.cx - x) - Math.abs(b.cx - x))[0];
}

// drop es una función para
// manejar el evento de soltar la
// garra y recoger un regalo

async function drop() {
  if (busy) return;
  busy = true;
  dir = 0;
  machine.className = "claw-machine busy";

  const target = findTarget();
  const depth = Math.max(ROPE_REST, target.top - 6);

  claw.className = "claw open";
  await moveRope(depth, 1200); // acá baja la garra
  await wait(200); // espera un momento para que se vea la garra abierta
  claw.className = "claw closed"; // acá se cierra la garra
  await wait(300); // espera un momento para que se vea el cierre

  const gift = target.el;
  const w = gift.offsetWidth;
  gift.classList.add("caught", "dangle");
  gift.style.bottom = "auto";
  gift.style.marginLeft = "0";
  gift.style.left = `${15 - w / 2}px`;
  gift.style.top = "18px";
  gift.style.setProperty("--r", "0deg");
  clawBody.appendChild(gift);

  await moveRope(ROPE_REST, 1300); // acá sube la garra
  await wait(400);
  showPrize(gift);
}

// prizeGift es el contenedor del regalo
// que se muestra en la pantalla de premio y
// codeBox es el contenedor del código de cupón

const prizeTitle = document.getElementById("prizeTitle");
const codeBox = document.querySelector(".code-container");

// showPrize es una función para mostrar la pantalla de premio

function showPrize(gift) {
  const key = gift.dataset.prize;
  const code = prizeCoupons[key];

  prizeGift.innerHTML = giftSVG(GIFT_STYLES[gift.dataset.style]);
  prizeTitle.textContent = code ? "¡Felicidades!" : "¡Casi!";
  wonPrizeText.textContent = prizeMessages[key];
  couponCode.textContent = code;
  codeBox.style.display = code ? "" : "none";
  overlay.classList.remove("hidden");
  prizeScreen.classList.remove("hidden");
}

// copyBtn es el botón para copiar
// el código de cupón al portapapeles

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(couponCode.textContent);
    copyBtn.textContent = "¡Copiado!";
  } catch {
    copyBtn.textContent = "No se pudo copiar";
  }
  setTimeout(() => (copyBtn.textContent = "Copiar"), 2000);
});

// reset es una función para reiniciar el juego

function reset() {
  overlay.classList.add("hidden");
  clawBody.querySelector(".gift")?.remove(); // el regalo que llevaba la garra
  giftsBox.innerHTML = "";
  buildGifts();
  claw.className = "claw";
  machine.className = "claw-machine ready";
  x = glass.clientWidth / 5;
  busy = false;
}

// closeBtn es el botón
// para cerrar la pantalla de premio

closeBtn.addEventListener("click", reset);

// acá inicia el juego

reset();

// loop es la función que actualiza
// la posición de la garra

requestAnimationFrame(loop);
