let extensionScript = document.createElement('script');
// must be listed in web_accessible_resources in manifest.json
extensionScript.src = chrome.runtime.getURL('injected.js');
extensionScript.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(extensionScript);