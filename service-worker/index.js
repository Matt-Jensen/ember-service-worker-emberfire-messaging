import {
  VERSION,
  API_KEY,
  AUTH_DOMAIN,
  DATABASE_URL,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  FIREBASE_VERSION,
  DEFAULT_BACKGROUND_MESSAGE_TITLE,
  NOTIFICATION_OPTIONS
} from 'ember-service-worker-emberfire-messaging/service-worker/config';

importScripts(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`);
importScripts(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging.js`);

firebase.initializeApp({
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  databaseURL: DATABASE_URL,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID
});

const messaging = firebase.messaging();

/**
 * Called when user is not viewing web page
 * @return {Promise} NotificationEvent
 */
messaging.setBackgroundMessageHandler(function (payload) {
  const {
    notification = {},
      data = {}
  } = payload;
  const notificationOptions = Object.assign({},
    notification,
    data,
    NOTIFICATION_OPTIONS //console.log(NOTIFICATION_OPTIONS), shows => [object object] and is not merging in the object correctly. How can we parse it into an object correctly?
  );
  const title = notificationOptions.title || DEFAULT_BACKGROUND_MESSAGE_TITLE;
   return self.registration.showNotification(title, notificationOptions).then(notificationEvent => {
    if (notificationOptions.timeOut) {
      let notif = notificationEvent.notification;
      setTimeout(() => notif.close(), notificationOptions.timeOut);
    }
  });
});
