/**
 * @fileOverview Showing class
 */

/**
 * The Showing class represents a showtime for a specific Movie in a specific 
 * Theater.
 * @param {number} id the ID of this Showing
 * @param {Movie} movie the Movie this Showing is for
 * @param {string} date a string description of the date of the Showing
 * @param {string} time a string description of the time of the Showing
 * @param {Theater} theater the Theater the Showing is in
 * @returns {Showing}
 */
function Showing(id, movie, date, time, theater) {
    
    /**
     * This Showing
     * @type {Showing}
     */
    var self = this;
    
    /**
     * The ID of this Showing, defaults to -1
     * @type {number}
     */
    this.id = isNaN(id) ? -1 : id;
    /**
     * The Movie for this Showing, defaults to a new Movie object
     * @type {Movie}
     */
    this.movie = typeof movie === 'undefined' ? new Movie() : movie;
    /**
     * The date of this Showing as a string, usually MMM d. For example, Jan 1
     * @type {string}
     */
    this.date = typeof date === 'string' ? date : '';
    /**
     * The time of this Showing as a string, usually hh:mm. For example, 11:30am
     * @type {string}
     */
    this.time = typeof time === 'string' ? time : '';
    /**
     * The Theater this Showing is located in, defaults to a new Theater object
     * @type {Theater}
     */
    this.theater = typeof theater === 'undefined' ? new Theater() : theater;
    
    /**
     * Sets the provided tag's showing data related children to this Showing's 
     * information.
     * <p>
     * The provided element's children should implement any number of the 
     * following tags to retrieve showing data:
     * <ul>
     * <li>showing-date</li>
     * <li>showing-time</li>
     * <li>showing-type</li>
     * </ul>
     * It is recommended that all tags are div tags.
     * @param {jQuery|string} selector the jQuery selector or a string 
     *     selector to set showing data to
     * @returns {jQuery} the jQuery showing data selector
     */
    this.setShowingData = function(selector) {
        var s = $(selector);
        s.find('.showing-date').html(self.date);
        s.find('.showing-time').html(self.time);
        s.find('.showing-type').html(self.theater.pricing.name);
        return s;
    };
    
    /**
     * Retrieves a button tag that contains this Showing's ID as a 
     * "data-id" attribute, along with the Showing's time and type.
     * @returns {jQuery} the jQuery button tag
     */
    this.getShowingButton = function() {
        var button = $('<button/>').addClass('showing', 'showing-data').attr('data-id', self.id);
        button.append($('<span/>').addClass('showing-time'));
        button.append($('<span/>').addClass('showing-type'));
        self.setShowingData(button);
        
        return button;
    };
}