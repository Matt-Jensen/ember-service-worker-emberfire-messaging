import RSVP from 'rsvp';
import Service from '@ember/service';
import { inject } from '@ember/service';
import { get, set } from '@ember/object';
import EmberError from '@ember/error';
import { assert } from '@ember/debug';

export default Service.extend({
  firebaseApp: inject(),

  /**
   * Firebase messaging instance
   * @type {firebase.messaging.Messaging}
   */
  messaging: null,

  /**
   * onMessage event subscribers
   * @type {Array}
   */
  _subscribers: [],

  /**
   * Firebase Messaging token
   * @type {String}
   */
  token: '',

  /**
   * Add subscriber to `onMessage` event
   * @param  {Function} fn
   * @return {Number}   index
   */
  subscribe(fn) {
    assert('service:firebase-message onMessage requires a function', typeof fn === 'function');
    get(this, '_subscribers').addObject(fn);
    return get(this, '_subscribers').indexOf(fn);
  },

  /**
   * Remove subscriber of `onMessage` event
   * @param  {Function} fn
   * @return {Number}   index
   */
  unsubscribe(fn) {
    assert('service:firebase-message offMessage requires a function', typeof fn === 'function');
    get(this, '_subscribers').removeObject(fn);
    return get(this, '_subscribers').indexOf(fn);
  },

  /**
   * Sugar for a firebase:
   *  `messaging.requestPermission()` & `messaging.getToken()`
   *  promise chain
   *
   * @return {Promise} token
   */
  initialize() {
    const messaging = get(this, 'messaging');
    return messaging.requestPermission()
    .then(this.getToken.bind(this));
  },

  /**
   * Proxy for: firebase `Messaging.getToken()`
   * @return {Promise}
   * @resolve {String} token
   */
  getToken() {
    return get(this, 'messaging').getToken()
    .then(token => {
      if (token) {
        return set(this, 'token', token);
      } else {
        return RSVP.Promise.reject(
          new EmberError('No Instance ID token available. Request permission to generate one.')
        );
      }
    });
  },

  init() {
    this._super(...arguments);

    /*
     Set `messaging` instance
     */
    const messaging = set(
      this,
      'messaging',
      get(this, 'firebaseApp').messaging()
    );

    /*
     Invalidate and request a new token when invalidated by FCM
     */
    messaging.onTokenRefresh(() => {
      set(this, 'token', '');
      this.getToken();
    });

    /**
     * Invoke subscribers queue `onMessage`
     * @param {Object} payload
     *
     * Example payload:
     * {
     *   collapse_key: "do_not_collapse",
     *   from: "463017952018",
     *   notification: {
     *     body: "5 to 1",
     *     click_action: "http://localhost:4200",
     *     icon : "sparkle-logo.svg",
     *     title: "Portugal vs. Denmark"
     *   }
     * }
     */
    messaging.onMessage((payload) =>
      get(this, '_subscribers').forEach(fn => fn(payload)));
  }
});
