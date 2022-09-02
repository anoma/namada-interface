const container = document.head || document.documentElement;
const scriptElement = document.createElement("script");

scriptElement.src = (chrome || browser).runtime.getURL("scripts/inject.js");
scriptElement.type = "text/javascript";
container.insertBefore(scriptElement, container.children[0]);
scriptElement.remove();

export {};
