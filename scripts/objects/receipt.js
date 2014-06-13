/**
 * @fileOverview Receipt class
 */

/**
 * The Receipt class represents a receipt of selected 
 * Tickets for a specific Showing. It also contains 
 * payment information.
 * @constructor
 * @param {Showing} showing the selected Showing
 * @returns {Receipt}
 */
function Receipt(showing) {
    
    /**
     * This Receipt
     * @type {Receipt}
     */
    var self = this;
    /**
     * The ID of this Receipt, defaults to a random XX-XXX format, where X is 
     * any numerical digit.
     * @type {string}
     */
    this.id = (Math.floor(Math.random() * 89) + 10).toString() + '-' + (Math.floor(Math.random() * 899) + 100).toString();
    /**
     * The selected Showing for this Receipt
     * @type {Showing}
     */
    this.showing = typeof showing === 'undefined' ? new Showing() : showing;
    /**
     * The Tickets selected for purchase
     * @type {Array.<Ticket>}
     */
    this.tickets = [];
    /**
     * The type of payment, usually 'Credit', 'Cash', or 'Gift'
     * @type {string}
     */
    this.paymentType = '';
    /**
     * An optional Object representing more details of the payment type. 
     * @type {Object}
     */
    this.paymentObject = {};
    /**
     * A short description of payment information that should be displayed. 
     * For example, this could be the last four digits of the card charged, 
     * or change due.
     * @type {string}
     */
    this.paymentTypeInfo = '';
    
    /**
     * Retrieves an Array of Ticket objects with the "quantity" property added 
     * to each Ticket object, indicating the number of Tickets selected.
     * <p>
     * By default, the Receipt's tickets Array can contain multiples of each 
     * Ticket. This function will condense those duplicates and return the 
     * results.
     * @returns {Array.<Ticket>}
     */
    this.getTicketsWithQuantity = function() {
        var ticketQuantities = [];
        for (var i = 0; i < self.tickets.length; i++) {
            var found = -1;
            for (var j = 0; j < ticketQuantities.length; j++) {
                if (ticketQuantities[j].ticketType.name === self.tickets[i].ticketType.name) {
                    found = j;
                    break;
                }
            }
            if (found > -1) {
                ticketQuantities[j].quantity += 1;
            }
            else {
                self.tickets[i].quantity = 1;
                ticketQuantities.push(self.tickets[i]);
            }
        }
        
        return ticketQuantities;
    };
    
    this.createStorageObject = function() {
        var store = {};
        
        store.id = self.id;
        store.theater = self.showing.theater.name;
        store.movie = self.showing.movie.title;
        store.rating = self.showing.movie.rating;
        store.time = self.showing.time;
        store.date = self.showing.date;
        store.stubs = [];
        
        for (var i = 0; i < self.tickets.length; i++) {
            var stub = {};
            stub.type = self.tickets[i].ticketType.name;
            stub.price = self.tickets[i].price;
            store.stubs.push(stub);
        }
        
        store.cardHash = swiper.generateCardHash(self.paymentObject);
        
        return store;
    };
}