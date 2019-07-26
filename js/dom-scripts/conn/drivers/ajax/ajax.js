window.conn_ajax = {
    constructor() {
        this.driver_data = config.props.binaryPool.drivers.ajax;

        this.setIntervals();
    },

    sender(ajax_data) {
        let send_data = {
            api_token: config.props.binaryPool.api_token,
        };

        if (ajax_data.data) {
            send_data = {
                ...send_data,
                ...ajax_data.data,
            }
        }

        $.post(ajax_data.url, send_data).done((response, textStatus, xhr) => {
            this.dispathAuthOrUnAuth(xhr);

            let preHandledResponse = drivers_helper.responsePreHandler(ajax_data.method, response);
            data_cache.updateData(ajax_data.method, preHandledResponse);

            if (ajax_data.success) {
                ajax_data.success(preHandledResponse);
            }
        }).fail((xhr) => {
            this.dispathAuthOrUnAuth(xhr);
            if (ajax_data.error) {
                ajax_data.error(xhr);
            }
        });
    },

    setIntervals() {
        let access_interval,
            get_notify_interval;

        document.addEventListener('userAuth', () => {
            if (access_interval === undefined) {
                access_interval = setInterval(() => {
                    this.access();
                }, 5000);
            }

            if (get_notify_interval === undefined) {
                get_notify_interval = setInterval(() => {
                    this.getNotify();
                }, 1000);
            }
        });

        document.addEventListener('userUnAuth', () => {
            if (access_interval !== undefined) {
                clearInterval(access_interval);
                access_interval = undefined;
            }

            if (get_notify_interval !== undefined) {
                clearInterval(get_notify_interval);
                get_notify_interval = undefined;
            }
        });
    },

    dispathAuthOrUnAuth(xhr) {
        if (xhr.status === 200) {
            document.dispatchEvent(drivers_helper.userAuthEvent);
        } else if (xhr.status === 401 || xhr.status === 0) {
            document.dispatchEvent(drivers_helper.userUnAuthEvent);
        }
    },

    getUser(callbacks) {
        this.sender({
            ...callbacks,
            url: this.driver_data.url + '/getUser',
            method: 'getUser',
        });
    },

    changeAccountMode(callbacks) {
        this.sender({
            ...callbacks,
            url: this.driver_data.url + '/changeAccountMode',
            method: 'changeAccountMode',
        });
    },

    changeSource(ajax_data) {
        this.sender({
            ...ajax_data,
            url: this.driver_data.url + '/changeSource',
            method: 'changeSource',
        });
    },

    demo(callbacks) {
        this.sender({
            ...callbacks,
            url: this.driver_data.url + '/demo',
            method: 'demo',
        });
    },

    access(callbacks) {
        this.sender({
            ...callbacks,
            url: this.driver_data.url + '/access',
            method: 'access',
        });
    },

    getNotify(callbacks) {
        this.sender({
            ...callbacks,
            url: this.driver_data.url + '/getNotify',
            method: 'getNotify',
        });
    },

    sendNotify(ajax_data) {
        this.sender({
            ...ajax_data,
            url: this.driver_data.url + '/sendNotify',
            method: 'sendNotify',
        });
    },

    updateNotify(ajax_data) {
        this.sender({
            ...ajax_data,
            url: this.driver_data.url + '/updateNotify',
            method: 'updateNotify',
        });
    },

    getSourceStat(ajax_data) {
        this.sender({
            ...ajax_data,
            url: this.driver_data.url + '/getSourceStat',
            method: 'getSourceStat',
        });
    },
};

components.addListener([
    'jquery',
    'config',
    'helpers',
    'dataCache',
    'driversHelper',
], () => {
    conn_ajax.constructor();
});