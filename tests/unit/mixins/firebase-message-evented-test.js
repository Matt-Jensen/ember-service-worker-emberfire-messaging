import Ember from 'ember';
import FirebaseMessageEventedMixin from 'ember-service-worker-emberfire-messaging/mixins/firebase-message-evented';
import { module, test } from 'qunit';

module('Unit | Mixin | firebase message evented');

test('it works', function(assert) {
  let FirebaseMessageEventedObject = Ember.Object.extend(FirebaseMessageEventedMixin);
  let subject = FirebaseMessageEventedObject.create();
  assert.ok(subject);
});
