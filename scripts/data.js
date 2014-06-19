//Data Scope
var data = {};

//Static Global Data Variables
/**
 * Name of the theater
 * @type String
 */
data.CINEMA_NAME = 'I/0 Cinema 10';
/**
 * Abbreviated month names
 * @type Array.<string>
 */
data.MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/**
 * Spreadsheet to save receipt information to
 * @type String
 */
data.SPREADSHEET_ID = '1PSIXV-k_r0r53dVFIIqO72ZCCSXWNxa7-Ijl4Yjm0Fc';

/**
 * Contains all of the TicketType objects
 * @type Array.<TicketType>
 */
data.ticketTypes = [];
/**
 * Contains all of the Pricing objects
 * @type Array.<Pricing>
 */
data.pricings = [];
/**
 * Contains all of the Theater objects
 * @type Array.<Theater>
 */
data.theaters = [];
/**
 * Contains all of the Movie objects
 * @type Array.<Movie>
 */
data.movies = [];
/**
 * Contains all of the Showing objects
 * @type Array.<Showing>
 */
data.showings = [];

/**
 * Initializes all data and calls the provided callback function upon 
 * completion.
 * @param {function} callback called upon completion of data initialization
 * @returns {undefined}
 */
data.initializeData = function(callback) {
    /*
     * In a real case scenario, all of this data would be pulled in from the 
     * theater's internal web services and API. For this demonstration, we 
     * are pulling in data from three sources: a JSON file, a sandboxed 
     * API (Rotten Tomatoes), and dynamically generated content. 
     */
    $.getJSON('scripts/data.json', data.initializeDataJson);
    rotten.getInTheatersData(function() {
        data.getShowtimes(callback);
    });
    spreadsheet.defaultSpreadsheetId = data.SPREADSHEET_ID;
};

/**
 * Retrieves the showtime information for all the Movie objects.
 * @param {function} callback called upon completion of the Showtime object
 *      initialization
 * @returns {undefined}
 */
data.getShowtimes = function(callback) {
    //We are dynamically generating showtimes, but this is where you would 
    //call a showtime API service such as Fandango to pull in showtime data 
    //for each movie
    data.showings = [];
    var now = new Date();
    var date = data.MONTHS[now.getMonth()] + ' ' + now.getDate();
    
    var times = [
        '10:00am',
        '11:25am',
        '12:00pm',
        '12:30pm',
        '1:30pm',
        '2:00pm',
        '4:45pm',
        '6:20pm'
    ];
    var numShowings = 5;
    
    for (var i = 0; i < data.movies.length; i++) {
        var timeIndex = Math.floor((Math.random() * 3));
        
        for (var j = 0; j < numShowings; j++) {
            if (timeIndex < times.length) {
                var time = times[timeIndex];
                timeIndex += 2;
                
                var id = Math.floor((Math.random() * 9999) + 1000);
                var movie = data.movies[i];            
                var theater = data.theaters[Math.floor(Math.random() * data.theaters.length)];
                var showing = new Showing(id, movie, date, time, theater);
                data.showings.push(showing);
            }
        }
    }
    callback();
};
/**
 * Initialize data from a JSON file.
 * @param {Object} json the JSON file to initialize data from
 * @returns {undefined}
 */
data.initializeDataJson = function(json) {
    //For ticket information, pricings, and theaters, you would pull this from 
    //the theater's in house API. For demo purposes, we defined this data in a 
    //JSON file
    for (var i = 0; i < json.ticketTypes.length; i++) {
        var tt = json.ticketTypes[i];
        data.ticketTypes.push(new TicketType(tt.id, tt.name));
    }
    for (var i = 0; i < json.pricings.length; i++) {
        var p = json.pricings[i];
        var pricing = new Pricing(p.id, p.name);
        for (var j = 0; j < p.tickets.length; j++) {
            pricing.tickets.push(new Ticket(data.getTicketTypeByID(p.tickets[j].id), p.tickets[j].price));
        }
        data.pricings.push(pricing);
    }
    for (var i = 0; i < json.theaters.length; i++) {
        var t = json.theaters[i];
        data.theaters.push(new Theater(t.id, t.name, data.getPricingByName(t.pricing)));
    }
    return;
};

//Helper Functions
/**
 * Retrieves a TicketType object by its ID.
 * @param {string|number} id the ID of the TicketType to retrieve
 * @returns {TicketType} the TicketType, or undefined
 */
data.getTicketTypeByID = function(id) {
    return data.getObjectByProperty(data.ticketTypes, 'id', id);
};
/**
 * Retrieves a Pricing object by its name.
 * @param {string} name the name of the Pricing object to retrieve
 * @returns {Pricing} the Pricing object, or undefined
 */
data.getPricingByName = function(name) {
    return data.getObjectByProperty(data.pricings, 'name', name); 
};
/**
 * Retrieves a Movie object by its ID.
 * @param {string|number} id the ID of the Movie to retrieve
 * @returns {Movie} the Movie, or undefined
 */
data.getMovieByID = function(id) {
    return data.getObjectByProperty(data.movies, 'id', id);
};
/**
 * Retrieves a Movie object by its title.
 * @param {string} name the title of the Movie to retrieve
 * @returns {Movie} the Movie, or undefined
 */
data.getMovieByTitle = function(name) {
    return data.getObjectByProperty(data.movies, 'title', name); 
};
/**
 * Retrieves a Theater object by its ID.
 * @param {string|number} id the ID of the Theater to retrieve
 * @returns {Theater} the Theater, or undefined
 */
data.getTheaterByID = function(id) {
    return data.getObjectByProperty(data.theaters, 'id', id);
};
/**
 * Retrieves a Showing object by its ID.
 * @param {string|number} id the ID of the Showing to retrieve
 * @returns {Showing} the Showing, or undefined
 */
data.getShowingByID = function(id) {
    return data.getObjectByProperty(data.showings, 'id', id);
};
/**
 * Retrieves an array of Showing object associated with a give Movie.
 * @param {Movie} movie the Movie to retrieve Showings for
 * @returns {Array.<Showing>} Array of Showing objects for the provided Movie
 */
data.getShowingsByMovie = function(movie) {
    return data.getArrayByProperty(data.showings, 'movie', movie); 
};
/**
 * Retrieves an Object from the provided Array whose property matches the 
 * given value, or undefined in no Object could be found in the Array.
 * @param {Array} array the Array to search
 * @param {string} property the property name to look for
 * @param {Object} value the property value to match
 * @returns {Object} the Object found, or undefined
 */
data.getObjectByProperty = function(array, property, value) {
    var results = data.getArrayByProperty(array, property, value);
    if (results.length >= 1) {
        return results[0];
    }
};
/**
 * Retrieves an Array of Objects from the provided Array whose property 
 * matches the given value.
 * <p>
 * The Array will be empty if no Objects were found.
 * @param {Array} array the Array to search
 * @param {string} property the property name to look for
 * @param {Object} value the property value to match
 * @returns {Array} an Array of Objects found
 */
data.getArrayByProperty = function(array, property, value) {
    var results = [];
    for (var i = 0; i < array.length; i++) {
        //Loosely compare the value
        if (array[i][property] == value) {
            results.push(array[i]);
        }
    }
    return results;
};

/**
 * Saves the given Receipt object to a spreadsheet.
 * @param {Receipt|object} receipt the Receipt or receipt storage object to save
 * @returns {undefined}
 */
data.saveReceipt = function(receipt) {
    if (receipt && receipt.createStorageObject) {
        receipt = receipt.createStorageObject();
    }
    var row = [
        JSON.stringify(receipt)
    ];
    spreadsheet.appendRow(row, function(message, status) {
        console.log('Receipt Save Result: (' + status + ') ' + message);
    });
};
/**
 * Retrieves a Receipt object from the spreadsheet by its ID.
 * @param {string|number} id the ID of the Receipt to retrieve
 * @param {function(Receipt)} callback called upon successfully locating the 
 *      Receipt, the argument may be undefined if a Receipt is not found
 * @returns {undefined}
 */
data.getReceiptById = function(id, callback) {
    data.getReceiptByProperty('id', id, callback);
};
/**
 * Retrieves a Receipt object from the spreadsheet by the Card object used 
 * to create the Receipt.
 * @param {Card} card the Card used with the Receipt to retrieve
 * @param {function(Receipt)} callback called upon successfully locating the 
 *      Receipt, the argument may be undefined if a Receipt is not found
 * @returns {undefined}
 */
data.getReceiptByCard = function(card, callback) {
    var hash = swiper.generateCardHash(card);
    data.getReceiptByProperty('cardHash', hash, callback);
};
/**
 * Retrieves a Receipt from the spreadsheet whose property matches the 
 * provided value, or undefined if a Receipt could not be found.
 * @param {string} property the property name to look for
 * @param {Object} value the property value to match
 * @param {function(Receipt)} callback called upon successfully locating the 
 *      Receipt, the argument may be undefined if a Receipt is not found
 * @returns {undefined}
 */
data.getReceiptByProperty = function(property, value, callback) {
    spreadsheet.getAllRows(function(rows) {
        rows.reverse();
        for (var i = 0; i < rows.length; i++) {
            var receipt = JSON.parse(rows[i]);
            //Loosely compare the value
            if (receipt[property] == value) {
                callback(receipt);
                return;
            }
        }
        callback();
    });
};