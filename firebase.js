import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getMessaging,
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX",
  projectId: "XXX",
  messagingSenderId: "XXX",
  appId: "XXX"
};

/* ================= INIT ================= */
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/* ================= VAPID ================= */
const VAPID_KEY = "BMbYF_FmOgLKZDM8kTdvY5BZihwKuMC0at3AYhj7vgJoaVwpe-mKpyCs0pOus0e1dZGK5JwSddr_MxRZm5EjgS4";

/* ================= UTILS ================= */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/* ================= ENABLE PUSH ================= */
export async function enablePush() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("❌ Notifications not allowed");
      return null;
    }

    // 🔥 viktig: sørg for service worker
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    console.log("🔥 PUSH TOKEN:", token);

    return token;

  } catch (err) {
    console.error("Push error:", err);
  }
}

/* ================= FOREGROUND NOTIFICATIONS ================= */
onMessage(messaging, (payload) => {
  console.log("📩 Foreground message:", payload);

  if (payload.notification) {
    alert(`${payload.notification.title}\n\n${payload.notification.body}`);
  }
});

/* ================= OPTIONAL EXPORT ================= */
export { messaging };
