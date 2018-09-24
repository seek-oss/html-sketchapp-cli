const path = require('path');

module.exports = {
  setupTestFrameworkScriptFile: path.resolve(__dirname, 'test/_utils/jestSetup.js'),
  testEnvironment: 'node'
};
