let bonanzaActive = false;
let bonanzaQuest = null;
let bonanzaTimer = null;

/* ================= NOTIFY (fallback) ================= */
function notify(title, body) {
  if (Notification.permission !== "granted") return;

  new Notification(title, {
    body,
    icon: "b98ab4e3-b4bf-417e-a76a-b7bb691b1da5.png"
  });
}

/* ================= START ================= */
export function startBonanza(renderBonanzaUI) {
  if (bonanzaActive) return;

  bonanzaActive = true;

  bonanzaQuest = {
    name: "⚡ BONANZA",
    type: "countCars",
    goal: 5,
    reward: 500,
    progress: 0
  };

  notify("⚡ BONANZA!", "Du har 15 min!");

  bonanzaTimer = setTimeout(() => {
    endBonanza(false, renderBonanzaUI);
  }, 15 * 60 * 1000);

  renderBonanzaUI?.(bonanzaQuest);
}

/* ================= END ================= */
export function endBonanza(success, renderBonanzaUI) {
  bonanzaActive = false;

  if (!success) {
    notify("⛔ Bonanza over", "Du rakk det ikke!");
  }

  bonanzaQuest = null;
  renderBonanzaUI?.(null);
}

/* ================= UPDATE ================= */
export function tickBonanza(addXP, showXPPopup, renderBonanzaUI) {
  if (!bonanzaActive || !bonanzaQuest) return;

  bonanzaQuest.progress++;

  if (bonanzaQuest.progress >= bonanzaQuest.goal) {
    addXP(bonanzaQuest.reward);
    showXPPopup(bonanzaQuest.reward);

    endBonanza(true, renderBonanzaUI);
  }
}

/* ================= TRIGGER ================= */
export function checkBonanzaTrigger() {
  const hour = new Date().getHours();

  if (hour < 10 || hour > 22) return false;
  if (bonanzaActive) return false;

  return Math.random() < 0.05;
}
