const vue = {
    constructor() {
        this.addListeners();
    },

    components: {},
    auth: false,

    notifications() {
        return Vue.component('notifications', {
            template: '#notifications-template',
            data() {
                return {
                    auth: false,
                    user: null,
                    notify_list: [],
                    notify: null,
                    notify_listener_list: [],
                    get_user_listener_id: null,
                    run: false,
                    get_source_stat_interval: null,
                };
            },
            methods: {
                changeAuth(val) {
                    this.auth = val;

                    if (val) {
                        this.get_user_listener_id = data_cache.addListener([
                            'getUser',
                            'changeAccountMode',
                            'changeSource',
                            'demo',
                        ], (res) => {
                            if (res.success) {
                                if (this.user !== null && this.user.settings.account_mode !== res.response.settings.account_mode) {
                                    this.notify_list = [];
                                    this.notify = null;
                                    this.notify_listener_list = [];
                                }

                                this.user = res.response;
                            }
                        });
                    } else {
                        if (this.get_user_listener_id !== null) {
                            data_cache.removeListener(this.get_user_listener_id);
                            this.get_user_listener_id = null;
                        }
                    }
                },

                webSocketMessage(data) {
                    let action_data = {};
                    if (data.data !== undefined) {
                        action_data = data.data[0];
                    }

                    // console.log(data);

                    if ((data.event_name === 'deals:demo:opening' || data.event_name === 'deals:real:opening') && this.user.settings.account_mode === 0) {
                        this.wsMessageDealOpenListener(data, action_data);
                    } else if ((data.event_name === 'deals:demo:opening' || data.event_name === 'deals:real:opening') && this.user.settings.account_mode === 1) {
                        this.wsMessageDealOpenSource(data, action_data);
                    } else if (data.event_name === 'deals:closed' && this.user.settings.account_mode === 0) {
                        this.wsMessageDealCloseListener(data, action_data);
                    } else if (data.event_name === 'deals:closed' && this.user.settings.account_mode === 1) {
                        this.wsMessageDealCloseSource(data, action_data);
                    }
                },

                wsMessageDealOpenListener(data, action_data) {
                    const send_data = {
                        direction: action_data.dir === 'up' ? 1 : 0,
                        duration: action_data.duration,
                        sum: action_data.amount,
                        cur_pair: action_data.pair,
                        platform_id: action_data.id,
                        demo: action_data.group === 'demo' ? 1 : 0,
                    };

                    if (this.notify !== null) {
                        send_data.source_id = this.notify.id;
                        this.notify = null;
                    }

                    conn.driver.sendNotify({
                        data: send_data,
                        success: (res) => {
                            if (res.success) {
                                this.notify_listener_list.unshift(res.response);
                            } else {
                                console.log(res.error);
                            }
                        },
                    });
                },

                wsMessageDealCloseListener(data, action_data) {
                    for (const key in this.notify_listener_list) {
                        let notify = this.notify_listener_list[key];

                        if (notify.platform_id === action_data.id) {
                            conn.driver.updateNotify({
                                data: {
                                    id: notify.id,
                                    status: this.getDealStatus(action_data.status),
                                },
                                success: (res) => {
                                    if (res.success) {
                                        Vue.set(this.notify_listener_list, key, res.response);
                                    } else {
                                        console.log(res.error);
                                    }
                                },
                            });
                        }
                    }
                },

                getAmount() {
                    return parseInt($('input[data-test="deal-amount-input"]').val());
                },

                dealOpen(notify) {
                    let connect = webSocketConnects.olymptrade.ds;
                    this.notify = notify;
                    notify.timer = 0;

                    const send_data = {
                        data: [{
                            amount: this.getAmount(),
                            dir: notify.direction ? 'up' : 'down',
                            pair: notify.cur_pair,
                            cat: 'classic',
                            source: 'platform',
                            group: this.user.settings.demo ? 'demo' : 'real',
                            timestamp: Date.now(),
                            duration: notify.duration,
                        }],
                        data_type: 'deal_open',
                        event_name: this.user.settings.demo ? 'deals:demo:opening' : 'deals:real:opening',
                        timestamp: parseInt(Date.now() / 1000),
                        type: 'request',
                        uuid: helpers.generateUuid(),
                    };

                    connect.send(JSON.stringify([send_data]));

                    const $active_deal = $('.user-deals-table__row[data-test*="active-deal-"]');

                    $active_deal.ready(() => {
                        $active_deal.click();
                    });
                },

                wsMessageDealOpenSource(data, action_data) {
                    if (!this.run) return;

                    conn.driver.sendNotify({
                        data: {
                            direction: action_data.dir === 'up' ? 1 : 0,
                            duration: action_data.duration,
                            sum: action_data.amount,
                            cur_pair: action_data.pair,
                            platform_id: action_data.id,
                            demo: action_data.group === 'demo' ? 1 : 0,
                        },
                        success: (res) => {
                            if (res.success) {
                                this.notify_list.unshift(res.response);
                                this.startSourceStatInterval();
                            } else {
                                console.log(res.error);
                            }
                        },
                    });
                },

                wsMessageDealCloseSource(data, action_data) {
                    for (const key in this.notify_list) {
                        let notify = this.notify_list[key];

                        if (notify.platform_id === action_data.id) {
                            conn.driver.updateNotify({
                                data: {
                                    id: notify.id,
                                    status: this.getDealStatus(action_data.status),
                                },
                                success: (res) => {
                                    if (res.success) {
                                        Vue.set(this.notify_list, key, res.response);
                                    } else {
                                        console.log(res.error);
                                    }
                                },
                            });
                        }
                    }
                },

                startSourceStatInterval() {
                    if (this.get_source_stat_interval !== null) clearInterval(this.get_source_stat_interval);

                    const stat_ids = [];

                    for (const key in this.notify_list.slice(0, 9)) {
                        let notify = this.notify_list[key];

                        stat_ids.push(notify.id);
                    }

                    this.get_source_stat_interval = setInterval(() => {
                        conn.driver.getSourceStat({
                            data: {
                                stat_ids: stat_ids,
                            },
                            success: (res) => {
                                if (res.success) {
                                    for (const key in res.response) {
                                        let notify_update = res.response[key];

                                        for (const _key in this.notify_list) {
                                            let notify = this.notify_list[_key];

                                            if (notify_update.id === notify.id) {
                                                Vue.set(this.notify_list, _key, notify_update);
                                            }
                                        }
                                    }
                                } else {
                                    console.log(res.error);
                                }
                            },
                        });
                    }, 1000);
                },

                getDealStatus(status) {
                    if (status === 'win') {
                        return 1;
                    } else if (status === 'loose') {
                        return 0;
                    } else if (status === 'standoff') {
                        return 2;
                    } else if (status === 'cancel') {
                        return 4;
                    }
                },

                getNotify(res) {
                    for (const key in res.response.create) {
                        let notify = res.response.create[key];
                        notify.timer = 10;
                        this.notify_list.unshift(notify);

                        const open_deal_interval = setInterval(() => {
                            notify.timer--;

                            if (notify.timer <= 0) {
                                clearInterval(open_deal_interval);
                            }
                        }, 1000);
                    }

                    for (const key in this.notify_list) {
                        let notify = this.notify_list[key];

                        for (const _key in res.response.update) {
                            let notify_update = res.response.update[_key];

                            if (notify.id === notify_update.id) {
                                notify_update.timer = notify.timer;
                                Vue.set(this.notify_list, key, notify_update);
                            }
                        }
                    }
                },

                startBtnClick() {
                    this.run = !this.run;
                    config.props.binaryPool.run = !config.props.binaryPool.run;
                },

                accountModeChanger() {
                    setInterval(() => {
                        if (this.user !== null) {
                            if ($('.-demo').hasClass('-active') && !this.user.settings.demo) {
                                conn.driver.demo();
                            } else if ($('.-real').hasClass('-active') && this.user.settings.demo) {
                                conn.driver.demo();
                            }
                        }
                    }, 1000);
                },
            },
            created() {
                vue.components.notifications = this;
                this.run = config.props.binaryPool.run;
                this.accountModeChanger();
            },
        });
    },

    settings() {
        return Vue.component('settings', {
            template: '#settings-template',
            data() {
                return {
                    config: Object.assign({}, config),
                    showAPIToken: false,
                    alerts: {
                        api_token: {
                            type: 'success',
                            text: '',
                            show: false,
                        },
                        account_mode: {
                            type: 'success',
                            text: '',
                            show: false,
                        },
                        notify_id: {
                            type: 'success',
                            text: '',
                            show: false,
                        },
                    },
                    auth: false,
                    user: {
                        settings: {},
                        access: [],
                    },
                    get_user_listener_id: null,
                };
            },
            methods: {
                clickShowToken() {
                    this.showAPIToken = !this.showAPIToken;

                    setTimeout(() => {
                        this.showAPIToken = false
                    }, 3000);
                },

                toggleAlert(alert_name, show, type, text, timeout) {
                    this.alerts[alert_name].type = type;
                    this.alerts[alert_name].text = text;
                    this.alerts[alert_name].show = show;

                    if (timeout) {
                        setTimeout(() => {
                            this.alerts[alert_name].show = false;
                        }, timeout);
                    }
                },

                saveToken() {
                    config.props.binaryPool.api_token = $('#binary-pool-api-token').val();
                    conn.driver.getUser();
                },

                saveAccountMode() {
                    if (this.user.settings.account_mode === parseInt($('#binary-pool-account-mode').val())) {
                        return;
                    }

                    conn.driver.changeAccountMode({
                        success: (res) => {
                            if (res.success) {
                                this.user.settings = res.response.settings;
                                this.toggleAlert('account_mode', true, 'success', 'Режим аккаунта изменен');
                            }
                        },
                        error: (xhr) => {
                            if (xhr.status === 429) {
                                this.toggleAlert('account_mode', true, 'danger', 'Режим аккаунта можно менять 1 раз в 10 минут');
                            } else {
                                this.toggleAlert('account_mode', true, 'danger', 'Ошибка изменения режима аккаунта');
                            }
                        },
                    });
                },

                saveNotifyId() {
                    conn.driver.changeSource({
                        data: {
                            source_id: $('#binary-pool-notify-id').val(),
                        },
                        success: (res) => {
                            if (res.success) {
                                this.user.settings = res.response.settings;
                                this.toggleAlert('notify_id', true, 'success', 'Источник оповещений изменен');
                            }
                        },
                        error: () => {
                            this.toggleAlert('account_mode', true, 'danger', 'Ошибка изменения источника оповещений');
                        },
                    })
                },

                changeAuth(val) {
                    this.auth = val;

                    if (val) {
                        this.toggleAlert('api_token', true, 'success', 'Подключились');

                        this.get_user_listener_id = data_cache.addListener([
                            'getUser',
                            'changeAccountMode',
                            'changeSource',
                            'demo',
                        ], (res) => {
                            if (res.success) {
                                this.user.settings = res.response.settings;
                            }
                        });

                        conn.driver.access();
                    } else {
                        if (this.get_user_listener_id !== null) {
                            data_cache.removeListener(this.get_user_listener_id);
                            this.get_user_listener_id = null;
                        }
                        this.toggleAlert('api_token', true, 'danger', 'API token не прошел проверку');
                    }
                },

                updateAccess(res) {
                    this.user.access = res.response;
                },
            },
            created() {
                vue.components.settings = this;
            },
        });
    },

    makeApp() {
        this.components.app = new Vue({
            el: '#binary-pool',
            components: {
                notifications: this.notifications(),
                settings: this.settings(),
            },
            data() {
                return {
                    showMenu: true,
                    showMenuElement: 'settings',
                    auth: false,
                };
            },
            methods: {
                clickBtn() {
                    this.showMenu = !this.showMenu;
                },

                changeMenuElement(element_name) {
                    this.showMenuElement = element_name;
                },

                checkToken() {
                    conn.driver.getUser();
                },

                changeAuth(val) {
                    this.auth = val;

                    if (val) {
                        this.showMenuElement = 'notifications';
                    } else {
                        this.showMenuElement = 'settings';
                    }
                }
            },
            created() {
                this.checkToken();
            }
        });
    },

    setAuthComponents(auth) {
        if (this.auth === auth) {
            return;
        }

        this.auth = auth;

        for (const key in this.components) {
            let component = this.components[key];
            component.changeAuth(auth);
        }
    },

    addListeners() {
        document.addEventListener('userAuth', () => {
            this.setAuthComponents(true);
        });

        document.addEventListener('userUnAuth', () => {
            this.setAuthComponents(false);
        });

        document.addEventListener('webSocketMessage', (event) => {
            this.components.notifications.webSocketMessage(event.data);
        });

        data_cache.addListener('access', (res) => {
            if (res.success) {
                this.components.settings.updateAccess(res);
            }
        });

        data_cache.addListener('getNotify', (res) => {
            if (res.success) {
                this.components.notifications.getNotify(res);
            }
        });
    },
};

components.addListener([
    'jquery',
    'vue',
    'conn',
    'helpers',
    'dataCache',
    'config',
    {
        name: 'htmlTemplatesLoaded',
        args: ['#binary-pool', '#settings-template', '#notifications-template']
    },
], () => {
    vue.constructor();
    vue.makeApp();
});

