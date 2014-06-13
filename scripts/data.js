//data.js namespace
var data = {};

//Static Global Data Variables
data.CINEMA_NAME = 'I/0 Cinema 10';
data.MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
data.SPREADSHEET_ID = '1PSIXV-k_r0r53dVFIIqO72ZCCSXWNxa7-Ijl4Yjm0Fc';

data.ticketTypes = [];
data.pricings = [];
data.theaters = [];
data.movies = [];
data.showings = [];

data.initializeData = function(callback) {
    $.getJSON('scripts/data.json', data.initializeDataJson);
    rotten.getInTheatersData(function() {
        data.generateShowtimes(callback);
    });
    spreadsheet.defaultSpreadsheetId = data.SPREADSHEET_ID;
};

data.generateShowtimes = function(callback) {
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
data.getTicketTypeByID = function(id) {
    return data.getObjectByProperty(data.ticketTypes, 'id', id);
};
data.getPricingByName = function(name) {
    return data.getObjectByProperty(data.pricings, 'name', name); 
};
data.getMovieByID = function(id) {
    return data.getObjectByProperty(data.movies, 'id', id);
};
data.getMovieByTitle = function(name) {
    return data.getObjectByProperty(data.movies, 'title', name); 
};
data.getTheaterByID = function(id) {
    return data.getObjectByProperty(data.theaters, 'id', id);
};
data.getShowingByID = function(id) {
    return data.getObjectByProperty(data.showings, 'id', id);
};
data.getShowingsByMovie = function(movie) {
    return data.getArrayByProperty(data.showings, 'movie', movie); 
};
//This function will only return a the first found object, or undefined
data.getObjectByProperty = function(array, property, value) {
    var results = data.getArrayByProperty(array, property, value);
    if (results.length >= 1) {
        return results[0];
    }
};
//This function returns an array of results, which may be empty
data.getArrayByProperty = function(array, property, value) {
    var results = [];
    for (var i = 0; i < array.length; i++) {
        if (array[i][property] == value) {
            results.push(array[i]);
        }
    }
    return results;
};


data.saveReceipt = function(receipt) {
    var row = [
        JSON.stringify(receipt)
    ];
    spreadsheet.appendRow(row, function(message, status) {
        console.log('Receipt Save Result: (' + status + ') ' + message);
    });
};
data.getReceiptByProperty = function(property, value, callback) {
    spreadsheet.getAllRows(function(rows) {
        rows.reverse();
        for (var i = 0; i < rows.length; i++) {
            var receipt = JSON.parse(rows[i]);
            if (receipt[property] === value) {
                callback(receipt);
                return;
            }
        }
        callback();
    });
};
data.getReceiptById = function(id, callback) {
    data.getReceiptByProperty('id', id, callback);
};
data.getReceiptByCard = function(card, callback) {
    var hash = swiper.generateCardHash(card);
    data.getReceiptByProperty('cardHash', hash, callback);
};