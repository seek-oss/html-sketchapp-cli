module.exports = {
  file: 'index.html',
  outDir: 'dist',
  puppeteerArgs: '--no-sandbox --disable-setuid-sandbox',
  symbolInstanceMiddleware: (args) => {
    const { symbolInstance, RESIZING_CONSTRAINTS, node } = args;

    symbolInstance.setName("from-inline-function-" + node.dataset.sketchSymbolInstance);
    symbolInstance.setResizingConstraint(RESIZING_CONSTRAINTS.LEFT, RESIZING_CONSTRAINTS.TOP);
  }
};
