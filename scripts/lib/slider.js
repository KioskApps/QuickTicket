(function(window, $) {
    //Slider Scope
    var slider = {};
    window.slider = slider;
    
    slider.Event = {
        BEFORE_OPEN: 'before-open',
        AFTER_OPEN: 'after-open',
        BEFORE_CLOSE: 'before-close',
        AFTER_CLOSE: 'after-close'
    };
    slider.Direction = {
        LEFT: 'left',
        RIGHT: 'right'
    };
    slider.duration = 350;
    slider.processing;
    slider.storage;
    
    var $process;
    
    slider.slide = function(slideContainer, page, direction, beforeOpen, param) {
        if (typeof beforeOpen === 'function' && slider.processing) {
            if (!$process) {
                $process = $(slider.processing);
            }
            
            var processSlide = $('<div/>').addClass('slide').append($process);
            processSlide.on(slider.Event.AFTER_OPEN, function(e) {
                e.stopPropagation();
                var targetSlide = $('<div/>').addClass('slide').append($(page));
                targetSlide.on(slider.Event.BEFORE_OPEN, function() {
                    beforeOpen(param);
                });
                open(slideContainer, targetSlide, direction);
            });
            open(slideContainer, processSlide, direction);
        }
        else {
            if (typeof beforeOpen === 'function') {
                beforeOpen(param);
            }
            var targetSlide = $('<div/>').addClass('slide').append($(page));
            open(slideContainer, targetSlide, direction);
        }
    };

    var open = function(slideContainer, target, direction) {
        direction = direction === slider.Direction.LEFT ? slider.Direction.LEFT : slider.Direction.RIGHT;
        var $slider = $(slideContainer);
        
        var center = $slider.find('.slide.center');
        center.children().trigger(slider.Event.BEFORE_CLOSE);
        center.animate({
            left: direction === slider.Direction.LEFT ? '100%' : '-100%'
        }, slider.duration, function() {
            center.children().trigger(slider.Event.AFTER_CLOSE);
            if (slider.storage) {
                center.children().appendTo(slider.storage);
            }
            center.detach();
        });

        target = $(target);
        target.addClass(direction).appendTo($slider);
        target.children().trigger(slider.Event.BEFORE_OPEN);
        target.animate({
            left: 0
        }, slider.duration, function() {
            target.removeClass(direction).addClass('center');
            target.children().trigger(slider.Event.AFTER_OPEN);
        });    
    };
})(window, jQuery);