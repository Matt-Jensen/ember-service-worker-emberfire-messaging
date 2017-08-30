/* eslint-env node */
const Config = require('./lib/config');
const mergeTrees = require('broccoli-merge-trees');

const DEFAULT_OPTIONS = {
  firebaseVersion: '4.2.0',
  defaultBackgroundMessageTitle: 'New Message'
};

module.exports = {
  name: 'ember-service-worker-emberfire-messaging',

  treeForServiceWorker(swTree, appTree) {
    const { root } = this;
    const config = this.config.call({root}, this.app.env);

    const options = Object.assign({},
      DEFAULT_OPTIONS,
      (config.firebase || {}),
      (config['esw-emberfire-messaging'] || {})
    );

    const configFile = new Config([appTree], options);
    return mergeTrees([swTree, configFile]);
  }
}
