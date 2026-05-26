importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDKKkRqNnXsoqE26lr7L9siHDmKJ67bEyI",
  authDomain: "bilspotter.firebaseapp.com",
  projectId: "bilspotter",
  messagingSenderId: "503216789907",
  appId: "1:503216789907:web:7bfc28a12e94b95ff73066"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body
    }
  );
});
