/*

Jappix - An open social platform
These are the homepage JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 02/11/10

*/

// Allows the user to switch the difference home page elements
function switchHome(div) {
	// Path to
	var home = '#home .';
	var right = home + 'right ';
	var current = right + '.homediv.' + div;
	
	// We reset the homedivs
	$(home + 'homediv:not(.default), ' + home + 'top:not(.default)').remove();
	
	// We switch the div
	$(right + '.homediv, ' + right + '.top').hide();
	$(right + '.' + div).show();
	
	// Get the HTML code to display
	var code = '';
	
	// Apply the previous link
	switch(div) {
		case 'loginer':
		case 'anonymouser':
		case 'registerer':
			if(!exists(right + '.top.sub')) {
				// Append the HTML code for previous link
				$(right + '.top.default').after('<h1 class="top sub loginer anonymouser registerer">&laquo; <a class="previous">' + _e("Previous") + '</a></h1>');
				
				// Click event on previous link
				$(home + 'top.sub a.previous').click(function() {
					return switchHome('default');
				});
			}
		
		break;
	}
	
	// Apply the form
	switch(div) {
		// Login tool
		case 'loginer':
			code = '<p>' + printf(_e("Login to your existing XMPP account. You can also use the %s to join a groupchat."), '<a class="to-anonymous">' + _e("anonymous mode") + '</a>') + '</p>' + 
				
				'<form action="#" method="post">' + 
					'<fieldset>' + 
						'<legend>' + _e("Required") + '</legend>' + 
						
						'<label for="lnick">' + _e("Address") + '</label>' + 
						'<input type="text" class="nick resetable" id="lnick" /><span class="jid">@</span><input type="text" class="server resetable" id="lserver" value="' + HOST_MAIN + '" ' + disableInput(LOCK_HOST, 'on') + '/>' + 
						'<label for="lpassword">' + _e("Password") + '</label>' + 
						'<input type="password" class="password resetable" id="lpassword" />' + 
						'<label for="lremember">' + _e("Remember me") + '</label>' + 
						'<input type="checkbox" class="remember" id="lremember" />' + 
					'</fieldset>' + 
					
					'<a class="advanced home-images">' + _e("Advanced") + '</a>' + 
					
					'<fieldset class="advanced">' + 
						'<legend>' + _e("Advanced") + '</legend>' + 
						
						'<label for="lresource">' + _e("Resource") + '</label>' + 
						'<input type="text" class="resource resetable" id="lresource" value="' + JAPPIX_RESOURCE + '" />' + 
						'<label for="lpriority">' + _e("Priority") + '</label>' + 
						'<select class="priority resetable" id="lpriority">' + 
							'<option value="1">' + _e("Low") + '</option>' + 
							'<option value="10">' + _e("Medium") + '</option>' + 
							'<option value="100">' + _e("High") + '</option>' + 
						'</select>' + 
					'</fieldset>' + 
					
					'<input type="submit" value="' + _e("Here we go!") + '" />' + 
				'</form>';
			
			break;
		
		// Anonymous login tool
		case 'anonymouser':
			code = '<p>' + printf(_e("Enter the groupchat you want to join and the nick you want to have. You can also go back to the %s."), '<a class="to-home">' + _e("login page") + '</a>') + '</p>' + 
				
				'<form action="#" method="post">' + 
					'<fieldset>' + 
						'<legend>' + _e("Required") + '</legend>' + 
						
						'<label>' + _e("Room") + '</label>' + 
						'<input type="text" class="room resetable"' +  disableInput(ANONYMOUS, 'off') + ' />' + 
						
						'<label>' + _e("Nickname") + '</label>' + 
						'<input type="text" class="nick resetable"' +  disableInput(ANONYMOUS, 'off') + ' />' + 
					'</fieldset>' + 
					
					'<input type="submit" value="' + _e("Here we go!") + '"' +  disableInput(ANONYMOUS, 'off') + ' />' + 
				'</form>' + 
				
				'<div class="info report">' + 
					_e("Share this link with your friends:") + ' <span></span>' + 
				'</div>';
			
			break;
		
		// Register tool
		case 'registerer':
			code = '<p>' + _e("Register a new XMPP account to join your friends on your own social cloud. That's simple!") + '</p>' + 
				
				'<form action="#" method="post">' + 
					'<fieldset>' + 
						'<legend>' + _e("Required") + '</legend>' + 
						
						'<label for="rnick">' + _e("Address") + '</label>' + 
						'<input type="text" class="nick resetable" id="rnick" /><span class="jid">@</span><input type="text" class="server resetable" id="rserver" value="' + HOST_MAIN + '" ' + disableInput(LOCK_HOST, 'on') + '/>' + 
						'<label for="rpassword">' + _e("Password") + '</label>' + 
						'<input type="password" class="password resetable" id="rpassword" />' + 
						'<label for="spassword">' + _e("Confirm") + '</label><input type="password" class="spassword resetable" id="spassword" />' + 
					'</fieldset>' + 
					
					'<input type="submit" value="' + _e("Here we go!") + '" />' + 
				'</form>' + 
				
				'<div class="info success">' + 
					'' + _e("You have been registered, here is your XMPP address:") + ' <b></b>' + 
				'</div>';
			
			break;
	}
	
	// Create this HTML code
	if(code && !exists(current)) {
		// Append it!
		$(right + '.homediv.default').after('<div class="' + div + ' homediv">' + code + '</div>');
		
		// Create the attached events
		switch(div) {
			// Login tool
			case 'loginer':
				$(current + ' a.to-anonymous').click(function() {
					return switchHome('anonymouser');
				});
				
				$(current + ' a.advanced').click(function() {
					return showAdvanced();
				});
				
				$(current + ' form').submit(function() {
					return doLogin();
				});
				
				break;
			
			// Anonymous login tool
			case 'anonymouser':
				$(current + ' a.to-home').click(function() {
					return switchHome('loginer');
				});
				
				$(current + ' form').submit(function() {
					return doAnonymous();
				});
				
				// Keyup event on anonymous join's room input
				$(current + ' input.room').keyup(function() {
					var value = $(this).val();
					var report = current + ' .report';
					var span = report + ' span';
					
					if(!value) {
						$(report).hide();
						$(span).text('');
					}
					
					else {
						$(report).show();
						$(span).text(JAPPIX_LOCATION + '?r=' + value);
					}
				});
				
				break;
			
			// Register tool
			case 'registerer':
				$(current + ' form').submit(function() {
					return doRegister();
				});
				
				break;
		}
	}
	
	// We focus on the first input
	$(right + 'input:visible:first').focus();
	
	return false;
}

// Allows the user to display the advanced login options
function showAdvanced() {
	// Hide the link
	$('#home a.advanced').hide();
	
	// Show the fieldset
	$('#home fieldset.advanced').show();
	
	return false;
}

// Launch this plugin!
$(document).ready(function() {
	// Allows the user to switch the home page
	$('#home .button').click(function() {
		// Login button
		if($(this).is('.login'))
			return switchHome('loginer');
		
		// Register button
		else
			return switchHome('registerer');
	});
});
