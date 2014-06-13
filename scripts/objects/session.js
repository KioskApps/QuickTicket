/**
 * @fileOverview Session class
 */

/**
 * The Session class represents the current user's session.
 * <p>
 * A Session contains only two properties, the current selected Showing, and 
 * the current Receipt.
 * @returns {Session}
 */
function Session() {
    
    /**
     * The user's currently selected Showing
     * @type {Showing}
     */
    this.showing = new Showing();
    /**
     * The user's current Receipt
     * @type {Receipt}
     */
    this.receipt = new Receipt(this.showing);
}