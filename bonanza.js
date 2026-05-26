let bonanzaActive = false;
let bonanzaQuest = null;
let bonanzaTimer = null;

/* ================= NOTIFY ================= */
export function notify(title, body) {
  if (Notification.permission !== "granted") return;

  new Notification(title, {
    body,
    icon: "b98ab4e3-b4bf-417e-a76a-b7bb691b1da5.png"
  });
}

/* ================= START BONANZA ================= */
export function startBonanza(addXP, showXPPopup, renderBonanzaUI) {

  bonanzaActive = true;

  bonanzaQuest = {
    name: "⚡ BONANZA QUEST",
    type: "countCars",
    goal: 5,
    reward: 500,
    progress: 0
  };

  notify("⚡ BONANZA!", "Du har 15 min til å fullføre!");

  bonanzaTimer = setTimeout(() => {
    endBonanza(false, renderBonanzaUI);
  }, 15 * 60 * 1000);

  renderBonanzaUI?.(bonanzaQuest);
}

/* ================= END BONANZA ================= */
export function endBonanza(success, renderBonanzaUI) {

  bonanzaActive = false;

  if (!success) {
    notify("⛔ Bonanza over", "Du rakk det ikke!");
  }

  bonanzaQuest = null;

  renderBonanzaUI?.(null);
}

/* ================= UPDATE ================= */
export function updateBonanza(plate, addXP, showXPPopup, renderBonanzaUI) {

  if (!bonanzaActive || !bonanzaQuest) return;

  bonanzaQuest.progress = (bonanzaQuest.progress || 0) + 1;

  if (bonanzaQuest.progress >= bonanzaQuest.goal) {

    addXP(bonanzaQuest.reward);
    showXPPopup(bonanzaQuest.reward);

    endBonanza(true, renderBonanzaUI);
  }
}

/* ================= TRIGGER ================= */
export function checkBonanzaTrigger() {

  const now = new Date();
  const hour = now.getHours();

  if (hour < 10 || hour > 22) return;
  if (bonanzaActive) return;

  const chance = Math.random();

  if (chance < 0.05) {
    return true; // signal til script.js
  }

  return false;
}
