prependScript('js/dom-scripts/intercept/web-socket.js');
prependScript('js/dom-scripts/helpers/components.js');
prependScript('js/dom-scripts/helpers/helpers.js');
prependScript('js/dom-scripts/jquery.js');
prependScript('js/dom-scripts/config.js');
prependScript('js/dom-scripts/data-cache.js');
prependScript('js/dom-scripts/conn/drivers/drivers-helper.js');
prependScript('js/dom-scripts/conn/drivers/ajax/ajax.js');
prependScript('js/dom-scripts/conn/conn.js');

let dev = true;

if (dev) {
    prependScript('js/dom-scripts/vue/vue-dev.js');
} else {
    prependScript('js/dom-scripts/vue/vue-prod.js');
}

if (location.host === 'olymptrade.com') {
    olymptrade.launchInject();
}