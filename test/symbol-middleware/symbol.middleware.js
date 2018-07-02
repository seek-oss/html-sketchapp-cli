module.exports = ({ symbol, node, suffix }) => {
    symbol.setId(`from-config-file-${node.dataset.sketchSymbol}${suffix}`);
};
