const components = {
    interval() {
        for (const key in this.listeners) {
            let listenerData = this.listeners[key];

            let component_res = false;

            components:
            for (const _key in listenerData.components) {
                let component_data = listenerData.components[_key];

                let component_name = component_data;
                if (typeof component_data === 'object') {
                    component_name = component_data.name;
                }

                if (this.components[component_name] === undefined || !this.components[component_name](component_data.args)) {
                    component_res = false;
                    break components;
                } else {
                    component_res = true;
                }
            }

            if (component_res) {
                listenerData.callback();
                this.removeListener(key);
            }
        }
    },

    components: {
        jquery() {
            return window.jQuery !== undefined;
        },

        vue() {
            return window.Vue !== undefined;
        },

        htmlTemplatesLoaded(selectors) {
            let found = false;

            for (const key in selectors) {
                let selector = selectors[key];

                if (!$('*').is(selector)) {
                    found = false;
                    break;
                } else {
                    found = true;
                }
            }

            return found;
        },

        drivers() {
            return window.conn_ajax !== undefined;
        },

        conn() {
            return window.conn !== undefined;
        },

        config() {
            return window.config !== undefined;
        },

        helpers() {
            return window.helpers !== undefined;
        },

        dataCache() {
            return window.data_cache !== undefined;
        },

        driversHelper() {
            return window.drivers_helper !== undefined;
        },
    },

    listeners: [],

    addListener(components, callback) {
        let length = this.listeners.push({
            components: components,
            callback: callback,
        });

        return length - 1;
    },

    removeListener(listener_id) {
        this.listeners.splice(listener_id, 1);
    }
};

setInterval(components.interval.bind(components), 1);
