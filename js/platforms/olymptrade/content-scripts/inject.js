const olymptrade = {
    launchInject() {
        dataToDOM({
            htmlUrls: {
                appHtmlUrl: chrome.extension.getURL('/html/platforms/olymptrade/app.html'),
                notificationsHtmlUrl: chrome.extension.getURL('/html/platforms/olymptrade/notifications.html'),
                settingsHtmlUrl: chrome.extension.getURL('/html/platforms/olymptrade/settings.html'),
            },
        });
        prependScript('js/platforms/olymptrade/dom-scripts/template.js');
        prependScript('js/platforms/olymptrade/dom-scripts/vue/vue.js');
    }
};