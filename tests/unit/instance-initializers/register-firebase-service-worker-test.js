import RSVP from 'rsvp';
import Ember from 'ember';
import { initialize } from 'dummy/instance-initializers/register-firebase-service-worker';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';
import Service from '@ember/service';
import { assign } from '@ember/polyfills';

const mockNavigator = (config = {}) => assign({ serviceWorker: {} }, config);

module('Unit | Instance Initializer | register firebase service worker', {
  beforeEach() {
    Ember.run(() => {
      this.application = Ember.Application.create();
      this.appInstance = this.application.buildInstance();
    });
  },
  afterEach() {
    Ember.run(this.appInstance, 'destroy');
    destroyApp(this.application);
  }
});

test('it throws an error when `messagingSenderId` is not configured', function(assert) {
  this.appInstance.register('service:firebase-app', Service.extend({ options: {} }));
  assert.throws(() => initialize(this.appInstance, mockNavigator()), 'rejects firebase app without `messagingSenderId` option');
});

test('it registers activated service worker with firebase', function(assert) {
  assert.expect(1);

  const serviceWorkerRegistration = {};
  this.appInstance.register('service:firebase-app', Service.extend({
    options: { messagingSenderId: '123' },
    messaging: () => ({
      useServiceWorker: (reg) => assert.strictEqual(reg, serviceWorkerRegistration, 'using activated service worker')
    })
  }));

  const stubNavigator = {
    serviceWorker: {
      ready: RSVP.Promise.resolve(serviceWorkerRegistration)
    }
  };

  initialize(this.appInstance, stubNavigator);
});
