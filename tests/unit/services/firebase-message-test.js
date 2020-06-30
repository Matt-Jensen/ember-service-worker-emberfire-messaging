import { resolve } from "rsvp";
import { module, test } from "ember-qunit";
import { assign } from "@ember/polyfills";
import { setupTest } from "ember-qunit";

const mockMessaging = (msgConfig = {}) =>
  resolve(
    assign(
      {
        onTokenRefresh: () => {},
        onMessage: () => {}
      },
      msgConfig
    )
  );

module("Unit | Service | firebase message", function(hooks) {
  setupTest(hooks);

  test("it does not subscribe to Firebase messaging hooks in Fastboot", function(assert) {
    assert.expect(0);
    const service = this.owner.lookup("service:firebase-message");
    service.setProperties({
      _isFastboot: true,
      messaging: mockMessaging({
        onTokenRefresh: () => assert.ok(false),
        onMessage: () => assert.ok(false)
      }),
    });
    service.init();
  });

  test("it adds subscribers via `subscribe` method", function(assert) {
    const subscriber = () => {};
    const service = this.owner.lookup("service:firebase-message");
    service.setProperties({
      messaging: mockMessaging(),
      _subscribers: []
    });
    const index = service.subscribe(subscriber);
    assert.strictEqual(
      service._subscribers[index],
      subscriber,
      "added subscriber function"
    );
  });

  test("it removes subscribers via `unsubscribe` method", function(assert) {
    const subscriber = () => {};
    const service = this.owner.lookup("service:firebase-message");
    service.setProperties({
      messaging: mockMessaging(),
      _subscribers: [subscriber]
    });
    service.unsubscribe(subscriber);
    assert.strictEqual(
      service._subscribers.length,
      0,
      "removed subscriber function"
    );
  });

  test("it invokes all `onMessage` subscribers with message payload", function(assert) {
    assert.expect(1);

    const expected = {};
    const subscriber = actual =>
      assert.strictEqual(actual, expected, "invoked with payload");
    const service = this.owner.lookup("service:firebase-message");

    service.setProperties({
      _subscribers: [subscriber],
      messaging: mockMessaging({
        onMessage: cb => cb(expected) // trigger onMessage immediately
      })
    });

    service.init()
  });

  test("it requests permission and resolves token on initialize", function(assert) {
    assert.expect(2);

    const expected = "123";
    const service = this.owner.lookup("service:firebase-message");

    service.setProperties({
      messaging: mockMessaging(),
      getToken: () => resolve(expected),
      requestPermission: () => {
        assert.ok(true, "invoked `requestPermission`");
        return resolve();
      },
      serviceWorkerReady: () => resolve()
    });

    service.initialize().then(actual => {
      assert.strictEqual(actual, expected, "resolved a token");
    });
  });

  test("it rejects promise chain when request for token resolves nothing on initialize", function(assert) {
    assert.expect(1);

    const service = this.owner.lookup("service:firebase-message");
    service.setProperties({
      mocking: mockMessaging({
        getToken: () => resolve("") // resolve falsey token
      }),
      requestPermission: () => resolve(),
      serviceWorkerReady: () => resolve()
    });

    return service
      .initialize()
      .then(() => assert.ok(false, "should not accept invalid token"))
      .catch(() => assert.ok(true, "rejected invalid token"));
  });

  test("it sets a token when a request for a token is successful", function(assert) {
    assert.expect(1);

    const expected = "123";

    const service = this.owner.lookup("service:firebase-message");
    service.setProperties({
      messaging: mockMessaging({
        getToken: () => resolve(expected)
      })
    });

    service
      .getToken()
      .then(() =>
        assert.strictEqual(service.get("token"), expected, "set resolved token")
      );
  });

  test("it destroys any local token and requests a new one onTokenRefesh", function(assert) {
    const service = this.owner.lookup("service:firebase-message");
    service.setProperties({
      token: "123",
      messaging: mockMessaging({
        onTokenRefresh: cb => cb.call(service) // invoke immediately
      }),
      getToken: () => {
        assert.strictEqual(
          service.token,
          "",
          "set local token to empty string"
        );
        return resolve("");
      }
    });

    service.init();
  });
});
