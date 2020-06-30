"use strict";
const Config = require("./lib/config");
const mergeTrees = require("broccoli-merge-trees");

const DEFAULT_OPTIONS = {
  firebaseVersion: "7.15.0",
  defaultBackgroundMessageTitle: "New Message",
  projectId: undefined,
  messagingSenderId: undefined,
  notification: {}
};

module.exports = {
  name: require("./package").name,

  treeForServiceWorker(swTree, appTree) {
    const config = this.config.call(this.app.project, this.app.env);

    const options = Object.assign(
      {},
      DEFAULT_OPTIONS,
      config.firebase || {},
      config["esw-emberfire-messaging"] || {}
    );

    /*
     Stringify global notification
     options object for service worker
     */
    options.notification = JSON.stringify(options.notification);

    // Convert app options into SW config file
    const configFile = new Config([appTree], options);
    return mergeTrees([swTree, configFile]);
  }
};
