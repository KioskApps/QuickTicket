/**
 * @fileOverview TicketType class
 */

/**
 * The TicketType class represents a defined type of Ticket, such as 
 * "Adult" or "Child".
 * <p>
 * Individual prices for each TicketType is set in the Ticket class. TicketType 
 * objects only define the name of the type of tickets available.
 * @param {number} id the ID of the TicketType, must be unique
 * @param {string} name the name of the TicketType, must be unique
 * @returns {TicketType}
 */
function TicketType(id, name) {
    
    /**
     * The ID of this TicketType, defaults to -1
     * @type {number}
     */
    this.id = isNaN(id) ? -1 : id;
    /**
     * The name of this TicketType
     * @type {string}
     */
    this.name = typeof name === 'string' ? name : '';
}