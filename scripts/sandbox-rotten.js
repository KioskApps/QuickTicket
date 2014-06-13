(function(window, document) {
    if (!window.sandbox) {
        throw new Error('sandbox-scripts.js is not loaded in the "sandbox-scripts" iframe.');
    }
    
    //Rotten Tomatoes Scope
    var rotten = {};
    window.rotten = rotten;
    
    rotten.API_KEY = 'e7xdbjgd572szexwqpxjfhb2';
    rotten.IN_THEATERS_URL = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json';
    rotten.events = {};
    
    rotten.messageHandler = function(e) {
        rotten.events[e.data.source] = e;
        getInTheaters(e);
    };
    
    var getInTheaters = function(e) {
        var param = {
            'apikey': rotten.API_KEY,
            'page_limit': 20,
            'page': 1,
            'callback': 'rotten.callback'
        };
        var url = [];
        url.push(rotten.IN_THEATERS_URL);
        url.push('?');
        for (var key in param) {
            url.push(key);
            url.push('=');
            url.push(param[key]);
            url.push('&');
        }
        url.pop();

        var script = document.getElementById('jsonp-rotten');
        if (script !== null) {
            document.body.removeChild(script);
        }
        script = document.createElement('script');
        script.id = 'jsonp-rotten';
        script.src = url.join('');
        document.body.appendChild(script);
    };
    
    rotten.callback = function(response) {
        for (var source in rotten.events) {
            window.sandbox.returnMessage(rotten.events[source], {
                'movies': response.movies
            });
            delete rotten.events[source];
        }
    };
})(window, document);