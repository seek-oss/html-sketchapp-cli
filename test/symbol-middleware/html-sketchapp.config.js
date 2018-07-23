module.exports = {
  file: 'index.html',
  outDir: 'dist',
  puppeteerArgs: '--no-sandbox --disable-setuid-sandbox',
  symbolMiddleware: ({ symbol, node, suffix }) => {
     symbol.setId(`from-inline-function-${node.dataset.sketchSymbol}${suffix}`);
   }
};
