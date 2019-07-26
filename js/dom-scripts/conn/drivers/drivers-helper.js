window.drivers_helper = {
    userAuthEvent: new CustomEvent('userAuth'),
    userUnAuthEvent: new CustomEvent('userUnAuth'),

    responsePreHandler(method, res) {
        if (method === 'access' && res.success) {
            for (const key in res.response) {
                let notify = res.response[key];

                notify.source.online = helpers.userOnline(notify.source.last_online);
            }
        } else if (method === 'getUser' || method === 'changeAccountMode' || method === 'changeSource' || method === 'demo' && res.success) {
            res.response.settings = helpers.getUserSettings(res.response.settings);
        }

        return res;
    },
};