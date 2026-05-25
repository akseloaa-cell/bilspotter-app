import { questPool } from "./quests.js";

/* ================= DOM ================= */
const plateInput = document.getElementById("plateInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");
const stats = document.getElementById("stats");

/* ================= STATE ================= */
let cars = JSON.parse(localStorage.getItem("cars")) || [];

let player = JSON.parse(localStorage.getItem("player")) || {
  xp: 0,
  level: 1
};

let quests =
  JSON.parse(localStorage.getItem("quests")) ||
  structuredClone(questPool);

/* ================= SAVE ================= */
function saveCars() {
  localStorage.setItem("cars", JSON.stringify(cars));
}

function savePlayer() {
  localStorage.setItem("player", JSON.stringify(player));
}

function saveQuests() {
  localStorage.setItem("quests", JSON.stringify(quests));
}

/* ================= PLATE ANALYSIS ================= */
function analyzePlate(plate) {
  const letters = plate.replace(/\d/g, "");
  const numbers = plate.replace(/\D/g, "").split("").map(Number);
  const sum = numbers.reduce((a, b) => a + b, 0);

  return {
    letters,
    numbers,
    sum,
    hasText: (txt) => plate.includes(txt),
    hasDoubleLetter: /(.)\1/.test(letters)
  };
}

/* ================= XP SYSTEM ================= */
function addXP(amount) {
  player.xp += amount;

  const needed = Math.floor(75 + player.level * player.level * 35);

  if (player.xp >= needed) {
    player.xp -= needed;
    player.level++;
    alert(`🎉 Level Up! Du er nå level ${player.level}`);
  }

  savePlayer();
  renderXP();
}

function renderXP() {
  const levelEl = document.getElementById("level");
  const xpText = document.getElementById("xpText");
  const xpFill = document.getElementById("xpFill");

  if (!levelEl || !xpText || !xpFill) return;

  const needed = Math.floor(75 + player.level * player.level * 35);

  levelEl.innerText = player.level;
  xpText.innerText = `${player.xp} / ${needed} XP`;
  xpFill.style.width = `${(player.xp / needed) * 100}%`;
}

/* ================= QUEST SYSTEM ================= */
function updateQuests(plate) {
  const analysis = analyzePlate(plate);

  [...quests.daily, ...quests.weekly].forEach((q) => {
    if (q.completed) return;

    let done = false;

    if (q.type === "hasText") {
      done = analysis.hasText(q.value);
    }

    if (q.type === "sumEquals") {
      done = analysis.sum === q.value;
    }

    if (q.type === "doubleLetter") {
      done = analysis.hasDoubleLetter;
    }

    if (q.type === "countCars") {
      q.progress = (q.progress || 0) + 1;
      done = q.progress >= q.goal;
    }

    if (done) {
      q.completed = true;
      addXP(q.reward);
      alert("🏆 Quest fullført: " + q.name);
    }
  });

  saveQuests();
  renderQuests();
}

function renderQuests() {
  const dailyEl = document.getElementById("dailyQuests");
  const weeklyEl = document.getElementById("weeklyQuests");

  if (!dailyEl || !weeklyEl) return;

  dailyEl.innerHTML = "";
  weeklyEl.innerHTML = "";

  quests.daily.forEach((q) => {
    dailyEl.innerHTML += questHTML(q);
  });

  quests.weekly.forEach((q) => {
    weeklyEl.innerHTML += questHTML(q);
  });
}

function questHTML(q) {
  const progress = q.progress || 0;
  const goal = q.goal || 1;
  const percent = (progress / goal) * 100;

  return `
    <div class="quest">
      <div class="quest-name">
        ${q.completed ? "✅" : "🎯"} ${q.name}
      </div>

      <div class="quest-progress">
        ${progress} / ${goal} • ⭐ ${q.reward} XP
      </div>

      <div class="quest-bar">
        <div class="quest-fill" style="width:${percent}%"></div>
      </div>
    </div>
  `;
}

/* ================= CAR SYSTEM ================= */
function addCar() {
  const plate = plateInput.value.trim().toUpperCase();
  if (!plate) return;

  const existing = cars.find(c => c.plate === plate);

  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.createdAt = Date.now();
  } else {
    cars.push({
      plate,
      createdAt: Date.now(),
      count: 1
    });
  }

  saveCars();

  addXP(10);
  updateQuests(plate);

  plateInput.value = "";
  render();
  renderLastCar();
}

function deleteCar(index) {
  cars.splice(index, 1);
  saveCars();
  render();
}

function renderLastCar() {
  const lastCarDiv = document.getElementById("lastCar");

  if (!lastCarDiv) return;
  if (!cars || cars.length === 0) {
    lastCarDiv.innerHTML = "";
    return;
  }

  // trygg sortering (bedre enn reduce)
  const sorted = [...cars].sort((a, b) => {
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const last = sorted[0];

  if (!last) return;

  lastCarDiv.innerHTML = `
    <div style="font-size:11px;opacity:0.7;margin-bottom:6px;">
      SISTE REGISTRERING
    </div>

    <div class="last-plate">
      ${last.plate || "?"}
    </div>

    <div class="last-meta">
      Lagt til: ${last.createdAt ? formatDate(last.createdAt) : "ukjent"}
    </div>

    <div class="last-meta">
      Registrert ${last.count || 1} ganger
    </div>
  `;
}
/* ================= RENDER ================= */
function formatDate(t) {
  return new Date(t).toLocaleString("no-NO");
}

function render() {
  let filtered = [...cars];

  const search = searchInput.value.toLowerCase();

  if (search) {
    filtered = filtered.filter(c =>
      c.plate.toLowerCase().includes(search)
    );
  }

  const sort = sortSelect.value;

  if (sort === "newest") filtered.sort((a,b)=>b.createdAt-a.createdAt);
  if (sort === "oldest") filtered.sort((a,b)=>a.createdAt-b.createdAt);
  if (sort === "az") filtered.sort((a,b)=>a.plate.localeCompare(b.plate));
  if (sort === "za") filtered.sort((a,b)=>b.plate.localeCompare(a.plate));

  stats.innerText = `Antall registreringsnummer: ${filtered.length}`;

  list.innerHTML = "";

  filtered.forEach((car) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <div>
        <div class="plate">${car.plate}</div>
        <div class="time">Lagt til: ${formatDate(car.createdAt)}</div>
        <div class="time">Registrert ${car.count} ganger</div>
      </div>

      <button class="delete-btn">Slett</button>
    `;

    div.querySelector("button").addEventListener("click", () => {
      const index = cars.indexOf(car);
      deleteCar(index);
    });

    list.appendChild(div);
  });
}

/* ================= EVENTS ================= */
addBtn.addEventListener("click", addCar);

plateInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addCar();
});

plateInput.addEventListener("input", () => {
  plateInput.value = plateInput.value.toUpperCase();
});

searchInput.addEventListener("input", render);
sortSelect.addEventListener("change", render);

/* ================= INIT ================= */
render();
renderXP();
renderQuests();
renderLastCar();
