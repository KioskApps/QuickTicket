/**
 * @fileOverview Rotten Tomatoes API
 */

/**
 * Rotten Tomatoes API Namespace
 * @type {Object}
 */
var rotten = {};

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
            if (callback !== undefined) {
                callback();
            }
        }
    });
    sandbox.message({
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
    data.movies = [];
    
    for (var i = 0; i < movies.length; i++) {
        var m = movies[i];
        var movie = new Movie();
        movie.id = m.id;
        movie.title = m.title;
        movie.rating = m.mpaa_rating;
        movie.runtime = m.runtime + ' min';
        rotten.getMoviePoster(m.posters.original, movie);
        movie.synopsis = m.synopsis;
        for (var j = 0; j < m.abridged_cast.length; j++) {
            movie.cast.push(m.abridged_cast[j].name);
        }
        //No director data from Rotten Tomatoes
        //movie.directors = m.directors.slice(); 
        data.movies.push(movie);
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
                movie.posterUrl = window.URL.createObjectURL(xhr.response);
                $('.movies-carousel .movie[data-id="' + movie.id + '"] .movie-poster').attr('src', movie.posterUrl);
            }
            else {
                console.log('Could not retrieve poster: ' + xhr.responseText);
                //TODO: 404 Not Found Movie Poster
            }
        } 
    };
    xhr.open('GET', url, true);
    xhr.send();
};