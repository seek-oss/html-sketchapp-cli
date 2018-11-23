import htmlSketchapp from '@brainly/html-sketchapp'
import { RESIZING_CONSTRAINTS } from '@brainly/html-sketchapp/html2asketch/helpers/utils';

const {
  Page,
  Document,
  Text,
  nodeToSketchLayers,
  SymbolMaster,
  SVG,
  Rectangle,
  ShapeGroup
} = htmlSketchapp;

const getAllLayers = (rootNode, symbolMastersByName = {}, symbolInstanceMiddleware = {}) => {
  const rootNodeAndChildren = [rootNode, ...rootNode.querySelectorAll('*')];

  const symbolInstanceChildren = new Set([
    ...rootNode.querySelectorAll('[data-sketch-symbol-instance] *')
  ]);

  const layers = Array.from(rootNodeAndChildren).map(node => {
    if (node.dataset.sketchSymbolInstance) {
      const symbolName = node.dataset.sketchSymbolInstance;

      if (!(symbolName in symbolMastersByName)) {
        throw new Error(`Unknown symbol master: ${symbolName}`);
      }

      const symbolMaster = symbolMastersByName[symbolName];

      const { left: x, top: y, width, height } = node.getBoundingClientRect();
      const symbolInstance = symbolMaster.getSymbolInstance({ x, y, width, height });

      symbolInstance.setName(symbolName);
      symbolInstanceMiddleware({symbolInstance, symbolMaster, node, RESIZING_CONSTRAINTS});

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
    .forEach(node => {
      const color = node.dataset.sketchColor;

      doc.addColor(color);
    });
}

export function snapshotTextStyles({ suffix = '', customIds }) {
  Array.from(document.querySelectorAll('[data-sketch-text]'))
    .forEach(node => {
      getAllLayers(node)
        .filter(layer => layer instanceof Text)
        .forEach(layer => {
          const name = node.dataset.sketchText;

          const id = `${name}${suffix}`;
          layer.setName(id);
          if (customIds) {
            doc.addTextStyle(layer, id);
          } else {
            doc.addTextStyle(layer);
          }
        });
    });
}

export function getDocumentJSON(name) {
  if (name) {
    doc.setId(name);
  }
  return JSON.stringify(doc.toJSON());
}

const page = new Page({
  width: document.body.offsetWidth,
  height: document.body.offsetHeight
});

export function setupSymbols({ name, id }) {
  if (id) {
    page.setId(id);
  }
  page.setName(name);
}

export function snapshotSymbols({ suffix = '', symbolLayerMiddleware = () => {}, symbolMiddleware = () => {}, symbolInstanceMiddleware = () => {} },) {
  const nodes = Array.from(document.querySelectorAll('[data-sketch-symbol]'));

  const symbolMastersByName = nodes.reduce((obj, node) => {
    const name = node.dataset.sketchSymbol;
    const { left: x, top: y } = node.getBoundingClientRect();

    const symbol = new SymbolMaster({ x, y });
    symbol.setName(`${name}${suffix}`);
    symbolMiddleware({symbol, node, suffix, RESIZING_CONSTRAINTS});
    obj[name] = symbol;

    return obj;
  }, {});

  const symbols = nodes.map(node => {
    const name = node.dataset.sketchSymbol;
    const symbol = symbolMastersByName[name];

    const layers = getAllLayers(node, symbolMastersByName, symbolInstanceMiddleware);

    layers
      .filter(layer => layer !== null)
      .forEach(layer => {
        symbolLayerMiddleware({layer, SVG, Text, ShapeGroup, Rectangle, RESIZING_CONSTRAINTS});
        symbol.addLayer(layer);
      });

    return symbol;
  });

  symbols.forEach(obj => page.addLayer(obj));
}

export function getPageJSON() {
  return JSON.stringify(page.toJSON());
}
