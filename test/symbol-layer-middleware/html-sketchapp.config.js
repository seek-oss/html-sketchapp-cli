module.exports = {
  file: 'index.html',
  outDir: 'dist',
  puppeteerArgs: '--no-sandbox --disable-setuid-sandbox',
  symbolLayerMiddleware: (args) => {
    const { layer, RESIZING_CONSTRAINTS } = args;

    layer.setResizingConstraint(RESIZING_CONSTRAINTS.LEFT, RESIZING_CONSTRAINTS.TOP);
  }
};
