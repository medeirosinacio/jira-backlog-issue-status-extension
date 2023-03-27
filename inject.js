let extensionScript = document.createElement('script');
extensionScript.src = chrome.runtime.getURL('injected.js');
extensionScript.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(extensionScript);

const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
            mutation.removedNodes.forEach(function (node) {
                if (node.nodeName === 'SCRIPT' && node.src === extensionScript.src) {
                    (document.head || document.documentElement).appendChild(extensionScript);
                }
            });
        }
    });
});

const observerConfig = {
    childList: true, subtree: true
};

// Verificar se o DOM está disponível antes de adicionar o observer
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        observer.observe(document.documentElement, observerConfig);
    });
} else {
    observer.observe(document.documentElement, observerConfig);
}