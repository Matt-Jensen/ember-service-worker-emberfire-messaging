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
  console.log('payload entered');
  const {
    //Apparently, the notification key is unnecessary as this callback will never be called when the notification key is set
    data: {
      title,
      body,
      ...rest //rest destructuring provides an easy way to dump all the other data options received from server into an object that can be used to set the data key of the options passed to the showNofications method
    } = {} // in destructuring this data key performs two functions:1. shows you which key in the object has the data we are interested in. 2. the name of the variable to use to get the data in this case, 'data' which is the same name as the key, super!!
  } = payload;
  let notificationOptions = NOTIFICATION_OPTIONS //NOTIFICATION_OPTIONS is readonly hence necessary to set another local variable;
  //###### I believe the condition checks below will be unnecessary (and can be removed) once you parse the notificationOptions object in the build step
  if (typeof notificationOptions !== 'object') {
    notificationOptions = {
      data: {}
    };
  } else if (typeof notificationOptions.data !== 'object') {
    notificationOptions.data = {};
  }
  //###### I believe the condition checks above will be unnecessary (and can be removed) once you parse the notificationOptions object in the build step
  console.log('Before tag notificationOptions');
  console.log(notificationOptions);
  notificationOptions.tag = 'request'; //This is temporary, should be set in environment config
  console.log('After tag');
  notificationOptions.body = notificationOptions.body || body; //Allow you to override body option from environment config
  notificationOptions.data = Object.assign({}, rest, notificationOptions.data); // allows you to merge & override data key values (rest) from the server payload with notificationOptions.data key values

  const notificationTitle = title || DEFAULT_BACKGROUND_MESSAGE_TITLE;
  console.log('Show notification');
  var notificationFilter = {
    tag: notificationOptions.tag
  };
  return self.registration.getNotifications(notificationFilter)
    .then(function (notifications) {
      console.log('notifications array');
      console.log(notifications);
      if (notifications && notifications.length !== 0) {
        console.log('notification length entered =');
        console.log(notifications.length);
        for (var i = 0; i < notifications.length; i++) {
          var existingNotification = notifications[i];
          existingNotification.close();
        }
      }
      //return showNotification(title, message, icon, notificationData);
      console.log('final show notification called');
      return self.registration.showNotification(notificationTitle, notificationOptions);
    });
  //return self.registration.showNotification(notificationTitle, notificationOptions);
});
//Also only called when the payload from server has the data key only without the notification key

function showNotification(title, body, data) {
  var notificationOptions = {
    body: body,
    //icon: icon ? icon : 'images/touch/chrome-touch-icon-192x192.png',
    tag: 'request',
    data: data
  };

  self.registration.showNotification(title, notificationOptions);
  return;
}

self.onnotificationclick = function (event) {
  console.log('New notification click called');

  console.log('event.notification object');
  console.log(event.notification);
  console.log('event object');
  console.log(event);
  console.log('event.notification.data.agentId');
  console.log(event.notification.data.agentId);
  console.log('event.notification.data.domain');
  console.log(event.notification.data.domain);

  event.notification.close();
  const myRequest = new Request('https://us-central1-mpesa-on-zuru.cloudfunctions.net/isIncomingToAgentSet');
  console.log('init options set on fetch');
  event.waitUntil(fetch(myRequest, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: `{"agentId":"${event.notification.data.agentId}"}`
  }).then(function (response) {
    console.log('Service worker response object');
    console.log(response);
    if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
        response.status);
      // Throw an error so the promise is rejected and catch() is executed
      throw new Error();
    }
    return clients.matchAll({
      type: "window",
      includeUncontrolled: !0
    }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url == event.notification.data.domain && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow)
        return clients.openWindow(event.notification.data.domain);
    });
  }).catch(function (err) {
    console.error('Unable to retrieve data', err);
    var title = 'You Missed a Request';
    var message = event.notification.data.body;
    return showNotification(title, message);
  }));
};
