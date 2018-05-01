import Page from '@brainly/html-sketchapp/html2asketch/model/page.js';
import Document from '@brainly/html-sketchapp/html2asketch/model/document.js';
import Text from '@brainly/html-sketchapp/html2asketch/model/text.js';
import SVG from '@brainly/html-sketchapp/html2asketch/model/svg.js';
import nodeToSketchLayers from '@brainly/html-sketchapp/html2asketch/nodeToSketchLayers.js';
import SymbolMaster from '@brainly/html-sketchapp/html2asketch/model/symbolMaster.js';
import { RESIZING_CONSTRAINTS } from '@brainly/html-sketchapp/html2asketch/helpers/utils';

const getAllLayers = (item, symbolMastersByName = {}) => {
  const itemAndChildren = [item, ...item.querySelectorAll('*')];

  const symbolInstanceChildren = new Set([
    ...item.querySelectorAll('[data-sketch-symbol-instance] *')
  ]);

  const layers = Array.from(itemAndChildren).map(node => {
    if (node.dataset.sketchSymbolInstance) {
      const symbolName = node.dataset.sketchSymbolInstance;

      if (!(symbolName in symbolMastersByName)) {
        throw new Error(`Unknown symbol master: ${symbolName}`);
      }

      const symbolMaster = symbolMastersByName[symbolName];

      const { left: x, top: y, width, height } = node.getBoundingClientRect();
      const symbolInstance = symbolMaster.getSymbolInstance({ x, y, width, height });

      symbolInstance.setName(symbolName);

      return [symbolInstance];
    } else if (symbolInstanceChildren.has(node)) {
      // Anything nested under data-sketch-symbol-instance shouldn't be rendered,
      // otherwise it'll be included in the symbolInstance itself.
      return [];
    }

    return nodeToSketchLayers(node);
  });

  return layers.reduce((prev, current) => prev.concat(current), []);
};

const doc = new Document();

export function snapshotColorStyles() {
  Array.from(document.querySelectorAll('[data-sketch-color]'))
    .forEach(item => {
      const color = item.dataset.sketchColor;

      doc.addColor(color);
    });
}

export function snapshotTextStyles({ suffix = '' }) {
  Array.from(document.querySelectorAll('[data-sketch-text]'))
    .forEach(item => {
      getAllLayers(item)
        .filter(layer => layer instanceof Text)
        .forEach(layer => {
          const name = item.dataset.sketchText;

          layer.setName(`${name}${suffix}`);
          doc.addTextStyle(layer);
        });
    });
}

export function getDocumentJSON() {
  return JSON.stringify(doc.toJSON());
}

const page = new Page({
  width: document.body.offsetWidth,
  height: document.body.offsetHeight
});

export function setupSymbols({ name }) {
  page.setName(name);
}

export function snapshotSymbols({ suffix = '', symbolMiddleware = () => {} }, ) {
  const nodes = Array.from(document.querySelectorAll('[data-sketch-symbol]'));

  const symbolMastersByName = nodes.reduce((obj, item) => {
    const name = item.dataset.sketchSymbol;
    const { left: x, top: y } = item.getBoundingClientRect();

    const symbol = new SymbolMaster({ x, y });
    symbol.setName(`${name}${suffix}`);

    obj[name] = symbol;

    return obj;
  }, {});

  const symbols = nodes.map(item => {
    const name = item.dataset.sketchSymbol;
    const symbol = symbolMastersByName[name];

    const layers = getAllLayers(item, symbolMastersByName);

    layers
      .filter(layer => layer !== null)
      .forEach(layer => {
        symbolMiddleware({layer, SVG, Text, RESIZING_CONSTRAINTS});
        symbol.addLayer(layer)
      });

    return symbol;
  });

  symbols.forEach(obj => page.addLayer(obj));
}

export function getPageJSON() {
  return JSON.stringify(page.toJSON());
}
