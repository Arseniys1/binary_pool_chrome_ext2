components.addListener(['jquery', 'vue'], () => {
    $(document).ready(() => {
        $.get(htmlUrls.appHtmlUrl, (res) => {
            $('body').append(res);
        });

        $.get(htmlUrls.notificationsHtmlUrl, (res) => {
            $('body').append(res);
        });

        $.get(htmlUrls.settingsHtmlUrl, (res) => {
            $('body').append(res);
        });
    });
});
