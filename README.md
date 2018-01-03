[![Build Status](https://img.shields.io/travis/seek-oss/html-sketchapp-cli/master.svg?style=flat-square)](http://travis-ci.org/seek-oss/html-sketchapp-cli) [![npm](https://img.shields.io/npm/v/html-sketchapp-cli.svg?style=flat-square)](https://www.npmjs.com/package/html-sketchapp-cli) [![David](https://img.shields.io/david/seek-oss/html-sketchapp-cli.svg?style=flat-square)](https://david-dm.org/seek-oss/html-sketchapp-cli) [![David](https://img.shields.io/david/dev/seek-oss/html-sketchapp-cli.svg?style=flat-square)](https://david-dm.org/seek-oss/html-sketchapp-cli?type=dev) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)

# html-sketchapp-cli

Quickly generate [Sketch libraries](https://www.sketchapp.com/docs/libraries/) from HTML documents and living style guides, powered by [html-sketchapp](https://github.com/brainly/html-sketchapp).

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

### Config file

All options can be provided via an `html-sketchapp.config.js` file.

```js
module.exports = {
  file: 'sketch.html',
  outDir: 'dist/sketch',
  viewports: {
    Desktop: '1024x768',
    Mobile: '320x568'
  }
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
