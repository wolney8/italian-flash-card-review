(function () {
  function activateV60() {
    if (
      typeof cards !== 'undefined' &&
      Array.isArray(cards) &&
      cards.length > 0 &&
      typeof renderView === 'function'
    ) {
      // The v6.0 loader replaces the complete card dataset. It no longer
      // depends on the superseded v5.2–v5.4 patch chain being loaded.
      window.__ITALIAN_V54_READY__ = true;
      return;
    }
    window.setTimeout(activateV60, 60);
  }

  activateV60();
})();
