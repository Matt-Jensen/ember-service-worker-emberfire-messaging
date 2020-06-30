import RSVP, { reject } from "rsvp";
import Service from "@ember/service";
import { inject as service } from "@ember/service";
import { get, set } from "@ember/object";
import EmberError from "@ember/error";
import { assert } from "@ember/debug";
import { run } from "@ember/runloop";
import { getOwner } from "@ember/application";
import { computed } from "@ember/object";

export default Service.extend({
  firebaseApp: service(),

  /**
   * Firebase messaging instance
   * @type {Promise}
   * @resolves {firebase.messaging.Messaging}
   */
  messaging: computed(function() {
    return this.firebaseApp.messaging();
  }),

  /**
   * onMessage event subscribers
   * @type {Array}
   */
  _subscribers: [],

  /**
   * Firebase Messaging token
   * @type {String}
   */
  token: "",

  /**
   * Is Fastboot env
   * @return {Boolean}
   */
  _isFastboot: computed(function() {
    return Boolean(
      get(getOwner(this).lookup("service:fastboot") || {}, "isFastBoot")
    );
  }),

  /**
   * Add subscriber to `onMessage` event
   * @param  {Function} fn
   * @return {Number}   index
   */
  subscribe(fn) {
    assert(
      "service:firebase-message onMessage requires a function",
      typeof fn === "function"
    );
    this._subscribers.addObject(fn);
    return this._subscribers.indexOf(fn);
  },

  /**
   * Remove subscriber of `onMessage` event
   * @param  {Function} fn
   * @return {Number}   index
   */
  unsubscribe(fn) {
    assert(
      "service:firebase-message offMessage requires a function",
      typeof fn === "function"
    );
    this._subscribers.removeObject(fn);
    return this._subscribers.indexOf(fn);
  },

  /**
   * Sugar for a firebase:
   *  `messaging.requestPermission()` & `messaging.getToken()`
   *  promise chain
   *
   * Wait until after service worker registration or firebase
   * messaging service will attempt to load the default messaging SW.
   *
   * @return {Promise}
   * @resolves {String} token
   */
  initialize() {
    return this.serviceWorkerReady().then(() =>
      this.messaging.then(message => message.requestPermission().then(this.getToken.bind(this)))
    );
  },

  /**
   * Proxy for: firebase `Messaging.getToken()`
   * @return {Promise}
   * @resolves {String} token
   */
  getToken() {
    return this.messaging.then(message =>
      message.getToken().then(token => {
        if (token) {
          return set(this, "token", token);
        } else {
          return reject(
            new EmberError(
              "No Instance ID token available. Request permission to generate one."
            )
          );
        }
      })
    );
  },

  init() {
    this._super(...arguments);

    if (this._isFastboot === false) {
      // Invalidate and request a new token when invalidated by FCM
      this.messaging.then(message => message.onTokenRefresh(() => {
        set(this, "token", "");
        this.getToken();
      }));

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
       *     icon : "logo.svg",
       *     title: "Portugal vs. Denmark"
       *   }
       * }
       */
      this.messaging.then(message => message.onMessage(payload =>
        this._subscribers.forEach(fn => fn(payload))
      ));
    }
  },

  /**
   * Resolve once service worker successfully registered
   * @return {RSVP.Promise}
   */
  serviceWorkerReady() {
    return new RSVP.Promise((resolve, reject) => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then(() => {
          // Ensure Firebase recieves SW first
          // via: instance-initializer:register-firebase-service-worker
          run(resolve);
        }, reject);
      } else {
        reject();
      }
    });
  }
});
