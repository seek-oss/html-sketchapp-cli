module.exports = {
  file: 'index.html',
  outDir: 'dist',
  puppeteerArgs: '--no-sandbox --disable-setuid-sandbox',
  symbolMasterMiddleware: ({ symbol, item, suffix }) => {
     symbol.setId(`from-inline-function-${item.dataset.sketchSymbol}${suffix}`);
   }
};
