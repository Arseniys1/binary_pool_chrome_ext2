window.conn = {
    constructor() {
        if (config.props.binaryPool.driver === 'ajax') {
            this.driver = conn_ajax;
        }
    },
};

components.addListener([
    'drivers',
], () => {
    conn.constructor();
});