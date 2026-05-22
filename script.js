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

  cars.push({
    plate,
    createdAt: Date.now()
  });

  saveCars();

  plateInput.value = "";

  render();
}

function deleteCar(id) {
  cars.splice(id, 1);

  saveCars();

  render();
}

function formatDate(timestamp) {

  const date = new Date(timestamp);

  return date.toLocaleString("no-NO");
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

  stats.innerText = `Antall registreringsnummer: ${filtered.length}`;

  list.innerHTML = "";

  filtered.forEach((car, index) => {

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

render();
