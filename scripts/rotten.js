(function(window, document, Math) {
    //Check if sandbox-scripts.js exists
    if (!window.sandbox) {
        throw new Error('rotten.js requires sandbox. sandbox-scripts.js is not loaded in the "sandbox-scripts" iframe.');
    }

    //Rotten Tomatoes Scope
    var rotten = {};
    window.rotten = rotten;

    /**
     * Called each time an image is successfully loaded in order to give
     * user feedback on the status of the movie image loading/resizing.
     * @param {number} index the number of images loaded
     * @param {number} length the max number of images to load
     * @param {string} message a short message about the status of loading
     * @returns {undefined}
     */
    rotten.progress = function(index, length, message) {};
    /**
     * Called when all movie data images have been loaded.
     * @returns {undefined}
     */
    rotten.finished = function() {};
    /**
     * Current number of images loaded.
     */
    var imagesLoaded = 0;
    /**
     * Checks if all movie data images have been loaded, and calls
     * rotten.finished if true.
     * @returns {undefined}
     */
    var checkFinished = function() {
        if (imagesLoaded === data.movies.length) {
            rotten.finished();
        }
    };

    /**
     * Retrieves movie data for movies currently in theaters using the
     * Rotten Tomatoes API and parses the data into the data.movies Array.
     * @param {Function} callback an optional function that is called upon
     *     completing the movie retrieval
     * @returns {undefined}
     */
    rotten.getInTheatersData = function(callback) {
        window.addEventListener('message', function(e) {
            if (e.data.script === 'rotten') {
                rotten.parseMovieData(e.data.movies);
                if (typeof callback === 'function') {
                    rotten.finished = callback;
                }
            }
        });
        window.sandbox.message({
            'script': 'rotten'
        });
    };

    /**
     * Parses the provided array of movie data from Rotten Tomatoes into the
     * data.movies array.
     * <p>
     * This function is automatically called by rotten.getInTheatersData.
     * @param {Array} movies
     * @returns {undefined}
     */
    rotten.parseMovieData = function(movies) {
        window.data.movies = [];

        for (var i = 0; i < movies.length; i++) {
            var m = movies[i];
            var movie = new Movie();
            movie.id = m.id;
            movie.title = m.title;
            movie.rating = m.mpaa_rating;
            movie.runtime = m.runtime + ' min';
            //Original is the highest resolution, but this can be replaced
            //with detailed if the network is an issue.
            //We're replacing "_tmb" with "_ori" due to a bug in the
            //Rotten Tomatoes API that sometimes returns only thumbnail images
            //(noted as https://link/to/thumb_tmb.jpg). This bypasses that bug
            //and retrieves the original size.
            m.posters.original = m.posters.original.replace('_tmb', '_ori');

            //Rotten Tomatoes API movie URLs are referencing
            //resizing.flixster.com for thumbnail sizes. This regex will
            //strip the resizing url part and return the original link, with
            //the larger size.
            var parts = /\/\d+x\d+\/(.+)$/.exec(m.posters.original);
            var originalPoster = parts[1] || parts[0];
            if (m.posters.original.indexOf('https://' > -1)) {
              originalPoster = 'https://' + originalPoster;
            } else {
              originalPoster = 'http://' + originalPoster;
            }

            rotten.getMoviePoster(originalPoster, movie);
            movie.synopsis = m.synopsis;
            for (var j = 0; j < m.abridged_cast.length; j++) {
                movie.cast.push(m.abridged_cast[j].name);
            }
            //No director data from Rotten Tomatoes
            //movie.directors = m.directors.slice();
            window.data.movies.push(movie);
        }
    };

    /**
     * Retrieves an external movie poster image and creates a blob that is
     * accessible within the chrome app.
     * @param {string} url the URL of the movie poster to retrieve
     * @param {Movie} movie the Movie to set the posterUrl property
     * @returns {undefined}
     */
    rotten.getMoviePoster = function(url, movie) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var blob = xhr.response;
                    var blobUrl = window.URL.createObjectURL(blob);
                    var image = new Image();

                    image.src = blobUrl;
                    image.onload = function() {
                        var message = 'Loading "' + movie.title + '" ...';
                        rotten.progress(imagesLoaded + 1, data.movies.length, message);

                        var response = resizeImage(image, 300, true);
                        movie.poster = response.normal;
                        movie.posterBlur = response.blur;

                        imagesLoaded++;
                        checkFinished();
                    };
                }
            }
        };
        xhr.open('GET', url);
        xhr.send();
    };
    /**
     * Resizes an image if its width is greater than the max width provided.
     * <p>
     * This method returns an object with two data URLs, "normal" and "blur".
     * The "normal" data URL is the resized image, and the "blur" data URL is
     * the resized image with a blur filter applied.
     * @param {Image} img the Image to resize
     * @param {number} maxWidth the max width of the image
     * @returns {Object} Object with two properties, "normal" and "blur" which
     *      contain data URLs to the normal and blurred images
     */
    var resizeImage = function(img, maxWidth) {
        var canvas = document.createElement('canvas');

        var width = img.width;
        var height = img.height;

        if (width > maxWidth) {
            height = Math.round(height *= maxWidth / width);
            width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        var response = {};
        response.normal = canvas.toDataURL('image/jpeg');

        //See StackBlur.js for blur implementation
        stackBlurCanvasRGB(canvas, 0, 0, width, height, 5, 1);
        response.blur = canvas.toDataURL('image/jpeg');
        return response;
    };
})(window, document, Math);
