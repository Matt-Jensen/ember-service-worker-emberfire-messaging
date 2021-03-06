import {
  APP_ID,
  API_KEY,
  AUTH_DOMAIN,
  DATABASE_URL,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  FIREBASE_VERSION,
  DEFAULT_BACKGROUND_MESSAGE_TITLE,
  NOTIFICATION
} from 'ember-service-worker-emberfire-messaging/service-worker/config';

importScripts(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`);
importScripts(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging.js`);

firebase.initializeApp({
  apiKey: API_KEY,
  appId: APP_ID,
  authDomain: AUTH_DOMAIN,
  databaseURL: DATABASE_URL,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID
});

const messaging = firebase.messaging();
const globalNotification = JSON.parse(NOTIFICATION);

/**
 * Called when user is not viewing web page
 * @return {Promise} - resolves {NotificationEvent}
 */
messaging.setBackgroundMessageHandler(function(payload) {
  /*
   For this custom `setBackgroundMessageHandler` to be invoked
   by FCM the `data` parameter must be used, as using `notification`
   will only invoke a default background handler:
   https://github.com/firebase/quickstart-js/issues/134
   */
  const notification = payload.notification || payload.data || {};
  const title = notification.title || DEFAULT_BACKGROUND_MESSAGE_TITLE;

  /**
   * Overwrite global notification options
   * with individual notification's options
   * @type {Object}
   */
  const options = Object.assign({}, globalNotification, notification);
  return self.registration.showNotification(title, options);
});
