importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCd6VV5jVJXQ_xZbse7yvL3czd91DglmOU",
  authDomain: "ecommercetunitoku.firebaseapp.com",
  projectId: "ecommercetunitoku",
  storageBucket: "ecommercetunitoku.firebasestorage.app",
  messagingSenderId: "811418653806",
  appId: "1:811418653806:web:648e869345a18f8e27427f",
  measurementId: "G-JFNQ2PNPCE"
};

const app = firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/images/favicon.jpg',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
