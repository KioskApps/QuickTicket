/**
 * @fileOverview Pricing class
 */

/**
 * The Pricing class is used to group several Ticket 
 * objects under one price name scheme.
 * <p>
 * For example, if there are four Tickets with a single 
 * TicketType called "Standard", those four Tickets 
 * would be added to a single Pricing named "Standard".
 * <p>
 * The Pricing class is used by an individual Theater 
 * to denote the price scheme of that theater.
 * @constructor
 * @param {number} id the ID of the pricing scheme, must be unique
 * @param {string} name the name of the pricing scheme, must be unique
 * @returns {Pricing}
 */
function Pricing(id, name) {
    
    /**
     * The ID of this Pricing scheme, default -1
     * @type {number}
     */
    this.id = isNaN(id) ? -1 : id;
    /**
     * The name of this Pricing scheme, default blank
     * @type {string}
     */
    this.name = typeof name === 'string' ? name : '';
    /**
     * The Tickets associated with this Pricing scheme
     * @type {Array.<Ticket>}
     */
    this.tickets = [];    
}