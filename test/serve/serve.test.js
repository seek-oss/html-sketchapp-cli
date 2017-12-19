const promisify = require('es6-promisify');
const rimrafAsync = promisify(require('rimraf'));
const path = require('path');
const { exec } = require('child-process-promise');
const dirContentsToObject = require('../_utils/dirContentsToObject');

const distPath = path.join(__dirname, 'dist');

beforeEach(() => rimrafAsync(distPath));

test('serve', async () => {
  await exec('node ../../bin/cli --out-dir dist --serve serve-me', { cwd: __dirname });

  const output = await dirContentsToObject(distPath);
  expect(output).toMatchSnapshot();
});
