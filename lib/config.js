/* eslint-env node */
'use strict';
const fs = require('fs');
const path = require('path');
const Plugin = require('broccoli-plugin');

module.exports = class Config extends Plugin {
  constructor(inputNodes, options) {
    super(inputNodes, {
      name: options && options.name,
      annotation: options && options.annotation
    });

    this.options = options;
  }

  build() {
    let options = this.options;
    let module = `export const VERSION = '${options.version || '1'}';\n`;

    Object.keys(options).forEach((k) => {
      module += `export const ${camelToSnake(k).toUpperCase()} = '${options[k]}';\n`;
    });

    fs.writeFileSync(path.join(this.outputPath, 'config.js'), module);
  }
};

/**
 * Convert camelized name to snakecase
 * @param  {String} name
 * @return {String}
 */
function camelToSnake(name) {
 return name.replace(/([a-z]|(?:[A-Z0-9]+))([A-Z0-9]|$)/g, function(_, $1, $2) {
    return $1 + ($2 && '_' + $2);
  });
}
