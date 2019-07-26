window.data_cache = {
    listeners: [],
    data_list: {},

    addListener(data_name, callback, disposable = false) {
        const listener_data = {
            data_name: data_name,
            callback: callback,
            disposable: disposable,
        };

        this.listeners.push(listener_data);
        this.sendData(listener_data);

        return this.listeners.length - 1;
    },

    sendData(listener_data) {
        if (typeof listener_data.data_name === 'string') {
            let data = this.data_list[listener_data.data_name];

            if (data !== undefined) {
                if (listener_data.disposable) {
                    const key = this.listeners.indexOf(listener_data);
                    this.listeners.splice(key, 1);
                }

                listener_data.callback(data);
            }
        } else if (Array.isArray(listener_data.data_name)) {
            for (const key in listener_data.data_name) {
                let data_name = listener_data.data_name[key];

                let data = this.data_list[data_name];

                if (data !== undefined) {
                    if (listener_data.disposable) {
                        const _key = this.listeners.indexOf(listener_data);
                        this.listeners.splice(_key, 1);
                    }

                    listener_data.callback(data);
                }
            }
        }
    },

    removeListener(listener_id) {
        this.listeners.splice(listener_id, 1);
    },

    updateData(data_name, data) {
        this.data_list[data_name] = data;

        for (const key in this.listeners) {
            let listener_data = this.listeners[key];

            if (typeof listener_data.data_name === 'string' && listener_data.data_name === data_name) {
                this.sendData(listener_data);
            } else if (Array.isArray(listener_data.data_name) && listener_data.data_name.indexOf(data_name) !== -1) {
                this.sendData(listener_data);
            }
        }
    },
};