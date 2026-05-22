const plateInput = document.getElementById("plateInput");

const addBtn = document.getElementById("addBtn");

const list = document.getElementById("list");

const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");

const stats = document.getElementById("stats");

let cars = JSON.parse(localStorage.getItem("cars")) || [];
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("bilspotter-v1").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./script.js",
        "./manifest.json"
      ]);
    })
  );
});


function saveCars() {
  localStorage.setItem("cars", JSON.stringify(cars));
}

function addCar() {

  const plate = plateInput.value.trim().toUpperCase();

  if (!plate) return;

  // 🔍 Finn eksisterende bil
  const existing = cars.find(c => c.plate === plate);

  if (existing) {

    // ➕ Øk antall
    existing.count = (existing.count || 1) + 1;

    // 🕒 Oppdater tidspunkt
    existing.createdAt = Date.now();

  } else {

    // 🆕 Ny bil
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

function formatDate(timestamp) {

  const date = new Date(timestamp);

  return date.toLocaleString("no-NO");
}

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

function render() {

  let filtered = [...cars];
  
  const search = searchInput.value.toLowerCase();

  if (search) {
    filtered = filtered.filter(car =>
      car.plate.toLowerCase().includes(search)
    );
  }

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
  filtered.sort((a, b) => extractNumber(a.plate) - extractNumber(b.plate));
}

if (sort === "numDesc") {
  filtered.sort((a, b) => extractNumber(b.plate) - extractNumber(a.plate));
}
  
  stats.innerText = `Antall registreringsnummer: ${filtered.length}`;

  list.innerHTML = "";

  filtered.forEach((car, index) => {

    car.count = car.count || 1;
    
    const div = document.createElement("div");

    div.className = "card";

    div.innerHTML = `
      <div>
        <div class="plate">${car.plate}</div>
        <div class="time">
          Lagt til: ${formatDate(car.createdAt)}
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
  
renderLastCar();
  
}

  
  function renderLastCar() {
  const lastCarDiv = document.getElementById("lastCar");

  if (cars.length === 0) {
    lastCarDiv.innerHTML = "";
    return;
  }

  const last = cars[cars.length - 1];

  lastCarDiv.innerHTML = `
    <div class="last-plate">${last.plate}</div>
    <div class="last-meta">
      Lagt til ${formatDate(last.createdAt)} •
      lagt til ${last.count || 1} ganger
    </div>
  `;
}

addBtn.addEventListener("click", addCar);

plateInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addCar();
  }
});

function extractNumber(plate) {
  const match = plate.match(/\d+/g);
  if (!match) return 0;
  return parseInt(match.join(""), 10);
}

sortSelect.addEventListener("change", render);

searchInput.addEventListener("input", render);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").then((reg) => {
    console.log("SW registered");

    // 🔥 sjekker oppdateringer hvert 30 sek
    setInterval(() => {
      reg.update();
    }, 30000);
  });
}

navigator.serviceWorker.addEventListener("controllerchange", () => {
  alert("Ny versjon tilgjengelig! Last siden på nytt 🔄");
});


renderLastCar();
render();
renderLastCar();

if (plateInput) {
  plateInput.addEventListener("input", () => {
    plateInput.value = plateInput.value.toUpperCase();
  });
}
