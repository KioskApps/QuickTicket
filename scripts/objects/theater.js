/**
 * @fileOverview Theater class
 */

/**
 * The Theater class represents a theater in which Showings for a specific 
 * Movie are held.
 * <p>
 * Each Theater has a Pricing scheme that defines the cost of Tickets for 
 * the available seats.
 * @param {number} id the Theater ID, must be unique
 * @param {string} name the name of the Theater, must be unique
 * @param {Pricing} pricing the Pricing scheme for the Theater
 * @returns {Theater}
 */
function Theater(id, name, pricing) {
    
    /**
     * This Theater
     * @type {Theater}
     */
    var self = this;
    
    /**
     * The Theater ID, defaults to -1
     * @type {number}
     */
    this.id = isNaN(id) ? -1 : id;
    /**
     * The Theater name, such as "Theater 4"
     * @type {string}
     */
    this.name = typeof name === 'string' ? name : '';
    /**
     * The Pricing scheme for this Theater
     * @type {Pricing}
     */
    this.pricing = typeof pricing === 'undefined' ? new Pricing() : pricing;
    
    /**
     * Sets the provided tag's theater data related children to this Theater's 
     * information.
     * <p>
     * The provided element's children should implement any number of the 
     * following tags to retrieve theater data:
     * <ul>
     * <li>theater-name</li>
     * <li>theater-type</li>
     * </ul>
     * It is recommended that all tags are div tags.
     * @param {jQuery|string} selector the jQuery selector or a string 
     *     selector to set theater data to
     * @returns {jQuery} the jQuery theater data selector
     */
    this.setTheaterData = function(selector) {
        var s = $(selector);
        s.find('.theater-name').html(self.name);
        s.find('.theater-type').html(self.pricing.name);
        return s;
    };
}