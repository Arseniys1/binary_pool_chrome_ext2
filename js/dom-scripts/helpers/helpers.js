window.helpers = {
    getUserSettings(settings) {
        let settings_res = {};

        const settings_types = {
            int: [
                'account_mode',
                'notify_id',
                'demo',
                'price',
                'days',
                'forever',
                'balance',
            ],
        };

        for (const key in settings) {
            let setting = settings[key];

            if (settings_types.int.indexOf(setting.name) !== -1) {
                if (setting.value === null) {
                    settings_res[setting.name] = setting.value;
                } else {
                    settings_res[setting.name] = parseInt(setting.value);
                }
            }
        }

        return settings_res;
    },

    getMSKTime() {
        const now = new Date();
        now.setHours(now.getHours() + (now.getTimezoneOffset() / 60) + 3);
        return parseInt(now.getTime() / 1000);
    },

    userOnline(last_online) {
        if (parseInt(Date.parse(last_online) / 1000) > helpers.getMSKTime() - 300) {
            return true;
        }

        return false;
    },

    generateUuid() {
        return (Date.now().toString(36) + Math.random().toString(36).substr(2, 12)).toUpperCase();
    },
};