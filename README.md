[![Build Status](https://img.shields.io/travis/seek-oss/html-sketchapp-cli/master.svg?style=flat-square)](http://travis-ci.org/seek-oss/html-sketchapp-cli) [![npm](https://img.shields.io/npm/v/html-sketchapp-cli.svg?style=flat-square)](https://www.npmjs.com/package/html-sketchapp-cli) [![David](https://img.shields.io/david/seek-oss/html-sketchapp-cli.svg?style=flat-square)](https://david-dm.org/seek-oss/html-sketchapp-cli) [![David](https://img.shields.io/david/dev/seek-oss/html-sketchapp-cli.svg?style=flat-square)](https://david-dm.org/seek-oss/html-sketchapp-cli?type=dev) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)

# html-sketchapp-cli

Quickly generate [Sketch libraries](https://www.sketchapp.com/docs/libraries/) from HTML documents and living style guides, powered by [html-sketchapp](https://github.com/brainly/html-sketchapp) and [Puppeteer](https://github.com/GoogleChrome/puppeteer).

Add some simple markup to your page, for example:

```html
<div data-sketch-symbol="Button/Primary">...</div>
<div data-sketch-text="Heading">...</div>
<div data-sketch-color="#212121">...</div>
```

Then run the `html-sketchapp` command to generate JSON files in html-sketchapp's ["Almost Sketch"](https://github.com/brainly/html-sketchapp#how-does-it-work) format, ready to be [imported into Sketch](#importing-into-sketch).

```bash
$ html-sketchapp --file sketch.html --out-dir dist/sketch
```

## Install

*Please note: html-sketchapp-cli targets the latest ["Active LTS" version](https://github.com/nodejs/Release#release-schedule) of Node. Older versions of Node are unsupported.*

```bash
$ npm install --global html-sketchapp-cli
```

Then, install the Sketch plugin.

```bash
$ html-sketchapp install
```

## Page Setup

Before using this tool, you'll need to add some hooks to your page so that everything can be selected, extracted and named correctly.

Annotate symbols with `data-sketch-symbol` attributes. Note that forward slashes will create nested menu items within Sketch.

```html
<div data-sketch-symbol="Button/Primary">
  ...
</div>
```

Annotate [nested symbols](https://www.sketchapp.com/docs/symbols/nested-symbols) with `data-sketch-symbol-instance` attributes, where the attribute values reference existing symbols defined elsewhere in the document.

```html
<div data-sketch-symbol="Icon/Reply">...</div>
<div data-sketch-symbol="Icon/Retweet">...</div>
<div data-sketch-symbol="Icon/Like">...</div>

<div data-sketch-symbol="IconRow">
  <div data-sketch-symbol-instance="Icon/Reply">...</div>
  <div data-sketch-symbol-instance="Icon/Retweet">...</div>
  <div data-sketch-symbol-instance="Icon/Like">...</div>
</div>
```

Annotate all text styles with `data-sketch-text` attributes.

```html
<div data-sketch-text="Heading">
  ...
</div>
```

Annotate all colors with `data-sketch-color` attributes. Note that colors are unnamed in Sketch, so only the hex value needs to be provided.

```html
<div data-sketch-color="#212121">
  ...
</div>
```

For a real world example, check out [SEEK Style Guide's sketch exports page](http://seek-oss.github.io/seek-style-guide/sketch-exports) and the corresponding [source code](https://github.com/seek-oss/seek-style-guide/blob/master/docs/src/components/SketchExports/SketchExports.js).

## CLI Usage

### Importing from a local file

If your page is self-contained, you can import from a local HTML file.

```bash
$ html-sketchapp --file sketch.html --out-dir dist
```

### Importing from a local static web server

If your page needs to be hosted on a static web server, you can provide a local directory to serve and a root relative URL to import from.

```bash
$ html-sketchapp --serve docs --url /sketch --out-dir dist
```

### Importing from existing web server

If your page is hosted on an existing web server, you can provide an absolute URL.

```bash
$ html-sketchapp --url http://localhost:3000 --out-dir dist
```

### Viewport sizes and responsive design

If you provide a set of one or more named viewports, every symbol and text style will be rendered for each screen size.

```bash
$ html-sketchapp --viewports.Desktop 1024x768 --viewports.Mobile 320x568 --file sketch.html --out-dir dist
```

If multiple screen sizes are provided, the viewport name will be being appended to all symbol and text style names. For example, `Button/Primary` will be exported as `Button/Primary/Desktop` and `Button/Primary/Mobile`.

Optionally, you can set the pixel density for a given viewport by adding an `@` followed by the desired scaling factor to the end of the viewport's resolution. For example, you can simulate a 1.5x and 2x display like so:

```bash
$ html-sketchapp --viewports.HigherDensity 1024x768@1.5 --viewports.Retina 1024x768@2 --file sketch.html --out-dir dist
```

If no scaling factor is provided, a default of `1` will be used.

### Config file

All options can be provided via an `html-sketchapp.config.js` file.

```js
module.exports = {
  file: 'sketch.html',
  outDir: 'dist/sketch',
  viewports: {
    Desktop: '1024x768',
    Mobile: '320x568'
  },
  puppeteerArgs: '--no-sandbox --disable-setuid-sandbox',
  puppeteerExecutablePath: 'google-chrome-unstable'
};
```

You can provide an alternate config file path with the `--config` option.

```bash
$ html-sketchapp --config example.config.js
```

### Importing into Sketch

Once this command has successfully run, the following files will be generated in the output directory.

- `document.asketch.json`
- `page.asketch.json`

These need to be imported into Sketch via html-sketchapp's corresponding Sketch plugin. To ease the install process, you can run the following command.

```bash
$ html-sketchapp install
```

Then, open a new Sketch document and, from the menu, select `Plugins > From *Almost* Sketch to Sketch`. In the file picker, select both `document.asketch.json` and `page.asketch.json`, and click `Choose`.

Congratulations! You should now have your symbols, text styles and document colors available within Sketch! 💎🎉

## Advanced Usage

### Debug mode

If you need to see what Puppeteer is doing, you can provide the `--debug` flag which will do the following things:
- Turn off headless mode
- Bring the browser window to the front
- Forward `console` calls to the terminal
- Stop the browser from closing until you exit the CLI tool

For example:

```bash
$ html-sketchapp --url http://localhost:3000 --out-dir dist --debug
```

### Puppeteer args

If you need to provide command line arguments to the browser instance via [Puppeteer](https://github.com/GoogleChrome/puppeteer), you can provide the `puppeteer-args` option.

Since Puppeteer uses [Chromium](https://www.chromium.org/Home) internally, you can refer to the [List of Chromium Command Line Switches](https://peter.sh/experiments/chromium-command-line-switches) for available options.

For example, if you'd like to disable the browser sandbox:

```bash
$ html-sketchapp --puppeteer-args="--no-sandbox --disable-setuid-sandbox" --file sketch.html --out-dir dist
```

*Note: Because Puppeteer args are prefixed with hyphens, you **must** use an equals sign and quotes when providing this option via the command line (as seen above).*

### Chromium executable

If you'd like to override the Chromium used by Puppeteer, you can provide a path to the executable with the `puppeteer-executable-path` option.

```bash
$ html-sketchapp --puppeteer-executable-path google-chrome-unstable --file sketch.html --out-dir dist
```

### Middleware

If you need to call out to lower-level html-sketchapp APIs, you can provide middleware functions that allow you to modify the underlying Sketch classes as they're generated.

It's recommended that you provide middleware via a [config file](#config-file) as inline functions, for example:

```js
module.exports = {
  symbolLayerMiddleware: (args) => { ... }
};
```

Alternatively, you can also provide middleware as standalone JavaScript files, configured via the command line:

```bash
$ html-sketchapp --symbol-layer-middleware symbol.layer.middleware.js
```

This assumes that your middleware is a JavaScript module that exports the function:

```js
module.exports = (args) => { ... };
```

However, in order to keep the documentation streamlined, all examples will use the config file notation.

#### Symbol Layer Middleware

This middleware is executed for every layer within a symbol.

The typical use case for this is html-sketchapp's `layer.setResizingConstraint` API which allows you to configure how a layer should behave when a symbol is resized.

```js
module.exports = {
  symbolLayerMiddleware: args => { ... }
};
```

The following arguments are passed into your middleware function:
- layer: the html-sketchapp layer instance
- SVG: The SVG class for type checking of layer
- Text: The Text class for type checking of layer
- Rectangle: The Rectangle class for type checking of layer
- ShapeGroup: The ShapeGroup class for type checking of layer
- RESIZING_CONSTRAINTS: Object containing constants for the `setResizingConstraint` API

For example, when handling SVGs differently from other layers:

```js
module.exports = {
  symbolLayerMiddleware: (args) => {
    const { layer, SVG, RESIZING_CONSTRAINTS } = args;

    layer.setResizingConstraint(RESIZING_CONSTRAINTS.LEFT, RESIZING_CONSTRAINTS.TOP);

    if(layer instanceof SVG) {
      layer.setResizingConstraint(RESIZING_CONSTRAINTS.TOP, RESIZING_CONSTRAINTS.LEFT, RESIZING_CONSTRAINTS.WIDTH, RESIZING_CONSTRAINTS.HEIGHT);
    }
  }
};

```

#### Symbol Middleware

This middleware is executed for every symbol within a document.

```js
module.exports = {
  symbolMiddleware: args => { ... }
};
```

The following arguments are passed into your middleware function:
- symbol: The current symbol master
- node: The source HTML node
- suffix: The symbol name suffix (e.g. `/Desktop`)
- RESIZING_CONSTRAINTS: Object containing constants for the `setResizingConstraint` API


#### Symbol Instance Middleware

This middleware is executed for every symbol instance within a document.

```js
module.exports = {
  symbolInstanceMiddleware: args => { ... }
};
```

The following arguments are passed into your middleware function:
- symbolInstance: The current symbol instance
- symbolMaster: The symbol master that the symbol instance is referencing
- node: The source HTML node
- RESIZING_CONSTRAINTS: Object containing constants for the `setResizingConstraint` API

## Contributing

Refer to [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT.
