/**
 * Prevents Firebase from loading service worker at default location:
 * `/firebase-messaging-sw.js` instead using the registered ember service worker
 * registered by ember-service-worker
 * @param {Ember.Application} applicationInstance
 */
export function initialize(applicationInstance, _navigator) {
  if (typeof FastBoot === 'undefined') {
    if (!_navigator) _navigator = window && window.navigator;

    if (_navigator && 'serviceWorker' in _navigator) {
      const firebase = applicationInstance.lookup('service:firebase-app');
      const { options = {} } = firebase;

      if (!options.messagingSenderId) {
        throw new Error('Please set `firebase: { messagingSenderId }` in your config/environment.js');
      }

      _navigator.serviceWorker.ready.then((reg) => {
        return firebase.messaging().then(message => message.useServiceWorker(reg));
      });
    }
  }
}

export default {
  name: 'register-firebase-service-worker',
  initialize
};
