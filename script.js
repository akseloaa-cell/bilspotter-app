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

let quests = JSON.parse(localStorage.getItem("quests"));

if (!quests || !quests.daily || !quests.weekly) {
  quests = structuredClone(questPool);
}

// 🔥 HARD LIMIT (ALLTID)
quests.daily = quests.daily.slice(0, 2);
quests.weekly = quests.weekly.slice(0, 2);

let lastHas67 = false;
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

    if (!plate || typeof plate !== "string") {
    return {
      letters: "",
      numbers: "",
      sum: 0,
      hasText: () => false,
      hasDoubleLetter: false
    };
  }
  
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

function calculateXP(plate) {

  const letters = plate.replace(/\d/g, "");
  const numbers = plate.replace(/\D/g, "");
  
if (numbers.includes("67")) {
    return 67;
  }
  
  let xp = 10; // base XP

  // 🔠 dobbel bokstav (AA, BB osv)
  if (/(.)\1/.test(letters)) {
    xp += 20;
  }

  // 🔢 like tall (11, 222 osv)
 const match = numbers.match(/(\d)\1+/g);

if (match) {
  match.forEach(m => {
    const length = m.length;

    // 2 like → 20 XP
    if (length === 2) xp += 20;

    // 3 like → 30 XP
    else if (length === 3) xp += 30;

    // 4 like → 40 XP
    else if (length === 4) xp += 50;
    else if (length === 5) xp += 100;
  });
}

  const digitCounts = {};

for (const d of numbers) {
  digitCounts[d] = (digitCounts[d] || 0) + 1;
}

for (const count of Object.values(digitCounts)) {
  if (count > 1) {
    xp += (count - 1) * 5;
  }
}

  return xp;
}
/* ================= QUEST SYSTEM ================= */
function updateQuests(plate) {

  if (!plate) return;

  const analysis = analyzePlate(plate);

  [...quests.daily, ...quests.weekly].forEach((q) => {

    if (q.completed) return;

    // 🧠 safety
    q.progress = q.progress || 0;

    let hit = false;

    // 🚗 COUNT QUEST (always increments)
    if (q.type === "countCars") {
      q.progress += 1;
    }

    // 🎯 TEXT QUEST (DL etc)
    else if (q.type === "hasText") {
      hit = analysis.hasText(q.value);
      if (hit) q.progress += 1;
    }

    // 🔢 SUM QUEST
    else if (q.type === "sumEquals") {
      hit = analysis.sum === q.value;
      if (hit) q.progress += 1;
    }

    // 🔠 DOUBLE LETTER QUEST
    else if (q.type === "doubleLetter") {
      hit = analysis.hasDoubleLetter;
      if (hit) q.progress += 1;
    }

    // 🏁 COMPLETE CHECK (UNIFIED)
    if (q.progress >= q.goal) {
      q.completed = true;
      q.progress = q.goal;

      addXP(q.reward);
      console.log("🏆 Quest fullført:", q.name);
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
 const progress = q.progress ?? 0;
const goal = q.goal ?? 1;
const percent = Math.min(100, (progress / goal) * 100 || 0);

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

function generateDailyQuests() {
  quests.daily = pickRandomQuests(questPool.daily, 2);
  saveQuests();
  renderQuests();
}

function generateWeeklyQuests() {
  quests.weekly = pickRandomQuests(questPool.weekly, 2);
  saveQuests();
  renderQuests();
}

function updateResetTimers() {

  const dailyEl = document.getElementById("dailyReset");
  const weeklyEl = document.getElementById("weeklyReset");

  if (!dailyEl || !weeklyEl) return;

  // 📅 DAILY (til midnatt)
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 0);

  const diffDaily = nextMidnight - now;

  const h = Math.floor(diffDaily / 1000 / 60 / 60);
  const m = Math.floor((diffDaily / 1000 / 60) % 60);
  const s = Math.floor((diffDaily / 1000) % 60);

  dailyEl.innerText = `${h}t ${m}m ${s}s`;

  // 📅 WEEKLY (til neste mandag)
  const nextMonday = new Date();
  const daysToMonday = (8 - now.getDay()) % 7 || 7;

  nextMonday.setDate(now.getDate() + daysToMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const diffWeek = nextMonday - now;

  const d = Math.floor(diffWeek / 1000 / 60 / 60 / 24);
  const wh = Math.floor((diffWeek / 1000 / 60 / 60) % 24);

  weeklyEl.innerText = `${d}d ${wh}t`;
}

function updateCountQuests(q) {
  q.progress = (q.progress || 0) + 1;
  return q.progress >= q.goal;
}

function pickRandomQuests(pool, max) {
  return [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, max)
    .map(q => ({
      ...q,
      progress: 0,
      completed: false
    }));
}

/* ================= CAR SYSTEM ================= */
function addCar() {

  const plate = plateInput.value.trim().toUpperCase();
  if (!plate) return;

  // 1. beregn XP FØRST
  const xp = calculateXP(plate);

  const has67 = plate.includes("67");
  // 2. oppdater data
  const existing = cars.find(c => c.plate === plate);

  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.createdAt = Date.now();
  } else {
    cars.push({
      plate,
      createdAt: Date.now(),
      count: 1,
      xp: xp,
      favorite: false
    });
  }

  // 3. gi XP til player
  addXP(xp);

  saveCars();

  plateInput.value = "";

  render();
  renderLastCar();
  updateQuests(plate);
  if (has67) {
  trigger67Wiggle();
}
}

function deleteCar(index) {
  cars.splice(index, 1);
  saveCars();
  render();
}

function renderLastCar() {

  const lastCarDiv = document.getElementById("lastCar");

  if (!lastCarDiv) return;

  if (cars.length === 0) {
    lastCarDiv.innerHTML = "";
    return;
  }

  const last = cars.reduce((latest, car) =>
    car.createdAt > latest.createdAt ? car : latest
  );

lastCarDiv.innerHTML = `
  <div class="last-header">

    <div class="last-left">

      <div class="last-label">SISTE REGISTRERING</div>

      <div class="plate-row">

        <div class="last-plate">
          ${last.plate || "?"}
        </div>

        <button class="fav-btn">
          ${last.favorite ? "⭐" : "☆"}
        </button>

      </div>

    </div>

    <div class="xp-big">
      +${last.xp || 10} XP
    </div>

  </div>

  <div class="last-meta">
    Lagt til ${formatDate(last.createdAt)}
  </div>

  <div class="last-meta">
    Registrert ${last.count || 1} ganger
  </div>
`;

 const btn = lastCarDiv.querySelector(".fav-btn");

if (btn) {
  btn.addEventListener("click", () => {

    // 🔍 finn ekte objekt i cars-array
    const car = cars.find(c =>
      c.plate === last.plate &&
      c.createdAt === last.createdAt
    );

    if (!car) return;

    car.favorite = !car.favorite;

    saveCars();

    render();          // oppdater liste
    renderLastCar();   // oppdater last card
  });
}
}

function toggleFavorite(car) {
  car.favorite = !car.favorite;
  saveCars();
  render();
}
/* ================= RENDER ================= */
function formatDate(t) {
  return new Date(t).toLocaleString("no-NO");
}

function render() {

  let filtered = [...cars];

  const search = searchInput.value.toLowerCase();

  // 🔍 search
  if (search) {
    filtered = filtered.filter(c =>
      c.plate.toLowerCase().includes(search)
    );
  }

  const sort = sortSelect.value;

  // ↕️ sort
  if (sort === "newest")
    filtered.sort((a, b) => b.createdAt - a.createdAt);

  if (sort === "oldest")
    filtered.sort((a, b) => a.createdAt - b.createdAt);

  if (sort === "az")
    filtered.sort((a, b) => a.plate.localeCompare(b.plate));

  if (sort === "za")
    filtered.sort((a, b) => b.plate.localeCompare(a.plate));

  // ⭐ (valgfritt men nice: favoritter først)
  if (sort === "favorite")
    filtered.sort((a, b) => (b.favorite === true) - (a.favorite === true));

  stats.innerText = `Antall registreringsnummer: ${filtered.length}`;

  list.innerHTML = "";

filtered.forEach((car) => {

  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <div class="card-left">

      <div class="plate-row">

        <div class="plate">
          ${car.plate}
        </div>

        <button class="fav-btn">
          ${car.favorite ? "⭐" : "☆"}
        </button>

      </div>

      <div class="time">
        Lagt til: ${formatDate(car.createdAt)}
      </div>

      <div class="time">
        Registrert ${car.count || 1} ganger
      </div>

    </div>

    <button class="delete-btn">Slett</button>
  `;

  // 🗑 delete
  div.querySelector(".delete-btn").addEventListener("click", () => {
    const index = cars.indexOf(car);
    deleteCar(index);
  });

  // ⭐ favorite toggle
  div.querySelector(".fav-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    car.favorite = !car.favorite;
    saveCars();
    render();
    renderLastCar();
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

function shouldResetDaily() {

  const last = localStorage.getItem("dailyReset");
  const today = new Date().toDateString();

  if (last !== today) {
    localStorage.setItem("dailyReset", today);
    generateDailyQuests();
  }
}

function shouldResetWeekly() {

  const last = localStorage.getItem("weeklyReset");
  const now = new Date();

  const monday = new Date();
  const daysToMonday = (8 - now.getDay()) % 7 || 7;
  monday.setDate(now.getDate() + daysToMonday);

  const weekId = monday.toDateString();

  if (last !== weekId) {
    localStorage.setItem("weeklyReset", weekId);
    generateWeeklyQuests();
  }
}

function trigger67Wiggle() {
  const el = document.getElementById("lastCar");
  if (!el) return;

  el.classList.add("wiggle-67");

  setTimeout(() => {
    el.classList.remove("wiggle-67");
  }, 1200);
}
/* ================= INIT ================= */
render();
renderXP();
renderQuests();
renderLastCar();
shouldResetDaily();
shouldResetWeekly();
updateResetTimers();
setInterval(updateResetTimers, 1000);

window.quests = quests;
window.cars = cars;
window.player = player;
