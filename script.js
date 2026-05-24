const plateInput = document.getElementById("plateInput");
const addBtn = document.getElementById("addBtn");

const list = document.getElementById("list");

const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");

const stats = document.getElementById("stats");

let cars = JSON.parse(localStorage.getItem("cars")) || [];

/* 🎮 PLAYER DATA */
let player = JSON.parse(localStorage.getItem("player")) || {
  xp: 0,
  level: 1
};

/* 📅 QUESTS */
let quests = JSON.parse(localStorage.getItem("quests")) || {

  daily: [
    {
      id: "daily1",
      name: "Spot 5 biler",
      goal: 5,
      progress: 0,
      reward: 50,
      completed: false
    },

    {
      id: "daily2",
      name: "Spot 10 biler",
      goal: 10,
      progress: 0,
      reward: 100,
      completed: false
    }
  ],

  weekly: [
    {
      id: "weekly1",
      name: "Spot 50 biler",
      goal: 50,
      progress: 0,
      reward: 500,
      completed: false
    }
  ]
};

/* 💾 SAVE */
function saveCars() {
  localStorage.setItem("cars", JSON.stringify(cars));
}

/* 💾 SAVE PLAYER */
      quest.progress++;

      if (quest.progress >= quest.goal) {

        quest.completed = true;

        addXP(quest.reward);

        alert(`🏆 Quest fullført: ${quest.name}`);

  saveQuests();

  renderQuests();
      }

/* 📱 RENDER QUESTS */
function renderQuests() {

  const dailyEl = document.getElementById("dailyQuests");
  const weeklyEl = document.getElementById("weeklyQuests");

  dailyEl.innerHTML = "";
  weeklyEl.innerHTML = "";

  quests.daily.forEach((quest) => {

    const percent = (quest.progress / quest.goal) * 100;

    dailyEl.innerHTML += `
      <div class="quest">

        <div class="quest-name">
          ${quest.completed ? "✅" : "🎯"} ${quest.name}
        </div>

        <div class="quest-progress">
          ${quest.progress} / ${quest.goal}
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

    const percent = (quest.progress / quest.goal) * 100;

    weeklyEl.innerHTML += `
      <div class="quest">

        <div class="quest-name">
          ${quest.completed ? "✅" : "🏁"} ${quest.name}
        </div>

        <div class="quest-progress">
          ${quest.progress} / ${quest.goal}
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

/* 🔢 HENT TALL FRA SKILT */
function extractNumber(plate) {
  const match = plate.match(/\d+/g);

  if (!match) return 0;

  return parseInt(match.join(""), 10);
}

/* 🕒 FORMAT DATE */
function formatDate(timestamp) {
  const date = new Date(timestamp);

  return date.toLocaleString("no-NO");
}

/* ➕ LEGG TIL BIL */
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
updateQuests();
  
  plateInput.value = "";

  render();
}

/* ❌ SLETT */
function deleteCar(id) {

  cars.splice(id, 1);

  saveCars();

  render();
}

/* 📱 SISTE BIL CARD */
function renderLastCar() {

  const lastCarDiv = document.getElementById("lastCar");

  if (!lastCarDiv) return;

  if (cars.length === 0) {
    lastCarDiv.innerHTML = "";
    return;
  }

  const last = cars.reduce((latest, car) => {
    return car.createdAt > latest.createdAt ? car : latest;
  });

  lastCarDiv.innerHTML = `
    <div class="last-plate">${last.plate}</div>

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

  const search = searchInput.value.toLowerCase();

  /* 🔍 SEARCH */
  if (search) {
    filtered = filtered.filter(car =>
      car.plate.toLowerCase().includes(search)
    );
  }

  /* ↕️ SORT */
  const sort = sortSelect.value;

  if (sort === "newest") {
    filtered.sort((a, b) => b.createdAt - a.createdAt);
  }

  if (sort === "oldest") {
    filtered.sort((a, b) => a.createdAt - b.createdAt);
  }

  if (sort === "az") {
    filtered.sort((a, b) => a.plate.localeCompare(b.plate));
  }

  if (sort === "za") {
    filtered.sort((a, b) => b.plate.localeCompare(a.plate));
  }

  if (sort === "num") {
    filtered.sort((a, b) =>
      extractNumber(a.plate) - extractNumber(b.plate)
    );
  }

  if (sort === "numDesc") {
    filtered.sort((a, b) =>
      extractNumber(b.plate) - extractNumber(a.plate)
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

    const div = document.createElement("div");

    div.className = "card";

    div.innerHTML = `
      <div>
        <div class="plate">${car.plate}</div>

        <div class="time">
          Lagt til: ${formatDate(car.createdAt)}
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

        const realIndex = cars.indexOf(car);

        deleteCar(realIndex);

      });

    list.appendChild(div);

  });

  /* 📱 SISTE BIL */
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

/* 🔠 AUTO STORE BOKSTAVER */
plateInput.addEventListener("input", () => {

  plateInput.value =
    plateInput.value.toUpperCase();

});

/* 🔍 SEARCH */
searchInput.addEventListener("input", render);

/* ↕️ SORT */
sortSelect.addEventListener("change", render);

/* ⚡ SERVICE WORKER */
if ("serviceWorker" in navigator) {

  navigator.serviceWorker
    .register("service-worker.js")
    .then((reg) => {

      console.log("SW registered");

      /* 🔄 CHECK FOR UPDATES */
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

/* 🚀 START */
render();
renderXP();
renderQuests();
