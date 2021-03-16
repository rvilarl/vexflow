declare var window: any;

export const QUnit = (function () {
  if (!window.QUnit) {
    return {};
  }
  return window.QUnit;
})();
