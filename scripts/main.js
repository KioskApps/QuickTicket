//Global Vars
var SECTION_ANIMATION = 200;

var CurrentSession;

$(document).ready(Init);

function Init() {
    CurrentSession = new Session();
    AddListeners();
    InitSlider();
    FormatPages();
    UpdateClock();
    slider.navigateTo('#page-processing', slider.Direction.LEFT);
    data.initializeData(function() {
        ReturnMainMenu_ClickHandler();
    });
}
function InitSlider() {
    slider.processing = '#page-processing';
    slider.storage = '#pages';
    slider.navigateTo = function(page, direction, beforeOpen, param) {
        slider.slide('#slide-container', page, direction, beforeOpen, param);
    };
}
function FormatPages() {
    //This is causing the footer buttons to be cut off
    //var slideContainerHeight = $('body').outerHeight() - $('body>header').outerHeight();
    //$('#slide-container').height(slideContainerHeight);
    $('.cinema-name').html(data.CINEMA_NAME);
}
function UpdateClock() {
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
    
    setTimeout(UpdateClock, 30000);
}


function AddTicket(clearExisting) {
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
    
    var ticketsDisplayed = tickets.length;
    var ticket = $('<div/>').addClass('ticket').css('display', 'none').attr('data-id', ticketID);
    ticket.append($('<span/>').addClass('showing-time').html(CurrentSession.showing.time));
    ticket.append($('<span/>').addClass('showing-type').html(CurrentSession.showing.theater.pricing.name));
    ticket.append($('<select/>').addClass('ticket-type'));
    ticket.append($('<span/>').addClass('ticket-price'));
    ticket.append($('<span/>').addClass('ticket-multiplier').html('x'));
    ticket.append($('<span/>').addClass('ticket-quantity').html('1'));
    ticket.append($('<button/>').addClass('ticket-quantity-decrease').html('-').click(Showing_TicketQuantityDecrease_ClickHandler));
    ticket.append($('<button/>').addClass('ticket-quantity-increase').html('+').click(Showing_TicketQuantityIncrease_ClickHandler));
    ticket.append($('<span/>').addClass('ticket-total'));
    ticket.append($('<button/>').addClass('delete-ticket').css('visibility', 'hidden').html('X'));
    
    $('#page-showing .showing-tickets').append(ticket);
    
    if(ticketsDisplayed > 0) {
        var deleteButton = $('#page-showing .ticket[data-id="' + ticketID + '"] .delete-ticket');
        deleteButton.css('visibility', 'visible');
        deleteButton.click(Showing_DeleteTickets_ClickHandler);
    }
    $('#page-showing .ticket-type').each(function() {
        var showingTicketType = $(this);
        if (showingTicketType.children().length === 0) {
            var tickets = CurrentSession.showing.theater.pricing.tickets;
            for (var i = 0; i < tickets.length; i++) {
                var ticketTypeString = '<option value="' + tickets[i].ticketType.name + '">' + tickets[i].ticketType.name + '</option>';
                showingTicketType.append(ticketTypeString);
            }
        }
    });
    
    $('#page-showing .ticket[data-id="' + ticketID + '"] .ticket-type').change(Showing_TicketType_ChangeHandler);
    
    UpdateTickets();
    
    $('#page-showing .ticket[data-id="' + ticketID + '"]').show(SECTION_ANIMATION);
}
function RemoveTicket(ticketID) {
    $('#page-showing .showing-tickets .ticket[data-id="' + ticketID + '"]').hide(SECTION_ANIMATION, function(){
        $(this).remove();
        UpdateTickets();
    });
}
function ModifyTicketQuantity(ticketID, increase) {
    var ticketQuantity = $('#page-showing .showing-tickets .ticket[data-id="' + ticketID + '"] .ticket-quantity');
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
    UpdateTickets();
}
function UpdateTickets() {
    var totalPrice = 0;
    $.each($('#page-showing .ticket'), function() {
       var ticket = $(this);
       var ticketType = $('.ticket-type option:selected', ticket).val();
       var tickets = CurrentSession.showing.theater.pricing.tickets;
       var price = 0.00;
       for (var i = 0; i < tickets.length; i++) {
           if (tickets[i].ticketType.name === ticketType) {
               price = tickets[i].price;
               break;
           }
       }

       var priceElement = $('.ticket-price', ticket);
       priceElement.html(FormatCurrency(price));

       var ticketQuantity = parseInt($('.ticket-quantity', ticket).html());

       var ticketTotal = price * ticketQuantity;
       $('.ticket-total', ticket).html(FormatCurrency(ticketTotal));

       totalPrice += ticketTotal;
    });
    $('#page-showing .tickets-grand-total').html(FormatCurrency(totalPrice, true));
}
function CreateTicketSummary() {
    var summary = $('<div/>').addClass('tickets');
    var ticketTotal = 0;
    var ticketQuantities = CurrentSession.receipt.getTicketsWithQuantity();
    for (var i = 0; i < ticketQuantities.length; i++) {
        CreateTicketDiv(ticketQuantities[i]).appendTo(summary);
        ticketTotal += (ticketQuantities[i].price * ticketQuantities[i].quantity);
    }
    CreateTicketTotalDiv('----------').addClass('tickets-total-line').appendTo(summary);
    CreateTicketTotalDiv(FormatCurrency(ticketTotal)).addClass('tickets-total').appendTo(summary);
    return summary;
}
function CreateTicketDiv(ticket) {
    var quantity = typeof ticket.quantity === 'undefined' ? 1 : ticket.quantity;
    return $('<div/>').addClass('ticket')
                .append($('<span/>').addClass('ticket-movie-title').html(CurrentSession.showing.movie.title))
                .append($('<span/>').addClass('ticket-time').html(CurrentSession.showing.time))
                .append($('<span/>').addClass('ticket-type').html(ticket.ticketType.name))
                .append($('<span/>').addClass('ticket-price').html(FormatCurrency(ticket.price)))
                .append($('<span/>').addClass('ticket-multiplier').html('x'))
                .append($('<span/>').addClass('ticket-quantity').html(quantity));
}
function CreateTicketTotalDiv(priceHtml) {
    var totalTitle = '';
    if(priceHtml.indexOf('$') > -1)
    {
        totalTitle = '<strong>Total</strong>'
    }
    return $('<div/>').addClass('ticket')
                .append($('<span/>').addClass('ticket-movie-title').css('visibility', 'hidden').html(CurrentSession.showing.movie.title))
                .append($('<span/>').addClass('ticket-time').html(''))
                .append($('<span/>').addClass('ticket-type').html(totalTitle))
                .append($('<span/>').addClass('ticket-price').html(priceHtml))
                .append($('<span/>').addClass('ticket-multiplier').html(''))
                .append($('<span/>').addClass('ticket-quantity').html(''));
}
function CreatePrintTickets(ticket) {
    var quantity = typeof ticket.quantity === 'undefined' ? 1 : ticket.quantity;
    var todaysDate = new Date();
    
    var ticketHTML = ['<div class="ticket">',
                            '<div class="main">',
                                '<header><img src="images/ioCinemaIcon.png" /><span class="header-title">I/0 Cinema 10</span></header>',
                                '<div class="ticket-content">',
                                    '<div class="theater"><span class="title">Theater:</span><span class="theater-name">' + CurrentSession.showing.theater.name + '</span></div>',
                                    '<div class="movie"><span class="ticket-movie-title title">' + CurrentSession.showing.movie.title + '</span></div>',
                                    '<div class="rating"><span class="title">Rating:</span><span class="ticket-rating">' + CurrentSession.showing.movie.rating + '</span></div>',
                                    '<div class="time"><span class="title">Showing:</span><span class="ticket-time">' + CurrentSession.showing.time + '</span></div>',
                                    '<div class="date"><span class="admission-date title">' + CurrentSession.showing.date + '</span></div>',
                                    '<div class="admission-data">',
                                        '<div class="admission-data-item admission"><span class="title">Admit:</span>1 <span class="ticket-type">' + ticket.ticketType.name + '</span></div>',
                                        '<div class="admission-data-item price"><span class="title">Price:</span><span class="ticket-price">' + FormatCurrency(ticket.price) + '</span></div>',
                                    '</div>',
                                    '<div class="cinema-data">',
                                        '<div class="cinema-data-item id"><span class="title">ID:</span><span class="ticket-id">' + CurrentSession.receipt.id + '</span></div>',
                                        '<div class="cinema-data-item issue"><span class="title">Issued:</span><span class="ticket-issue-data">' + todaysDate.getHours() + ':' + todaysDate.getMinutes() + ":" + todaysDate.getSeconds() + ' ' + todaysDate.getMonth()+1 + '/' + todaysDate.getDate() + '/' + todaysDate.getFullYear() + '</span></div>',
                                        '<div class="cinema-data-item issuer"><span class="title">By:</span><span class="ticket-issuer">Kiosk</span></div>',
                                    '</div>',
                                '</div>',
                            '</div>',
                            '<div class="stub">',
                                '<header></header>',
                                '<div class="ticket-content">',
                                    '<div class="theater"><span class="title">Theater:</span><span class="theater-name">' + CurrentSession.showing.theater.name + '</span></div>',
                                    '<div class="date"><span class="admission-date title">' + CurrentSession.showing.date + '</span></div>',
                                    '<div class="time"><span class="title">Showing:</span><span class="ticket-time">' + CurrentSession.showing.time + '</span></div>',
                                    '<div class="movie"><span class="ticket-movie-title title">' + CurrentSession.showing.movie.title + '</span></div>',
                                    '<div class="admission">1 <span class="ticket-type">' + ticket.ticketType.name + '</span></div>',
                                    '<div class="cinema-data">',
                                        '<div class="cinema-data-item id"><span class="title">ID:</span><span class="ticket-id">' + CurrentSession.receipt.id + '</span></div>',
                                        '<div class="cinema-data-item issue"><span class="title">Issued:</span><span class="ticket-issue-data">' + todaysDate.getHours() + ':' + todaysDate.getMinutes() + ":" + todaysDate.getSeconds() + ' ' + todaysDate.getMonth()+1 + '/' + todaysDate.getDate() + '/' + todaysDate.getFullYear() + '</span></div>',
                                        '<div class="cinema-data-item issuer"><span class="title">By:</span><span class="ticket-issuer">Kiosk</span></div>',
                                    '</div>',
                                '</div>',
                            '</div>',
                      '</div>'];
    var ticketHTMLString = ticketHTML.join('');
    
    $('#page-print-tickets .tickets-container').append(ticketHTMLString);
    
    
//    
//    return $('<div/>').addClass('ticket')
//                .append($('<span/>').addClass('ticket-movie-title').html(CurrentSession.showing.movie.title))
//                .append($('<span/>').addClass('ticket-time').html(CurrentSession.showing.time))
//                .append($('<span/>').addClass('ticket-type').html(ticket.ticketType.name))
//                .append($('<span/>').addClass('ticket-price').html(FormatCurrency(ticket.price)))
//                .append($('<span/>').addClass('ticket-multiplier').html('x'))
//                .append($('<span/>').addClass('ticket-quantity').html(quantity));
}
function ShowPurchaseOption(option) {
    $.each($('#page-purchase .purchase-option-forms .purchase-option-form'), function() {
        if ($(this).hasClass(option)) {
            $(this).show(SECTION_ANIMATION);
        }
        else if ($(this).is(':visible')) {
            $(this).hide(SECTION_ANIMATION);
        }
    });
}
function ShowSearchOption(option) {
    $.each($('#page-ticket-search .search-options .option'), function() {
        if ($(this).hasClass(option)) {
            $(this).show(SECTION_ANIMATION);
        }
        else if ($(this).is(':visible')) {
            $(this).hide(SECTION_ANIMATION);
        }
    });
}

function PrintHTML(html) {
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
}


/*******************************************************************************
 * Prerequisite Functions (Must be called before page loads)
 ******************************************************************************/
function Prerequisite_Movies() {
    $('#page-movies .movies-carousel').empty();
    for (var i = 0; i < data.movies.length; i++) {
        $('#page-movies .movies-carousel').append(data.movies[i].getCarouselDiv());
    }

    //add listeners to view movie show times
    $('#page-movies .movie').unbind('click').click(Movies_ViewShowTimes_ClickHandler);
}
function Prerequisite_Movie(movie) {
    movie.setMovieData($('#page-movie'));

    $('#page-movie .showings').empty();
    var movieShowings = data.getShowingsByMovie(movie);
    for (var i = 0; i < movieShowings.length; i++) {
        var button = movieShowings[i].getShowingButton();
        button.click(Movie_MovieShowing_ClickHandler);
        $('#page-movie .showings').append(button);
    }
}
function Prerequisite_Showing() {
    var pageShowing = $('#page-showing');
    CurrentSession.showing.movie.setMovieData(pageShowing);
    CurrentSession.showing.setShowingData(pageShowing);
    CurrentSession.showing.theater.setTheaterData(pageShowing);

    AddTicket(true);
}
function Prerequisite_Purchase() {
    var receipt = new Receipt(CurrentSession.showing);
    CurrentSession.receipt = receipt;

    $.each($('#page-showing .showing-tickets .ticket'), function() {
        var ticketForm = $(this);
        var ticketType = $('.ticket-type option:selected', ticketForm).val();
        var ticket;
        var tickets = CurrentSession.showing.theater.pricing.tickets;
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

    $('#page-purchase .tickets').replaceWith(CreateTicketSummary());
    ShowPurchaseOption('none');
}
function Prerequisite_Purchase_Results() {
    //Assume successful transaction
    data.saveReceipt(CurrentSession.receipt.createStorageObject());

    $('#page-purchase-results .purchase-status').html('Purchase Successful');

    $('#page-purchase-results .tickets').replaceWith(CreateTicketSummary());

    $('#page-purchase-results .payment-type').html(CurrentSession.receipt.paymentType);
    $('#page-purchase-results .payment-type-info').html(CurrentSession.receipt.paymentTypeInfo);
}
function Prerequisite_Print_Tickets() {  
    $('#page-print-tickets .tickets-container').empty();
    var receipt = CurrentSession.receipt;
    for (var i = 0; i < receipt.tickets.length; i++)
    {
        CreatePrintTickets(receipt.tickets[i]);
        //.appendTo($('#page-print-tickets .tickets-container'));
    }
}
function Prerequisite_Printing() {
    PrintHTML($('#page-print-tickets .tickets-container').html());
}
function Prerequisite_Search() {
    $('#page-ticket-search .receipt-input').val('');
    SetButtonStatus($('#page-ticket-search .retrieve'), ValidateConfirmationCodeFormat, '');
    TicketSearch_Message();
    ShowSearchOption('none');
}


/*******************************************************************************
 * Misc Helper Functions 
 ******************************************************************************/
function ValidateConfirmationCodeFormat(validationString)
{
    var regex = /^\d{2}-\d{3}$/;
    return regex.test(validationString);
}
function FormatCurrency(value, hideSign)
{
    if(hideSign == true)
    {
        return parseFloat(value, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
    }
    
    return '$' + parseFloat(value, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
}
function FormatDecimalFromCurrency(value)
{
    return parseFloat(value.substr(1));
}
function SetButtonStatus(button, validationFunction, validationString)
{
    var isValid = validationFunction(validationString);
    if(isValid)
    {
        button.removeAttr('disabled');
    }
    else
    {
        button.attr('disabled', 'disabled');
    }
}

/*******************************************************************************
 * Listeners and Event Handlers
 ******************************************************************************/
function AddListeners()
{
    $('#page-initial .purchase-tickets').click(Initial_PurchaseTickets_ClickHandler);
    $('#page-initial .print-tickets').click(Initial_PrintTickets_ClickHandler);
    $('#page-movie').on(slider.Event.AFTER_CLOSE, Movie_AfterCloseHandler);
    $('#page-showing .purchase-tickets').click(Showing_PurchaseTickets_ClickHandler);
    $('#page-showing .add-tickets').click(Showing_AddTickets_ClickHandler);
    $('#page-purchase .payment-method-option.cash').click(Purchase_Cash_ClickHandler);
    $('#page-purchase .payment-method-option.card').click(Purchase_Card_ClickHandler);
    $('#page-purchase .payment-method-option.gift').click(Purchase_Gift_ClickHandler);
    $('#page-purchase').on(swiper.EVENT, Purchase_CardSwiped);
    swiper.addTrigger($('#page-purchase'));
    $('#page-purchase-results .print-tickets').click(PurchaseResults_PrintTickets_ClickHandler);
    
    $('#page-ticket-search').on(slider.Event.AFTER_CLOSE, TicketSearch_AfterClose);
    $('#page-ticket-search').on(swiper.EVENT, TicketSearch_Swiped);
    $('#page-ticket-search .receipt-button').click(TicketSearch_ReceiptOption);
    $('#page-ticket-search .card-button').click(TicketSearch_CardOption);
    $('#page-ticket-search .receipt-input').keyup(TicketSearch_Receipt_KeyUpHandler);
    $('#page-ticket-search .retrieve').click(TicketSearch_Retrieve_ClickHandler);
    
    $('#page-print-tickets .print-tickets').click(PrintTickets_PrintTickets_ClickHandler);
    
    $('#page-print-results').on(slider.Event.AFTER_OPEN, PrintResults_AfterOpen);
    
    $('.return-main-menu').unbind('click').click(ReturnMainMenu_ClickHandler);
    $('.return-movies').unbind('click').click(ReturnMovies_ClickHandler);
    $('.return-movie').unbind('click').click(ReturnMovie_ClickHandler);
    $('.return-showing').unbind('click').click(ReturnShowing_ClickHandler);
}

//Event Handlers
function Initial_PurchaseTickets_ClickHandler(e)
{
    slider.navigateTo('#page-movies', slider.Direction.RIGHT, Prerequisite_Movies);
    $('body > header').css('visibility', 'visible');
}
function Initial_PrintTickets_ClickHandler(e)
{
    slider.navigateTo('#page-ticket-search', slider.Direction.RIGHT, Prerequisite_Search);
    $('body > header').css('visibility', 'visible');
}
function Movies_ViewShowTimes_ClickHandler(e)
{
    var movieID = $(e.target).closest('.movie').attr('data-id');
    slider.navigateTo('#page-movie', slider.Direction.RIGHT, Prerequisite_Movie, data.getMovieByID(movieID));
}
function Movie_MovieShowing_ClickHandler(e)
{
    var showingID = $(e.target).closest('.showing').attr('data-id');
    CurrentSession.showing = data.getShowingByID(showingID);
    slider.navigateTo('#page-showing', slider.Direction.RIGHT, Prerequisite_Showing);
}
function Movie_AfterCloseHandler(e)
{
    $(this).removeData('movie');
}
function Showing_AddTickets_ClickHandler(e)
{
    AddTicket();
}
function Showing_DeleteTickets_ClickHandler(e)
{
    var ticketID = $(this).closest('.ticket').attr('data-id');
    RemoveTicket(ticketID);
}
function Showing_TicketType_ChangeHandler(e)
{
    UpdateTickets();
}
function Showing_TicketQuantityIncrease_ClickHandler(e) 
{
    var ticketID = $(e.target).closest('.ticket').attr('data-id');
    ModifyTicketQuantity(ticketID, true);
}
function Showing_TicketQuantityDecrease_ClickHandler(e) 
{
    var ticketID = $(e.target).closest('.ticket').attr('data-id');
    ModifyTicketQuantity(ticketID, false);
}
function Showing_PurchaseTickets_ClickHandler(e)
{
    slider.navigateTo('#page-purchase', slider.Direction.RIGHT, Prerequisite_Purchase);
}
function Purchase_Cash_ClickHandler(e) 
{
    CurrentSession.receipt.paymentType = 'Cash';
    swiper.scanning = false;
    ShowPurchaseOption('cash');
}
function Purchase_Card_ClickHandler(e) 
{
    CurrentSession.receipt.paymentType = 'Credit';
    swiper.scanning = true;
    $('#page-purchase .purchase-option-form.card header').html('Please Swipe Your Credit Card');
    ShowPurchaseOption('card');
}
function Purchase_Gift_ClickHandler(e) 
{
    CurrentSession.receipt.paymentType = 'Gift';
    swiper.scanning = true;
    $('#page-purchase .purchase-option-form.gift header').html('Please Swipe Your Gift Card');
    ShowPurchaseOption('gift');
}
function Purchase_CashPurchase_ClickHandler(e)
{
    //Payment verification logic
    CurrentSession.receipt.paymentType = 'Cash';
    CurrentSession.receipt.paymentTypeInfo = 'Change Due: $0.00';
    slider.navigateTo('#page-purchase-results', slider.Direction.RIGHT, Prerequisite_Purchase_Results);
}
function Purchase_CardSwiped(e, card) 
{
    if (card.isValid()) {
        swiper.scanning = false;
        var amount = FormatDecimalFromCurrency($('#page-purchase .tickets-total .ticket-price').html());
        stripe.chargeCard(card, amount, function(response) {
            if (response.success) {
                CurrentSession.receipt.paymentObject = card;
                CurrentSession.receipt.paymentTypeInfo = 'Card Charged: xxxx-xxxx-xxxx-' + card.getLast4();

                slider.navigateTo('#page-purchase-results', slider.Direction.RIGHT, Prerequisite_Purchase_Results);
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
}
function PurchaseResults_PrintTickets_ClickHandler(e)
{
    slider.navigateTo('#page-print-tickets', slider.Direction.RIGHT, Prerequisite_Print_Tickets);
}
function TicketSearch_AfterClose(e) {
    swiper.scanning = false;    
    swiper.removeFocus();
}
function TicketSearch_ReceiptOption(e) {
    swiper.scanning = false;
    TicketSearch_Message();
    ShowSearchOption('receipt');
}
function TicketSearch_CardOption(e) {
    swiper.scanning = true;
    swiper.setFocus($('#page-ticket-search'));
    TicketSearch_Message();
    ShowSearchOption('card');
}
function TicketSearch_Receipt_KeyUpHandler(e)
{
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
    
    SetButtonStatus(button, ValidateConfirmationCodeFormat, value);
}
function TicketSearch_Retrieve_ClickHandler(e)
{
    var receiptId = $('#page-ticket-search .receipt-input').val();
    TicketSearch_Process(receiptId);
}
function TicketSearch_Swiped(e, card) 
{
    TicketSearch_Process(card);
}
function TicketSearch_Process(cardOrId) {
    slider.navigateTo('#page-processing', slider.Direction.RIGHT);
    if (typeof cardOrId === 'string') {
        data.getReceiptById(cardOrId, function(receiptStore) {
            if (receiptStore) {
                TicketSearch_Results(receiptStore);
            }
            else {
                slider.navigateTo('#page-ticket-search', slider.Direction.LEFT);
                TicketSearch_Message('Invalid receipt ID');
            }
        });
    }
    else {
        swiper.scanning = false;
        data.getReceiptByCard(cardOrId, function(receiptStore) {
            if (receiptStore) {
                TicketSearch_Results(receiptStore);
            }
            else {
                slider.navigateTo('#page-ticket-search', slider.Direction.LEFT);
                TicketSearch_Message('Invalid card, please try again');
                swiper.scanning = true;
            }
        });
    }
}
function TicketSearch_Results(receiptStore) 
{
    if (receiptStore) {
        CurrentSession.receipt.id = receiptStore.id;
        CurrentSession.receipt.showing.theater.name = receiptStore.theater;
        CurrentSession.receipt.showing.movie.title = receiptStore.movie;
        CurrentSession.receipt.showing.movie.rating = receiptStore.rating;
        CurrentSession.receipt.showing.time = receiptStore.time;
        CurrentSession.receipt.showing.date = receiptStore.date;
        for (var i = 0; i < receiptStore.stubs.length; i++) {
            CurrentSession.receipt.tickets.push({
                ticketType: {
                    name: receiptStore.stubs[i].type
                },
                price: receiptStore.stubs[i].price
            });
        }
        Prerequisite_Print_Tickets();
        slider.navigateTo('#page-print-tickets', slider.Direction.RIGHT);
    }
}
function TicketSearch_Message(message) {
    if (message) {
        $('#page-ticket-search .message').html(message).show(100);
    }
    else {
        $('#page-ticket-search .message').html('').hide(100);
    }
}
function PrintTickets_PrintTickets_ClickHandler(e)
{
    slider.navigateTo('#page-print-results', slider.Direction.RIGHT, Prerequisite_Printing);
}
function PrintResults_AfterOpen(e) 
{
    setTimeout(ReturnMainMenu_ClickHandler, 5000);
}

function ReturnMainMenu_ClickHandler(e)
{
    CurrentSession = new Session();
    
    //get new hero image
    var randomNumber = Math.floor(Math.random() * 12) + 1;
    var imageNumber = '001';
    if(randomNumber >= 10)
    {
        imageNumber = '0' + randomNumber.toString();
    }
    else
    {
        imageNumber = '00' + randomNumber.toString();
    }

    var imageName = imageNumber + '.png';
    $('#page-initial .hero-image').attr('src', 'images/hero-images/' + imageName);
    
    slider.navigateTo('#page-initial', slider.Direction.LEFT);
}
function ReturnMovies_ClickHandler(e)
{
    slider.navigateTo('#page-movies', slider.Direction.LEFT, Prerequisite_Movies);
}
function ReturnMovie_ClickHandler(e)
{
    slider.navigateTo('#page-movie', slider.Direction.LEFT);
}
function ReturnShowing_ClickHandler(e)
{
    slider.navigateTo('#page-showing', slider.Direction.LEFT);
}