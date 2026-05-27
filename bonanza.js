/* ================= STATE ================= */

let bonanzaActive =
  JSON.parse(localStorage.getItem("bonanzaActive")) || false;

let bonanzaQuest =
  JSON.parse(localStorage.getItem("bonanzaQuest")) || null;

let bonanzaEndTime =
  Number(localStorage.getItem("bonanzaEndTime")) || null;

let lastBonanza =
  Number(localStorage.getItem("lastBonanza")) || 0;

/* ================= SAVE ================= */

function saveBonanza() {
  localStorage.setItem(
    "bonanzaActive",
    JSON.stringify(bonanzaActive)
  );

  localStorage.setItem(
    "bonanzaQuest",
    JSON.stringify(bonanzaQuest)
  );

  localStorage.setItem(
    "bonanzaEndTime",
    bonanzaEndTime || ""
  );

  localStorage.setItem(
    "lastBonanza",
    lastBonanza || 0
  );
}

/* ================= NOTIFY ================= */

export function notify(title, body) {

  if (Notification.permission !== "granted") return;

  navigator.serviceWorker.getRegistration()
    .then((reg) => {

      if (!reg) return;

      reg.showNotification(title, {
        body,
        icon: "./b98ab4e3-b4bf-417e-a76a-b7bb691b1da5.png",
        badge: "./b98ab4e3-b4bf-417e-a76a-b7bb691b1da5.png"
      });

    });

}

/* ================= START ================= */

export function startBonanza(renderBonanzaUI) {

  if (bonanzaActive) return;

  bonanzaActive = true;

  lastBonanza = Date.now();

  bonanzaEndTime =
    Date.now() + 15 * 60 * 1000;

  bonanzaQuest = {
    name: "⚡ BONANZA QUEST",
    type: "countCars",
    goal: 5,
    reward: 500,
    progress: 0
  };

  saveBonanza();

  notify(
    "⚡ BONANZA STARTET!",
    "Spot 5 biler på 15 minutter for 500 XP!"
  );

  renderBonanzaUI?.(bonanzaQuest, getRemainingTime());
}

/* ================= UPDATE ================= */

export function updateBonanza(
  addXP,
  showXPPopup,
  renderBonanzaUI
) {

  if (!bonanzaActive || !bonanzaQuest) return;

  bonanzaQuest.progress++;

  // ✅ WIN
  if (bonanzaQuest.progress >= bonanzaQuest.goal) {

    addXP(bonanzaQuest.reward);

    showXPPopup?.(bonanzaQuest.reward);

    notify(
      "🏆 BONANZA FULLFØRT!",
      `Du fikk ${bonanzaQuest.reward} XP`
    );

    endBonanza(renderBonanzaUI);

    return;
  }

  saveBonanza();

  renderBonanzaUI?.(
    bonanzaQuest,
    getRemainingTime()
  );
}

/* ================= END ================= */

export function endBonanza(renderBonanzaUI) {

  bonanzaActive = false;

  bonanzaQuest = null;

  bonanzaEndTime = null;

  saveBonanza();

  renderBonanzaUI?.(null);
}

/* ================= TIMER ================= */

export function tickBonanza(renderBonanzaUI) {

  if (!bonanzaActive) return;

  const remaining = getRemainingTime();

  // ❌ TIME OUT
  if (remaining <= 0) {

    notify(
      "⛔ BONANZA OVER",
      "Tiden gikk ut!"
    );

    endBonanza(renderBonanzaUI);

    return;
  }

  renderBonanzaUI?.(
    bonanzaQuest,
    remaining
  );
}

/* ================= HELPERS ================= */

export function getRemainingTime() {

  if (!bonanzaEndTime) return 0;

  return Math.max(
    0,
    Math.floor((bonanzaEndTime - Date.now()) / 1000)
  );
}

export function isBonanzaActive() {
  return bonanzaActive;
}

/* ================= RANDOM TRIGGER ================= */

export function checkBonanzaTrigger() {

  const now = new Date();

  const hour = now.getHours();

  // kun mellom 10 og 22
  if (hour < 10 || hour >= 22) {
    return false;
  }

  // allerede aktiv
  if (bonanzaActive) {
    return false;
  }

  // cooldown 2 timer
  const cooldown =
    2 * 60 * 60 * 1000;

  if (Date.now() - lastBonanza < cooldown) {
    return false;
  }

  // ca 5% sjanse
  return Math.random() < 0.05;
}
