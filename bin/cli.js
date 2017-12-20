#!/usr/bin/env node

const urlJoin = require('url-join');
const findUp = require('find-up');
const promisify = require('es6-promisify');
const getPort = require('get-port');
const serve = require('serve');
const puppeteer = require('puppeteer');
const waitOn = promisify(require('wait-on'));
const mkdirp = promisify(require('mkdirp'));
const fs = require('fs');
const path = require('path');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const configPath = findUp.sync(['html-sketchapp.config.js']);
const config = configPath ? require(configPath) : {};

const makeServer = (relativePath, port) => {
  const servePath = path.resolve(process.cwd(), relativePath);
  return serve(servePath, { port, silent: true });
};

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
// application specific logging, throwing an error, or other logic here
});

require('yargs')
  .config(config)
  .config('config', 'Path to JavaScript config file', customConfigPath => require(customConfigPath))
  .usage('Usage: $0 [options]')
  .command('$0', 'The default command', {
    'serve': {
      alias: 's',
      describe: 'Directory to serve, relative to working directory'
    },
    'url': {
      alias: 'u',
      describe: 'URL to open. When using the "serve" option, URL should be root relative.',
    },
    'file': {
      alias: 'f',
      describe: 'File to open, relative to working directory',
    },
    'out-dir': {
      alias: 'o',
      describe: 'Output directory, relative to working directory',
      demandOption: true
    },
    'viewports': {
      alias: 'v',
      describe: 'Set of named viewport sizes for symbols, e.g. --viewports.Desktop=1024x768 --viewports.Mobile=320x568'
    }
  }, async argv => {
    const port = argv.serve ? await getPort() : null;
    const server = argv.serve ? makeServer(argv.serve, port) : null;

    try {
      const url = argv.file ? `file://${path.join(process.cwd(), argv.file)}` : argv.url;
      const symbolsUrl = argv.serve ? urlJoin(`http://localhost:${String(port)}`, argv.url || '/') : url;
      await waitOn({ resources: [symbolsUrl] });

      const browser = await puppeteer.launch();

      try {
        const page = await browser.newPage();

        await page.goto(symbolsUrl, { waitUntil: 'networkidle0' });

        const bundlePath = path.resolve(__dirname, '../script/dist/generateAlmostSketch.bundle.js');
        const bundle = await readFileAsync(bundlePath, 'utf8');
        await page.addScriptTag({ content: bundle });

        await page.evaluate('generateAlmostSketch.setupSymbols({ name: "html-sketchapp symbols" })');

        await page.evaluate('generateAlmostSketch.snapshotColorStyles()');

        const viewports = argv.viewports || { Desktop: '1024x768' };
        const hasViewports = Object.keys(viewports).length > 1;
        for (const viewportName in viewports) {
          if (viewports.hasOwnProperty(viewportName)) {
            const viewport = viewports[viewportName];
            const [ width, height ] = viewport.split('x').map(x => parseInt(x, 10));
            await page.setViewport({ width, height });
            await page.evaluate(`generateAlmostSketch.snapshotTextStyles({ suffix: "${hasViewports ? `/${viewportName}` : ''}" })`);
            await page.evaluate(`generateAlmostSketch.snapshotSymbols({ suffix: "${hasViewports ? `/${viewportName}` : ''}" })`);
          }
        }

        const asketchDocumentJSON = await page.evaluate('generateAlmostSketch.getDocumentJSON()');
        const asketchPageJSON = await page.evaluate('generateAlmostSketch.getPageJSON()');

        const outputPath = path.resolve(process.cwd(), argv.outDir);
        await mkdirp(outputPath);

        const outputPagePath = path.join(outputPath, 'page.asketch.json');
        const outputDocumentPath = path.join(outputPath, 'document.asketch.json');

        await Promise.all([
          writeFileAsync(outputPagePath, asketchPageJSON),
          writeFileAsync(outputDocumentPath, asketchDocumentJSON)
        ]);
      } finally {
        if (browser && typeof browser.close === 'function') {
          browser.close();
        }
      }
    } finally {
      if (server && typeof server.stop === 'function') {
        server.stop();
      }
    }
  })
  .command('install', 'Install the html-sketchapp Sketch plugin', {}, async () => {
    const { getInstalledPath } = require('get-installed-path');
    const htmlSketchappPath = await getInstalledPath('html-sketchapp');
    const pluginPath = path.resolve(htmlSketchappPath, 'asketch2sketch.sketchplugin');

    const opn = require('opn');
    opn(pluginPath, { wait: false });
  })
  .parse();
