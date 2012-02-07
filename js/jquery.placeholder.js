(function(jQuery) {
	jQuery.extend({
		placeholder : {
			settings : {
				focusClass: 'placeholderFocus',
				activeClass: 'placeholder',
				overrideSupport: false,
				preventRefreshIssues: true
			},
			debug : false,
			log : function(msg){
				if(!jQuery.placeholder.debug) return;
				msg = "[Placeholder] " + msg;
				jQuery.placeholder.hasFirebug ?
				console.log(msg) :
				jQuery.placeholder.hasConsoleLog ?
					window.console.log(msg) :
					alert(msg);
			},
			hasFirebug : "console" in window && "firebug" in window.console,
			hasConsoleLog: "console" in window && "log" in window.console
		}

	});

    // check browser support for placeholder
    jQuery.support.placeholder = 'placeholder' in document.createElement('input');

	// Replace the val function to never return placeholders
	jQuery.fn.plVal = jQuery.fn.val;
	jQuery.fn.val = function(value) {
		jQuery.placeholder.log('in val');
		if(this[0]) {
			jQuery.placeholder.log('have found an element');
			var el = jQuery(this[0]);
			if(value != undefined)
			{
				jQuery.placeholder.log('in setter');
				var currentValue = el.plVal();
				var returnValue = jQuery(this).plVal(value);
				if(el.hasClass(jQuery.placeholder.settings.activeClass) && currentValue == el.attr('placeholder')){
					el.removeClass(jQuery.placeholder.settings.activeClass);
				}
				return returnValue;
			}

			if(el.hasClass(jQuery.placeholder.settings.activeClass) && el.plVal() == el.attr('placeholder')) {
				jQuery.placeholder.log('returning empty because its a placeholder');
				return '';
			} else {
				jQuery.placeholder.log('returning original val');
				return el.plVal();
			}
		}
		jQuery.placeholder.log('returning undefined');
		return undefined;
	};

	// Clear placeholder values upon page reload
	jQuery(window).bind('beforeunload.placeholder', function() {
		var els = jQuery('input.placeholderActive' );
		if(els.length > 0)
			els.val('').attr('autocomplete','off');
	});


    // plugin code
	jQuery.fn.placeholder = function(opts) {
		opts = jQuery.extend({},jQuery.placeholder.settings, opts);

		// we don't have to do anything if the browser supports placeholder
		if(!opts.overrideSupport && jQuery.support.placeholder)
		    return this;
			
        return this.each(function() {
            var $el = jQuery(this);

            // skip if we do not have the placeholder attribute
            if(!$el.is('[placeholder]'))
                return;

            // we cannot do password fields, but supported browsers can
            if($el.is(':password'))
                return;
			
			// Prevent values from being reapplied on refresh
			if(opts.preventRefreshIssues)
				$el.attr('autocomplete','off');

            $el.bind('focus.placeholder', function(){
                var $el = jQuery(this);
                if(this.value == $el.attr('placeholder') && $el.hasClass(opts.activeClass))
                    $el.val('')
                       .removeClass(opts.activeClass)
                       .addClass(opts.focusClass);
            });
            $el.bind('blur.placeholder', function(){
                var $el = jQuery(this);
				
				$el.removeClass(opts.focusClass);

                if(this.value == '')
                  $el.val($el.attr('placeholder'))
                     .addClass(opts.activeClass);
            });

            $el.triggerHandler('blur');
			
			// Prevent incorrect form values being posted
			$el.parents('form').submit(function(){
				$el.triggerHandler('focus.placeholder');
			});

        });
    };
})(jQuery);
