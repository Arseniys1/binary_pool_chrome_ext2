let webSocketConnects = {
    olymptrade: {
        ws2: {},
        ds: {},
    },
};

const webSocketMessageEvent = new CustomEvent('webSocketMessage');

function getPlatformName() {
    if (location.host === 'olymptrade.com') {
        return 'olymptrade';
    }
}

function getConnectionName(url) {
    if (url === 'wss://olymptrade.com/ds') {
        return 'ds';
    } else if (url === 'wss://olymptrade.com/ws2') {
        return 'ws2';
    }
}

function dispathWebSocketMessageEvent(event) {
    let data_list;

    try {
        data_list = JSON.parse(event.data);
    } catch (e) { return; }

    for (const key in data_list) {
        let data = data_list[key];

        webSocketMessageEvent.data = data;
        document.dispatchEvent(webSocketMessageEvent);
    }
}

const WebSocketProxy = new Proxy(window.WebSocket, {
    construct(target, args) {
        const instance = new target(...args);

        const openHandler = (event) => {
            // console.log('Open', event);
        };

        const messageHandler = (event) => {
            // console.log('Message', event);

            if (getPlatformName() === 'olymptrade' && getConnectionName(event.target.url) === 'ds') {
                dispathWebSocketMessageEvent(event);
            }
        };

        const closeHandler = (event) => {
            // console.log('Close', event);

            instance.removeEventListener('open', openHandler);
            instance.removeEventListener('message', messageHandler);
            instance.removeEventListener('close', closeHandler);
        };

        instance.addEventListener('open', openHandler);
        instance.addEventListener('message', messageHandler);
        instance.addEventListener('close', closeHandler);

        const sendProxy = new Proxy(instance.send, {
            apply: function(target, thisArg, _args) {
                // console.log('Send', _args);

                target.apply(thisArg, _args);
            }
        });

        webSocketConnects[getPlatformName()][getConnectionName(args[0])] = instance;

        return instance;
    },
});

window.WebSocket = WebSocketProxy;