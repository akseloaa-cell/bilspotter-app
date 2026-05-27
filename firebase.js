import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getMessaging,
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyDKKkRqNnXsoqE26lr7L9siHDmKJ67bEyI",
  authDomain: "bilspotter.firebaseapp.com",
  projectId: "bilspotter",
  storageBucket: "bilspotter.firebasestorage.app",
  messagingSenderId: "503216789907",
  appId: "1:503216789907:web:7bfc28a12e94b95ff73066"
};

/* ================= INIT ================= */
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/* ================= VAPID ================= */
const VAPID_KEY = "BMbYF_FmOgLKZDM8kTdvY5BZihwKuMC0at3AYhj7vgJoaVwpe-mKpyCs0pOus0e1dZGK5JwSddr_MxRZm5EjgS4";

/* ================= ENABLE PUSH ================= */
export async function enablePush() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("❌ Notifications not allowed");
      return null;
    }

    // 🔥 viktig: sørg for service worker
  const registration =
  await navigator.serviceWorker.register("/firebase-messaging-sw.js");

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
