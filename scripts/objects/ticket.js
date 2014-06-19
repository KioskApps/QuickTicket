/**
 * The Ticket class represents a TicketType and its associated price.
 * <p>
 * TicketTypes can be universal, such as "Adult" or "Child", but the price for 
 * each Ticket can change depending on the Theater type.
 * @param {TicketType} ticketType
 * @param {number} price
 * @returns {Ticket}
 */
function Ticket(ticketType, price) {
    
    /**
     * This Ticket
     * @type {Ticket}
     */
    var self = this;
    /**
     * The TicketType of this Ticket
     * @type {TicketType}
     */
    this.ticketType = typeof ticketType === 'undefined' ? new TicketType() : ticketType;
    /**
     * The price of this Ticket, defaults to 0
     * @type number
     */
    this.price = typeof price === 'undefined' ? 0.00 : parseFloat(price);
    
    /**
     * Creates a ticket div that to display a read-only line of this 
     * Ticket's information. This can be used in creating a summary of this 
     * Ticket.
     * @returns {jQuery} the ticket summary jQuery div selector
     */
    this.createTicketDiv = function() {
        var quantity = typeof self.quantity === 'undefined' ? 1 : self.quantity;
        return $('<div/>').addClass('ticket')
                    .append($('<span/>').addClass('ticket-movie-title').html(main.session.showing.movie.title))
                    .append($('<span/>').addClass('ticket-time').html(main.session.showing.time))
                    .append($('<span/>').addClass('ticket-type').html(self.ticketType.name))
                    .append($('<span/>').addClass('ticket-price').html(main.formatCurrency(self.price)))
                    .append($('<span/>').addClass('ticket-multiplier').html('x'))
                    .append($('<span/>').addClass('ticket-quantity').html(quantity));
    };
}