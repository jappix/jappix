/*

Jappix - An open social platform
These are the homepage JS scripts for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, LinkMauve

*/

// Bundle
var Home = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Apply change events
     * @private
     * @param {object} current_sel
     * @param {string} div
     * @return {undefined}
     */
    self._eventsChange = function(current_sel, div) {

        try {
            // Create the attached events
            switch(div) {
                // Login tool
                case 'loginer':
                    current_sel.find('a.to-anonymous').click(function() {
                        return self.change('anonymouser');
                    });

                    current_sel.find('a.advanced').click(self.showAdvanced);
                    current_sel.find('form').submit(self.loginForm);

                    break;

                // Anonymous login tool
                case 'anonymouser':
                    current_sel.find('a.to-home').click(function() {
                        return self.change('loginer');
                    });

                    current_sel.find('form').submit(Connection.doAnonymous);

                    // Keyup event on anonymous join's room input
                    current_sel.find('input.room').keyup(function() {
                        var value = $(this).val();
                        var report_sel = current_sel.find('.report');
                        var span_sel = current_sel.find('span');

                        if(!value) {
                            report_sel.hide();
                            span_sel.text('');
                        } else {
                            report_sel.show();
                            span_sel.text(JAPPIX_LOCATION + '?r=' + value);
                        }
                    });

                    break;

                // Register tool
                case 'registerer':
                    // Server input change
                    $('#home input.server').keyup(function(e) {
                        if($.trim($(this).val()) == HOST_MAIN) {
                            $('#home .captcha_grp').show();
                            $('#home input.captcha').removeAttr('disabled');
                        } else {
                            $('#home .captcha_grp').hide();
                            $('#home input.captcha').attr('disabled', true);
                        }
                    });

                    // Register input placeholder
                    // FIXME: breaks IE compatibility
                    //$('#home input[placeholder]').placeholder();

                    // Register form submit
                    current_sel.find('form').submit(self.registerForm);

                    break;
            }
        } catch(e) {
            Console.error('Home._eventsChange', e);
        }

    };


    /**
     * Create obsolete form
     * @private
     * @param {string} home
     * @param {string} locale
     * @return {undefined}
     */
    self._obsolete = function(home, locale) {

        try {
            // Add the code
            $(locale).after(
                '<div class="obsolete">' +
                    '<p>' + Common._e("Your browser is out of date!") + '</p>' +

                    '<a class="firefox browsers-images" title="' + Common.printf(Common._e("Last %s version is better!"), 'Mozilla Firefox') + '" href="http://www.mozilla.com/firefox/"></a>' +
                    '<a class="chrome browsers-images" title="' + Common.printf(Common._e("Last %s version is better!"), 'Google Chrome') + '" href="http://www.google.com/chrome"></a>' +
                    '<a class="safari browsers-images" title="' + Common.printf(Common._e("Last %s version is better!"), 'Safari') + '" href="http://www.apple.com/safari/"></a>' +
                    '<a class="opera browsers-images" title="' + Common.printf(Common._e("Last %s version is better!"), 'Opera') + '" href="http://www.opera.com/"></a>' +
                    '<a class="ie browsers-images" title="' + Common.printf(Common._e("Last %s version is better!"), 'Internet Explorer') + '" href="http://www.microsoft.com/hk/windows/internet-explorer/"></a>' +
                '</div>'
            );

            // Display it later
            $(home + '.obsolete').oneTime('1s', function() {
                $(this).slideDown();
            });

            Console.warn('Jappix does not support this browser!');
        } catch(e) {
            Console.error('Home._obsolete', e);
        }

    };


    /**
     * Allows the user to switch the difference home page elements
     * @public
     * @param {string} div
     * @return {boolean}
     */
    self.change = function(div) {

        try {
            // Path to
            var home = '#home .';
            var right = home + 'right ';
            var current = right + '.homediv.' + div;

            // We switch the div
            $(right + '.homediv, ' + right + '.top').hide();
            $(right + '.' + div).show();

            // We reset the homedivs
            $(home + 'homediv:not(.default), ' + home + 'top:not(.default)').remove();

            // Get the HTML code to display
            var disable_form = '';
            var lock_host = '';
            var code = '';

            // Apply the previous link
            switch(div) {
                case 'loginer':
                case 'anonymouser':
                case 'registerer':
                    if(!Common.exists(right + '.top.sub')) {
                        // Append the HTML code for previous link
                        $(right + '.top.default').after('<h1 class="top sub loginer anonymouser registerer">&laquo; <a href="#" class="previous">' + Common._e("Previous") + '</a></h1>');

                        // Click event on previous link
                        $(home + 'top.sub a.previous').click(function() {
                            return self.change('default');
                        });
                    }

                break;
            }

            // Apply the form
            switch(div) {
                // Login tool
                case 'loginer':
                    lock_host = Utils.disableInput(LOCK_HOST, 'on');
                    code = '<p>' + Common.printf(Common._e("Login to your existing XMPP account. You can also use the %s to join a groupchat."), '<a href="#" class="to-anonymous">' + Common._e("anonymous mode") + '</a>') + '</p>' +

                        '<form action="#" method="post">' +
                            '<fieldset>' +
                                '<legend>' + Common._e("Required") + '</legend>' +

                                '<label for="lnick">' + Common._e("Address") + '</label>' +
                                '<input type="text" class="nick" id="lnick" pattern="[^@/]+" required="" /><span class="jid">@</span><input type="text" class="server" id="lserver" value="' + HOST_MAIN + '" ' + lock_host + ' pattern="[^@/]+" required="" list="server" />' +
                                '<label for="lpassword">' + Common._e("Password") + '</label>' +
                                '<input type="password" class="password" id="lpassword" required="" />' +
                                '<label for="lremember">' + Common._e("Remember me") + '</label>' +
                                '<input type="checkbox" class="remember" id="lremember" />' +
                            '</fieldset>' +

                            '<a href="#" class="advanced home-images">' + Common._e("Advanced") + '</a>' +

                            '<fieldset class="advanced">' +
                                '<legend>' + Common._e("Advanced") + '</legend>' +

                                '<label for="lresource">' + Common._e("Resource") + '</label>' +
                                '<input type="text" class="resource" id="lresource" value="' + JAPPIX_RESOURCE + '" />' +
                                '<label for="lpriority">' + Common._e("Priority") + '</label>' +
                                '<select class="priority" id="lpriority">' +
                                    '<option value="1">' + Common._e("Low") + '</option>' +
                                    '<option value="10" selected="">' + Common._e("Medium") + '</option>' +
                                    '<option value="100">' + Common._e("High") + '</option>' +
                                '</select>' +
                            '</fieldset>' +

                            '<div class="submit">' +
                                '<input type="submit" value="' + Common._e("Here we go!") + '" />' +

                                '<div class="clear"></div>' +
                            '</div>' +
                        '</form>';

                    break;

                // Anonymous login tool
                case 'anonymouser':
                    disable_form = Utils.disableInput(ANONYMOUS, 'off');
                    code = '<p>' + Common.printf(Common._e("Enter the groupchat you want to join and the nick you want to have. You can also go back to the %s."), '<a href="#" class="to-home">' + Common._e("login page") + '</a>') + '</p>';

                    if(LEGAL) {
                        code += '<p>' + Common.printf(Common._e("By using our service, you accept %s."), '<b><a href="' + Common.encodeQuotes(LEGAL) + '" target="_blank">' + Common._e("our terms of use") + '</a></b>') + '</p>';
                    }

                    code += '<form action="#" method="post">' +
                            '<fieldset>' +
                                '<legend>' + Common._e("Required") + '</legend>' +

                                '<label>' + Common._e("Room") + '</label>' +
                                '<input type="text" class="room"' + disable_form + ' pattern="[^/]+" required="" />' +

                                '<label>' + Common._e("Nickname") + '</label>' +
                                '<input type="text" class="nick"' + disable_form + ' required="" />' +
                            '</fieldset>' +

                            '<input type="submit" value="' + Common._e("Here we go!") + '"' + disable_form + ' />' +
                        '</form>' +

                        '<div class="info report">' +
                            Common._e("Share this link with your friends:") + ' <span></span>' +
                        '</div>';

                    break;

                // Register tool
                case 'registerer':
                    disable_form = Utils.disableInput(REGISTRATION, 'off');

                    if(!disable_form) {
                        lock_host = Utils.disableInput(LOCK_HOST, 'on');
                    }

                    code = '<p>' + Common._e("Register a new XMPP account to join your friends on your own social cloud. That's simple!") + '</p>';

                    if(LEGAL) {
                        code += '<p>' + Common.printf(Common._e("By using our service, you accept %s."), '<b><a href="' + Common.encodeQuotes(LEGAL) + '" target="_blank">' + Common._e("our terms of use") + '</a></b>') + '</p>';
                    }

                    code += '<form action="#" method="post">' +
                            '<fieldset>' +
                                '<legend>' + Common._e("Required") + '</legend>' +

                                '<label for="rnick">' + Common._e("Address") + '</label>' +
                                '<input type="text" class="nick" id="rnick" ' + disable_form + ' pattern="[^@/]+" required="" placeholder="' + Common._e("Username") + '" /><span class="jid">@</span><input type="text" class="server" id="rserver" value="' + HOST_MAIN + '" ' + disable_form + lock_host + ' pattern="[^@/]+" required="" list="server" placeholder="' + Common._e("Server") + '" />' +
                                '<label for="rpassword">' + Common._e("Password") + '</label>' +
                                '<input type="password" class="password" id="rpassword" ' + disable_form + ' required="" placeholder="' + Common._e("Enter password") + '" /><input type="password" class="spassword" id="spassword" ' + disable_form + ' required="" placeholder="' + Common._e("Once again...") + '" />';

                    if(REGISTER_API == 'on') {
                        code += '<div class="captcha_grp">' +
                                    '<label for="captcha">' + Common._e("Code") + '</label><input type="text" class="captcha" id="captcha" ' + disable_form + ' maxlength="6" pattern="[a-zA-Z0-9]{6}" required="" placeholder="' + Common._e("Security code") + '" /><img class="captcha_img" src="./server/captcha.php?id=' + genID() + '" alt="" />' +
                                '</div>';
                    }

                    code += '</fieldset>' +

                            '<input type="submit" value="' + Common._e("Here we go!") + '" ' + disable_form + '/>' +
                        '</form>';

                    break;
            }

            // Form disabled?
            if(disable_form) {
                code += '<div class="info fail">' +
                        Common._e("This tool has been disabled!") +
                    '</div>';
            }

            // Create this HTML code
            if(code && !Common.exists(current)) {
                $(right + '.homediv.default').after(
                    '<div class="' + div + ' homediv">' + code + '</div>'
                );

                self._eventsChange(
                    $(current),
                    div
                );
            }

            // We focus on the first input
            $(document).oneTime(10, function() {
                $(right + 'input:visible:first').focus();
            });
        } catch(e) {
            Console.error('Home.change', e);
        } finally {
            return false;
        }

    };


    /**
     * Allows the user to display the advanced login options
     * @public
     * @return {boolean}
     */
    self.showAdvanced = function() {

        try {
            // Hide the link
            $('#home a.advanced').hide();

            // Show the fieldset
            $('#home fieldset.advanced').show();
        } catch(e) {
            Console.error('Home.showAdvanced', e);
        } finally {
            return false;
        }

    };


    /**
     * Reads the login form values
     * @public
     * @return {boolean}
     */
    self.loginForm = function() {

        try {
            // We get the values
            var path_sel = $('#home .loginer');

            var lServer = path_sel.find('.server').val();
            var lNick = Common.nodeprep(path_sel.find('.nick').val());
            var lPass = path_sel.find('.password').val();
            var lResource = path_sel.find('.resource').val();
            var lPriority = path_sel.find('.priority').val();
            var lRemember = path_sel.find('.remember').filter(':checked').size();

            // Enough values?
            if(lServer && lNick && lPass && lResource && lPriority) {
                Connection.doLogin(lNick, lServer, lPass, lResource, lPriority, lRemember);
            } else {
                $(lPath + 'input[type="text"], ' + lPath + 'input[type="password"]').each(function() {
                    var select = $(this);

                    if(!select.val()) {
                        $(document).oneTime(10, function() {
                            select.addClass('please-complete').focus();
                        });
                    } else {
                        select.removeClass('please-complete');
                    }
                });
            }
        } catch(e) {
            Console.error('Home.loginForm', e);
        } finally {
            return false;
        }

    };


    /**
     * Reads the register form values
     * @public
     * @return {boolean}
     */
    self.registerForm = function() {

        try {
            var path = '#home .registerer';
            var path_sel = $(path);

            // Remove the success info
            path_sel.find('.success').remove();

            // Get the values
            var username = Common.nodeprep(path_sel.find('.nick').val());
            var domain = path_sel.find('.server').val();
            var pass = path_sel.find('.password').val();
            var spass = path_sel.find('.spassword').val();
            var captcha = path_sel.find('.captcha').val();

            // Enough values?
            if(domain && username && pass && spass && (pass == spass) && !((REGISTER_API == 'on') && (domain == HOST_MAIN) && !captcha)) {
                // We remove the not completed class to avoid problems
                $('#home .registerer input').removeClass('please-complete');

                // Fire the register event!
                Connection.doRegister(username, domain, pass, captcha);
            }

            // Something is missing?
            else {
                $(path + ' input[type="text"], ' + path + ' input[type="password"]').each(function() {
                    var select = $(this);

                    if(!select.val() || (select.is('#spassword') && pass && (pass != spass))) {
                        $(document).oneTime(10, function() {
                            select.addClass('please-complete').focus();
                        });
                    } else {
                        select.removeClass('please-complete');
                    }
                });
            }
        } catch(e) {
            Console.error('Home.registerForm', e);
        } finally {
            return false;
        }

    };


    /**
     * Plugin launcher
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.launch = function() {

        try {
            $(document).ready(function() {
                // Define the vars
                var home = '#home ';
                var button = home + 'button';
                var corp = home + '.corporation';
                var aboutus = home + '.aboutus';
                var locale = home + '.locale';

                // Removes the <noscript /> elements to lighten the DOM
                $('noscript').remove();

                // Allows the user to switch the home page
                $(button).click(function() {
                    // Login button
                    if($(this).is('.login')) {
                        return self.change('loginer');
                    }

                    // Register button
                    else {
                        return self.change('registerer');
                    }
                });

                // Allows the user to view the corporation & about infobox
                $(corp + ', ' + aboutus).hover(function() {
                    $(this).addClass('hovered');
                }, function() {
                    $(this).removeClass('hovered');
                });

                // Allows the user to switch the language
                $(locale).hover(function() {
                    // Initialize the HTML code
                    var keepget = $(locale).attr('data-keepget');
                    var html = '<div class="list">';

                    // Generate each locale HTML code
                    for(var i in LOCALES_AVAILABLE_ID) {
                        html += '<a href="./?l=' + LOCALES_AVAILABLE_ID[i] + keepget + '">' + LOCALES_AVAILABLE_NAMES[i].htmlEnc() + '</a>';
                    }

                    html += '</div>';

                    // Append the HTML code
                    $(locale).append(html);
                }, function() {
                    $(locale + ' .list').remove();
                });

                // Disables the browser HTTP-requests stopper
                $(document).keydown(function(e) {
                    if((e.keyCode == 27) && !System.isDeveloper()) {
                        return false;
                    }
                });

                // Warns for an obsolete browser
                if(Utils.isObsolete()) {
                    self._obsolete();
                }

                Console.log('Welcome to Jappix! Happy coding in developer mode!');
            });
        } catch(e) {
            Console.error('Home.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

Home.launch();
