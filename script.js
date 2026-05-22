const plateInput = document.getElementById("plateInput");
const addBtn = document.getElementById("addBtn");

const list = document.getElementById("list");

const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");

const stats = document.getElementById("stats");

let cars = JSON.parse(localStorage.getItem("cars")) || [];

/* 💾 SAVE */
function saveCars() {
  localStorage.setItem("cars", JSON.stringify(cars));
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
