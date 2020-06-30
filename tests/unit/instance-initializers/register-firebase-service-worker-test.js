import { resolve } from "rsvp";
import Application from "@ember/application";
import { run } from "@ember/runloop";
import { initialize } from "dummy/instance-initializers/register-firebase-service-worker";
import { module, test } from "qunit";
import Service from "@ember/service";

module(
  "Unit | Instance Initializer | register firebase service worker",
  function(hooks) {
    hooks.beforeEach(function() {
      this.TestApplication = Application.extend();
      this.TestApplication.instanceInitializer({
        name: 'initializer under test',
        initialize
      });
      this.application = this.TestApplication.create({ autoboot: false });
      this.instance = this.application.buildInstance();

    });

    hooks.afterEach(function() {
      run(this.instance, 'destroy');
      run(this.application, 'destroy');
    });

    test("it throws an error when `messagingSenderId` is not configured", async function(assert) {
      this.instance.register(
        "service:firebase-app",
        Service.extend({
          options: {} // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
        })
      );
      try {
        initialize(this.instance);
      } catch (err) {
        assert.ok(true, "rejects firebase app without `messagingSenderId` option");
      }
    });

    test("it registers activated service worker with firebase", async function(assert) {
      assert.expect(1);
      const swRegistration = {};

      this.instance.register(
        "service:firebase-app",
        Service.extend({
          options: { messagingSenderId: "123" }, // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
          messaging: () => resolve({
            useServiceWorker: reg =>
              assert.strictEqual(
                reg,
                swRegistration,
                "using activated service worker"
              )
          })
        })
      );

      const stubNavigator = {
        serviceWorker: {
          ready: resolve(swRegistration)
        }
      };

      initialize(this.instance, stubNavigator);
    });
  }
);
