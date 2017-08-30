# ember-service-worker-emberfire-messaging

A push notification Ember Service Worker plugin for Firebase Cloud Messaging using [Emberfire](https://github.com/firebase/emberFire).
⚠️ Currently in beta ⚠️!

## Installation
`ember install ember-service-worker-emberfire-messaging@beta`

## Configuration
The configuration is done in the `config/environment.js` file:
```js
// Ensure Emberfire is correctly configured
var ENV = {
  firebase: {
    apiKey: 'xyz',
    authDomain: 'YOUR-FIREBASE-APP.firebaseapp.com',
    databaseURL: 'https://YOUR-FIREBASE-APP.firebaseio.com',
    storageBucket: 'YOUR-FIREBASE-APP.appspot.com',
    messagingSenderId: "123456789012" // Required!
  }
};
```
Message sender Id can be found in your firebase console > project settings > add app button > Add Firebase to your web app.

Additional options:
```js
var ENV = {
  'esw-emberfire-messaging': {
    firebaseVersion: '4.2.0', // default (Firebase version used by SW)
    defaultBackgroundMessageTitle: 'New Message' // default (title for background message)
  }
};
```

## Firebase Message Service

Request user permission and subscribe to new messages:
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
      console.log('firebase message', message);
    });

    // Firebase Messaging service interface:
    // https://firebase.google.com/docs/reference/js/firebase.messaging.Messaging
    this.get('firebaseMessage.messaging');
  }
});
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
