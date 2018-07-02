const { promisify } = require('es6-promisify');
const path = require('path');
const readFileAsync = promisify(require('fs').readFile);
const traverse = require('traverse');

const guidRegex = /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/;

module.exports = async dir => {
  const document = await readFileAsync(path.join(dir, 'document.asketch.json'));
  const page = await readFileAsync(path.join(dir, 'page.asketch.json'));

  const output = {
    'document.asketch.json': JSON.parse(document),
    'document.page.json': JSON.parse(page)
  };

  // Scrub out GUIDs or they'll fail the snapshot tests
  traverse(output).forEach(function() {
    if (guidRegex.test(this.node) ) {
      this.update('__GUID__');
    }
  });

  return output;
};
