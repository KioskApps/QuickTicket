chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('window.html', {
        'state': 'normal',
        'bounds': {
            'width': 1280,
            'height': 1024
        }
    });
});