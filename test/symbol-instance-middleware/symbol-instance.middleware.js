module.exports = ({ symbolInstance, node, RESIZING_CONSTRAINTS}) => {
  symbolInstance.setName("from-config-file-" + node.dataset.sketchSymbolInstance);
  symbolInstance.setResizingConstraint(RESIZING_CONSTRAINTS.LEFT, RESIZING_CONSTRAINTS.TOP);
};
