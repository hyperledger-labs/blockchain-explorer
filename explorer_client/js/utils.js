export default {
    load: function(opts) {
        var config = {
            type: opts.method ? opts.method : 'POST',
            url: opts.url,
            contentType: opts.type ? opts.type : 'application/json',
            cache: false,
            async: opts.async ? opts.async : true
        };

        if (opts.data) {
            config.data = JSON.stringify(opts.data);
        }

        if (opts.complete) {
            config.complete = opts.complete;
        }

        return $.ajax(config);
    },

    subscribe: Client.subscribe,

    prettyUpdate: function(oldValue, newValue, el) {
        if (oldValue !== newValue) {
            el.css({
                'opacity': 0
            });

            setTimeout(function() {
                el.html($('<span>', {
                    html: newValue
                }));

                el.css({
                    'opacity': 1
                });
            }, 500);
        }
    }
};

