window.config = {
    constructor() {
        let config_storage = localStorage.getItem('config');

        if (config_storage !== null) {
            this.mergeProps('defaultConfig', JSON.parse(config_storage));
        }

        this.props = this.defaultConfig;

        setInterval((() => {
            localStorage.setItem('config', JSON.stringify(this.props));
        }).bind(this), 1000);
    },

    defaultConfig: {
        binaryPool: {
            api_token: '',
            driver: 'ajax',
            drivers: {
                ajax: {
                    url: 'http://localhost:8000/api',
                    // url: 'https://binary-pool.ru/api',
                },

                webSocket: {},
            },
            run: false,
        },
    },

    props: {},

    mergeProps(object, propsToMerge) {
        this[object] = {
            ...this[object],
            ...propsToMerge,
        };
    },

};

config.constructor();