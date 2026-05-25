import { questTemplates } from "./quests.js";
import { questPool } from "./quests.js";

const plateInput = document.getElementById("plateInput");
const addBtn = document.getElementById("addBtn");

const list = document.getElementById("list");

const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");

const stats = document.getElementById("stats");

/* 🚗 CARS */
let cars = JSON.parse(localStorage.getItem("cars")) || [];

/* 🎮 PLAYER */
let player = JSON.parse(localStorage.getItem("player")) || {
  xp: 0,
  level: 1
};

/* 📅 QUESTS */
let quests =
  JSON.parse(localStorage.getItem("quests")) ||
  structuredClone(questTemplates);

/* 💾 SAVE */
function saveCars() {
  localStorage.setItem("cars", JSON.stringify(cars));
}

function savePlayer() {
  localStorage.setItem("player", JSON.stringify(player));
}

function saveQuests() {
  localStorage.setItem("quests", JSON.stringify(quests));
}

/* 🔢 NUMBER SORT */
function extractNumber(plate) {

  const match = plate.match(/\d+/g);

  if (!match) return 0;

  return parseInt(match.join(""), 10);
}

/* 🕒 DATE */
function formatDate(timestamp) {

  const date = new Date(timestamp);

  return date.toLocaleString("no-NO");
}

/* ⭐ XP */
function addXP(amount) {

  player.xp += amount;

  const needed =
  Math.floor(
    75 + (player.level * player.level * 35)
  );

  if (player.xp >= needed) {

    player.xp -= needed;

    player.level++;

    alert(`🎉 Level Up! Du er nå level ${player.level}`);
  }

  savePlayer();

  renderXP();
}

/* 📊 XP UI */
function renderXP() {

  const levelEl = document.getElementById("level");
  const xpText = document.getElementById("xpText");
  const xpFill = document.getElementById("xpFill");

  if (!levelEl || !xpText || !xpFill) return;

  const needed =
  Math.floor(75 + (player.level * player.level * 35));

  levelEl.innerText = player.level;

  xpText.innerText =
    `${player.xp} / ${needed} XP`;

  xpFill.style.width =
    `${(player.xp / needed) * 100}%`;
}

/* 📅 UPDATE QUESTS */
function updateQuests() {

  [...quests.daily, ...quests.weekly]
    .forEach((quest) => {

      if (!quest.completed) {

        quest.progress++;

        if (quest.progress >= quest.goal) {

          quest.completed = true;

          addXP(quest.reward);

          alert(`🏆 Quest fullført: ${quest.name}`);
        }
      }

    });

  saveQuests();

  renderQuests();
}

/* 📱 RENDER QUESTS */
function renderQuests() {

  const dailyEl =
    document.getElementById("dailyQuests");

  const weeklyEl =
    document.getElementById("weeklyQuests");

  if (!dailyEl || !weeklyEl) return;

  dailyEl.innerHTML = "";
  weeklyEl.innerHTML = "";

  quests.daily.forEach((quest) => {

    const percent =
      (quest.progress / quest.goal) * 100;

    dailyEl.innerHTML += `
      <div class="quest">

        <div class="quest-name">
          ${quest.completed ? "✅" : "🎯"} ${quest.name}
        </div>

        <div class="quest-progress">
  ${quest.progress} / ${quest.goal}
  • ⭐ ${quest.reward} XP
</div>

        <div class="quest-bar">
          <div
            class="quest-fill"
            style="width:${percent}%"
          ></div>
        </div>

      </div>
    `;
  });

  quests.weekly.forEach((quest) => {

    const percent =
      (quest.progress / quest.goal) * 100;

    weeklyEl.innerHTML += `
      <div class="quest">

        <div class="quest-name">
          ${quest.completed ? "✅" : "🏁"} ${quest.name}
        </div>

       <div class="quest-progress">
  ${quest.progress} / ${quest.goal}
  • ⭐ ${quest.reward} XP
</div>

        <div class="quest-bar">
          <div
            class="quest-fill"
            style="width:${percent}%"
          ></div>
        </div>

      </div>
    `;
  });
}

/* ⏳ RESET TIMERS */
function updateResetTimers() {

  const dailyEl =
    document.getElementById("dailyReset");

  const weeklyEl =
    document.getElementById("weeklyReset");

  if (!dailyEl || !weeklyEl) return;

  /* 📅 DAILY */

  const now = new Date();

  const nextMidnight = new Date();

  nextMidnight.setHours(24, 0, 0, 0);

  const dailyDiff =
    nextMidnight - now;

  const dailyHours =
    Math.floor(dailyDiff / 1000 / 60 / 60);

  const dailyMinutes =
    Math.floor(
      (dailyDiff / 1000 / 60) % 60
    );

  const dailySeconds =
    Math.floor(
      (dailyDiff / 1000) % 60
    );

dailyEl.innerText =
  `${dailyHours}t ${dailyMinutes}m ${dailySeconds}s`;

  /* 🗓️ WEEKLY */

  const nextMonday = new Date();

  const daysUntilMonday =
    (8 - now.getDay()) % 7 || 7;

  nextMonday.setDate(
    now.getDate() + daysUntilMonday
  );

  nextMonday.setHours(0,0,0,0);

  const weeklyDiff =
    nextMonday - now;

  const weeklyDays =
    Math.floor(
      weeklyDiff / 1000 / 60 / 60 / 24
    );

  const weeklyHours =
    Math.floor(
      (weeklyDiff / 1000 / 60 / 60) % 24
    );

  weeklyEl.innerText =
  `${weeklyDays}d ${weeklyHours}t`;
}
/* ➕ ADD CAR */
function addCar() {

  const plate =
    plateInput.value.trim().toUpperCase();

  if (!plate) return;

  const existing =
    cars.find(c => c.plate === plate);

  if (existing) {

    existing.count =
      (existing.count || 1) + 1;

    existing.createdAt = Date.now();

  } else {

    cars.push({
      plate,
      createdAt: Date.now(),
      count: 1
    });
  }

  addXP(10);

  updateQuests();

  saveCars();

  plateInput.value = "";

  render();
}

/* ❌ DELETE */
function deleteCar(id) {

  cars.splice(id, 1);

  saveCars();

  render();
}

/* 📱 LAST CAR */
function renderLastCar() {

  const lastCarDiv =
    document.getElementById("lastCar");

  if (!lastCarDiv) return;

  if (cars.length === 0) {

    lastCarDiv.innerHTML = "";

    return;
  }

  const last = cars.reduce((latest, car) => {
    return car.createdAt > latest.createdAt
      ? car
      : latest;
  });

  lastCarDiv.innerHTML = `

    <div style="
      font-size:11px;
      opacity:0.7;
      margin-bottom:6px;
      letter-spacing:1px;
    ">
      SISTE REGISTRERING
    </div>

    <div class="last-plate">
      ${last.plate}
    </div>

    <div class="last-meta">
      Lagt til ${formatDate(last.createdAt)}
    </div>

    <div class="last-meta">
      Registrert ${last.count || 1} ganger
    </div>
  `;
}

/* 🔄 RENDER */
function render() {

  let filtered = [...cars];

  const search =
    searchInput.value.toLowerCase();

  /* 🔍 SEARCH */
  if (search) {

    filtered = filtered.filter(car =>
      car.plate.toLowerCase().includes(search)
    );
  }

  /* ↕️ SORT */
  const sort = sortSelect.value;

  if (sort === "newest") {
    filtered.sort((a, b) =>
      b.createdAt - a.createdAt
    );
  }

  if (sort === "oldest") {
    filtered.sort((a, b) =>
      a.createdAt - b.createdAt
    );
  }

  if (sort === "az") {
    filtered.sort((a, b) =>
      a.plate.localeCompare(b.plate)
    );
  }

  if (sort === "za") {
    filtered.sort((a, b) =>
      b.plate.localeCompare(a.plate)
    );
  }

  if (sort === "num") {
    filtered.sort((a, b) =>
      extractNumber(a.plate) -
      extractNumber(b.plate)
    );
  }

  if (sort === "numDesc") {
    filtered.sort((a, b) =>
      extractNumber(b.plate) -
      extractNumber(a.plate)
    );
  }

  /* 📊 STATS */
  stats.innerText =
    `Antall registreringsnummer: ${filtered.length}`;

  /* 🧹 CLEAR */
  list.innerHTML = "";

  /* 🚗 CARDS */
  filtered.forEach((car) => {

    car.count = car.count || 1;

    const div =
      document.createElement("div");

    div.className = "card";

    div.innerHTML = `
      <div>

        <div class="plate">
          ${car.plate}
        </div>

        <div class="time">
          Lagt til:
          ${formatDate(car.createdAt)}
        </div>

        <div class="time">
          Registrert ${car.count} ganger
        </div>

      </div>

      <button class="delete-btn">
        Slett
      </button>
    `;

    div.querySelector("button")
      .addEventListener("click", () => {

        const realIndex =
          cars.indexOf(car);

        deleteCar(realIndex);

      });

    list.appendChild(div);

  });

  renderLastCar();
}

/* 🔘 BUTTON */
addBtn.addEventListener("click", addCar);

/* ⌨️ ENTER */
plateInput.addEventListener("keypress", (e) => {

  if (e.key === "Enter") {
    addCar();
  }

});

/* 🔠 AUTO CAPS */
plateInput.addEventListener("input", () => {

  plateInput.value =
    plateInput.value.toUpperCase();

});

/* 🔍 SEARCH */
searchInput.addEventListener(
  "input",
  render
);

/* ↕️ SORT */
sortSelect.addEventListener(
  "change",
  render
);

/* ⚡ SERVICE WORKER */
if ("serviceWorker" in navigator) {

  navigator.serviceWorker
    .register("service-worker.js")
    .then((reg) => {

      console.log("SW registered");

      setInterval(() => {
        reg.update();
      }, 30000);

    });

  navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => {

      alert("Ny versjon tilgjengelig 🔄");

    }
  );
}

function analyzePlate(plate) {

  const letters = plate.replace(/\d/g, "");
  const numbers = plate.replace(/\D/g, "").split("").map(Number);

  const sum = numbers.reduce((a, b) => a + b, 0);

  return {
    letters,
    numbers,
    sum,
    hasDL: plate.includes("DL"),
    hasAB: plate.includes("AB"),
    hasDoubleLetters: /(.)\1/.test(letters),
    hasRepeatingNumbers: /(.)\1/.test(numbers.join(""))
  };
}

/* 🚀 START */
render();
renderXP();
renderQuests();
updateResetTimers();

setInterval(updateResetTimers, 1000);
