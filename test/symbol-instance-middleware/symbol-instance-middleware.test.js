const { promisify } = require('es6-promisify');
const rimrafAsync = promisify(require('rimraf'));
const path = require('path');
const { exec } = require('child-process-promise');
const dirContentsToObject = require('../_utils/dirContentsToObject');

const distPath = path.join(__dirname, 'dist');

beforeEach(() => rimrafAsync(distPath));

describe('symbol-instance-middleware sets style for symbolInstance when middleware function is defined', () => {
  test('inline in config file', async () => {
  await exec('node ../../bin/cli', { cwd: __dirname });

    const output = await dirContentsToObject(distPath);
    expect(output).toMatchSnapshot();
  });

  test('in separate config file', async () => {
    await exec('node ../../bin/cli --puppeteer-args="--no-sandbox --disable-setuid-sandbox" --out-dir dist --file index.html --symbol-instance-middleware symbol-instance.middleware.js', { cwd: __dirname });

    const output = await dirContentsToObject(distPath);
    expect(output).toMatchSnapshot();
  });
})
