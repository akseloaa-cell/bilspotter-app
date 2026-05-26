import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX",
  projectId: "XXX",
  messagingSenderId: "XXX",
  appId: "XXX"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function enablePush() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const token = await getToken(messaging, {
    vapidKey: "BMbYF_FmOgLKZDM8kTdvY5BZihwKuMC0at3AYhj7vgJoaVwpe-mKpyCs0pOus0e1dZGK5JwSddr_MxRZm5EjgS4"
  });

  console.log("🔥 PUSH TOKEN:", token);

  return token;
}

