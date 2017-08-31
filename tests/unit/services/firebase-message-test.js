import RSVP from 'rsvp';
import Service from '@ember/service';
import { moduleFor, test } from 'ember-qunit';
import { A } from 'ember-array/utils';
import { assign } from '@ember/polyfills';

const mockFirebaseApp = (msgConfig = {}) => Service.extend({
  messaging: () => assign({
    onTokenRefresh: () => {},
    onMessage: () => {}
  }, msgConfig)
});

moduleFor('service:firebase-message', 'Unit | Service | firebase message', {
  beforeEach() {
    this.register('service:firebase-app', mockFirebaseApp());
  }
});

test('it adds subscribers via `subscribe` method', function(assert) {
  const subscriber = () => {};
  const service = this.subject({ _subscribers: A() });
  service.subscribe(subscriber);
  assert.strictEqual(service.get('_subscribers')[0], subscriber, 'added subscriber function');
});

test('it removes subscribers via `unsubscribe` method', function(assert) {
  const subscriber = () => {};
  const service = this.subject({ _subscribers: A([subscriber]) });
  service.unsubscribe(subscriber);
  assert.strictEqual(service.get('_subscribers.length'), 0, 'removed subscriber function');
});

test('it invokes all `onMessage` subscribers with message payload', function(assert) {
  assert.expect(1);

  const expected = {};
  const subscriber = (actual) => assert.strictEqual(actual, expected, 'invoked with payload');

  this.subject({
    _subscribers: A([subscriber]),
    firebaseApp: mockFirebaseApp({
      onMessage: (fn) => fn(expected) // trigger onMessage immediately
    }).create()
  });
});

test('it invokes `messaging.requestPermission` and resolves token on initialize', function(assert) {
  assert.expect(2);

  let wasCalled = false;
  const token = '123';

  const service = this.subject({
    firebaseApp: mockFirebaseApp({
      requestPermission: () => {
        wasCalled = true;
        return RSVP.Promise.resolve();
      }
    }).create(),
    getToken: () => token,
    serviceWorkerReady: () => RSVP.Promise.resolve()
  });

  service.initialize()
  .then((t) => {
    assert.strictEqual(t, token, 'resolved a token');
    assert.strictEqual(wasCalled, true, 'invoked `requestPermission`');
  });
});

test('it rejects promise chain when request for token resolves nothing on initialize', function(assert) {
  assert.expect(1);

  const service = this.subject({
    firebaseApp: mockFirebaseApp({
      requestPermission: () => RSVP.Promise.resolve(),
      getToken: () => RSVP.Promise.resolve('') // resolve falsey token
    }).create(),
    serviceWorkerReady: () => RSVP.Promise.resolve()
  });

  service.initialize()
  .then(() => assert.ok(false, 'should not accept invalid token'))
  .catch(() => assert.ok(true, 'rejected invalid token'));
});

test('it sets a token when a request for a token is successful', function(assert) {
  assert.expect(1);

  const expected = '123';

  const service = this.subject({
    firebaseApp: mockFirebaseApp({
      getToken: () => RSVP.Promise.resolve(expected)
    }).create(),
  });

  service.getToken()
  .then(() => assert.strictEqual(service.get('token'), expected, 'set resolved token'));
});

test('it destroys any local token and requests a new one onTokenRefesh', function(assert) {
  const service = this.subject({
    token: '123',
    firebaseApp: mockFirebaseApp({
      onTokenRefresh: (fn) => fn() // invoke immediately
    }).create(),
    getToken: () => {} // stub
  });

  assert.strictEqual(service.get('token'), '', 'set local token to empty string');
});
