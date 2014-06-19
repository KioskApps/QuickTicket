$(document).ready(function() {
    main.initialize();
});

//Main Scope
var main = {};
/**
 * The current Session
 * @type Session
 */
main.session;
/**
 * Delay (ms) until returning to the main page after printing tickets
 * @type Number
 */
main.completeDelay = 5000;
/**
 * Animation time (ms) for opening/closing of various sections
 * @type Number
 */
main.SECTION_ANIMATION = 200;

/**
 * Initialize the app
 * @returns {undefined}
 */
main.initialize = function() {
    //Setup Slider
    slider.processing = '#page-processing';
    slider.storage = '#pages';
    /*
     * Add navigateTo() utility function so that we don't have to specify 
     * the main slider each time
     */
    slider.navigateTo = function(page, direction, beforeOpen, param) {
        slider.slide('#slide-container', page, direction, beforeOpen, param);
    };
    
    //First display a processing page while we load and initialize
    slider.navigateTo('#page-processing', slider.Direction.LEFT);
    
    //Load data
    data.initializeData(main.start);
    $('.cinema-name').html(data.CINEMA_NAME);
    
    //Start Clock
    main.updateClock();
    
    //Setup StillThere
    stillthere.timeoutStillThere = 120000; //2 minutes
    stillthere.timeout = 150000; //2.5 minutes
    stillthere.addEventListener(stillthere.Event.STILL_THERE, function() {
        stillthere.overlay.find('.message').html('Are you still there?');
    });
    stillthere.addEventListener(stillthere.Event.TIMEOUT, function() {
        stillthere.overlay.find('.message').html('Touch to Begin');
        main.start();
    });
    
    //Setup swiper
    swiper.addTrigger('#page-purchase');
    
    /*
     * Add Listeners
     */
    //Page-Initial
    $('#page-initial .purchase-tickets').click(function() {
        slider.navigateTo('#page-movies', slider.Direction.RIGHT, main.moviesBeforeOpen);
    });
    $('#page-initial .print-tickets').click(function() {
        slider.navigateTo('#page-ticket-search', slider.Direction.RIGHT, main.searchBeforeOpen);
    });
    
    //Page-Showing
    $('#page-showing .purchase-tickets').click(function() {
        slider.navigateTo('#page-purchase', slider.Direction.RIGHT, main.purchaseBeforeOpen);
    });
    $('#page-showing .add-tickets').click(main.addTicket);
    
    //Page-Purchase
    $('#page-purchase').on(swiper.EVENT, main.purchaseSwiper);
    $('#page-purchase .payment-method-option.cash').click(main.purchaseCash);
    $('#page-purchase .payment-method-option.card').click(main.purchaseCard);
    $('#page-purchase .payment-method-option.gift').click(main.purchaseGift);
    
    //Page-Purchase-Results
    $('#page-purchase-results .print-tickets').click(function() {
        slider.navigateTo('#page-print-tickets', slider.Direction.RIGHT, main.printPreviewBeforeOpen);
    });
    
    //Page-Ticket-Search
    $('#page-ticket-search').on(slider.Event.AFTER_CLOSE, function() {
        swiper.scanning = false;    
        swiper.removeFocus();
    });
    $('#page-ticket-search').on(swiper.EVENT, function(e, card) {
        main.searchProcess(card);
    });
    $('#page-ticket-search .receipt-button').click(main.searchReceipt);
    $('#page-ticket-search .receipt-input').keyup(main.searchReceiptKeyUp);
    $('#page-ticket-search .card-button').click(main.searchCard);
    
    //Page-Print-Tickets
    $('#page-print-tickets .print-tickets').click(function() {
        slider.navigateTo('#page-print-results', slider.Direction.RIGHT, main.printTickets);
    });
    
    //Page-Print-Results
    $('#page-print-results').on(slider.Event.AFTER_OPEN, function() {
        setTimeout(main.start, main.completeDelay);
    });
    
    //Buttons
    $('.return-main-menu').click(main.start);
    $('.return-movies').click(function() {
        slider.navigateTo('#page-movies', slider.Direction.LEFT, main.moviesBeforeOpen);
    });
    $('.return-movie').click(function() {
        slider.navigateTo('#page-movie', slider.Direction.LEFT);
    });
    $('.return-showing').click(function() {
        slider.navigateTo('#page-showing', slider.Direction.LEFT);
    });
};

/**
 * Starts the app and resets the current session.
 * @returns {undefined}
 */
main.start = function() {
    main.session = new Session();
    swiper.scanning = false;
    
    //Get new hero image
    var randomNumber = Math.floor(Math.random() * 12) + 1;
    var imageNumber = '001';
    if(randomNumber >= 10) {
        imageNumber = '0' + randomNumber;
    }
    else {
        imageNumber = '00' + randomNumber;
    }
    var imageName = imageNumber + '.png';
    $('#page-initial .hero-image').attr('src', 'images/hero-images/' + imageName);
    
    slider.navigateTo('#page-initial', slider.Direction.LEFT);
};


/*******************************************************************************
 * Actions
 ******************************************************************************/
/**
 * Adds a new ticket to the showing page.
 * <p>
 * If clearExisting is set to true, all other tickets will be removed.
 * <p>
 * If the type is set, a ticket with the appropriate TicketType will be 
 * displayed. Otherwise, a dropdown menu will be used to allow the user to 
 * specify the TicketType.
 * @param {boolean} clearExisting if true, clear the existing tickets
 * @param {string} type define the TicketType of the ticket to add
 * @returns {undefined}
 */
main.addTicket = function(clearExisting, type) {
    var tickets = $('#page-showing .showing-tickets .ticket');
    if (clearExisting) {
        $('#page-showing .showing-tickets').empty();
        tickets = [];
    }
    var ticketID = Math.floor((Math.random() * 1000) + 1000);
    $.each($(tickets), function() {
        var id = parseInt($(this).attr('data-id'));
        if (id === ticketID) {
            ticketID = Math.floor((Math.Random * 1000) + 1000);
        }
    });
    
    var ticket = $('<div/>').addClass('ticket').css('display', 'none').attr('data-id', ticketID);
    ticket.append($('<span/>').addClass('showing-time').html(main.session.showing.time));
    ticket.append($('<span/>').addClass('showing-type').html(main.session.showing.theater.pricing.name));
    if (type) {
        ticket.append($('<span/>').addClass('ticket-type').html(type));
    }
    else {
        ticket.append($('<select/>').addClass('ticket-type'));
    }
    ticket.append($('<span/>').addClass('ticket-price'));
    ticket.append($('<span/>').addClass('ticket-multiplier').html('x'));
    ticket.append($('<span/>').addClass('ticket-quantity').html('1'));
    //Add listener to decrease ticket quantity
    ticket.append($('<button/>').addClass('ticket-quantity-decrease').html('-').click(function(e) {
        var ticketID = $(e.target).closest('.ticket').attr('data-id');
        main.modifyTicketQuantity(ticketID, false);
    }));
    //Add listener to increase ticket quantity
    ticket.append($('<button/>').addClass('ticket-quantity-increase').html('+').click(function(e) {
        var ticketID = $(e.target).closest('.ticket').attr('data-id');
        main.modifyTicketQuantity(ticketID, true);
    }));
    ticket.append($('<span/>').addClass('ticket-total'));
    //Add listener to remove ticket with delete button
    ticket.append($('<button/>').addClass('delete-ticket').html('X').click(function(e) {
        var ticketID = $(e.target).closest('.ticket').attr('data-id');
        main.addTicket(ticketID);
    }));
    
    $('#page-showing .showing-tickets').append(ticket);
    
    if (!type) {
        $('#page-showing .ticket-type').each(function() {
            var showingTicketType = $(this);
            if (showingTicketType.children().length === 0) {
                var tickets = main.session.showing.theater.pricing.tickets;
                for (var i = 0; i < tickets.length; i++) {
                    var selected = '';
                    if (type && tickets[i].ticketType.name === type) {
                        selected = ' selected';
                    }
                    var ticketTypeString = '<option value="' + tickets[i].ticketType.name + '"' + selected + '>' + tickets[i].ticketType.name + '</option>';
                    showingTicketType.append(ticketTypeString);
                }
            }
        });
    }
    
    $('#page-showing .ticket[data-id="' + ticketID + '"] .ticket-type').change(function() {
        main.updateTickets();
    });
    
    main.updateTickets();
    
    $('#page-showing .ticket[data-id="' + ticketID + '"]').show(main.SECTION_ANIMATION);
};
/**
 * Removes a Ticket from the showing page by its ticket ID.
 * @param {string} ticketId the ID of the ticket to remove
 * @returns {undefined}
 */
main.removeTicket = function(ticketId) {
    $('#page-showing .showing-tickets .ticket[data-id="' + ticketId + '"]').hide(main.SECTION_ANIMATION, function(){
        $(this).remove();
        main.updateTickets();
    });
};
/**
 * Modifies the quantity of a ticket on the showing page.
 * @param {string} ticketId the ID of the ticket to modify
 * @param {boolean} increase if true, increase the quantity by one, otherwise 
 *      decrease by one
 * @returns {undefined}
 */
main.modifyTicketQuantity = function(ticketId, increase) {
    var ticketQuantity = $('#page-showing .showing-tickets .ticket[data-id="' + ticketId + '"] .ticket-quantity');
    var newQuantity = 0;
    if (increase) {
        newQuantity = parseInt(ticketQuantity.html()) + 1;
    }
    else {
        newQuantity = parseInt(ticketQuantity.html()) - 1;
        if (newQuantity < 0) {
            newQuantity = 0;
        }
    }
    ticketQuantity.html(newQuantity);
    main.updateTickets();
};
/**
 * Updates the showing page tickets. This function will update the ticket 
 * quantity and prices.
 * @returns {undefined}
 */
main.updateTickets = function() {
    var totalPrice = 0;
    $.each($('#page-showing .ticket'), function() {
       var ticket = $(this);
       var ticketType = $('.ticket-type option:selected', ticket).val();
       if (typeof ticketType === 'undefined') {
           ticketType = $('.ticket-type').html();
       }
       var tickets = main.session.showing.theater.pricing.tickets;
       var price = 0.00;
       for (var i = 0; i < tickets.length; i++) {
           if (tickets[i].ticketType.name === ticketType) {
               price = tickets[i].price;
               break;
           }
       }

       var priceElement = $('.ticket-price', ticket);
       priceElement.html(main.formatCurrency(price));

       var ticketQuantity = parseInt($('.ticket-quantity', ticket).html());
       var ticketTotal = price * ticketQuantity;
       $('.ticket-total', ticket).html(main.formatCurrency(ticketTotal));

       totalPrice += ticketTotal;
    });
    $('#page-showing .tickets-grand-total').html(main.formatCurrency(totalPrice, true));
};
/**
 * Creates a ticket summary div tag that contains all of the current session 
 * receipt tickets as well as a total.
 * @returns {jQuery} jQuery ticket summary div selector
 */
main.createTicketSummary = function() {
    var summary = $('<div/>').addClass('tickets');
    var ticketTotal = 0;
    var ticketQuantities = main.session.receipt.getTicketsWithQuantity();
    for (var i = 0; i < ticketQuantities.length; i++) {
        ticketQuantities[i].createTicketDiv().appendTo(summary);
        ticketTotal += (ticketQuantities[i].price * ticketQuantities[i].quantity);
    }
    main.createTicketTotalDiv('----------').addClass('tickets-total-line').appendTo(summary);
    main.createTicketTotalDiv(main.formatCurrency(ticketTotal)).addClass('tickets-total').appendTo(summary);
    return summary;
};
/**
 * Creates a special ticket div that is used for displaying the total price 
 * of the receipt's tickets.
 * @param {string} priceHtml content to display in the 'ticket-price' class
 * @returns {jQuery} jQuery ticket total div selector
 */
main.createTicketTotalDiv = function(priceHtml) {
    var totalTitle = '';
    if(priceHtml.indexOf('$') > -1) {
        totalTitle = '<strong>Total</strong>'
    }
    
    var totalTicket = new Ticket();
    var div = totalTicket.createTicketDiv();
    div.find('.ticket-movie-title').css('visibility', 'hidden');
    div.find('.ticket-time').html('');
    div.find('.ticket-type').html(totalTitle);
    div.find('.ticket-price').html(priceHtml);
    div.find('.ticket-multiplier').html('');
    div.find('.ticket-quantity').html('');
    return div;
};
/**
 * Creates the printable div ticket stubs.
 * <p>
 * This function will create the ticket stub div and append it to the 
 * print tickets page container.
 * @param {Ticket} ticket the Ticket to create a stub for
 * @returns {undefined}
 */
main.createPrintTickets = function(ticket) {
    var todaysDate = new Date();
    
    var ticketHTML = ['<div class="ticket">',
                            '<div class="main">',
                                '<header><img src="images/ioCinemaIcon.png" /><span class="header-title">I/0 Cinema 10</span></header>',
                                '<div class="ticket-content">',
                                    '<div class="theater"><span class="title">Theater:</span><span class="theater-name">' + main.session.showing.theater.name + '</span></div>',
                                    '<div class="movie"><span class="ticket-movie-title title">' + main.session.showing.movie.title + '</span></div>',
                                    '<div class="rating"><span class="title">Rating:</span><span class="ticket-rating">' + main.session.showing.movie.rating + '</span></div>',
                                    '<div class="time"><span class="title">Showing:</span><span class="ticket-time">' + main.session.showing.time + '</span></div>',
                                    '<div class="date"><span class="admission-date title">' + main.session.showing.date + '</span></div>',
                                    '<div class="admission-data">',
                                        '<div class="admission-data-item admission"><span class="title">Admit:</span>1 <span class="ticket-type">' + ticket.ticketType.name + '</span></div>',
                                        '<div class="admission-data-item price"><span class="title">Price:</span><span class="ticket-price">' + main.formatCurrency(ticket.price) + '</span></div>',
                                    '</div>',
                                    '<div class="cinema-data">',
                                        '<div class="cinema-data-item id"><span class="title">ID:</span><span class="ticket-id">' + main.session.receipt.id + '</span></div>',
                                        '<div class="cinema-data-item issue"><span class="title">Issued:</span><span class="ticket-issue-data">' + todaysDate.getHours() + ':' + todaysDate.getMinutes() + ":" + todaysDate.getSeconds() + ' ' + todaysDate.getMonth()+1 + '/' + todaysDate.getDate() + '/' + todaysDate.getFullYear() + '</span></div>',
                                        '<div class="cinema-data-item issuer"><span class="title">By:</span><span class="ticket-issuer">Kiosk</span></div>',
                                    '</div>',
                                '</div>',
                            '</div>',
                            '<div class="stub">',
                                '<header></header>',
                                '<div class="ticket-content">',
                                    '<div class="theater"><span class="title">Theater:</span><span class="theater-name">' + main.session.showing.theater.name + '</span></div>',
                                    '<div class="date"><span class="admission-date title">' + main.session.showing.date + '</span></div>',
                                    '<div class="time"><span class="title">Showing:</span><span class="ticket-time">' + main.session.showing.time + '</span></div>',
                                    '<div class="movie"><span class="ticket-movie-title title">' + main.session.showing.movie.title + '</span></div>',
                                    '<div class="admission">1 <span class="ticket-type">' + ticket.ticketType.name + '</span></div>',
                                    '<div class="cinema-data">',
                                        '<div class="cinema-data-item id"><span class="title">ID:</span><span class="ticket-id">' + main.session.receipt.id + '</span></div>',
                                        '<div class="cinema-data-item issue"><span class="title">Issued:</span><span class="ticket-issue-data">' + todaysDate.getHours() + ':' + todaysDate.getMinutes() + ":" + todaysDate.getSeconds() + ' ' + todaysDate.getMonth()+1 + '/' + todaysDate.getDate() + '/' + todaysDate.getFullYear() + '</span></div>',
                                        '<div class="cinema-data-item issuer"><span class="title">By:</span><span class="ticket-issuer">Kiosk</span></div>',
                                    '</div>',
                                '</div>',
                            '</div>',
                      '</div>'];
    var ticketHTMLString = ticketHTML.join('');
    
    $('#page-print-tickets .tickets-container').append(ticketHTMLString);
};

/**
 * Prints the tickets currently displayed on the print page.
 * @returns {undefined}
 */
main.printTickets = function() {
    /*
     * When printing from a Chrome Box, you must use Google Cloud printing, 
     * since you cannot print to a local computer. Google for Business allows 
     * the setup of a managed kiosk device with cloud printing, but for 
     * demo purposes, this print function will cause a window print prompt 
     * to display to the user.
     * 
     * In a real world scenario, this kiosk app would be deployed on a 
     * managed kiosk device with silent printing set up. To avoid the 
     * print prompt, this section of code is commented out.
     */
    
    /*
    var html = $('#page-print-tickets .tickets-container').html();
    chrome.app.window.create('blank.html', function(createdWindow) {
        //blank.html is an empty file that the provided HTML to print can 
        //be appended to. The blank.html file also links to the print.css 
        //style, where you can specify print-related styling
        var w = createdWindow.contentWindow;
        createdWindow.hide();
        w.onload = function() {
            var content = w.document.getElementById('content');
            content.innerHTML = html;
            w.print();
            createdWindow.close();
        };
    });
    */
};


/*******************************************************************************
 * Listeners / Pre-requisite Functions
 ******************************************************************************/
/**
 * Loads movies into the movie carousel.
 * @returns {undefined}
 */
main.moviesBeforeOpen = function() {
    //Only load the movies in once, there is no need to load them in every time
    //since data.movies only pulls in movie data once at startup
    if ($('#page-movies .movies-carousel').children().length === 0) {
        for (var i = 0; i < data.movies.length; i++) {
            $('#page-movies .movies-carousel').append(data.movies[i].getCarouselDiv());
        }

        //Add listeners to view movie show times
        $('#page-movies .movie').unbind('click').click(function(e) {
            var movieID = $(e.target).closest('.movie').attr('data-id');
            slider.navigateTo('#page-movie', slider.Direction.RIGHT, main.movieBeforeOpen, data.getMovieByID(movieID));
        });
    }
};

/**
 * Sets the movie data for the movie page
 * @param {Movie} movie the Movie to view
 * @returns {undefined}
 */
main.movieBeforeOpen = function(movie) {
    movie.setMovieData($('#page-movie'));

    $('#page-movie .showings').empty();
    var movieShowings = data.getShowingsByMovie(movie);
    for (var i = 0; i < movieShowings.length; i++) {
        var button = movieShowings[i].getShowingButton();
        //Add listener to open showing
        button.click(function(e) {
            var showingID = $(e.target).closest('.showing').attr('data-id');
            main.session.showing = data.getShowingByID(showingID);
            slider.navigateTo('#page-showing', slider.Direction.RIGHT, main.showingBeforeOpen);
        });
        $('#page-movie .showings').append(button);
    }
};

/**
 * Initializes the showing ticket selection page.
 * @returns {undefined}
 */
main.showingBeforeOpen = function() {
    var pageShowing = $('#page-showing');
    
    main.session.showing.movie.setMovieData(pageShowing);
    main.session.showing.setShowingData(pageShowing);
    main.session.showing.theater.setTheaterData(pageShowing);

    var types = pageShowing.find('.ticket-types');
    types.empty();
    var tickets = main.session.showing.theater.pricing.tickets;
    for (var i = 0; i < tickets.length; i++) {
        var button = $('<button/>').click(function() {
            main.addTicket(false, $(this).html());
        });
        button.html(tickets[i].ticketType.name);
        types.append(button);
    }
    main.addTicket(true, 'Adult');
};

/**
 * Initializes the ticket search page.
 * @returns {undefined}
 */
main.searchBeforeOpen = function() {
    $('#page-ticket-search .receipt-input').val('');
    main.setButtonStatus($('#page-ticket-search .retrieve'), main.validateId, '');
    main.searchMessage();
    main.showSearchOption('none');
};

/**
 * Sums up the selected tickets and prepares a summary for the 
 * purchase page.
 * @returns {undefined}
 */
main.purchaseBeforeOpen = function() {
    var receipt = new Receipt(main.session.showing);
    main.session.receipt = receipt;

    $.each($('#page-showing .showing-tickets .ticket'), function() {
        var ticketForm = $(this);
        var ticketType = $('.ticket-type option:selected', ticketForm).val();
        if (typeof ticketType === 'undefined') {
            ticketType = $('.ticket-type', ticketForm).html();
        }
        var ticket;
        var tickets = main.session.showing.theater.pricing.tickets;
        for (var i = 0; i < tickets.length; i++) {
            if (tickets[i].ticketType.name === ticketType) {
                ticket = tickets[i];
                break;
            }
        }
        var quantity = parseInt($('.ticket-quantity', ticketForm).html());

        for (var i = 0; i < quantity; i++) {
            receipt.tickets.push(ticket);
        }
    });
    
    $('#page-purchase .tickets').replaceWith(main.createTicketSummary());
    main.showPurchaseOption('none');
};
/**
 * Called whenever a card is swiped on the purchase page.
 * @param {Event} e swipe Event
 * @param {Card} card the Card to charge
 * @returns {undefined}
 */
main.purchaseSwiper = function(e, card) {
    if (card.isValid()) {
        swiper.scanning = false;
        var amount = main.currencyToFloat($('#page-purchase .tickets-total .ticket-price').html());
        stripe.chargeCard(card, amount, function(response) {
            if (response.success) {
                main.session.receipt.paymentObject = card;
                main.session.receipt.paymentTypeInfo = 'Card Charged: xxxx-xxxx-xxxx-' + card.getLast4();

                slider.navigateTo('#page-purchase-results', slider.Direction.RIGHT, main.purchaseResultsBeforeOpen);
            }
            else {
                var message = 'There was a problem charging your card: ' + response.message;
                $('#page-purchase .purchase-option-form.card header').html(message);
                $('#page-purchase .purchase-option-form.gift header').html(message);
            }
        });
    }
    else {
        swiper.scanning = true;
        var message = 'There was a problem reading your card, please try again';
        $('#page-purchase .purchase-option-form.card header').html(message);
        $('#page-purchase .purchase-option-form.gift header').html(message);
    }
};
/**
 * Displays the "Cash" purchase option.
 * @returns {undefined}
 */
main.purchaseCash = function() {
    main.session.receipt.paymentType = 'Cash';
    swiper.scanning = false;
    main.showPurchaseOption('cash');
};
/**
 * Displays the "Card" purchase option.
 * @returns {undefined}
 */
main.purchaseCard = function() {
    main.session.receipt.paymentType = 'Credit';
    swiper.scanning = true;
    $('#page-purchase .purchase-option-form.card header').html('Please Swipe Your Credit Card');
    main.showPurchaseOption('card');
};
/**
 * Displays the "Gift" purchase option.
 * @returns {undefined}
 */
main.purchaseGift = function() {
    main.session.receipt.paymentType = 'Gift';
    swiper.scanning = true;
    $('#page-purchase .purchase-option-form.gift header').html('Please Swipe Your Gift Card');
    main.showPurchaseOption('gift');
};
/**
 * Opens a specified purchase option.
 * <p>
 * If the purchase option cannot be found, such as specifying "none", then 
 * the currently visible option will be hidden.
 * @param {string} option the purchase option to show 
 *      ("card", "cash", "gift", "none")
 * @returns {undefined}
 */
main.showPurchaseOption = function(option) {
    $.each($('#page-purchase .purchase-option-forms .purchase-option-form'), function() {
        if ($(this).hasClass(option)) {
            $(this).show(main.SECTION_ANIMATION);
        }
        else if ($(this).is(':visible')) {
            $(this).hide(main.SECTION_ANIMATION);
        }
    });
};

/**
 * Creates a ticket summary and payment information for the result of a 
 * transaction for the purchase results page.
 * @returns {undefined}
 */
main.purchaseResultsBeforeOpen = function() {
    data.saveReceipt(main.session.receipt.createStorageObject());

    $('#page-purchase-results .purchase-status').html('Purchase Successful');

    $('#page-purchase-results .tickets').replaceWith(main.createTicketSummary());

    $('#page-purchase-results .payment-type').html(main.session.receipt.paymentType);
    $('#page-purchase-results .payment-type-info').html(main.session.receipt.paymentTypeInfo);
};

/**
 * Creates the printable ticket stubs for the print tickets page.
 * @returns {undefined}
 */
main.printPreviewBeforeOpen = function() {  
    $('#page-print-tickets .tickets-container').empty();
    var receipt = main.session.receipt;
    for (var i = 0; i < receipt.tickets.length; i++) {
        main.createPrintTickets(receipt.tickets[i]);
    }
};

/**
 * Searches for a receipt with the given Card or receipt ID, and 
 * loads the print tickets page.
 * <p>
 * If the receipt could not be found, this function will kick the user back 
 * to the ticket search page with an error.
 * @param {Card|string} cardOrId the Card used to purchase tickets, or the
 *      Receipt ID
 * @returns {undefined}
 */
main.searchProcess = function(cardOrId) {
    slider.navigateTo('#page-processing', slider.Direction.RIGHT);
    if (typeof cardOrId === 'string') {
        data.getReceiptById(cardOrId, function(receiptStore) {
            if (receiptStore) {
                main.searchResults(receiptStore);
            }
            else {
                slider.navigateTo('#page-ticket-search', slider.Direction.LEFT);
                main.searchMessage('Invalid receipt ID');
            }
        });
    }
    else {
        swiper.scanning = false;
        data.getReceiptByCard(cardOrId, function(receiptStore) {
            if (receiptStore) {
                main.searchResults(receiptStore);
            }
            else {
                slider.navigateTo('#page-ticket-search', slider.Direction.LEFT);
                main.searchMessage('Invalid card, please try again');
                swiper.scanning = true;
            }
        });
    }
};
/**
 * Loads a Receipt's storage object into the print tickets page.
 * @param {Object} receiptStore the Receipt storage object to load
 * @returns {undefined}
 */
main.searchResults = function(receiptStore) {
    if (receiptStore) {
        main.session.receipt.id = receiptStore.id;
        main.session.receipt.showing.theater.name = receiptStore.theater;
        main.session.receipt.showing.movie.title = receiptStore.movie;
        main.session.receipt.showing.movie.rating = receiptStore.rating;
        main.session.receipt.showing.time = receiptStore.time;
        main.session.receipt.showing.date = receiptStore.date;
        for (var i = 0; i < receiptStore.stubs.length; i++) {
            main.session.receipt.tickets.push({
                ticketType: {
                    name: receiptStore.stubs[i].type
                },
                price: receiptStore.stubs[i].price
            });
        }
        main.printPreviewBeforeOpen();
        slider.navigateTo('#page-print-tickets', slider.Direction.RIGHT);
    }
};
/**
 * Displays an error message on the ticket search page.
 * @param {string} message the message to display, or none to hide the previous 
 *      message
 * @returns {undefined}
 */
main.searchMessage = function(message) {
    if (message) {
        $('#page-ticket-search .message').html(message).show(100);
    }
    else {
        $('#page-ticket-search .message').html('').hide(100);
    }
};
/**
 * Called when the user specifies to search by Receipt ID. 
 * <p>
 * This function will show the receipt search option and disable the 
 * card reader.
 * @returns {undefined}
 */
main.searchReceipt = function() {
    swiper.scanning = false;
    main.searchMessage();
    main.showSearchOption('receipt');
};
/**
 * Validates the format of the Receipt ID input.
 * @param {Event} e the KeyEvent
 * @returns {undefined}
 */
main.searchReceiptKeyUp = function(e) {
    var button = $('#page-ticket-search .retrieve');
    var input = $(e.target);
    var value = input.val();
    if (value.length === 2) {
        value = value + '-';
        input.val(value);
    }
    else if (value.substring(value.length - 2, value.length) === '--') {
        value = value.substr(0, value.length - 1);
        input.val(value);
    }
    
    main.setButtonStatus(button, main.validateId, value);
};
/**
 * Called when the user specifies to search by card. 
 * <p>
 * This function will show the card search option and enable the card reader.
 * @returns {undefined}
 */
main.searchCard = function() {
    swiper.scanning = true;
    swiper.setFocus($('#page-ticket-search'));
    main.searchMessage();
    main.showSearchOption('card');
};
/**
 * Opens a ticket search option.
 * <p>
 * If the search option cannot be found, such as specifying "none", then 
 * the currently visible option will be hidden.
 * @param {string} option the search option to show 
 *      ("card", "receipt","none")
 * @returns {undefined}
 */
main.showSearchOption = function(option) {
    $.each($('#page-ticket-search .search-options .option'), function() {
        if ($(this).hasClass(option)) {
            $(this).show(main.SECTION_ANIMATION);
        }
        else if ($(this).is(':visible')) {
            $(this).hide(main.SECTION_ANIMATION);
        }
    });
};


/*******************************************************************************
 * Helper Functions
 ******************************************************************************/
/**
 * Updates the app clock with the current time. This function only needs to 
 * be called once to start the clock.
 * @returns {undefined}
 */
main.updateClock = function() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var amPm = h >= 12 ? ' pm' : ' am';
    h = h % 12;
    h = h ? h : 12;
    m = m < 10 ? '0' + m : m;
    $('.clock-hours').html(h);
    $('.clock-minutes').html(m);
    $('.clock-ampm').html(amPm);
    
    setTimeout(main.updateClock, 30000);
};
/**
 * Validates the provided receipt ID (XX-XXX).
 * @param {string} id the Receipt ID to validate
 * @returns {boolean} true if the ID is valid, or false if it is not
 */
main.validateId = function(id) {
    var regex = /^\d{2}-\d{3}$/;
    return regex.test(id);
};
/**
 * Enables or disables the provided button based on the result of passing 
 * the provided validation String to the provided validation function.
 * <p>
 * If the function returns true, the button is enabled, otherwise it is 
 * disabled.
 * @param {jQuery|string} button the button to enable or disable
 * @param {function(string)} validateFunction the function used to validate 
 *      the provided String
 * @param {string} validateString the String to validate
 * @returns {undefined}
 */
main.setButtonStatus = function(button, validateFunction, validateString) {
    var isValid = validateFunction(validateString);
    if(isValid) {
        $(button).removeAttr('disabled');
    }
    else {
        $(button).attr('disabled', 'disabled');
    }
};
/**
 * Converts a Number value into a currency formatted String.
 * @param {number} value the value to format
 * @returns {string} value formatted as a currency String
 */
main.formatCurrency = function(value, hideSign) {
    if(hideSign) {
        return parseFloat(value, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
    }
    return '$' + parseFloat(value, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
};
/**
 * Converts a currency String into a Number
 * @param {string} value the currency String to convert to a Number
 * @returns {number} the value as a Number
 */
main.currencyToFloat = function(value) {
    return parseFloat(value.substr(1));
};