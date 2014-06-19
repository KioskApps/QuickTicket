(function(window, document) {
    //Requires sandbox-script.js
    if (!window.sandbox) {
        throw new Error('sandbox-scripts.js is not loaded in the "sandbox-scripts" iframe.');
    }
    
    //Rotten Tomatoes Scope
    var rotten = {};
    window.rotten = rotten;
    
    /**
     * The Rotten Tomatoes API key (replace with your own)
     */
    rotten.API_KEY = 'e7xdbjgd572szexwqpxjfhb2';
    /**
     * URL to retrieve movies that are currently in theaters
     */
    rotten.IN_THEATERS_URL = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json';
    /**
     * Used to store Events waiting for a response from Rotten Tomatoes
     */
    rotten.events = {};
    
    /**
     * Rotten Tomatoes sandboxed message handler.
     * <p>
     * Note that unlike sandbox-stripe.js, sandbox-rotten.js does not 
     * implement checkScript() or getScriptUrl(). This is because this API 
     * does not require an external script to be loaded in order to work.
     * <p>
     * The reason Rotten Tomatoes' API must be sandboxed is to avoid the 
     * same-origin policy that prevents it from running regularly. Sandboxing 
     * API calls is a good way to avoid dealing with Cross-Origin Policy (CORS).
     * @param {Event} e message event
     * @returns {undefined}
     */
    rotten.messageHandler = function(e) {
        rotten.events[e.data.source] = e;
        getInTheaters();
    };
    
    /**
     * Retrieve movie data for movies currently in theaters.
     * @returns {undefined}
     */
    var getInTheaters = function() {
        //Define a callback for JSON padding (JSONP)
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
    /**
     * Called when the JSON padding result has been loaded into the 
     * document.
     * @param {Object} response movie data from Rotten Tomatoes
     * @returns {undefined}
     */
    rotten.callback = function(response) {
        //Return movie data for all events that requested it. Since the movie 
        //data is the same no matter what event requests it, it is safe to 
        //send the same data object to all events without checking their 
        //source
        for (var source in rotten.events) {
            window.sandbox.returnMessage(rotten.events[source], {
                'movies': response.movies
            });
            delete rotten.events[source];
        }
    };
})(window, document);