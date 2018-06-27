module.exports = ({ symbol, item, suffix }) => {
    symbol.setId(`from-config-file-${item.dataset.sketchSymbol}${suffix}`);
};
