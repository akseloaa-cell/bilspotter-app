import { questPool } from "./quests.js";  
import {
  startBonanza,
  updateBonanza,
  checkBonanzaTrigger,
  tickBonanza
} from "./bonanza.js";
import { enablePush } from "./firebase.js";

enablePush();

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

let activeQuest = JSON.parse(localStorage.getItem("activeQuest")) || null;

let questChoices = JSON.parse(localStorage.getItem("questChoices")) || [];

if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}
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
      numbers: [],
      numberString: "",
      sum: 0,
      hasText: () => false,
      hasDoubleLetter: false,
      isPalindrome: false
    };
  }

  const upperPlate = plate.toUpperCase();

  const letters =
    upperPlate.replace(/\d/g, "");

  const numberString =
    upperPlate.replace(/\D/g, "");

  const numbers =
    numberString
      .split("")
      .map(Number);

  const sum =
    numbers.reduce((a, b) => a + b, 0);

const isPalindrome =
  numberString.length === 5 &&
  numberString ===
    numberString.split("").reverse().join("");

  return {
    letters,
    numbers,
    numberString,
    sum,

hasText: (txt) => {
  return letters.includes(txt.toUpperCase());
},

    hasNumber: (num) => {
  return numberString.includes(String(num));
},
    
    hasDoubleLetter: /(.)\1/.test(letters),

    isPalindrome
  };
}

function getPlateRarity(plate) {

  const analysis = analyzePlate(plate);

  const letters = analysis.letters;
  const numbers = analysis.numberString;

  const hasDoubleLetter = /(.)\1/.test(letters);
  const hasTripleDigit = /(\d)\1\1/.test(numbers);
  const hasFourDigits = /(\d)\1\1\1/.test(numbers);
  const hasFiveSameDigits = /^(\d)\1{4}$/.test(numbers);

  const isPalindrome =
    numbers.length === 5 &&
    numbers === numbers.split("").reverse().join("");

  const has67 = numbers.includes("67");
  const hasTwo67 = (numbers.match(/67/g) || []).length >= 2;

  const sum = analysis.sum;

  // 🔥 MYTHIC (må sjekkes først)
  if (
    (hasFiveSameDigits && hasDoubleLetter) ||
    (hasDoubleLetter && numbers === "67676")
  ) {
    return "mythic";
  }

  // 🟠 LEGENDARY
  if (
    hasFiveSameDigits ||
    (isPalindrome && hasDoubleLetter) ||
    numbers === "67676"
  ) {
    return "legendary";
  }

  // 🟣 EPIC
  if (
    isPalindrome ||
    hasFourDigits ||
    hasTwo67
  ) {
    return "epic";
  }

  // 🔵 RARE
  if (
    hasDoubleLetter ||
    hasTripleDigit ||
    sum <= 10 || sum >= 40
  ) {
    return "rare";
  }

  // 🟢 COMMON
  if (
    has67 ||
    /(\d)\1/.test(numbers)
  ) {
    return "common";
  }

  // ⚪ UNCOMMON (default)
  return "uncommon";
}

function validatePlateInput(input) {
  const plate = input.trim().toUpperCase();

  const standardPattern = /^[A-Z]{2}\s?\d{5}$/;
  const customPattern = /^CUSTOM:/;

  if (standardPattern.test(plate)) {
    return { valid: true, type: "standard", plate };
  }

  if (customPattern.test(plate)) {
    return { valid: true, type: "custom", plate: plate.replace("CUSTOM:", "").trim() };
  }

  return { valid: false };
}

function formatPlateInput(value) {
  let v = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // STANDARD: 2 bokstaver + 5 tall
  const match = v.match(/^([A-Z]{0,2})(\d{0,5})/);

  if (!match) return v;

  const letters = match[1] || "";
  const numbers = match[2] || "";

  if (numbers.length > 0) {
    return `${letters} ${numbers}`;
  }

  return letters;
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

function showXPPopup(amount) {

  const container =
    document.getElementById("xpPopupContainer");

  if (!container) return;

  const popup = document.createElement("div");

  popup.className = "xp-popup";

  popup.innerText = `⭐ +${amount} XP`;

  container.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 1800);
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

  const numberString = numbers;

const isPalindrome =
  numberString.length === 5 &&
  numberString ===
    numberString.split("").reverse().join("");

if (isPalindrome) {
  xp += 40;
}
  
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

    q.progress = q.progress || 0;

    let hit = false;

    // 🚗 COUNT QUEST
    if (q.type === "countCars") {
      q.progress += 1;
    }

    // 🎯 TEXT QUEST
 else if (q.type === "hasText") {

  if (Array.isArray(q.value)) {
    hit = q.value.some(v =>
      analysis.hasText(v)
    );
  } else {
    hit = analysis.hasText(q.value);
  }

  if (hit) q.progress += 1;
}

   else if (q.type === "palindrome") {
  hit = analysis.isPalindrome;
  if (hit) q.progress += 1;
}
     
    // 🔢 SUM QUEST
    else if (q.type === "sumEquals") {
      hit = analysis.sum === q.value;
      if (hit) q.progress += 1;
    }

    // 🔠 DOUBLE LETTER
    else if (q.type === "doubleLetter") {
      hit = analysis.hasDoubleLetter;
      if (hit) q.progress += 1;
    }

    // 🔢 TRIPLE DIGIT
    else if (q.type === "tripleDigit") {
      hit = /(\d)\1\1/.test(analysis.numberString);
      if (hit) q.progress += 1;
    }

    // 🏁 COMPLETE CHECK (ENKEL OG SIKKER)
    if (q.progress >= q.goal && !q.completed) {
      q.completed = true;
      q.progress = q.goal;

      q.claimable = true;
      console.log("🏆 Quest fullført:", q.name);
    }
  });

  saveQuests();
  renderQuests();

  // 🔥 ACTIVE QUEST
if (activeQuest && !activeQuest.completed) {

  activeQuest.progress = activeQuest.progress || 0;

  let hit = false;

  if (activeQuest.type === "countCars") {
    activeQuest.progress += 1;
  }

else if (activeQuest.type === "hasText") {

  if (Array.isArray(activeQuest.value)) {

    hit = activeQuest.value.some(v =>
      plate.toUpperCase().includes(v.toUpperCase())
    );

  } else {

    hit = plate
      .toUpperCase()
      .includes(activeQuest.value.toUpperCase());

  }

  if (hit) activeQuest.progress += 1;
}

  else if (activeQuest.type === "palindrome") {
  hit = analysis.isPalindrome;
  if (hit) activeQuest.progress += 1;
}
    
  else if (activeQuest.type === "sumEquals") {
    hit = analysis.sum === activeQuest.value;
    if (hit) activeQuest.progress += 1;
  }

  else if (activeQuest.type === "doubleLetter") {
    hit = analysis.hasDoubleLetter;
    if (hit) activeQuest.progress += 1;
  }

  else if (activeQuest.type === "tripleDigit") {
    hit = /(\d)\1\1/.test(analysis.numberString);
    if (hit) activeQuest.progress += 1;
  }

  // 🏆 COMPLETE
  if (activeQuest.progress >= activeQuest.goal) {

    activeQuest.completed = true;
    activeQuest.progress = activeQuest.goal;

activeQuest.claimable = true;

    saveActiveQuest();
    saveQuestChoices();

    renderQuestChoices();
  }

  saveActiveQuest();
  renderActiveQuest();
}
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

  const percent = goal > 0
    ? Math.min(100, (progress / goal) * 100)
    : 0;

  const canClaim = q.claimable === true;
  
  return `
    <div class="quest">
      <div class="quest-name">
        ${q.completed ? "✅" : "🎯"} ${q.name}
      </div>

      <div class="quest-progress">

  ${
    canClaim
      ? `<button class="claim-btn" onclick="claimQuest('${q.id}')">
           CLAIM ⭐ ${q.reward}
         </button>`
      : `${progress} / ${goal} • ⭐ ${q.reward} XP`
  }

</div>

      <div class="quest-bar">
        <div class="quest-fill" style="width:${percent}%"></div>
      </div>
    </div>
  `;
}

function claimQuest(id) {

  const all = [...quests.daily, ...quests.weekly];

  const q = all.find(q => q.id === id);

  if (!q) return;

  addXP(q.reward);

  q.completed = true;
  q.claimable = false;

  saveQuests();

  renderQuests();

  // 🔥 optional juicy feedback
  showXPPopup(q.reward);
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

function generateQuestChoices() {
  questChoices = pickRandomQuests(questPool.daily, 3);
  saveQuestChoices();

  renderQuestChoices(); // 🔥 VIKTIG
}

function saveQuestChoices() {
  localStorage.setItem("questChoices", JSON.stringify(questChoices));
}

function saveActiveQuest() {
  localStorage.setItem("activeQuest", JSON.stringify(activeQuest));
}

function selectQuest(q) {
  activeQuest = {
    ...q,
    progress: 0,
    completed: false
  };

  questChoices = [];

  saveActiveQuest();
  saveQuestChoices();

  renderActiveQuest();   // 🔥 MANGLET OFTE
  renderQuestChoices();
}

function claimActiveQuest() {

  if (!activeQuest) return;

  addXP(activeQuest.reward);
 showXPPopup(activeQuest.reward);
  
  activeQuest = null;

  generateQuestChoices();

  saveActiveQuest();
  saveQuestChoices();

  renderActiveQuest();
}

function renderActiveQuest() {

  const el = document.getElementById("activeQuest");

  if (!el) return;

  // ❌ ingen quest valgt
  if (!activeQuest) {

    el.innerHTML = `
      <div class="quest active">
        <div class="quest-name">🎯 Velg quest</div>
        <div class="quest-progress">Trykk for å velge</div>
      </div>
    `;

    return;
  }

  const p = activeQuest.progress || 0;

  const percent =
    Math.min(100, (p / activeQuest.goal) * 100);

  const canClaim =
    activeQuest.claimable === true;

  el.innerHTML = `
    <div class="quest active ${canClaim ? "claim-ready" : ""}">

      <div class="quest-name">
        ${activeQuest.name}
      </div>

      ${
        canClaim
          ? `
            <button class="claim-btn" onclick="claimActiveQuest()">
              CLAIM ⭐ ${activeQuest.reward}
            </button>
          `
          : `
            <div class="quest-progress">
              ${p} / ${activeQuest.goal} • ⭐ ${activeQuest.reward} XP
            </div>
          `
      }

      <div class="quest-bar">
        <div
          class="quest-fill"
          style="width:${percent}%">
        </div>
      </div>

    </div>
  `;
}

function renderQuestChoices() {
  const el = document.getElementById("questPopup");
  if (!el) return;

  // hvis man allerede har valgt quest → skjul popup
  if (activeQuest) {
    el.classList.add("hidden");
    return;
  }

  el.innerHTML = `
    <div class="quest-popup-content">
      <div class="popup-title">Velg en quest</div>

      ${questChoices.map((q, index) => `
        <div class="quest-choice" data-index="${index}">
          <div class="quest-name">${q.name}</div>
          <div class="quest-progress">⭐ ${q.reward} XP</div>
        </div>
      `).join("")}
    </div>
  `;

  el.querySelectorAll(".quest-choice").forEach(choice => {
    choice.addEventListener("click", () => {
      const index = choice.dataset.index;
      selectQuest(questChoices[index]);
      el.classList.add("hidden");
    });
  });
}

function openQuestPopup() {
  if (activeQuest) return;

  const el = document.getElementById("questPopup");
  if (!el) return;

  el.classList.remove("hidden");
  renderQuestChoices();
}

function closeQuestPopup() {
  const el = document.getElementById("questPopup");
  if (!el) return;

  el.classList.add("hidden");
}
/* ================= CAR SYSTEM ================= */
function addCar() {

  const result = validatePlateInput(plateInput.value);

if (!result.valid) {
  alert("Ugyldig skiltformat!");
  return;
}

const plate = result.plate;
const isCustom = result.type === "custom";

  // 1. beregn XP FØRST
  const xp = calculateXP(plate);
  
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
  favorite: false,
  rarity: getPlateRarity(plate),
  custom: isCustom
});
  }

  // 3. gi XP til player
  addXP(xp);

  saveCars();

  plateInput.value = "";

  render();
  renderLastCar();
  updateQuests(plate);
updateBonanza(
  plate,
  addXP,
  showXPPopup,
  renderBonanzaUI
);
  renderActiveQuest();
renderQuestChoices();
  
setTimeout(() => {
  if (plate.includes("67")) {
    trigger67Wiggle();
  }
}, 50);
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
    lastCarDiv.className = "";
    return;
  }

  const last = cars.reduce((latest, car) =>
    car.createdAt > latest.createdAt ? car : latest
  );

  const rarity = last.rarity || "uncommon";

  // 🎨 sett class på container (farge styling)
 lastCarDiv.classList.remove(...lastCarDiv.classList);
lastCarDiv.classList.add("last-car", `rarity-${rarity}`);

  lastCarDiv.innerHTML = `
    <div class="last-header">

      <div class="rarity-badge rarity-${rarity}">
        ${rarity.toUpperCase()}
      </div>

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

      render();
      renderLastCar();
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

  if (sort === "num")
  filtered.sort((a, b) => getPlateNumber(a.plate) - getPlateNumber(b.plate));

if (sort === "numDesc")
  filtered.sort((a, b) => getPlateNumber(b.plate) - getPlateNumber(a.plate));
  
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

function getPlateNumber(plate) {
  const number = String(plate || "").replace(/\D/g, "");
  return number ? Number(number) : Number.POSITIVE_INFINITY;
}
/* ================= EVENTS ================= */
addBtn.addEventListener("click", addCar);

plateInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addCar();
});

plateInput.addEventListener("input", () => {
  plateInput.value = formatPlateInput(plateInput.value);
});

searchInput.addEventListener("input", render);
sortSelect.addEventListener("change", render);

document.getElementById("activeQuest").addEventListener("click", () => {
  if (activeQuest) return;
  openQuestPopup();
});

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

const monday = new Date(now);
const daysSinceMonday = (now.getDay() + 6) % 7;
monday.setDate(now.getDate() - daysSinceMonday);
monday.setHours(0, 0, 0, 0);

  const weekId = monday.toDateString();

  if (last !== weekId) {
    localStorage.setItem("weeklyReset", weekId);
    generateWeeklyQuests();
  }
}

function trigger67Wiggle() {
  const el = document.getElementById("lastCar");
  if (!el) return;

  el.classList.remove("wiggle-67");

  // 🔥 tving mobil til å "reset animation state"
  void el.offsetHeight;

  el.classList.add("wiggle-67");
}

function renderBonanzaUI(q, remaining = 0) {

  const el =
    document.getElementById("bonanzaCard");

  if (!el) return;

  if (!q) {
    el.innerHTML = "";
    return;
  }

  const minutes =
    Math.floor(remaining / 60);

  const seconds =
    remaining % 60;

  el.innerHTML = `
    <div class="quest active bonanza">

      <div class="quest-name">
        ⚡ BONANZA
      </div>

      <div class="quest-progress">
        ${q.progress} / ${q.goal}
      </div>

      <div class="quest-progress">
        ⏰ ${minutes}:${String(seconds).padStart(2, "0")}
      </div>

      <div class="quest-bar">
        <div
          class="quest-fill"
          style="
            width:${(q.progress / q.goal) * 100}%
          ">
        </div>
      </div>

    </div>
  `;
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

setInterval(() => {
  if (checkBonanzaTrigger()) {
   startBonanza(renderBonanzaUI);
  }
}, 2 * 60 * 1000);

renderActiveQuest();
renderQuestChoices();

/* ================= PWA / PUSH ================= */
async function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  const reg = await navigator.serviceWorker.register("./service-worker.js");
  console.log("SW registered");

  return reg;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function setupPush() {
  const reg = await navigator.serviceWorker.ready;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array("BMbYF_FmOgLKZDM8kTdvY5BZihwKuMC0at3AYhj7vgJoaVwpe-mKpyCs0pOus0e1dZGK5JwSddr_MxRZm5EjgS4")
  });

  console.log("Push subscription:", subscription);
}

registerSW().then(() => {
  setupPush();
});

window.quests = quests;
window.cars = cars;
window.player = player;
window.claimQuest = claimQuest;
window.claimActiveQuest = claimActiveQuest;



