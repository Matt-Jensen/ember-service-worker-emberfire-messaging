/**
 * Prevents Firebase from loading service worker at default location:
 * `/firebase-messaging-sw.js` instead using the registered ember service worker
 * registered by ember-service-worker
 * @param {Ember.Application} applicationInstance
 * @param {navigator} _navigator
 */
export function initialize(applicationInstance, _navigator) {
  if (!_navigator) _navigator = navigator;


  if (typeof FastBoot === 'undefined' && 'serviceWorker' in _navigator) {
    const firebase = applicationInstance.lookup('service:firebase-app');
    const { options = {} } = firebase;

    if (!options.messagingSenderId) {
      throw new Error('Please set `firebase: { messagingSenderId }` in your config/environment.js');
    }

    _navigator.serviceWorker.ready.then((reg) =>
      firebase.messaging().useServiceWorker(reg));
  }
}

export default {
  name: 'register-firebase-service-worker',
  initialize
};
