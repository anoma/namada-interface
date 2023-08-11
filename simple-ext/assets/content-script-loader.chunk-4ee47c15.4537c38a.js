(function () {
  'use strict';

  (async () => {
    await import(
      /* @vite-ignore */
      chrome.runtime.getURL("assets/chunk-4ee47c15.js")
    );
  })().catch(console.error);

})();
