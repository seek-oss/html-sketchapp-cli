#!/usr/bin/env node

const urlJoin = require('url-join');
const findUp = require('find-up');
const { promisify } = require('es6-promisify');
const getPort = require('get-port');
const serve = require('serve');
const puppeteer = require('puppeteer');
const { rollup } = require('rollup');
const waitOnAsync = promisify(require('wait-on'));
const mkdirpAsync = promisify(require('mkdirp'));
const writeFileAsync = promisify(require('fs').writeFile);
const path = require('path');

const configPath = findUp.sync(['html-sketchapp.config.js']);
const config = configPath ? require(configPath) : {};

const makeServer = (relativePath, port) => {
  const servePath = path.resolve(process.cwd(), relativePath);
  return serve(servePath, { port, silent: true });
};

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
    },
    'debug': {
      alias: 'd',
      describe: 'Put into debug mode to see what the tool is doing'
    },
    'symbol-middleware': {
      describe: 'Path to symbol middleware to run when looping over sketch layers'
    },
    'puppeteer-args': {
      type: 'string',
      describe: 'Set of command line arguments to be provided to the Chromium instance via Puppeteer, e.g. --puppeteer-args="--no-sandbox --disable-setuid-sandbox"'
    },
    'puppeteer-executable-path': {
      type: 'string',
      describe: 'Path to a Chromium executable to use instead of the one downloaded by Puppeteer.'
    }
  }, async argv => {
    try {
      const port = argv.serve ? await getPort() : null;
      const server = argv.serve ? makeServer(argv.serve, port) : null;

      try {
        const url = argv.file ? `file://${path.join(process.cwd(), argv.file)}` : argv.url;
        const symbolsUrl = argv.serve ? urlJoin(`http://localhost:${String(port)}`, argv.url || '/') : url;
        const debug = argv.debug;

        await waitOnAsync({
          timeout: 5000,
          headers: { accept: 'text/html' },
          // Force 'wait-on' to make a GET request rather than a HEAD request
          resources: [symbolsUrl.replace(/^(https?)/, '$1-get')],
        });

        const launchArgs = {
            args: argv.puppeteerArgs ? argv.puppeteerArgs.split(' ') : [],
            executablePath: argv.puppeteerExecutablePath,
            headless: !debug
        };

        const browser = await puppeteer.launch(launchArgs);

        const { symbolLayerMiddleware: argSLM } = argv;
        let symbolLayerMiddleware;

        if (argSLM) {
          if (typeof argSLM === 'string') {
            symbolLayerMiddleware = require(path.resolve(process.cwd(), argSLM));
          } else if (typeof argSLM === 'function') {
            symbolLayerMiddleware = argSLM;
          }
        }

        try {
          const page = await browser.newPage();

          if (debug) {
            page.bringToFront();
            page.on('console', msg => console.log('PAGE LOG:', msg.text()));
          }

          await page.goto(symbolsUrl, { waitUntil: 'networkidle0' });

          const bundle = await rollup({
            input: path.resolve(__dirname, '../script/generateAlmostSketch.js'),
            plugins: [
              require('rollup-plugin-node-resolve')(),
              require('rollup-plugin-commonjs')()
            ]
          });

          const { code } = await bundle.generate({
            format: 'iife',
            name: 'generateAlmostSketch'
          });

          await page.addScriptTag({ content: code });

          await page.evaluate('generateAlmostSketch.setupSymbols({ name: "html-sketchapp symbols" })');

          await page.evaluate('generateAlmostSketch.snapshotColorStyles()');

          const viewports = argv.viewports || { Desktop: '1024x768' };
          const hasViewports = Object.keys(viewports).length > 1;
          for (const viewportName in viewports) {
            if (viewports.hasOwnProperty(viewportName)) {
              const viewport = viewports[viewportName];
              const [ size, scale ] = viewport.split('@');
              const [ width, height ] = size.split('x').map(x => parseInt(x, 10));
              const deviceScaleFactor = typeof scale === 'undefined' ? 1 : parseFloat(scale);
              await page.setViewport({ width, height, deviceScaleFactor });
              await page.evaluate(`generateAlmostSketch.snapshotTextStyles({ suffix: "${hasViewports ? `/${viewportName}` : ''}" })`);
              await page.evaluate(`generateAlmostSketch.snapshotSymbols({ suffix: "${hasViewports ? `/${viewportName}` : ''}", symbolLayerMiddleware: ${symbolLayerMiddleware} })`);
            }
          }

          const asketchDocumentJSON = await page.evaluate('generateAlmostSketch.getDocumentJSON()');
          const asketchPageJSON = await page.evaluate('generateAlmostSketch.getPageJSON()');

          const outputPath = path.resolve(process.cwd(), argv.outDir);
          await mkdirpAsync(outputPath);

          const outputPagePath = path.join(outputPath, 'page.asketch.json');
          const outputDocumentPath = path.join(outputPath, 'document.asketch.json');

          await Promise.all([
            writeFileAsync(outputPagePath, asketchPageJSON),
            writeFileAsync(outputDocumentPath, asketchDocumentJSON)
          ]);
        } finally {
          if (browser && typeof browser.close === 'function' && !debug) {
            browser.close();
          }
        }
      } finally {
        if (server && typeof server.stop === 'function') {
          server.stop();
        }
      }
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })
  .command('install', 'Install the html-sketchapp Sketch plugin', {}, async () => {
    const { version } = require('@brainly/html-sketchapp/package.json');
    console.log(`Detected html-sketchapp v${version}`);

    const tmpDirPath = path.resolve(__dirname, '../', '.tmp');
    const rimrafAsync = promisify(require('rimraf'));
    await rimrafAsync(tmpDirPath);
    await mkdirpAsync(tmpDirPath);

    const releaseUrl = `http://github.com/brainly/html-sketchapp/releases/download/v${version}/asketch2sketch.sketchplugin.zip`;
    console.log(`Downloading from ${releaseUrl}`);
    const axios = require('axios');
    const { data } = await axios(releaseUrl, { responseType: 'arraybuffer' });

    console.log(`Extracting to ${tmpDirPath}`);
    const decompress = require('decompress');
    await decompress(data, tmpDirPath);

    const pluginPath = path.resolve(tmpDirPath, 'asketch2sketch.sketchplugin');
    console.log(`Installing from ${pluginPath}`);
    const opn = require('opn');
    opn(pluginPath, { wait: false });
  })
  .parse();
