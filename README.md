[![Build Status](https://travis-ci.org/Matt-Jensen/ember-service-worker-emberfire-messaging.svg?branch=master)](https://travis-ci.org/Matt-Jensen/ember-service-worker-emberfire-messaging)
[![Ember Observer Score](http://emberobserver.com/badges/ember-service-worker-emberfire-messaging.svg)](http://emberobserver.com/addons/ember-service-worker-emberfire-messaging)
![Ember Version](https://embadge.io/v1/badge.svg?start=2.12.0)

# ember-service-worker-emberfire-messaging

A push notification Ember Service Worker plugin for Firebase Cloud Messaging using [Emberfire](https://github.com/firebase/emberFire).

## Installation
`ember install ember-service-worker-emberfire-messaging`

## Configuration
Step 1: basic setup is done in the `config/environment.js` file:
```js
// Ensure Emberfire is correctly configured
var ENV = {
  firebase: {
    apiKey: 'xyz',
    authDomain: 'YOUR-FIREBASE-APP.firebaseapp.com',
    databaseURL: 'https://YOUR-FIREBASE-APP.firebaseio.com',
    storageBucket: 'YOUR-FIREBASE-APP.appspot.com',
    projectId: 'my-firebase-app', // optional
    messagingSenderId: "123456789012" // Required!
  }
};
```
Message sender Id can be found in your firebase console > project settings > add app button > Add Firebase to your web app.

### Set GCM Sender ID
Step 2: `gcm_sender_id` must be configured in your manifest.json file.  For this purpose I recommend using [Ember Web App](https://github.com/san650/ember-web-app) where in your `config/manifest.js` you should add the following:
```js
module.exports = function() {
  return {
    // ...
    // gcm_sender_id: '103953800507'
  };
}
```
This Google Cloud Sender ID is not the same as your message sender ID.  **You can simply copy the value `103953800507` into your manifest.json!**

### Request User Permission
Step 3: Use the Firebase Message Service to request the user's permission and subscribe to new message events.

```js
export default default Route.extend({
  firebaseMessage: inject(),

  actions: {
    requestUserPermission() {
      /*
       Before you can receive any messages you need to request the users'
       permission to get push notifications
       */
      this.get('firebaseMessage').initialize()
      .then((token) => { // FCM registration token
        // Homework: persist this token to your server!
      });
    }
  },

  init() {
    this._super(...arguments);

    /*
     React to Firebase message when app is being viewed by user
     */
    this.get('firebaseMessage').subscribe((message) => {
      console.log('FCM JSON', message);
    });
  }
});
```

## Misc Options:
Customize this addon by adding any of the following to the `config/environment.js` file:
```js
var ENV = {
  'esw-emberfire-messaging': {
    firebaseVersion: '4.2.0', // default (Firebase version used by SW)
    defaultBackgroundMessageTitle: 'New Message', // default (fallback title for background message)
    notificationOptions: {
      //All supported notification options can be passed here && payload should have data key without the notification key
      vibrate: [200, 100, 200, 300]
    }
  }
};
```

## Triggering a Firebase Message
To test your app's Firebase Messaging try the following in the terminal:

```sh
curl -X POST -H "Authorization: key=<YOUR_SERVER_KEY>" -H "Content-Type: application/json" -d '{
  "notification": {
    "title": "Portugal vs. Denmark",
    "body": "5 to 1",
    "icon": "firebase-logo.png",
    "click_action": "http://localhost:4200"
  },
  "to": <DEVICE_REGISTRATION_TOKEN>
}' "https://fcm.googleapis.com/fcm/send"
```
`YOUR_SERVER_KEY` can be found in the firebase console under Project Settings > Cloud Messaging > Server key.
`DEVICE_REGISTRATION_TOKEN` is the token you requested via this addon's firebase-message service.

[Please refer to the Firebase docs for more information]( https://firebase.google.com/docs/cloud-messaging/js/first-message)

## Contributing
* `git clone <repository-url>` this repository
* `cd ember-service-worker-emberfire-messaging`
* `yarn`

## Running Tests

* `yarn test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
