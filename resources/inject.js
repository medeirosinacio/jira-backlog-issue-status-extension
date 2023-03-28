// Add JS
let extensionScript = document.createElement('script');
extensionScript.src = chrome.runtime.getURL('resources/script.js');
extensionScript.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(extensionScript);

// Add CSS
let injectedCss = document.createElement('link');
injectedCss.setAttribute('rel', 'stylesheet');
injectedCss.setAttribute('type', 'text/css');
injectedCss.setAttribute('href', chrome.runtime.getURL('resources/style.css'));
(document.head || document.documentElement).appendChild(injectedCss);

