declare global {
  var anomaExtensionRouterId: number;
}

export const getAnomaRouterId = (): number => {
  if (window.anomaExtensionRouterId == null) {
    window.anomaExtensionRouterId = Math.floor(Math.random() * 1000000);
  }
  return window.anomaExtensionRouterId;
};
