var s = document.createElement('script');
s.src = chrome.runtime.getURL('inject.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);


document.addEventListener('yourCustomEvent', function (e) {
    var data = e.detail;
    console.log('content script');
    console.log('received', e);
});