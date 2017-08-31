/* eslint-env node */
'use strict';
const Config = require('./lib/config');
const mergeTrees = require('broccoli-merge-trees');

const DEFAULT_OPTIONS = {
  firebaseVersion: '4.2.0',
  defaultBackgroundMessageTitle: 'New Message',
  projectId: undefined,
  messagingSenderId: undefined
};

module.exports = {
  name: 'ember-service-worker-emberfire-messaging',

  treeForServiceWorker(swTree, appTree) {
    const config = this.config.call(this.app.project, this.app.env);

    const options = Object.assign({},
      DEFAULT_OPTIONS,
      (config.firebase || {}),
      (config['esw-emberfire-messaging'] || {})
    );

    const configFile = new Config([appTree], options);
    return mergeTrees([swTree, configFile]);
  }
}
