/**
 * @fileOverview Movie class
 */

/**
 * A Movie object defines an individual movie that can be 
 * attached to Showings.
 * <p>
 * Each Movie is distinguished by an ID and by the movie title. 
 * Both fields should be unique.
 * @constructor
 * @returns {Movie}
 */
function Movie() {
    
    /**
     * This Movie
     * @type {Movie}
     */
    var self = this;
    
    /**
     * The ID of the movie, must be unique, -1 by default
     * @type {number}
     */
    this.id = -1;
    /**
     * The title of the movie, must be unique, blank by default
     * @type {string}
     */
    this.title = '';
    /**
     * The MPAA rating of the movie
     * @type {string}
     */
    this.rating = '';
    /**
     * The runtime, usually formatted as XXmin
     * @type {string}
     */
    this.runtime = '';
    /**
     * A link to the movie poster to be used in a 'src' attribute
     * @type {string}
     */
    this.posterUrl = 'images/loading.gif';
    /**
     * A short synopsis of the movie's plot
     * @type {string}
     */
    this.synopsis = '';
    /**
     * An array of Strings, no larger than 7, of the movie cast members
     * @type {Array.<string>}
     */
    this.cast = [];
    /**
     * An array of Strings, no larger than 7, of the movie directors
     * @type {Array.<string>}
     */
    this.directors = [];
    
    /**
     * Sets the provided tag's movie data related children to this movie's 
     * information.
     * <p>
     * The provided element's children should implement any number of the 
     * following tags to retrieve movie data:
     * <ul>
     * <li>movie-title</li>
     * <li>movie-rating</li>
     * <li>movie-runtime</li>
     * <li>movie-poster</li>
     * <li>movie-synopsis</li>
     * <li>movie-cast</li>
     * <li>movie-directors</li>
     * </ul>
     * It is recommended that all tags are div tags, with the exception of the 
     * movie-poster class, which should be on an img tag.
     * <p>
     * If the movie-poster tag is not an img tag, the background-image property 
     * of the tag will be set to the movie poster.
     * @param {!jQuery|string} selector the jQuery selector or a string 
     *     selector to set movie data to
     * @returns {jQuery} the jQuery movie data selector
     */
    this.setMovieData = function(selector) {
        var s = $(selector);
        s.find('.movie-title').html(self.title);
        s.find('.movie-rating').html('<span class="title">Rating: </span><span class="rating">' + self.rating + '</span>');
        s.find('.movie-runtime').html(self.runtime);
        s.find('.movie-poster').attr('src', self.posterUrl);
        s.find('.movie-poster').css('background-image', 'url("' + self.posterUrl + '")');
        s.find('.movie-synopsis').html(self.synopsis);
        var cast = s.find('.movie-cast').empty();
        var castLimit = (self.cast.length > 7 ) ? 7 : self.cast.length;
        for (var i = 0; i < castLimit; i++) {
            cast.append($('<div/>').html(self.cast[i]));
        }
        var directors = s.find('.movie-directors').empty();
        var directorsLimit = (self.directors.length > 7 ) ? 7 : self.directors.length;
        for (var i = 0; i < directorsLimit; i++) {
            directors.append($('<div/>').html(self.directors[i]));
        }
        return selector;
    };
    
    /**
     * Creates and returns a jQuery div tag for this Movie that 
     * is used in a carousel of several movies.
     * <p>
     * This div tag contains the movie poster and the movie's rating.
     * @returns {jQuery} jQuery div tag for movie carousel
     */
    this.getCarouselDiv = function() {
        var div = $('<div/>').addClass('movie').attr('data-id', self.id);
        div.append($('<img>').addClass('movie-poster').attr('src', self.posterUrl));
        var movieData = $('<div/>').addClass('movie-data');
        movieData.append($('<div/>').addClass('movie-rating'));
        self.setMovieData(movieData);
        div.append(movieData);
        
        return div;
    };
}