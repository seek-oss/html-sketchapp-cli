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

### Symbol Layer Middleware

Symbol Layer Middleware allows you to call out to any APIs that may be exposed on the underlying html-sketchapp layer.

The current usecase for this is the new `layer.setResizingConstraint` API which allows you to configure how a layer should behave when a symbol is resized.

#### Requiring a file

The below uses the string argument to `require` in a file that defines what resizing a layer should have applied to it. In the below case, fixing the layer to the top and left.

```bash
$ html-sketchapp --symbol-layer-middleware symbol.layer.middleware.js
```

```js
module.exports = (args) => {
  const { layer, RESIZING_CONSTRAINTS } = args;

  layer.setResizingConstraint(RESIZING_CONSTRAINTS.LEFT, RESIZING_CONSTRAINTS.TOP);
};
```

#### Inline function

If you use the config file you can provide an inline function and avoid creating a separate file:

```bash
$ html-sketchapp --config config.js
```

```js
module.exports = {
  symbolLayerMiddleware: (args) => {
    const { layer, RESIZING_CONSTRAINTS } = args;

    layer.setResizingConstraint(RESIZING_CONSTRAINTS.LEFT, RESIZING_CONSTRAINTS.TOP);
  }
};
```

#### Symbol layer middleware arguments

The function that is called has several arguments passed into it so you can provide different resizing options for different types of layers.

The following things are passed into symbol
- layer: the html-sketchapp layer instance
- SVG: The SVG class for type checking of layer
- Text: The Text class for type checking of layer
- Rectangle: The Rectangle class for type checking of layer
- ShapeGroup: The ShapeGroup class for type checking of layer
- RESIZING_CONSTRAINTS: contains friendly names for `setResizingConstraint` API.

Handling SVGs differently from other layers:

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

## Symbol middleware

It is possible to define symbol (master) middleware either in separete file or as inline function in config file. The asketch generator calls the middleware function when looping symbols. 

### Separate middleware file 

`html-sketchapp-cli --symbol-middleware 'symbol-middleware.js'`

Example symbol middleware to set symbolID based on symbol name and suffix
```
module.exports = ({ symbol, item, suffix }) => {
    symbol.setId(`${item.dataset.sketchSymbol}${suffix}`);
};
```

### Inline function

`html-sketchapp-cli  --config config.js`

Where config.js should contain following to set symbol id based on symbol name and suffix:
```
module.exports = {
  symbolMiddleware: ({ symbol, item, suffix }) => {
     symbol.setId(`${item.dataset.sketchSymbol}${suffix}`);
   }
};
```

### Symbol middleware arguments

The middleware function that is called has several arguments passed into it:

- symbol: The symbol master to process
- node: The node from html 
- suffix: The suffix set
- RESIZING_CONSTRAINTS: contains friendly names for `setResizingConstraint` API.


## Symbol instance middleware

It is possible to define symbol instance middleware either in separete file or as inline function in config file. The asketch generator calls the middleware function when looping symbols instances. 

### Separate middleware file 

`html-sketchapp-cli --symbol-instance-middleware 'symbol-instance-middleware.js'`

Example symbol instance middleware to set symbol instance name and resizing constraints:
```
module.exports = ({ symbolInstance, node, RESIZING_CONSTRAINTS}) => {
  symbolInstance.setName("from-config-file-" + node.dataset.sketchSymbolInstance);
  symbolInstance.setResizingConstraint(RESIZING_CONSTRAINTS.LEFT, RESIZING_CONSTRAINTS.TOP);
};
```

### Inline function

`html-sketchapp-cli  --config config.js`

Where config.js should contain following to set symbol id based on symbol name and suffix:
```
module.exports = {
  symbolInstanceMiddleware: (args) => {
    const { symbolInstance, RESIZING_CONSTRAINTS, node } = args;

    symbolInstance.setName("from-inline-function-" + node.dataset.sketchSymbolInstance);
    symbolInstance.setResizingConstraint(RESIZING_CONSTRAINTS.LEFT, RESIZING_CONSTRAINTS.TOP);
  }
};
```

### Symbol instance middleware arguments

The middleware function that is called has several arguments passed into it:

- symbolInstance: The symbolInstance to process
- symbolMaster: The symbol (master) the symbol instance is related
- node: The node from html
- RESIZING_CONSTRAINTS: contains friendly names for `setResizingConstraint` API.

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

## Importing into Sketch

Once this command has successfully run, the following files will be generated in the output directory.

- `document.asketch.json`
- `page.asketch.json`

These need to be imported into Sketch via html-sketchapp's corresponding Sketch plugin. To ease the install process, you can run the following command.

```bash
$ html-sketchapp install
```

Then, open a new Sketch document and, from the menu, select `Plugins > From *Almost* Sketch to Sketch`. In the file picker, select both `document.asketch.json` and `page.asketch.json`, and click `Choose`.

Congratulations! You should now have your symbols, text styles and document colors available within Sketch! 💎🎉

## Contributing

Refer to [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT.
