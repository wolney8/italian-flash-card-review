/* Restore the course worksheet and its current lesson, set and stage. */
(() => {
  const value = new URLSearchParams(location.search).get('sheetReturn');
  if (!value) return;
  let sheet;
  try { sheet = new URL(value, location.href); } catch { return; }
  const normalPath = new URL('study-sheets.html', location.href).pathname;
  if (sheet.origin !== location.origin || ![normalPath, normalPath.slice(0, -5)].includes(sheet.pathname)) return;
  const link = document.querySelector('a[data-back-to-sheet]');
  if (link) {
    link.href = sheet.pathname + sheet.search + sheet.hash;
    link.textContent = 'Back to your study sheet';
  }
})();
