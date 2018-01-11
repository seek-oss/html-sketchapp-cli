const promisify = require('es6-promisify');
const rimrafAsync = promisify(require('rimraf'));
const path = require('path');
const getPort = require('get-port');
const serve = require('serve');
const { exec } = require('child-process-promise');
const dirContentsToObject = require('../_utils/dirContentsToObject');

const distPath = path.join(__dirname, 'dist');
const servePath = path.join(__dirname, 'serve-me');

beforeEach(() => rimrafAsync(distPath));

test('url', async () => {
  const port = await getPort();
  const server = serve(servePath, { port, silent: true })

  await exec(`node ../../bin/cli --puppeteer-args="--no-sandbox --disable-setuid-sandbox" --out-dir dist --url http://localhost:${port}`, { cwd: __dirname });

  server.stop();

  const output = await dirContentsToObject(distPath);
  expect(output).toMatchSnapshot();
});
