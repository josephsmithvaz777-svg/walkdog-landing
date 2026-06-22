/**
 * Desalienta clic derecho y atajos habituales de DevTools.
 * No bloquea la inspeccion real: siempre se puede omitir o usar el menu del navegador.
 */
(function () {
  function isDevToolsShortcut(e) {
    if (e.key === 'F12') return true;
    var k = typeof e.key === 'string' ? e.key.toLowerCase() : '';
    if (e.ctrlKey && e.shiftKey && (k === 'i' || k === 'j' || k === 'c' || k === 'k')) return true;
    if (e.ctrlKey && !e.shiftKey && k === 'u') return true;
    if (e.metaKey && e.altKey && k === 'i') return true;
    return false;
  }

  document.addEventListener(
    'keydown',
    function (e) {
      if (isDevToolsShortcut(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  document.addEventListener(
    'contextmenu',
    function (e) {
      e.preventDefault();
    },
    true
  );
})();
