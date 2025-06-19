importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging.js");

// Inicialización de Firebase (igual que en el index.html)
firebase.initializeApp({
  apiKey: "AIzaSyCivT-KOZ_R5k3HGinsRHW_O29khMYdWBw",
  authDomain: "notificaciones-super.firebaseapp.com",
  projectId: "notificaciones-super",
  messagingSenderId: "1060951750396",
  appId: "1:1060951750396:web:12d7b3db78a226796dc979"
});

const messaging = firebase.messaging();

// Manejador para mostrar notificaciones en segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Notificación recibida:', payload);
  const { title, body, icon } = payload.notification;

  self.registration.showNotification(title, {
    body: body,
    icon: icon || '/icon.png'
  });
});
