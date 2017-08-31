import Mixin from '@ember/object/mixin';
import Evented from '@ember/object/evented';
import { inject } from '@ember/service';
import { get, computed } from '@ember/object';

export default Mixin.create(Evented, {
  firebaseMessage: inject(),

  /**
   * Fires `onFirebaseMessage` with message
   * @return {Function}
   */
  _firebaseOnMessageTrigger: computed(function() {
    return this.trigger('onFirebaseMessage');
  }),

  /**
   * Fires `onFirebaseMessageTokenChange` with new token
   * @type {String}
   */
  _firebaseMessageToken: computed('firebaseMessage.token', {
    get() {
      return get(this, 'firebaseMessage.token');
    },

    set(_, token) {
      this.trigger('onFirebaseMessageTokenChange', token);
      return token;
    }
  }),

  init() {
    this._super(...arguments);

    /*
      Add Firebase Message subscriber
     */
    get(this, 'firebaseMessage').subscribe(get(this, '_firebaseOnMessageTrigger'));
  },

  willDestroy() {
    this._super(...arguments);

    /*
      Remove Firebase Message subscriber
     */
    get(this, 'firebaseMessage').unsubscribe(get(this, '_firebaseOnMessageTrigger'));
  }
});
